const express = require('express');
const router  = express.Router();
const { getDb }                    = require('../../db/connection');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { logAction }                = require('../../middleware/audit');

const canManage = [requireAuth, requireRole('admin', 'instructor')];

// GET /api/admin/goals/audit — MUST be before /:id to avoid "audit" being treated as an id
router.get('/audit', ...canManage, (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    res.json(getDb().prepare(`
      SELECT a.*, u.name AS user_name
      FROM   audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      ORDER  BY a.created_at DESC
      LIMIT  ?
    `).all(limit));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/admin/goals
router.get('/', ...canManage, (req, res) => {
  try {
    res.json(getDb().prepare(`
      SELECT
        lg.id, lg.learner_id, lg.competency_id,
        l.name  AS learner_name,
        c.name  AS competency_name,
        c.eqf_level,
        lp.id     AS path_id,
        lp.status AS path_status,
        COUNT(DISTINCT CASE WHEN ps.is_completed = 1 THEN ps.id END) AS completed_steps,
        COUNT(DISTINCT ps.id) AS total_steps
      FROM learning_goals lg
      JOIN  learners     l  ON l.id  = lg.learner_id
      JOIN  competencies c  ON c.id  = lg.competency_id
      LEFT JOIN learning_paths lp ON lp.goal_id = lg.id AND lp.status = 'active'
      LEFT JOIN path_steps     ps ON ps.path_id = lp.id
      GROUP BY lg.id
      ORDER BY l.name, c.name
    `).all());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/admin/goals — assign new goal to a learner
router.post('/', ...canManage, (req, res) => {
  const { learner_id, competency_id } = req.body;
  if (!learner_id || !competency_id)
    return res.status(400).json({ error: 'learner_id and competency_id required' });

  try {
    const db = getDb();
    const existing = db.prepare(
      'SELECT id FROM learning_goals WHERE learner_id = ? AND competency_id = ?'
    ).get(Number(learner_id), Number(competency_id));
    if (existing)
      return res.status(409).json({ error: 'Goal already exists for this learner/competency pair' });

    const slug = `goal_${learner_id}_${competency_id}_${Date.now()}`;
    const { lastInsertRowid } = db.prepare(
      'INSERT INTO learning_goals (slug, learner_id, competency_id) VALUES (?,?,?)'
    ).run(slug, Number(learner_id), Number(competency_id));

    logAction(req.user.id, 'CREATE', 'goal', lastInsertRowid, null, { learner_id, competency_id });
    res.status(201).json({ id: lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/admin/goals/:id/regenerate — clear path so it can be regenerated in the learner app
router.post('/:id/regenerate', ...canManage, (req, res) => {
  try {
    const db     = getDb();
    const goalId = Number(req.params.id);

    db.transaction(() => {
      const paths = db.prepare('SELECT id FROM learning_paths WHERE goal_id = ?').all(goalId);
      for (const p of paths) {
        db.prepare(`
          DELETE FROM explanations WHERE path_step_id IN
          (SELECT id FROM path_steps WHERE path_id = ?)
        `).run(p.id);
        db.prepare('DELETE FROM path_steps WHERE path_id = ?').run(p.id);
      }
      db.prepare('DELETE FROM learning_paths WHERE goal_id = ?').run(goalId);
    })();

    logAction(req.user.id, 'REGENERATE', 'goal', goalId, null, null);
    res.json({ ok: true, message: 'Path cleared — open the learner view to regenerate.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/admin/goals/:id — remove goal and all associated path data
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  try {
    const db     = getDb();
    const goalId = Number(req.params.id);

    db.transaction(() => {
      const paths = db.prepare('SELECT id FROM learning_paths WHERE goal_id = ?').all(goalId);
      for (const p of paths) {
        db.prepare(`
          DELETE FROM explanations WHERE path_step_id IN
          (SELECT id FROM path_steps WHERE path_id = ?)
        `).run(p.id);
        db.prepare('DELETE FROM path_steps WHERE path_id = ?').run(p.id);
      }
      db.prepare('DELETE FROM learning_paths WHERE goal_id = ?').run(goalId);
      db.prepare('DELETE FROM learning_goals WHERE id = ?').run(goalId);
    })();

    logAction(req.user.id, 'DELETE', 'goal', goalId, null, null);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
