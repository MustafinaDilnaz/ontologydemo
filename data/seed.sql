-- ============================================================
-- LEARNERS  (id 1–10)
-- ============================================================
INSERT INTO learners (id, slug, name, learning_style, available_hours_week, performance_score) VALUES
(1,  'alice',  'Alice Chen',      'visual',       15, 0.75),
(2,  'bob',    'Bob Martinez',    'reading',      10, 0.82),
(3,  'carol',  'Carol Williams',  'kinesthetic',  20, 0.90),
(4,  'david',  'David Kumar',     'visual',       12, 0.50),
(5,  'elena',  'Elena Petrov',    'reading',       8, 0.65),
(6,  'farhan', 'Farhan Akhtar',   'visual',       18, 0.88),
(7,  'gina',   'Gina Rossi',      'kinesthetic',  14, 0.72),
(8,  'hassan', 'Hassan Al-Amri',  'auditory',     10, 0.60),
(9,  'irina',  'Irina Sokolova',  'reading',      20, 0.95),
(10, 'jake',   'Jake Thompson',   'kinesthetic',   6, 0.45);

-- ============================================================
-- COMPETENCIES  (id 1–20)
-- ============================================================
-- Уровень 1: основы (bloom 2-3, eqf 3-4)
INSERT INTO competencies (id, slug, name, description, bloom_level, eqf_level) VALUES
(1,  'python_basics',           'Python Programming Fundamentals',   'Variables, loops, functions, OOP basics in Python',                    3, 4),
(2,  'statistics_fundamentals', 'Statistics Fundamentals',           'Descriptive stats, probability, distributions, hypothesis testing',     2, 4),
(3,  'math_fundamentals',       'Mathematics Fundamentals',          'Linear algebra, calculus basics, matrix operations',                   2, 4),
(4,  'sql_databases',           'SQL and Databases',                 'SQL queries, joins, aggregations, database design basics',              3, 5),
(5,  'command_line',            'Command Line and Git',              'Bash basics, Git version control, GitHub workflow',                    2, 3),

-- Уровень 2: прикладные навыки (bloom 3-4, eqf 5)
(6,  'data_cleaning',           'Data Cleaning and Preprocessing',   'Handling missing values, outliers, feature engineering with Pandas',   3, 5),
(7,  'data_visualization',      'Data Visualization',                'Matplotlib, Seaborn, Plotly; chart selection and design principles',    3, 5),
(8,  'python_advanced',         'Advanced Python',                   'Decorators, generators, async, profiling, packaging',                  4, 5),
(9,  'probability_statistics',  'Probability and Statistical Modeling','Bayesian inference, regression, ANOVA, time series analysis',        3, 5),
(10, 'r_programming',           'R Programming',                     'Data wrangling and visualization with R, tidyverse, ggplot2',          3, 5),

-- Уровень 3: аналитика и ML (bloom 3-4, eqf 6)
(11, 'data_analysis',           'Data Analysis',                     'EDA, business metrics, A/B testing, insight communication',            4, 6),
(12, 'machine_learning_basics', 'Machine Learning Basics',           'Supervised/unsupervised learning, scikit-learn, model evaluation',     3, 6),
(13, 'feature_engineering',     'Feature Engineering',               'Feature selection, encoding, scaling, dimensionality reduction PCA',   4, 6),
(14, 'model_evaluation',        'Model Evaluation and Validation',   'Cross-validation, metrics ROC F1 MAE, overfitting, bias-variance',     4, 6),
(15, 'nlp_basics',              'Natural Language Processing',       'Text preprocessing, TF-IDF, word embeddings, sentiment analysis',      4, 6),

-- Уровень 4: продвинутый (bloom 4-5, eqf 7)
(16, 'deep_learning',           'Deep Learning',                     'Neural network architecture, backpropagation, CNNs, RNNs with PyTorch',4, 7),
(17, 'mlops',                   'MLOps and Model Deployment',        'Docker, FastAPI, CI/CD pipelines, model monitoring and versioning',    5, 7),
(18, 'data_engineering',        'Data Engineering',                  'ETL pipelines, Apache Spark, Airflow, data warehousing BigQuery',      5, 7),
(19, 'reinforcement_learning',  'Reinforcement Learning',            'MDP, Q-learning, policy gradients, OpenAI Gym environments',           4, 7),
(20, 'research_methods',        'Research Methods and Academic Writing','Literature review, experiment design, statistical reporting, LaTeX',5, 7);

