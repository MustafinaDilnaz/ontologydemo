-- ============================================================
-- LAYER 1: LEARNER
-- ============================================================
CREATE TABLE IF NOT EXISTS learners (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  slug                 TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  learning_style       TEXT NOT NULL
                         CHECK (learning_style IN ('visual','auditory','reading','kinesthetic')),
  available_hours_week INTEGER DEFAULT 10,
  performance_score    REAL    DEFAULT 0.5,
  domain               TEXT    DEFAULT 'data_science',
  created_at           TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS competencies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  bloom_level INTEGER NOT NULL CHECK (bloom_level BETWEEN 1 AND 6),
  eqf_level   INTEGER NOT NULL CHECK (eqf_level  BETWEEN 1 AND 8),
  domain      TEXT DEFAULT 'data_science',
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','archived')),
  created_by  INTEGER,
  created_at  TEXT,
  updated_at  TEXT
);

CREATE TABLE IF NOT EXISTS learner_mastery (
  learner_id    INTEGER NOT NULL REFERENCES learners(id),
  competency_id INTEGER NOT NULL REFERENCES competencies(id),
  mastered_at   TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (learner_id, competency_id)
);

-- ============================================================
-- LAYER 2: COMPETENCY GRAPH
-- ============================================================
CREATE TABLE IF NOT EXISTS prerequisites (
  competency_id          INTEGER NOT NULL REFERENCES competencies(id),
  requires_competency_id INTEGER NOT NULL REFERENCES competencies(id),
  created_by             INTEGER,
  created_at             TEXT,
  PRIMARY KEY (competency_id, requires_competency_id),
  CHECK (competency_id != requires_competency_id)
);

-- ============================================================
-- LAYER 3: CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL
                    CHECK (type IN ('video','article','exercise','project')),
  difficulty      INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  duration_hours  REAL    NOT NULL,
  url             TEXT,
  suitable_styles TEXT    NOT NULL,
  description     TEXT,
  language        TEXT DEFAULT 'en',
  status          TEXT DEFAULT 'approved' CHECK (status IN ('draft','approved','archived')),
  rating          REAL DEFAULT 0,
  created_by      INTEGER,
  created_at      TEXT,
  updated_at      TEXT
);

CREATE TABLE IF NOT EXISTS resource_competencies (
  resource_id   INTEGER NOT NULL REFERENCES resources(id),
  competency_id INTEGER NOT NULL REFERENCES competencies(id),
  PRIMARY KEY (resource_id, competency_id)
);

-- ============================================================
-- LAYER 4: PROCESS
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_goals (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT    NOT NULL UNIQUE,
  learner_id    INTEGER NOT NULL REFERENCES learners(id),
  competency_id INTEGER NOT NULL REFERENCES competencies(id),
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS learning_paths (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  learner_id   INTEGER NOT NULL REFERENCES learners(id),
  goal_id      INTEGER NOT NULL REFERENCES learning_goals(id),
  generated_at TEXT DEFAULT (datetime('now')),
  status       TEXT DEFAULT 'active'
                 CHECK (status IN ('active','completed','abandoned'))
);

CREATE TABLE IF NOT EXISTS path_steps (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  path_id       INTEGER NOT NULL REFERENCES learning_paths(id),
  competency_id INTEGER NOT NULL REFERENCES competencies(id),
  resource_id   INTEGER NOT NULL REFERENCES resources(id),
  step_order    INTEGER NOT NULL,
  is_completed  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS explanations (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  path_step_id         INTEGER NOT NULL REFERENCES path_steps(id),
  missing_competency   TEXT NOT NULL,
  why_required         TEXT NOT NULL,
  relation_to_goal     TEXT NOT NULL,
  resource_selected    TEXT NOT NULL,
  why_resource_matches TEXT NOT NULL,
  reasoning_chain      TEXT
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_learner_mastery_learner     ON learner_mastery(learner_id);
CREATE INDEX IF NOT EXISTS idx_learner_mastery_competency  ON learner_mastery(competency_id);
CREATE INDEX IF NOT EXISTS idx_prerequisites_competency    ON prerequisites(competency_id);
CREATE INDEX IF NOT EXISTS idx_prerequisites_required      ON prerequisites(requires_competency_id);
CREATE INDEX IF NOT EXISTS idx_resource_comp_competency    ON resource_competencies(competency_id);
CREATE INDEX IF NOT EXISTS idx_resource_comp_resource      ON resource_competencies(resource_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_learner      ON learning_goals(learner_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_competency   ON learning_goals(competency_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_learner      ON learning_paths(learner_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_goal         ON learning_paths(goal_id);
CREATE INDEX IF NOT EXISTS idx_path_steps_path             ON path_steps(path_id);
CREATE INDEX IF NOT EXISTS idx_path_steps_competency       ON path_steps(competency_id);
CREATE INDEX IF NOT EXISTS idx_explanations_path_step      ON explanations(path_step_id);

-- ============================================================
-- LAYER 5: ADMIN
-- ============================================================

-- 1. Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    UNIQUE NOT NULL,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'learner'
                CHECK (role IN ('admin','instructor','learner')),
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TEXT    DEFAULT CURRENT_TIMESTAMP
);

-- 2. Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   INTEGER,
  old_value   TEXT,
  new_value   TEXT,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes for admin tables
-- (ALTER TABLE migrations for existing tables are applied once via scripts/migrate-admin.js)
CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role       ON users(role);
CREATE INDEX IF NOT EXISTS idx_audit_user       ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity     ON audit_logs(entity_type, entity_id);