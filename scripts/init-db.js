const { getDb } = require('../db/connection');
const fs     = require('fs');
const path   = require('path');
const bcrypt = require('bcryptjs');

// 1. Apply schema + seed data
const db   = getDb();
const seed = fs.readFileSync(path.join(__dirname, '..', 'data', 'seed.sql'), 'utf8');
try {
  db.exec(seed);
  console.log('✓ База данных инициализирована (schema + seed).');
} catch (e) {
  if (e.message.includes('UNIQUE constraint')) {
    console.log('✓ Данные уже загружены — seed пропущен.');
  } else {
    throw e;
  }
}

// 2. Seed default admin user (idempotent)
const adminEmail = 'admin@ontology.edu';
const existing   = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
if (!existing) {
  const hash = bcrypt.hashSync('Admin123!', 10);
  db.prepare(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, 'admin')
  `).run('System Admin', adminEmail, hash);
  console.log('✓ Создан admin-пользователь: admin@ontology.edu / Admin123!');
} else {
  console.log('✓ Admin-пользователь уже существует — пропущено.');
}

console.log('\nГотово. Запустите сервер: node server.js');
