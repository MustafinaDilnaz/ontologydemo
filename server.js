const express = require('express');
const path    = require('path');
const { getDb } = require('./db/connection');

const app  = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── helpers ────────────────────────────────────────────────
function ok(res, data)         { res.json(data); }
function fail(res, code, msg)  { res.status(code).json({ error: msg }); }

// ============================================================
// GET /api/learners
// 20 студентов + освоенные компетенции из learner_mastery
// ============================================================
app.get('/api/learners', (req, res) => {
  try {
    const rows = getDb().prepare(`
      SELECT
        l.id, l.slug, l.name,
        l.learning_style    AS learningStyle,
        l.available_hours_week AS availableHours,
        l.performance_score AS performanceScore,
        l.domain,
        GROUP_CONCAT(lm.competency_id) AS masteredIds
      FROM learners l
      LEFT JOIN learner_mastery lm ON lm.learner_id = l.id
      GROUP BY l.id
      ORDER BY l.id
    `).all();

    ok(res, rows.map(r => ({
      id:               r.id,
      slug:             r.slug,
      name:             r.name,
      learningStyle:    r.learningStyle,
      availableHours:   r.availableHours,
      performanceScore: r.performanceScore,
      domain:           r.domain || 'data_science',
      masteredIds:      r.masteredIds
        ? r.masteredIds.split(',').map(Number).sort((a, b) => a - b)
        : [],
    })));
  } catch (e) { fail(res, 500, e.message); }
});

// ============================================================
// GET /api/goals
// Цели, сгруппированные по learner_id
// ============================================================
app.get('/api/goals', (req, res) => {
  try {
    const rows = getDb().prepare(`
      SELECT lg.learner_id, lg.id, lg.competency_id, c.name AS label
      FROM   learning_goals lg
      JOIN   competencies c ON c.id = lg.competency_id
      ORDER  BY lg.learner_id, lg.id
    `).all();

    const byLearner = {};
    for (const r of rows) {
      if (!byLearner[r.learner_id]) byLearner[r.learner_id] = [];
      byLearner[r.learner_id].push({
        id:               r.id,
        goalCompetencyId: r.competency_id,
        label:            r.label,
      });
    }
    ok(res, byLearner);
  } catch (e) { fail(res, 500, e.message); }
});

// ============================================================
// GET /api/competencies
// Все компетенции с массивом prerequisite IDs из БД
// ============================================================
app.get('/api/competencies', (req, res) => {
  try {
    const comps = getDb().prepare(`
      SELECT
        c.id, c.slug, c.name, c.description,
        c.bloom_level AS bloomLevel,
        c.eqf_level   AS eqfLevel,
        c.domain,
        GROUP_CONCAT(p.requires_competency_id) AS prereqIds
      FROM competencies c
      LEFT JOIN prerequisites p ON p.competency_id = c.id
      GROUP BY c.id
      ORDER BY c.domain, c.eqf_level, c.bloom_level
    `).all();

    ok(res, comps.map(c => ({
      id:          c.id,
      slug:        c.slug,
      name:        c.name,
      description: c.description,
      bloomLevel:  c.bloomLevel,
      eqfLevel:    c.eqfLevel,
      domain:      c.domain,
      prerequisites: c.prereqIds
        ? c.prereqIds.split(',').map(Number)
        : [],
    })));
  } catch (e) { fail(res, 500, e.message); }
});

// ============================================================
// GET /api/resources
// Все ресурсы с competency_ids из resource_competencies
// ============================================================
app.get('/api/resources', (req, res) => {
  try {
    const rows = getDb().prepare(`
      SELECT
        r.id, r.slug, r.name, r.type,
        r.difficulty, r.duration_hours AS durationHours,
        r.url, r.suitable_styles AS suitableStyles,
        GROUP_CONCAT(rc.competency_id) AS competencyIds
      FROM resources r
      LEFT JOIN resource_competencies rc ON rc.resource_id = r.id
      GROUP BY r.id
      ORDER BY r.id
    `).all();

    ok(res, rows.map(r => ({
      id:           r.id,
      slug:         r.slug,
      name:         r.name,
      type:         r.type,
      difficulty:   r.difficulty,
      durationHours: r.durationHours,
      url:          r.url || null,
      suitableStyles: r.suitableStyles ? JSON.parse(r.suitableStyles) : [],
      competencyIds: r.competencyIds
        ? r.competencyIds.split(',').map(Number)
        : [],
    })));
  } catch (e) { fail(res, 500, e.message); }
});

