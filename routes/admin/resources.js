const express = require('express');
const router  = express.Router();
const { getDb }                    = require('../../db/connection');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { logAction }                = require('../../middleware/audit');
const { validateResource }         = require('../../middleware/validate');

const canManage = [requireAuth, requireRole('admin', 'instructor')];

// GET /api/admin/resources/:id
router.get('/:id', ...canManage, (req, res) => {
  try {
    const row = getDb().prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/admin/resources  — ?status=approved&type=video&q=python
router.get('/', ...canManage, (req, res) => {
  try {
    const db = getDb();
    const { status, type, q } = req.query;
    let sql = `
      SELECT r.*,
             GROUP_CONCAT(c.name, ', ') AS competency_names
      FROM resources r
      LEFT JOIN resource_competencies rc ON r.id = rc.resource_id
      LEFT JOIN competencies c ON c.id = rc.competency_id
      WHERE 1=1
    `;
    const params = [];
    if (status) { sql += ' AND r.status = ?'; params.push(status); }
    if (type)   { sql += ' AND r.type = ?';   params.push(type); }
    if (q)      {
      sql += ' AND (r.name LIKE ? OR r.description LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    sql += ' GROUP BY r.id ORDER BY r.name';
    res.json(db.prepare(sql).all(...params));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/admin/resources
router.post('/', ...canManage, validateResource, (req, res) => {
  const {
    name, description, type, url, difficulty, duration_hours,
    language, suitable_styles, status = 'draft', competency_ids = [],
  } = req.body;

  if (!name || !type || !difficulty || !duration_hours || !suitable_styles)
    return res.status(400).json({
      error: 'name, type, difficulty, duration_hours, suitable_styles required',
    });

  const validTypes = ['video','article','book','course','exercise','project','quiz','documentation'];
  if (!validTypes.includes(type))
    return res.status(400).json({ error: 'Invalid resource type' });

  try {
    const db   = getDb();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + Date.now();

    const { lastInsertRowid } = db.prepare(`
      INSERT INTO resources
        (slug, name, description, type, url, difficulty, duration_hours,
         language, suitable_styles, status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      slug, name, description || null, type, url || null,
      Number(difficulty), Number(duration_hours),
      language || 'en',
      JSON.stringify(Array.isArray(suitable_styles) ? suitable_styles : [suitable_styles]),
      status, req.user.id
    );

    const linkStmt = db.prepare(
      'INSERT OR IGNORE INTO resource_competencies (resource_id, competency_id) VALUES (?,?)'
    );
    for (const cid of competency_ids) linkStmt.run(lastInsertRowid, Number(cid));

    logAction(req.user.id, 'CREATE', 'resource', lastInsertRowid, null, { name, type });
    res.status(201).json({ id: lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/admin/resources/:id
router.patch('/:id', ...canManage, validateResource, (req, res) => {
  try {
    const db       = getDb();
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Not found' });

    const allowed = ['name','description','type','url','difficulty',
                     'duration_hours','language','suitable_styles','status','rating'];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        updates[k] = (k === 'suitable_styles' && Array.isArray(req.body[k]))
          ? JSON.stringify(req.body[k])
          : req.body[k];
      }
    }

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: 'No valid fields to update' });

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    db.prepare(
      `UPDATE resources SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(...Object.values(updates), req.params.id);

    logAction(req.user.id, 'UPDATE', 'resource', Number(req.params.id), resource, updates);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/admin/resources/:id/competencies  — link / replace
router.post('/:id/competencies', ...canManage, (req, res) => {
  try {
    const { competency_ids, replace = false } = req.body;
    const db  = getDb();
    const rid = Number(req.params.id);

    db.transaction(() => {
      if (replace)
        db.prepare('DELETE FROM resource_competencies WHERE resource_id = ?').run(rid);
      const stmt = db.prepare(
        'INSERT OR IGNORE INTO resource_competencies (resource_id, competency_id) VALUES (?,?)'
      );
      for (const cid of (competency_ids || [])) stmt.run(rid, Number(cid));
    })();

    logAction(req.user.id, 'LINK_COMPETENCIES', 'resource', rid, null, { competency_ids });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/admin/resources/:id  — archive (soft delete)
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  try {
    const db  = getDb();
    const id  = Number(req.params.id);
    db.prepare("UPDATE resources SET status = 'archived' WHERE id = ?").run(id);
    logAction(req.user.id, 'ARCHIVE', 'resource', id, null, { status: 'archived' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
