const express = require('express');
const router  = express.Router();
const { getDb }                    = require('../../db/connection');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { logAction }                = require('../../middleware/audit');

const canManage = [requireAuth, requireRole('admin', 'instructor')];

// GET /api/admin/learners
router.get('/', ...canManage, (req, res) => {
  try {
    res.json(getDb().prepare(`
      SELECT l.*,
             COUNT(DISTINCT lm.competency_id) AS mastered_count,
             COUNT(DISTINCT lg.id)            AS goal_count
      FROM learners l
      LEFT JOIN learner_mastery lm ON l.id = lm.learner_id
      LEFT JOIN learning_goals  lg ON l.id = lg.learner_id
      GROUP BY l.id
      ORDER BY l.name
    `).all());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/admin/learners
router.post('/', ...canManage, (req, res) => {
  const {
    name, slug, learning_style,
    available_hours_week = 10,
    performance_score    = 0.5,
    domain               = 'data_science',
    mastered_competency_ids = [],
  } = req.body;

  if (!name || !learning_style)
    return res.status(400).json({ error: 'name and learning_style required' });
  if (!['visual','auditory','reading','kinesthetic'].includes(learning_style))
    return res.status(400).json({ error: 'Invalid learning_style' });

  try {
    const db        = getDb();
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    const { lastInsertRowid } = db.transaction(() => {
      const { lastInsertRowid: lid } = db.prepare(`
        INSERT INTO learners (slug, name, learning_style, available_hours_week,
                              performance_score, domain)
        VALUES (?,?,?,?,?,?)
      `).run(finalSlug, name, learning_style,
             Number(available_hours_week), Number(performance_score), domain);

      const masteryStmt = db.prepare(
        'INSERT OR IGNORE INTO learner_mastery (learner_id, competency_id) VALUES (?,?)'
      );
      for (const cid of mastered_competency_ids) masteryStmt.run(lid, Number(cid));
      return { lastInsertRowid: lid };
    })();

    logAction(req.user.id, 'CREATE', 'learner', lastInsertRowid, null, { name, learning_style });
    res.status(201).json({ id: lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/admin/learners/:id
router.patch('/:id', ...canManage, (req, res) => {
  try {
    const db      = getDb();
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(req.params.id);
    if (!learner) return res.status(404).json({ error: 'Not found' });

    const allowed = ['name','learning_style','available_hours_week','performance_score','domain'];
    const updates = {};
    for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];

    if (Object.keys(updates).length) {
      const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
      db.prepare(`UPDATE learners SET ${setClauses} WHERE id = ?`)
        .run(...Object.values(updates), req.params.id);
    }

    logAction(req.user.id, 'UPDATE', 'learner', Number(req.params.id), learner, updates);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/admin/learners/:id/mastery
router.get('/:id/mastery', ...canManage, (req, res) => {
  try {
    res.json(getDb().prepare(`
      SELECT c.id, c.name, c.domain, c.eqf_level, c.bloom_level, lm.mastered_at
      FROM learner_mastery lm
      JOIN competencies c ON c.id = lm.competency_id
      WHERE lm.learner_id = ?
      ORDER BY c.eqf_level, c.bloom_level
    `).all(req.params.id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/admin/learners/:id/mastery  — replace full mastery set
router.patch('/:id/mastery', ...canManage, (req, res) => {
  try {
    const { competency_ids = [] } = req.body;
    const lid = Number(req.params.id);
    const db  = getDb();

    const old = db.prepare(
      'SELECT competency_id FROM learner_mastery WHERE learner_id = ?'
    ).all(lid).map(r => r.competency_id);

    db.transaction(() => {
      db.prepare('DELETE FROM learner_mastery WHERE learner_id = ?').run(lid);
      const stmt = db.prepare(
        'INSERT INTO learner_mastery (learner_id, competency_id) VALUES (?,?)'
      );
      for (const cid of competency_ids) stmt.run(lid, Number(cid));
    })();

    logAction(req.user.id, 'UPDATE_MASTERY', 'learner', lid,
              { competency_ids: old }, { competency_ids });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