// ============================================================
// GET /api/stats
// Агрегированная статистика по всей онтологии
// ============================================================
app.get('/api/stats', (req, res) => {
  try {
    const db = getDb();

    const counts = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM learners)       AS totalLearners,
        (SELECT COUNT(*) FROM competencies)   AS totalCompetencies,
        (SELECT COUNT(*) FROM resources)      AS totalResources,
        (SELECT COUNT(*) FROM prerequisites)  AS totalPrerequisites,
        (SELECT COUNT(*) FROM learner_mastery)AS totalMasteries,
        (SELECT COUNT(*) FROM learning_paths WHERE status = 'active')    AS activePaths,
        (SELECT COUNT(*) FROM learning_paths WHERE status = 'completed') AS completedPaths,
        (SELECT COUNT(*) FROM learning_paths WHERE status = 'abandoned') AS abandonedPaths
    `).get();

    const avgRow = db.prepare(`
      SELECT ROUND(AVG(cnt), 1) AS avg
      FROM (SELECT COUNT(*) AS cnt FROM prerequisites GROUP BY competency_id)
    `).get();

    const topGoals = db.prepare(`
      SELECT c.name AS label, COUNT(lg.id) AS goalCount
      FROM   learning_goals lg
      JOIN   competencies c ON c.id = lg.competency_id
      GROUP  BY lg.competency_id
      ORDER  BY goalCount DESC
      LIMIT  5
    `).all();

    const keyCompetencies = db.prepare(`
      SELECT c.id, c.name, COUNT(p.competency_id) AS dependedBy
      FROM   prerequisites p
      JOIN   competencies c ON c.id = p.requires_competency_id
      GROUP  BY c.id
      ORDER  BY dependedBy DESC
      LIMIT  5
    `).all();

    // Cohort analytics ──────────────────────────────────────────
    // Top-5 competencies most frequently missing (gap frequency):
    // direct prerequisites of a learner's goal that they haven't mastered
    const gapFrequency = db.prepare(`
      SELECT c.id, c.name,
             COUNT(DISTINCT l.id) AS learnerCount
      FROM   learners l
      JOIN   learning_goals lg ON lg.learner_id = l.id
      JOIN   prerequisites   p  ON p.competency_id = lg.competency_id
      JOIN   competencies    c  ON c.id = p.requires_competency_id
      LEFT JOIN learner_mastery lm
             ON lm.learner_id = l.id AND lm.competency_id = c.id
      WHERE  lm.learner_id IS NULL
      GROUP  BY c.id
      ORDER  BY learnerCount DESC
      LIMIT  5
    `).all();

    // Top-5 resources by usage across saved path steps
    const topResources = db.prepare(`
      SELECT r.id, r.name, r.type,
             COUNT(ps.id) AS usageCount
      FROM   resources r
      JOIN   path_steps ps ON ps.resource_id = r.id
      GROUP  BY r.id
      ORDER  BY usageCount DESC
      LIMIT  5
    `).all();

    // Readiness distribution: bucket learners by % of total competencies mastered
    const readinessBuckets = db.prepare(`
      SELECT
        CASE
          WHEN pct < 25  THEN 'Beginner (0–25%)'
          WHEN pct < 50  THEN 'Developing (25–50%)'
          WHEN pct < 75  THEN 'Proficient (50–75%)'
          ELSE                'Advanced (75–100%)'
        END AS bucket,
        COUNT(*) AS learnerCount
      FROM (
        SELECT l.id,
               ROUND(
                 CAST(COUNT(lm.competency_id) AS REAL) /
                 (SELECT COUNT(*) FROM competencies) * 100
               ) AS pct
        FROM   learners l
        LEFT JOIN learner_mastery lm ON lm.learner_id = l.id
        GROUP  BY l.id
      )
      GROUP BY bucket
      ORDER BY MIN(pct)
    `).all();

    ok(res, {
      totalLearners:      counts.totalLearners,
      totalCompetencies:  counts.totalCompetencies,
      totalResources:     counts.totalResources,
      totalPrerequisites: counts.totalPrerequisites,
      totalMasteries:     counts.totalMasteries,
      avgPrerequisites:   avgRow.avg ?? 0,
      activePaths:        counts.activePaths,
      completedPaths:     counts.completedPaths,
      abandonedPaths:     counts.abandonedPaths,
      topGoals,
      keyCompetencies,
      gapFrequency,
      topResources,
      readinessBuckets,
    });
  } catch (e) { fail(res, 500, e.message); }
});

// ============================================================
// PATCH /api/mastery
// Добавить или убрать освоение компетенции у студента
// Body: { learnerId, competencyId, action: 'add'|'remove' }
// ============================================================
app.patch('/api/mastery', (req, res) => {
  const { learnerId, competencyId, action } = req.body;

  if (!learnerId || !competencyId || !['add', 'remove'].includes(action)) {
    return fail(res, 400, 'learnerId, competencyId and action (add|remove) are required');
  }

  try {
    const db = getDb();

    if (action === 'add') {
      db.prepare(`
        INSERT OR IGNORE INTO learner_mastery (learner_id, competency_id)
        VALUES (?, ?)
      `).run(Number(learnerId), Number(competencyId));
    } else {
      db.prepare(`
        DELETE FROM learner_mastery WHERE learner_id = ? AND competency_id = ?
      `).run(Number(learnerId), Number(competencyId));
    }

    const row = db.prepare(`
      SELECT GROUP_CONCAT(competency_id) AS ids
      FROM (SELECT competency_id FROM learner_mastery WHERE learner_id = ? ORDER BY competency_id)
    `).get(Number(learnerId));

    const masteredIds = row.ids
      ? row.ids.split(',').map(Number)
      : [];

    ok(res, { learnerId: Number(learnerId), competencyId: Number(competencyId), masteredIds });
  } catch (e) { fail(res, 500, e.message); }
});

// ============================================================
// POST /api/paths
// Сохранить сгенерированный путь в learning_paths + path_steps
// Body: { learnerId, goalId, targetCompetencyId, steps: [{competencyId, resourceId, stepOrder}] }
// ============================================================
app.post('/api/paths', (req, res) => {
  const { learnerId, goalId, targetCompetencyId, steps } = req.body;

  if (!learnerId || !targetCompetencyId || !Array.isArray(steps)) {
    return fail(res, 400, 'learnerId, targetCompetencyId and steps are required');
  }

  try {
    const db = getDb();

    // Разрешить goalId: принять из тела или найти по (learner, competency)
    let resolvedGoalId = goalId || null;
    if (!resolvedGoalId) {
      const goalRow = db.prepare(`
        SELECT id FROM learning_goals
        WHERE learner_id = ? AND competency_id = ?
        LIMIT 1
      `).get(learnerId, targetCompetencyId);

      if (!goalRow) return fail(res, 404, 'Learning goal not found for this learner/competency pair');
      resolvedGoalId = goalRow.id;
    }

    // Записать в транзакции
    const insertPath = db.prepare(`
      INSERT INTO learning_paths (learner_id, goal_id, status)
      VALUES (?, ?, 'active')
    `);
    const insertStep = db.prepare(`
      INSERT INTO path_steps (path_id, competency_id, resource_id, step_order, is_completed)
      VALUES (?, ?, ?, ?, 0)
    `);

    const validSteps = steps.filter(s => s.competencyId && s.resourceId);

    const run = db.transaction(() => {
      const { lastInsertRowid: pathId } = insertPath.run(learnerId, resolvedGoalId);
      for (const s of validSteps) {
        insertStep.run(pathId, s.competencyId, s.resourceId, s.stepOrder);
      }
      return pathId;
    });

    const pathId = run();

    ok(res, { pathId, stepsCount: validSteps.length, status: 'active' });
  } catch (e) { fail(res, 500, e.message); }
});

// ============================================================
// Запуск
// ============================================================
app.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Run: lsof -ti :${PORT} | xargs kill -9`);
  } else {
    console.error('❌ Server error:', err.message);
  }
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`🎓 Ontology Demo  →  http://localhost:${PORT}`);
  console.log('   Endpoints: /api/learners /api/goals /api/competencies /api/resources /api/stats');
  console.log('   POST: /api/paths');
  console.log('   Press Ctrl+C to stop.');
});