-- ============================================================
-- PREREQUISITES  (числовые FK)
-- ============================================================

-- Фундамент
INSERT INTO prerequisites (competency_id, requires_competency_id) VALUES
(5,  1),   -- command_line         → python_basics
(8,  1),   -- python_advanced      → python_basics
(9,  2),   -- probability_stats    → statistics_fundamentals
(9,  3),   -- probability_stats    → math_fundamentals
(10, 2),   -- r_programming        → statistics_fundamentals

-- Data pipeline
(6,  1),   -- data_cleaning        → python_basics
(7,  1),   -- data_visualization   → python_basics
(7,  2),   -- data_visualization   → statistics_fundamentals
(4,  1),   -- sql_databases        → python_basics

-- Data analysis
(11, 1),   -- data_analysis        → python_basics
(11, 2),   -- data_analysis        → statistics_fundamentals
(11, 6),   -- data_analysis        → data_cleaning
(11, 7),   -- data_analysis        → data_visualization
(11, 4),   -- data_analysis        → sql_databases

-- Machine learning
(12, 1),   -- ml_basics            → python_basics
(12, 2),   -- ml_basics            → statistics_fundamentals
(12, 6),   -- ml_basics            → data_cleaning
(12, 3),   -- ml_basics            → math_fundamentals
(13, 12),  -- feature_engineering  → ml_basics
(13, 6),   -- feature_engineering  → data_cleaning
(14, 12),  -- model_evaluation     → ml_basics
(14, 9),   -- model_evaluation     → probability_statistics

-- Deep learning
(16, 12),  -- deep_learning        → ml_basics
(16, 3),   -- deep_learning        → math_fundamentals
(16, 14),  -- deep_learning        → model_evaluation
(19, 16),  -- reinforcement_learning → deep_learning
(19, 9),   -- reinforcement_learning → probability_statistics

-- NLP
(15, 12),  -- nlp_basics           → ml_basics
(15, 8),   -- nlp_basics           → python_advanced
(15, 6),   -- nlp_basics           → data_cleaning

-- MLOps & Engineering
(17, 12),  -- mlops                → ml_basics
(17, 5),   -- mlops                → command_line
(17, 14),  -- mlops                → model_evaluation
(18, 4),   -- data_engineering     → sql_databases
(18, 8),   -- data_engineering     → python_advanced
(18, 5),   -- data_engineering     → command_line

-- Research
(20, 2),   -- research_methods     → statistics_fundamentals
(20, 9),   -- research_methods     → probability_statistics
(20, 11);  -- research_methods     → data_analysis

-- ============================================================
-- LEARNER MASTERY  (числовые FK)
-- ============================================================
INSERT INTO learner_mastery (learner_id, competency_id) VALUES
-- Alice (1): Python + статистика + CLI
(1, 1), (1, 2), (1, 5),

-- Bob (2): математика + статистика + R + вероятность
(2, 2), (2, 3), (2, 10), (2, 9),

-- Carol (3): продвинутый уровень
(3, 1), (3, 2), (3, 3), (3, 6), (3, 12), (3, 5), (3, 8), (3, 14),

-- David (4): полный новичок — нет записей

-- Elena (5): только статистика
(5, 2),

-- Farhan (6): fullstack разработчик
(6, 1), (6, 5), (6, 4), (6, 8),

-- Gina (7): аналитик данных
(7, 1), (7, 2), (7, 6), (7, 7), (7, 11),

-- Hassan (8): начинающий
(8, 1),

-- Irina (9): исследователь
(9, 1), (9, 2), (9, 3), (9, 9), (9, 10), (9, 20),

-- Jake (10): студент
(10, 1);

