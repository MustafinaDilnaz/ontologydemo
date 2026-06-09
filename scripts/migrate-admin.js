const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, '../data/ontology.db'));
db.pragma('foreign_keys = ON');

const migrations = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('admin','instructor','learner')),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    old_value TEXT,
    new_value TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
  `ALTER TABLE competencies ADD COLUMN status TEXT DEFAULT 'active'`,
  `ALTER TABLE competencies ADD COLUMN created_by INTEGER`,
  `ALTER TABLE competencies ADD COLUMN created_at TEXT`,
  `ALTER TABLE competencies ADD COLUMN updated_at TEXT`,
  `ALTER TABLE resources ADD COLUMN description TEXT`,
  `ALTER TABLE resources ADD COLUMN language TEXT DEFAULT 'en'`,
  `ALTER TABLE resources ADD COLUMN status TEXT DEFAULT 'approved'`,
  `ALTER TABLE resources ADD COLUMN rating REAL DEFAULT 0`,
  `ALTER TABLE resources ADD COLUMN created_by INTEGER`,
  `ALTER TABLE resources ADD COLUMN created_at TEXT`,
  `ALTER TABLE resources ADD COLUMN updated_at TEXT`,
  `ALTER TABLE prerequisites ADD COLUMN created_by INTEGER`,
  `ALTER TABLE prerequisites ADD COLUMN created_at TEXT`,
  `CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_users_role   ON users(role)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_logs(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id)`,
];

for (const sql of migrations) {
  try {
    db.exec(sql);
    console.log('OK:', sql.trim().substring(0, 60));
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log('SKIP (already exists):', sql.trim().substring(0, 60));
    } else {
      throw e;
    }
  }
}

// Seed default admin user
const adminEmail = 'admin@ontology.edu';
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
if (!existing) {
  const hash = bcrypt.hashSync('Admin123!', 10);
  db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`)
    .run('System Admin', adminEmail, hash);
  console.log('\nDefault admin created:');
  console.log('  email:    admin@ontology.edu');
  console.log('  password: Admin123!');
} else {
  console.log('\nAdmin user already exists — skipped seed.');
}

db.close();
console.log('\nMigration complete.');
