const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let _db = null;

function getDb() {
  if (_db) return _db;
  const dbPath = path.join(__dirname, '..', 'data', 'ontology.db');
  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  const schema = fs.readFileSync(path.join(__dirname, '..', 'data', 'schema.sql'), 'utf8');
  _db.exec(schema);
  return _db;
}

module.exports = { getDb };