-- ============================================================
-- LEARNING GOALS  (id 1–16)
-- ============================================================
INSERT INTO learning_goals (id, slug, learner_id, competency_id) VALUES
(1,  'alice_ml',     1,  12),  -- Alice     → Machine Learning Basics
(2,  'alice_da',     1,  11),  -- Alice     → Data Analysis
(3,  'bob_da',       2,  11),  -- Bob       → Data Analysis
(4,  'bob_ml',       2,  12),  -- Bob       → Machine Learning Basics
(5,  'carol_dl',     3,  16),  -- Carol     → Deep Learning
(6,  'carol_mlops',  3,  17),  -- Carol     → MLOps
(7,  'david_da',     4,  11),  -- David     → Data Analysis
(8,  'elena_da',     5,  11),  -- Elena     → Data Analysis
(9,  'farhan_mlops', 6,  17),  -- Farhan    → MLOps
(10, 'farhan_de',    6,  18),  -- Farhan    → Data Engineering
(11, 'gina_ml',      7,  12),  -- Gina      → Machine Learning Basics
(12, 'gina_fe',      7,  13),  -- Gina      → Feature Engineering
(13, 'hassan_da',    8,  11),  -- Hassan    → Data Analysis
(14, 'irina_rm',     9,  20),  -- Irina     → Research Methods
(15, 'irina_nlp',    9,  15),  -- Irina     → NLP
(16, 'jake_ml',      10, 12);  -- Jake      → Machine Learning Basics

-- ============================================================
-- RESOURCES  (id 1–42)
-- ============================================================
INSERT INTO resources (id, slug, name, type, difficulty, duration_hours, suitable_styles) VALUES

-- Python (1–5)
(1,  'res_py_video',       'Python для начинающих (видеокурс)',           'video',    1,  7, '["visual","kinesthetic"]'),
(2,  'res_py_article',     'Python: официальная документация и туториалы','article',  1,  5, '["reading"]'),
(3,  'res_py_exercise',    'Python: 100 упражнений на Exercism',          'exercise', 2, 10, '["kinesthetic"]'),
(4,  'res_py_adv_video',   'Advanced Python: курс Corey Schafer',         'video',    3,  6, '["visual"]'),
(5,  'res_py_adv_article', 'Real Python: продвинутые паттерны',           'article',  3,  8, '["reading"]'),

-- Statistics & Math (6–11)
(6,  'res_stats_video',    'Статистика для Data Science (видео)',          'video',    1,  8, '["visual","auditory"]'),
(7,  'res_stats_article',  'Think Stats: вероятность и статистика на Python','article',2, 12, '["reading"]'),
(8,  'res_math_video',     'Линейная алгебра: курс 3Blue1Brown',          'video',    2,  5, '["visual"]'),
(9,  'res_math_article',   'Mathematics for Machine Learning (учебник)',  'article',  3, 15, '["reading"]'),
(10, 'res_prob_video',     'Теория вероятностей: практический курс',      'video',    2,  9, '["visual","auditory"]'),
(11, 'res_prob_exercise',  'Байесовская статистика: задачи на PyMC',      'exercise', 4, 12, '["kinesthetic","reading"]'),

-- SQL (12–14)
(12, 'res_sql_video',      'SQL для аналитиков (видеокурс)',              'video',    1,  6, '["visual","auditory"]'),
(13, 'res_sql_exercise',   'SQLZoo и LeetCode SQL задачи',                'exercise', 2,  8, '["kinesthetic"]'),
(14, 'res_sql_project',    'Проект: анализ данных в PostgreSQL',          'project',  3, 10, '["kinesthetic","visual"]'),

-- Command Line & Git (15–16)
(15, 'res_cli_video',      'Git и командная строка (видео)',              'video',    1,  4, '["visual","auditory"]'),
(16, 'res_cli_exercise',   'Learn Git Branching: интерактивный тренажер', 'exercise', 1,  3, '["kinesthetic"]'),

-- Data Cleaning (17–19)
(17, 'res_clean_video',    'Pandas: чистка данных (видеокурс)',           'video',    2,  6, '["visual"]'),
(18, 'res_clean_exercise', 'Kaggle: Data Cleaning Challenge',             'exercise', 2,  8, '["kinesthetic"]'),
(19, 'res_clean_article',  'Tidy Data: принципы чистых данных (статья)',  'article',  2,  4, '["reading"]'),

-- Data Visualization (20–22)
(20, 'res_viz_video',      'Data Visualization с Matplotlib и Seaborn',  'video',    2,  5, '["visual"]'),
(21, 'res_viz_project',    'Проект: интерактивный дашборд на Plotly',    'project',  3, 12, '["kinesthetic","visual"]'),
(22, 'res_viz_article',    'Storytelling with Data: книга по визуализации','article', 2,  8, '["reading"]'),

