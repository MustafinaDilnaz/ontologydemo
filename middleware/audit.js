const { getDb } = require('../db/connection');

function logAction(userId, action, entityType, entityId, oldValue, newValue) {
  try {
    getDb().prepare(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      action,
      entityType,
      entityId ?? null,
      oldValue  != null ? JSON.stringify(oldValue)  : null,
      newValue  != null ? JSON.stringify(newValue)  : null
    );
  } catch (e) {
    console.error('Audit log failed:', e.message);
  }
}

module.exports = { logAction };
