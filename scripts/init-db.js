const { getDb } = require('../db/connection');
const fs = require('fs');
const path = require('path');

const db = getDb();
const seed = fs.readFileSync(path.join(__dirname, '..', 'data', 'seed.sql'), 'utf8');

db.exec(seed);
console.log('База данных инициализирована.');