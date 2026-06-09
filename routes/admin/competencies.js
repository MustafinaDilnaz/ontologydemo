const express = require('express');
const router  = express.Router();
const { getDb }                          = require('../../db/connection');
const { requireAuth, requireRole }       = require('../../middleware/auth');
const { logAction }                      = require('../../middleware/audit');
const { wouldCreateCycle, buildAdjacency } = require('../../utils/graphUtils');
const { validateCompetency }               = require('../../middleware/validate');

const canManage = [requireAuth, requireRole('admin', 'instructor')];

// GET /api/admin/competencies
// Query params: domain, bloom, eqf, status (default active), q (name/desc search)
router.get('/', ...canManage, (req, res) => {
  const db = getDb();
  const { domain, bloom, eqf, status = 'active', q } = req.query;

  let sql = `
    SELECT c.*,
           COUNT(DISTINCT p.requires_competency_id) AS prereq_count,
           COUNT(DISTINCT rc.resource_id)            AS resource_count
    FROM competencies c
    LEFT JOIN prerequisites p  ON c.id = p.competency_id
    LEFT JOIN resource_competencies rc ON c.id = rc.competency_id
    WHERE 1=1
  `;
  const params = [];

  if (domain) { sql += ' AND c.domain = ?';       params.push(domain); }
  if (bloom)  { sql += ' AND c.bloom_level = ?';  params.push(Number(bloom)); }
  if (eqf)    { sql += ' AND c.eqf_level = ?';    params.push(Number(eqf)); }
  if (status) { sql += ' AND c.status = ?';        params.push(status); }
  if (q)      {
    sql += ' AND (c.name LIKE ? OR c.description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  sql += ' GROUP BY c.id ORDER BY c.eqf_level, c.bloom_level';

  try {
    res.json(db.prepare(sql).all(...params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/admin/competencies/:id
router.get('/:id', ...canManage, (req, res) => {
  try {
    const db   = getDb();
    const comp = db.prepare('SELECT * FROM competencies WHERE id = ?').get(req.params.id);
    if (!comp) return res.status(404).json({ error: 'Not found' });

    comp.prerequisites = db.prepare(`
      SELECT c.id, c.name, c.eqf_level, c.bloom_level
      FROM prerequisites p
      JOIN competencies c ON c.id = p.requires_competency_id
      WHERE p.competency_id = ?
    `).all(req.params.id);

    comp.resources = db.prepare(`
      SELECT r.id, r.name, r.type, r.difficulty
      FROM resource_competencies rc
      JOIN resources r ON r.id = rc.resource_id
      WHERE rc.competency_id = ?
    `).all(req.params.id);

    res.json(comp);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/admin/competencies
router.post('/', ...canManage, validateCompetency, (req, res) => {
  const { name, slug, description, domain, bloom_level, eqf_level,
          status = 'active' } = req.body;

  if (!name || !domain || !bloom_level || !eqf_level)
    return res.status(400).json({ error: 'name, domain, bloom_level, eqf_level are required' });
  if (bloom_level < 1 || bloom_level > 6)
    return res.status(400).json({ error: 'bloom_level must be 1–6' });
  if (eqf_level < 1 || eqf_level > 8)
    return res.status(400).json({ error: 'eqf_level must be 1–8' });

  try {
    const db        = getDb();
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    if (db.prepare('SELECT id FROM competencies WHERE slug = ?').get(finalSlug))
      return res.status(409).json({ error: 'Slug already exists' });

    const { lastInsertRowid } = db.prepare(`
      INSERT INTO competencies (slug, name, description, domain,
                                bloom_level, eqf_level, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(finalSlug, name, description || null, domain,
           Number(bloom_level), Number(eqf_level), status, req.user.id);

    logAction(req.user.id, 'CREATE', 'competency', lastInsertRowid,
              null, { name, domain, bloom_level, eqf_level });

    res.status(201).json({ id: lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/admin/competencies/:id
router.patch('/:id', ...canManage, validateCompetency, (req, res) => {
  try {
    const db   = getDb();
    const comp = db.prepare('SELECT * FROM competencies WHERE id = ?').get(req.params.id);
    if (!comp) return res.status(404).json({ error: 'Not found' });

    const allowed = ['name', 'description', 'domain', 'bloom_level', 'eqf_level', 'status'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: 'No valid fields to update' });

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    db.prepare(
      `UPDATE competencies SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(...Object.values(updates), req.params.id);

    logAction(req.user.id, 'UPDATE', 'competency', Number(req.params.id), comp, updates);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/admin/competencies/:id  (soft delete → archive)
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const id = Number(req.params.id);

    const inPaths = db.prepare(
      'SELECT COUNT(*) AS n FROM path_steps WHERE competency_id = ?'
    ).get(id).n;
    if (inPaths > 0)
      return res.status(409).json({
        error: 'Competency is used in active learning paths. Archive instead.',
        action: 'archive',
      });

    const isPrereq = db.prepare(
      'SELECT COUNT(*) AS n FROM prerequisites WHERE requires_competency_id = ?'
    ).get(id).n;
    if (isPrereq > 0)
      return res.status(409).json({
        error: 'Competency is a prerequisite for other competencies.',
        action: 'archive',
      });

    db.prepare("UPDATE competencies SET status = 'archived' WHERE id = ?").run(id);
    logAction(req.user.id, 'ARCHIVE', 'competency', id, null, { status: 'archived' });
    res.json({ ok: true, action: 'archived' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Prerequisites sub-resource ──────────────────────────────────────────────

// GET /api/admin/competencies/:id/prerequisites
router.get('/:id/prerequisites', ...canManage, (req, res) => {
  try {
    res.json(getDb().prepare(`
      SELECT c.id, c.name, c.domain, c.eqf_level, c.bloom_level
      FROM prerequisites p
      JOIN competencies c ON c.id = p.requires_competency_id
      WHERE p.competency_id = ?
    `).all(req.params.id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/admin/competencies/:id/prerequisites
router.post('/:id/prerequisites', ...canManage, (req, res) => {
  const compId   = Number(req.params.id);
  const prereqId = Number(req.body.prerequisite_id);

  if (!prereqId)
    return res.status(400).json({ error: 'prerequisite_id is required' });
  if (compId === prereqId)
    return res.status(400).json({ error: 'A competency cannot be its own prerequisite' });

  try {
    const db  = getDb();
    const adj = buildAdjacency(db);
    if (!adj.has(compId)) adj.set(compId, new Set());

    if (wouldCreateCycle(adj, compId, prereqId))
      return res.status(409).json({
        error: 'Adding this prerequisite would create a cycle in the competency graph',
      });

    if (db.prepare(
      'SELECT 1 FROM prerequisites WHERE competency_id = ? AND requires_competency_id = ?'
    ).get(compId, prereqId))
      return res.status(409).json({ error: 'Prerequisite already exists' });

    db.prepare(
      'INSERT INTO prerequisites (competency_id, requires_competency_id, created_by) VALUES (?, ?, ?)'
    ).run(compId, prereqId, req.user.id);

    logAction(req.user.id, 'ADD_PREREQUISITE', 'competency', compId,
              null, { competency_id: compId, requires_competency_id: prereqId });

    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/admin/competencies/:id/prerequisites/:prereqId
router.delete('/:id/prerequisites/:prereqId', ...canManage, (req, res) => {
  try {
    const db     = getDb();
    const compId = Number(req.params.id);
    const prereqId = Number(req.params.prereqId);

    db.prepare(
      'DELETE FROM prerequisites WHERE competency_id = ? AND requires_competency_id = ?'
    ).run(compId, prereqId);

    logAction(req.user.id, 'REMOVE_PREREQUISITE', 'competency', compId,
              { requires_competency_id: prereqId }, null);

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/admin/graph/validate — full Kahn's algorithm cycle check
router.post('/graph/validate', ...canManage, (req, res) => {
  try {
    const db   = getDb();
    const rows = db.prepare(
      'SELECT competency_id, requires_competency_id FROM prerequisites'
    ).all();

    const inDegree = new Map();
    const adj      = new Map();
    const allNodes = new Set();

    for (const r of rows) {
      allNodes.add(r.competency_id);
      allNodes.add(r.requires_competency_id);
      if (!adj.has(r.requires_competency_id)) adj.set(r.requires_competency_id, []);
      adj.get(r.requires_competency_id).push(r.competency_id);
      inDegree.set(r.competency_id, (inDegree.get(r.competency_id) || 0) + 1);
    }

    const queue = [...allNodes].filter(n => !(inDegree.get(n) > 0));
    let processed = 0;
    while (queue.length) {
      const n = queue.shift();
      processed++;
      for (const dep of (adj.get(n) || [])) {
        inDegree.set(dep, inDegree.get(dep) - 1);
        if (inDegree.get(dep) === 0) queue.push(dep);
      }
    }

    const hasCycle = processed < allNodes.size;
    res.json({ valid: !hasCycle, nodeCount: allNodes.size, processed });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