-- Machine Learning (23–28)
(23, 'res_ml_video',       'ML с нуля: Scikit-learn на практике',        'video',    3, 10, '["visual","auditory"]'),
(24, 'res_ml_article',     'Hands-On Machine Learning: книга Geron',     'article',  3, 20, '["reading"]'),
(25, 'res_ml_project',     'Kaggle: соревнование Titanic и House Prices','project',  3, 15, '["kinesthetic"]'),
(26, 'res_fe_video',       'Feature Engineering для ML (видеокурс)',      'video',    3,  7, '["visual"]'),
(27, 'res_eval_article',   'Practical Guide to Model Evaluation',        'article',  3,  6, '["reading"]'),
(28, 'res_eval_exercise',  'Задачи на метрики качества моделей',         'exercise', 3,  5, '["kinesthetic","reading"]'),

-- Deep Learning (29–30)
(29, 'res_dl_video',       'Deep Learning Specialization от Coursera',   'video',    4, 25, '["visual","auditory"]'),
(30, 'res_dl_project',     'PyTorch: CNN для классификации изображений', 'project',  4, 20, '["kinesthetic"]'),

-- Reinforcement Learning (31)
(31, 'res_rl_article',     'Sutton and Barto: Reinforcement Learning (PDF)','article',5, 30, '["reading"]'),

-- NLP (32–33)
(32, 'res_nlp_video',      'NLP с нуля: от токенизации до BERT',         'video',    4, 12, '["visual","auditory"]'),
(33, 'res_nlp_project',    'Проект: анализ тональности отзывов',         'project',  4, 15, '["kinesthetic"]'),

-- MLOps (34–35)
(34, 'res_mlops_video',    'MLOps: Docker, FastAPI и DVC (видеокурс)',   'video',    4, 10, '["visual"]'),
(35, 'res_mlops_project',  'Проект: деплой ML-модели в production',      'project',  5, 20, '["kinesthetic"]'),

-- Data Engineering (36–37)
(36, 'res_de_video',       'Apache Spark и Airflow: основы (видео)',      'video',    4, 12, '["visual","auditory"]'),
(37, 'res_de_project',     'Проект: ETL-пайплайн с BigQuery',            'project',  5, 18, '["kinesthetic"]'),

-- Data Analysis (38–40)
(38, 'res_da_video',       'EDA и AB тестирование (видеокурс)',           'video',    3,  8, '["visual","auditory"]'),
(39, 'res_da_project',     'Проект: бизнес-анализ реальных данных',      'project',  3, 12, '["kinesthetic","visual"]'),
(40, 'res_da_article',     'Python for Data Analysis: книга McKinney',   'article',  3, 14, '["reading"]'),

-- Research Methods (41–42)
(41, 'res_rm_article',     'Research Design: учебник Creswell',          'article',  3, 10, '["reading"]'),
(42, 'res_rm_exercise',    'LaTeX и Overleaf: академическое письмо',     'exercise', 2,  5, '["reading","kinesthetic"]'),

-- R Programming (43–44)
(43, 'res_r_video',        'R для статистики: tidyverse и ggplot2',      'video',    2,  9, '["visual"]'),
(44, 'res_r_article',      'R for Data Science: книга Hadley Wickham',   'article',  2, 12, '["reading"]');

-- ============================================================
-- RESOURCE_COMPETENCIES  (числовые FK)
-- ============================================================
INSERT INTO resource_competencies (resource_id, competency_id) VALUES
-- python_basics (1)
(1, 1), (2, 1), (3, 1),
-- python_advanced (8)
(4, 8), (5, 8),
-- statistics_fundamentals (2)
(6, 2), (7, 2),
-- math_fundamentals (3)
(8, 3), (9, 3),
-- probability_statistics (9)
(10, 9), (11, 9),
-- sql_databases (4)
(12, 4), (13, 4), (14, 4),
-- command_line (5)
(15, 5), (16, 5),
-- data_cleaning (6)
(17, 6), (18, 6), (19, 6),
-- data_visualization (7)
(20, 7), (21, 7), (22, 7),
-- machine_learning_basics (12)
(23, 12), (24, 12), (25, 12),
-- feature_engineering (13)
(26, 13),
-- model_evaluation (14)
(27, 14), (28, 14),
-- deep_learning (16)
(29, 16), (30, 16),
-- reinforcement_learning (19)
(31, 19),
-- nlp_basics (15)
(32, 15), (33, 15),
-- mlops (17)
(34, 17), (35, 17),
-- data_engineering (18)
(36, 18), (37, 18),
-- data_analysis (11)
(38, 11), (39, 11), (40, 11),
-- research_methods (20)
(41, 20), (42, 20),
-- r_programming (10)
(43, 10), (44, 10);