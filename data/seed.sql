-- ============================================================
-- LEARNERS  (id 1–20)
-- ============================================================
INSERT INTO learners (id, slug, name, learning_style, available_hours_week, performance_score) VALUES
-- Data Science learners (1–10)
(1,  'aizat',    'Aizat Seitkali',          'visual',       15, 0.75),
(2,  'baurzhan', 'Baurzhan Akhmetov',        'reading',      10, 0.82),
(3,  'kamila',   'Kamila Nurmagambetova',    'kinesthetic',  20, 0.90),
(4,  'dias',     'Dias Bekov',               'visual',       12, 0.50),
(5,  'aigerim',  'Aigerim Kasymova',         'reading',       8, 0.65),
(6,  'farukh',   'Farukh Tashkentov',        'visual',       18, 0.88),
(7,  'gulnara',  'Gulnara Beisova',          'kinesthetic',  14, 0.72),
(8,  'hasan',    'Hasan Abenov',             'auditory',     10, 0.60),
(9,  'inkar',    'Inkar Zhaksybekova',       'reading',      20, 0.95),
(10, 'zhandos',  'Zhandos Kairbekov',        'kinesthetic',   6, 0.45),
-- Web Development learners (11–15)
(11, 'altynai',  'Altynai Sultanova',        'visual',       12, 0.68),
(12, 'marat',    'Marat Omarov',             'kinesthetic',  16, 0.80),
(13, 'saltanat', 'Saltanat Iskakova',        'reading',       9, 0.73),
(14, 'arman',    'Arman Zhumabek',           'auditory',     14, 0.55),
(15, 'madina',   'Madina Dzhaksybetova',     'visual',       20, 0.92),
-- Additional learners (16–20)
(16, 'daniyar',  'Daniyar Bekzhanov',        'reading',      12, 0.70),
(17, 'zhuldyz',  'Zhuldyz Bekova',           'visual',       10, 0.58),
(18, 'erlan',    'Erlan Nurbekov',           'kinesthetic',  15, 0.75),
(19, 'ainur',    'Ainur Tulegenova',         'auditory',      8, 0.62),
(20, 'timur',    'Timur Ramazanov',          'visual',       20, 0.85);

-- ============================================================
-- COMPETENCIES  (id 1–35)
-- ============================================================

-- Data Science — Уровень 1: основы (bloom 2-3, eqf 3-4)
INSERT INTO competencies (id, slug, name, description, bloom_level, eqf_level, domain) VALUES
(1,  'python_basics',           'Python Programming Fundamentals',
     'Variables, loops, functions, OOP basics in Python',                    3, 4, 'data_science'),
(2,  'statistics_fundamentals', 'Statistics Fundamentals',
     'Descriptive stats, probability, distributions, hypothesis testing',     2, 4, 'data_science'),
(3,  'math_fundamentals',       'Mathematics Fundamentals',
     'Linear algebra, calculus basics, matrix operations',                   2, 4, 'data_science'),
(4,  'sql_databases',           'SQL and Databases',
     'SQL queries, joins, aggregations, database design basics',              3, 5, 'data_science'),
(5,  'command_line',            'Command Line and Git',
     'Bash basics, Git version control, GitHub workflow',                    2, 3, 'data_science'),

-- Data Science — Уровень 2: прикладные (bloom 3-4, eqf 5)
(6,  'data_cleaning',           'Data Cleaning and Preprocessing',
     'Handling missing values, outliers, feature engineering with Pandas',   3, 5, 'data_science'),
(7,  'data_visualization',      'Data Visualization',
     'Matplotlib, Seaborn, Plotly; chart selection and design principles',    3, 5, 'data_science'),
(8,  'python_advanced',         'Advanced Python',
     'Decorators, generators, async, profiling, packaging',                  4, 5, 'data_science'),
(9,  'probability_statistics',  'Probability and Statistical Modeling',
     'Bayesian inference, regression, ANOVA, time series analysis',          3, 5, 'data_science'),
(10, 'r_programming',           'R Programming',
     'Data wrangling and visualization with R, tidyverse, ggplot2',          3, 5, 'data_science'),

-- Data Science — Уровень 3: аналитика и ML (bloom 3-4, eqf 6)
(11, 'data_analysis',           'Data Analysis',
     'EDA, business metrics, A/B testing, insight communication',            4, 6, 'data_science'),
(12, 'machine_learning_basics', 'Machine Learning Basics',
     'Supervised/unsupervised learning, scikit-learn, model evaluation',     3, 6, 'data_science'),
(13, 'feature_engineering',     'Feature Engineering',
     'Feature selection, encoding, scaling, dimensionality reduction PCA',   4, 6, 'data_science'),
(14, 'model_evaluation',        'Model Evaluation and Validation',
     'Cross-validation, metrics ROC F1 MAE, overfitting, bias-variance',     4, 6, 'data_science'),
(15, 'nlp_basics',              'Natural Language Processing',
     'Text preprocessing, TF-IDF, word embeddings, sentiment analysis',      4, 6, 'data_science'),

-- Data Science — Уровень 4: продвинутый (bloom 4-5, eqf 7)
(16, 'deep_learning',           'Deep Learning',
     'Neural network architecture, backpropagation, CNNs, RNNs with PyTorch',4, 7, 'data_science'),
(17, 'mlops',                   'MLOps and Model Deployment',
     'Docker, FastAPI, CI/CD pipelines, model monitoring and versioning',    5, 7, 'data_science'),
(18, 'data_engineering',        'Data Engineering',
     'ETL pipelines, Apache Spark, Airflow, data warehousing BigQuery',      5, 7, 'data_science'),
(19, 'reinforcement_learning',  'Reinforcement Learning',
     'MDP, Q-learning, policy gradients, OpenAI Gym environments',           4, 7, 'data_science'),
(20, 'research_methods',        'Research Methods and Academic Writing',
     'Literature review, experiment design, statistical reporting, LaTeX',   5, 7, 'data_science'),

-- Web Dev — Уровень 1: основы (bloom 2-3, eqf 3-4)
(21, 'html_css',            'HTML and CSS Fundamentals',
     'Semantic HTML5, CSS3, Flexbox, Grid, responsive design basics',        2, 3, 'web_dev'),
(22, 'js_basics',           'JavaScript Fundamentals',
     'Variables, functions, DOM manipulation, events, ES6+ syntax',          3, 4, 'web_dev'),
(23, 'web_git',             'Git for Web Development',
     'Git workflow, branching, pull requests, GitHub Pages deployment',       2, 3, 'web_dev'),

-- Web Dev — Уровень 2: прикладные (bloom 3-4, eqf 5)
(24, 'css_advanced',        'Advanced CSS and Design Systems',
     'Animations, CSS variables, BEM methodology, design tokens, Tailwind',  3, 5, 'web_dev'),
(25, 'js_advanced',         'Advanced JavaScript',
     'Async/await, Promises, closures, prototypes, modules, TypeScript',     4, 5, 'web_dev'),
(26, 'web_accessibility',   'Web Accessibility and UX',
     'WCAG 2.1, ARIA, semantic markup, keyboard navigation, screen readers', 3, 5, 'web_dev'),
(27, 'browser_devtools',    'Browser DevTools and Debugging',
     'Chrome DevTools, network tab, performance profiling, debugging JS',    3, 5, 'web_dev'),
(28, 'http_and_apis',       'HTTP Protocol and REST APIs',
     'HTTP methods, status codes, fetch API, JSON, REST principles, Postman',3, 5, 'web_dev'),

-- Web Dev — Уровень 3: фреймворки (bloom 3-4, eqf 6)
(29, 'react_basics',        'React Fundamentals',
     'Components, props, state, hooks, JSX, React Router, Context API',     3, 6, 'web_dev'),
(30, 'nodejs_basics',       'Node.js and Express',
     'Node.js runtime, Express server, middleware, routing, REST API design',3, 6, 'web_dev'),
(31, 'databases_web',       'Databases for Web Applications',
     'SQL with Postgres, NoSQL with MongoDB, ORM/ODM, database design',     3, 6, 'web_dev'),
(32, 'web_security',        'Web Security Fundamentals',
     'OWASP Top 10, XSS, CSRF, SQL injection, authentication, HTTPS',       4, 6, 'web_dev'),

-- Web Dev — Уровень 4: продвинутый (bloom 4-5, eqf 7)
(33, 'react_advanced',      'Advanced React and State Management',
     'Redux, Zustand, performance optimization, SSR, Next.js, testing',     4, 7, 'web_dev'),
(34, 'fullstack_project',   'Full-Stack Application Development',
     'System design, CI/CD, Docker, cloud deployment, AWS/Vercel basics',   5, 7, 'web_dev'),
(35, 'web_performance',     'Web Performance Optimization',
     'Core Web Vitals, lazy loading, caching, CDN, Lighthouse audits',      4, 7, 'web_dev');

-- ============================================================
-- PREREQUISITES
-- ============================================================

-- Data Science: фундамент
INSERT INTO prerequisites (competency_id, requires_competency_id) VALUES
(4,  1),   -- sql_databases        → python_basics
(5,  1),   -- command_line         → python_basics
(6,  1),   -- data_cleaning        → python_basics
(7,  1),   -- data_visualization   → python_basics
(7,  2),   -- data_visualization   → statistics_fundamentals
(8,  1),   -- python_advanced      → python_basics
(9,  2),   -- probability_stats    → statistics_fundamentals
(9,  3),   -- probability_stats    → math_fundamentals
(10, 2),   -- r_programming        → statistics_fundamentals

-- Data Science: аналитика
(11, 1),   -- data_analysis        → python_basics
(11, 2),   -- data_analysis        → statistics_fundamentals
(11, 4),   -- data_analysis        → sql_databases
(11, 6),   -- data_analysis        → data_cleaning
(11, 7),   -- data_analysis        → data_visualization

-- Data Science: машинное обучение
(12, 1),   -- ml_basics            → python_basics
(12, 2),   -- ml_basics            → statistics_fundamentals
(12, 3),   -- ml_basics            → math_fundamentals
(12, 6),   -- ml_basics            → data_cleaning
(13, 6),   -- feature_engineering  → data_cleaning
(13, 12),  -- feature_engineering  → ml_basics
(14, 9),   -- model_evaluation     → probability_statistics
(14, 12),  -- model_evaluation     → ml_basics

-- Data Science: глубокое обучение
(15, 6),   -- nlp_basics           → data_cleaning
(15, 8),   -- nlp_basics           → python_advanced
(15, 12),  -- nlp_basics           → ml_basics
(16, 3),   -- deep_learning        → math_fundamentals
(16, 12),  -- deep_learning        → ml_basics
(16, 14),  -- deep_learning        → model_evaluation
(19, 9),   -- reinforcement_learning → probability_statistics
(19, 16),  -- reinforcement_learning → deep_learning

-- Data Science: MLOps и инженерия
(17, 5),   -- mlops                → command_line
(17, 12),  -- mlops                → ml_basics
(17, 14),  -- mlops                → model_evaluation
(18, 4),   -- data_engineering     → sql_databases
(18, 5),   -- data_engineering     → command_line
(18, 8),   -- data_engineering     → python_advanced

-- Data Science: исследования
(20, 2),   -- research_methods     → statistics_fundamentals
(20, 9),   -- research_methods     → probability_statistics
(20, 11),  -- research_methods     → data_analysis

-- Web Dev: основы
(22, 21),  -- js_basics            → html_css
(24, 21),  -- css_advanced         → html_css
(24, 22),  -- css_advanced         → js_basics
(25, 22),  -- js_advanced          → js_basics
(26, 21),  -- web_accessibility    → html_css
(26, 22),  -- web_accessibility    → js_basics
(27, 22),  -- browser_devtools     → js_basics
(28, 22),  -- http_and_apis        → js_basics

-- Web Dev: фреймворки
(29, 24),  -- react_basics         → css_advanced
(29, 25),  -- react_basics         → js_advanced
(29, 28),  -- react_basics         → http_and_apis
(30, 23),  -- nodejs_basics        → web_git
(30, 25),  -- nodejs_basics        → js_advanced
(30, 28),  -- nodejs_basics        → http_and_apis
(31, 4),   -- databases_web        → sql_databases
(31, 30),  -- databases_web        → nodejs_basics
(32, 28),  -- web_security         → http_and_apis
(32, 30),  -- web_security         → nodejs_basics

-- Web Dev: продвинутый
(33, 29),  -- react_advanced       → react_basics
(33, 32),  -- react_advanced       → web_security
(34, 23),  -- fullstack_project    → web_git
(34, 29),  -- fullstack_project    → react_basics
(34, 30),  -- fullstack_project    → nodejs_basics
(34, 31),  -- fullstack_project    → databases_web
(34, 32),  -- fullstack_project    → web_security
(35, 24),  -- web_performance      → css_advanced
(35, 27),  -- web_performance      → browser_devtools
(35, 29);  -- web_performance      → react_basics

-- ============================================================
-- RESOURCES  (id 1–80)
-- ============================================================

-- Python (1–5)
INSERT INTO resources (id, slug, name, type, difficulty, duration_hours, suitable_styles) VALUES
(1,  'res_py_video',       'Python для начинающих (видеокурс)',             'video',    1,  7.0, '["visual","kinesthetic"]'),
(2,  'res_py_article',     'Python: официальная документация и туториалы', 'article',  1,  5.0, '["reading"]'),
(3,  'res_py_exercise',    'Python: 100 упражнений на Exercism',            'exercise', 2, 10.0, '["kinesthetic"]'),
(4,  'res_py_adv_video',   'Advanced Python: курс Corey Schafer',           'video',    3,  6.0, '["visual"]'),
(5,  'res_py_adv_article', 'Real Python: продвинутые паттерны',             'article',  3,  8.0, '["reading"]'),

-- Statistics & Math (6–11)
(6,  'res_stats_video',    'Статистика для Data Science (видео)',           'video',    1,  8.0, '["visual","auditory"]'),
(7,  'res_stats_article',  'Think Stats: вероятность и статистика на Python','article', 2, 12.0, '["reading"]'),
(8,  'res_math_video',     'Линейная алгебра: курс 3Blue1Brown',            'video',    2,  5.0, '["visual"]'),
(9,  'res_math_article',   'Mathematics for Machine Learning (учебник)',    'article',  3, 15.0, '["reading"]'),
(10, 'res_prob_video',     'Теория вероятностей: практический курс',        'video',    2,  9.0, '["visual","auditory"]'),
(11, 'res_prob_exercise',  'Байесовская статистика: задачи на PyMC',        'exercise', 4, 12.0, '["kinesthetic","reading"]'),

-- SQL (12–14)
(12, 'res_sql_video',      'SQL для аналитиков (видеокурс)',                'video',    1,  6.0, '["visual","auditory"]'),
(13, 'res_sql_exercise',   'SQLZoo и LeetCode SQL задачи',                  'exercise', 2,  8.0, '["kinesthetic"]'),
(14, 'res_sql_project',    'Проект: анализ данных в PostgreSQL',            'project',  3, 10.0, '["kinesthetic","visual"]'),

-- Command Line & Git (15–16)
(15, 'res_cli_video',      'Git и командная строка (видео)',                'video',    1,  4.0, '["visual","auditory"]'),
(16, 'res_cli_exercise',   'Learn Git Branching: интерактивный тренажер',   'exercise', 1,  3.0, '["kinesthetic"]'),

-- Data Cleaning (17–19)
(17, 'res_clean_video',    'Pandas: чистка данных (видеокурс)',             'video',    2,  6.0, '["visual"]'),
(18, 'res_clean_exercise', 'Kaggle: Data Cleaning Challenge',               'exercise', 2,  8.0, '["kinesthetic"]'),
(19, 'res_clean_article',  'Tidy Data: принципы чистых данных (статья)',    'article',  2,  4.0, '["reading"]'),

-- Data Visualization (20–22)
(20, 'res_viz_video',      'Data Visualization с Matplotlib и Seaborn',    'video',    2,  5.0, '["visual"]'),
(21, 'res_viz_project',    'Проект: интерактивный дашборд на Plotly',       'project',  3, 12.0, '["kinesthetic","visual"]'),
(22, 'res_viz_article',    'Storytelling with Data: книга по визуализации', 'article',  2,  8.0, '["reading"]'),

-- Machine Learning (23–28)
(23, 'res_ml_video',       'ML с нуля: Scikit-learn на практике',           'video',    3, 10.0, '["visual","auditory"]'),
(24, 'res_ml_article',     'Hands-On Machine Learning: книга Geron',        'article',  3, 20.0, '["reading"]'),
(25, 'res_ml_project',     'Kaggle: соревнование Titanic и House Prices',   'project',  3, 15.0, '["kinesthetic"]'),
(26, 'res_fe_video',       'Feature Engineering для ML (видеокурс)',         'video',    3,  7.0, '["visual"]'),
(27, 'res_eval_article',   'Practical Guide to Model Evaluation',           'article',  3,  6.0, '["reading"]'),
(28, 'res_eval_exercise',  'Задачи на метрики качества моделей',            'exercise', 3,  5.0, '["kinesthetic","reading"]'),

-- Deep Learning (29–30)
(29, 'res_dl_video',       'Deep Learning Specialization от Coursera',      'video',    4, 25.0, '["visual","auditory"]'),
(30, 'res_dl_project',     'PyTorch: CNN для классификации изображений',    'project',  4, 20.0, '["kinesthetic"]'),

-- Reinforcement Learning (31)
(31, 'res_rl_article',     'Sutton and Barto: Reinforcement Learning (PDF)','article',  5, 30.0, '["reading"]'),

-- NLP (32–33)
(32, 'res_nlp_video',      'NLP с нуля: от токенизации до BERT',            'video',    4, 12.0, '["visual","auditory"]'),
(33, 'res_nlp_project',    'Проект: анализ тональности отзывов',            'project',  4, 15.0, '["kinesthetic"]'),

-- MLOps (34–35)
(34, 'res_mlops_video',    'MLOps: Docker, FastAPI и DVC (видеокурс)',      'video',    4, 10.0, '["visual"]'),
(35, 'res_mlops_project',  'Проект: деплой ML-модели в production',         'project',  5, 20.0, '["kinesthetic"]'),

-- Data Engineering (36–37)
(36, 'res_de_video',       'Apache Spark и Airflow: основы (видео)',         'video',    4, 12.0, '["visual","auditory"]'),
(37, 'res_de_project',     'Проект: ETL-пайплайн с BigQuery',               'project',  5, 18.0, '["kinesthetic"]'),

-- Data Analysis (38–40)
(38, 'res_da_video',       'EDA и AB тестирование (видеокурс)',              'video',    3,  8.0, '["visual","auditory"]'),
(39, 'res_da_project',     'Проект: бизнес-анализ реальных данных',         'project',  3, 12.0, '["kinesthetic","visual"]'),
(40, 'res_da_article',     'Python for Data Analysis: книга McKinney',      'article',  3, 14.0, '["reading"]'),

-- Research Methods (41–42)
(41, 'res_rm_article',     'Research Design: учебник Creswell',             'article',  3, 10.0, '["reading"]'),
(42, 'res_rm_exercise',    'LaTeX и Overleaf: академическое письмо',        'exercise', 2,  5.0, '["reading","kinesthetic"]'),

-- R Programming (43–44)
(43, 'res_r_video',        'R для статистики: tidyverse и ggplot2',         'video',    2,  9.0, '["visual"]'),
(44, 'res_r_article',      'R for Data Science: книга Hadley Wickham',      'article',  2, 12.0, '["reading"]'),

-- HTML & CSS (45–48)
(45, 'res_html_video',     'HTML и CSS: полный курс для начинающих',        'video',    1,  8.0, '["visual","auditory"]'),
(46, 'res_html_exercise',  'freeCodeCamp: Responsive Web Design',           'exercise', 1, 12.0, '["kinesthetic"]'),
(47, 'res_html_article',   'MDN Web Docs: HTML и CSS Reference',            'article',  1,  6.0, '["reading"]'),
(48, 'res_html_project',   'Проект: верстка страницы по макету Figma',      'project',  2, 10.0, '["kinesthetic","visual"]'),

-- CSS Advanced (49–51)
(49, 'res_css_adv_video',    'CSS: Flexbox, Grid и анимации (видеокурс)',   'video',    2,  7.0, '["visual"]'),
(50, 'res_css_adv_exercise', 'CSS Battle: задачи на чистый CSS',            'exercise', 2,  5.0, '["kinesthetic"]'),
(51, 'res_css_adv_article',  'Tailwind CSS: документация и практика',       'article',  2,  6.0, '["reading"]'),

-- JavaScript Fundamentals (52–55)
(52, 'res_js_video',       'JavaScript: курс с нуля до Pro (видео)',        'video',    2, 12.0, '["visual","auditory"]'),
(53, 'res_js_exercise',    'JavaScript30: 30 проектов за 30 дней',          'exercise', 2, 15.0, '["kinesthetic"]'),
(54, 'res_js_article',     'Eloquent JavaScript: книга (бесплатно)',         'article',  2, 18.0, '["reading"]'),
(55, 'res_js_project',     'Проект: интерактивный ToDo на ванильном JS',    'project',  2,  8.0, '["kinesthetic","visual"]'),

-- JavaScript Advanced (56–58)
(56, 'res_js_adv_video',    'JavaScript: async, Promises и TypeScript',     'video',    3,  9.0, '["visual","auditory"]'),
(57, 'res_js_adv_exercise', 'TypeScript Exercises: задачи на типизацию',    'exercise', 3,  7.0, '["kinesthetic","reading"]'),
(58, 'res_js_adv_article',  'You Don''t Know JS: книга серии (бесплатно)',  'article',  3, 14.0, '["reading"]'),

-- Git for Web Dev (59–60)
(59, 'res_git_video',      'Git для веб-разработчиков (видео)',             'video',    1,  4.0, '["visual","auditory"]'),
(60, 'res_git_exercise',   'GitHub Flow: практика с реальными PR',          'exercise', 2,  5.0, '["kinesthetic"]'),

-- HTTP & APIs (61–63)
(61, 'res_http_video',     'HTTP, REST API и Fetch: полный курс (видео)',   'video',    2,  6.0, '["visual","auditory"]'),
(62, 'res_http_exercise',  'Postman: тестирование API на практике',         'exercise', 2,  5.0, '["kinesthetic"]'),
(63, 'res_http_article',   'REST API Design Best Practices (статья)',       'article',  3,  4.0, '["reading"]'),

-- Web Accessibility (64–65)
(64, 'res_a11y_video',     'Web Accessibility: WCAG и ARIA (видео)',        'video',    2,  5.0, '["visual","auditory"]'),
(65, 'res_a11y_article',   'MDN: Accessibility Guide и чеклисты',          'article',  2,  4.0, '["reading"]'),

-- Browser DevTools (66–67)
(66, 'res_devtools_video',   'Chrome DevTools: профилирование и отладка',   'video',    2,  4.0, '["visual"]'),
(67, 'res_devtools_exercise','DevTools Challenges: практика отладки',       'exercise', 2,  3.0, '["kinesthetic"]'),

-- React Basics (68–71)
(68, 'res_react_video',    'React: полный курс с нуля (видеокурс)',         'video',    3, 14.0, '["visual","auditory"]'),
(69, 'res_react_exercise', 'React Tutorial: TodoMVC и приложение с API',    'exercise', 3, 10.0, '["kinesthetic"]'),
(70, 'res_react_article',  'React документация: официальный туториал',      'article',  3,  8.0, '["reading"]'),
(71, 'res_react_project',  'Проект: SPA-приложение с React Router и API',   'project',  3, 16.0, '["kinesthetic","visual"]'),

-- Node.js (72–74)
(72, 'res_node_video',     'Node.js и Express: REST API с нуля (видео)',    'video',    3, 10.0, '["visual","auditory"]'),
(73, 'res_node_exercise',  'Проект: CRUD API с Express и SQLite',           'exercise', 3,  8.0, '["kinesthetic"]'),
(74, 'res_node_article',   'Node.js Best Practices: репозиторий GitHub',    'article',  3,  6.0, '["reading"]'),

-- Databases for Web (75–76)
(75, 'res_db_web_video',   'PostgreSQL + Prisma ORM для веба (видео)',      'video',    3,  8.0, '["visual","auditory"]'),
(76, 'res_db_web_project', 'Проект: API с базой данных и аутентификацией',  'project',  4, 12.0, '["kinesthetic"]'),

-- Web Security (77–78)
(77, 'res_security_video',  'Web Security: OWASP Top 10 (видеокурс)',       'video',    3,  7.0, '["visual","auditory"]'),
(78, 'res_security_article','OWASP Testing Guide: практическое руководство','article',  4,  9.0, '["reading"]'),

-- React Advanced (79)
(79, 'res_react_adv_video', 'Next.js, Redux и оптимизация React (видео)',   'video',    4, 16.0, '["visual","auditory"]'),

-- Full-Stack Project (80)
(80, 'res_fullstack_project','Capstone: Full-Stack приложение с деплоем',   'project',  5, 30.0, '["kinesthetic","visual"]');

-- ============================================================
-- RESOURCE_COMPETENCIES
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
(43, 10), (44, 10),
-- html_css (21)
(45, 21), (46, 21), (47, 21), (48, 21),
-- js_basics (22)
(52, 22), (53, 22), (54, 22), (55, 22),
-- web_git (23)
(59, 23), (60, 23),
-- css_advanced (24)
(49, 24), (50, 24), (51, 24),
-- js_advanced (25)
(56, 25), (57, 25), (58, 25),
-- web_accessibility (26)
(64, 26), (65, 26),
-- browser_devtools (27)
(66, 27), (67, 27),
-- http_and_apis (28)
(61, 28), (62, 28), (63, 28),
-- react_basics (29)
(68, 29), (69, 29), (70, 29), (71, 29),
-- nodejs_basics (30)
(72, 30), (73, 30), (74, 30),
-- databases_web (31)
(75, 31), (76, 31),
-- web_security (32)
(77, 32), (78, 32),
-- react_advanced (33)
(79, 33),
-- fullstack_project (34)
(80, 34),
-- web_performance (35) — переиспользует devtools и react_adv ресурсы
(66, 35), (79, 35);

-- ============================================================
-- LEARNER MASTERY
-- ============================================================
INSERT INTO learner_mastery (learner_id, competency_id, mastered_at) VALUES
-- Aizat (1): Python + статистика + CLI
(1, 1, '2025-03-10 09:00:00'),
(1, 2, '2025-04-05 11:00:00'),
(1, 5, '2025-05-12 14:00:00'),

-- Baurzhan (2): математика + статистика + R + вероятность
(2, 2, '2025-01-15 10:00:00'),
(2, 3, '2025-02-20 09:30:00'),
(2, 9, '2025-04-18 13:00:00'),
(2, 10,'2025-06-01 10:00:00'),

-- Kamila (3): продвинутый уровень DS
(3, 1, '2024-09-01 09:00:00'),
(3, 2, '2024-09-20 10:00:00'),
(3, 3, '2024-10-15 11:00:00'),
(3, 5, '2024-11-01 09:00:00'),
(3, 6, '2025-01-10 10:00:00'),
(3, 8, '2025-02-14 14:00:00'),
(3, 12,'2025-05-20 11:00:00'),
(3, 14,'2025-08-03 10:00:00'),

-- Dias (4): полный новичок — нет записей

-- Aigerim (5): только статистика
(5, 2, '2025-04-22 12:00:00'),

-- Farukh (6): fullstack-разработчик, цель — MLOps
(6, 1, '2025-02-05 09:00:00'),
(6, 4, '2025-03-18 11:00:00'),
(6, 5, '2025-04-02 10:00:00'),
(6, 8, '2025-07-14 14:00:00'),

-- Gulnara (7): аналитик данных
(7, 1, '2025-03-01 09:00:00'),
(7, 2, '2025-04-10 10:00:00'),
(7, 6, '2025-06-05 11:00:00'),
(7, 7, '2025-07-20 13:00:00'),
(7, 11,'2025-10-08 10:00:00'),

-- Hasan (8): начинающий
(8, 1, '2025-06-15 09:00:00'),

-- Inkar (9): исследователь
(9, 1, '2024-06-01 09:00:00'),
(9, 2, '2024-07-15 10:00:00'),
(9, 3, '2024-09-20 11:00:00'),
(9, 9, '2025-01-10 10:00:00'),
(9, 10,'2025-03-05 14:00:00'),
(9, 20,'2025-11-18 10:00:00'),

-- Zhandos (10): студент
(10, 1, '2025-09-10 09:00:00'),

-- Altynai (11): веб — HTML + Git
(11, 21, '2025-08-20 10:00:00'),
(11, 23, '2025-09-15 11:00:00'),

-- Marat (12): junior frontend
(12, 21, '2025-05-01 09:00:00'),
(12, 22, '2025-06-12 11:00:00'),
(12, 23, '2025-07-03 10:00:00'),
(12, 24, '2025-10-20 14:00:00'),

-- Saltanat (13): backend-разработчик
(13, 4,  '2025-04-10 11:00:00'),
(13, 23, '2025-07-25 10:00:00'),
(13, 30, '2025-12-05 14:00:00'),

-- Arman (14): полный новичок в вебе — нет записей

-- Madina (15): senior frontend
(15, 21, '2023-09-01 09:00:00'),
(15, 22, '2023-11-15 10:00:00'),
(15, 23, '2024-01-10 11:00:00'),
(15, 24, '2024-03-20 10:00:00'),
(15, 25, '2024-05-18 14:00:00'),
(15, 26, '2024-07-30 11:00:00'),
(15, 27, '2024-09-12 10:00:00'),
(15, 28, '2024-11-05 13:00:00'),
(15, 29, '2025-02-20 10:00:00'),
(15, 31, '2025-06-14 11:00:00'),

-- Daniyar (16): основы DS
(16, 1, '2025-07-05 09:00:00'),
(16, 2, '2025-08-22 11:00:00'),
(16, 3, '2025-10-14 10:00:00'),

-- Zhuldyz (17): начинающий DS
(17, 1, '2025-11-10 09:00:00'),
(17, 2, '2025-12-18 11:00:00'),

-- Erlan (18): начинающий веб
(18, 21, '2025-10-05 10:00:00'),
(18, 22, '2025-11-22 11:00:00'),
(18, 23, '2026-01-08 09:00:00'),

-- Ainur (19): DS с основами
(19, 1, '2025-08-15 09:00:00'),
(19, 2, '2025-09-28 11:00:00'),
(19, 5, '2025-11-10 10:00:00'),
(19, 6, '2026-02-03 14:00:00'),

-- Timur (20): продвинутый frontend
(20, 21, '2024-11-05 09:00:00'),
(20, 22, '2024-12-20 10:00:00'),
(20, 23, '2025-01-15 11:00:00'),
(20, 24, '2025-03-10 14:00:00'),
(20, 25, '2025-05-25 10:00:00'),
(20, 28, '2025-09-08 13:00:00');

-- ============================================================
-- LEARNING GOALS  (id 1–32)
-- ============================================================
INSERT INTO learning_goals (id, slug, learner_id, competency_id, created_at) VALUES
-- Data Science learners
(1,  'aizat_ml',           1,  12, '2025-05-15 10:00:00'),
(2,  'aizat_da',           1,  11, '2025-05-15 10:05:00'),
(3,  'baurzhan_da',        2,  11, '2025-06-10 09:00:00'),
(4,  'baurzhan_ml',        2,  12, '2025-06-10 09:05:00'),
(5,  'kamila_dl',          3,  16, '2025-08-10 11:00:00'),
(6,  'kamila_mlops',       3,  17, '2025-08-10 11:05:00'),
(7,  'dias_da',            4,  11, '2026-01-20 10:00:00'),
(8,  'aigerim_da',         5,  11, '2025-04-28 09:00:00'),
(9,  'farukh_mlops',       6,  17, '2025-07-20 14:00:00'),
(10, 'farukh_de',          6,  18, '2025-07-20 14:05:00'),
(11, 'gulnara_ml',         7,  12, '2025-10-15 11:00:00'),
(12, 'gulnara_fe',         7,  13, '2025-10-15 11:05:00'),
(13, 'hasan_da',           8,  11, '2025-06-20 09:00:00'),
(14, 'inkar_rm',           9,  20, '2025-11-25 10:00:00'),
(15, 'inkar_nlp',          9,  15, '2025-11-25 10:05:00'),
(16, 'zhandos_ml',         10, 12, '2025-09-15 09:00:00'),
-- Web Dev learners
(17, 'altynai_react',      11, 29, '2025-09-20 10:00:00'),
(18, 'altynai_fullstack',  11, 34, '2025-09-20 10:05:00'),
(19, 'marat_react_adv',    12, 33, '2025-11-01 11:00:00'),
(20, 'marat_perf',         12, 35, '2025-11-01 11:05:00'),
(21, 'saltanat_fullstack', 13, 34, '2026-01-05 09:00:00'),
(22, 'saltanat_security',  13, 32, '2026-01-05 09:05:00'),
(23, 'arman_react',        14, 29, '2026-02-10 10:00:00'),
(24, 'arman_node',         14, 30, '2026-02-10 10:05:00'),
(25, 'madina_react_adv',   15, 33, '2026-01-10 11:00:00'),
(26, 'madina_fullstack',   15, 34, '2026-01-10 11:05:00'),
-- Additional learners
(27, 'daniyar_ml',         16, 12, '2025-10-20 09:00:00'),
(28, 'daniyar_da',         16, 11, '2025-10-20 09:05:00'),
(29, 'zhuldyz_da',         17, 11, '2026-01-08 10:00:00'),
(30, 'erlan_react',        18, 29, '2026-01-12 09:00:00'),
(31, 'ainur_da',           19, 11, '2026-02-05 10:00:00'),
(32, 'timur_react_adv',    20, 33, '2025-09-20 14:00:00');

-- ============================================================
-- LEARNING PATHS  (id 1–15)
-- ============================================================
INSERT INTO learning_paths (id, learner_id, goal_id, generated_at, status) VALUES
(1,  1,  1,  '2026-03-01 10:00:00', 'active'),      -- Aizat → ML Basics
(2,  2,  3,  '2025-11-01 09:00:00', 'completed'),   -- Baurzhan → Data Analysis
(3,  3,  5,  '2026-02-15 11:00:00', 'active'),      -- Kamila → Deep Learning
(4,  4,  7,  '2026-01-25 10:00:00', 'active'),      -- Dias → Data Analysis
(5,  5,  8,  '2025-05-01 09:00:00', 'active'),      -- Aigerim → Data Analysis
(6,  6,  9,  '2025-08-01 14:00:00', 'active'),      -- Farukh → MLOps
(7,  7,  11, '2025-12-10 11:00:00', 'completed'),   -- Gulnara → ML Basics
(8,  8,  13, '2025-07-01 09:00:00', 'active'),      -- Hasan → Data Analysis
(9,  9,  15, '2025-12-01 10:00:00', 'active'),      -- Inkar → NLP
(10, 11, 17, '2025-10-01 10:00:00', 'active'),      -- Altynai → React Basics
(11, 12, 19, '2025-11-10 11:00:00', 'active'),      -- Marat → React Advanced
(12, 14, 23, '2026-02-15 10:00:00', 'active'),      -- Arman → React Basics
(13, 15, 25, '2026-01-15 11:00:00', 'completed'),   -- Madina → React Advanced
(14, 16, 27, '2025-10-25 09:00:00', 'active'),      -- Daniyar → ML Basics
(15, 18, 30, '2026-01-20 09:00:00', 'active');      -- Erlan → React Basics

-- ============================================================
-- PATH STEPS
-- ============================================================
INSERT INTO path_steps (id, path_id, competency_id, resource_id, step_order, is_completed) VALUES

-- Path 1: Aizat → ML Basics (gaps: math_fund=3, data_cleaning=6)
(1,  1, 3,  8,  1, 0),   -- математика → видеокурс 3Blue1Brown
(2,  1, 6,  17, 2, 0),   -- чистка данных → Pandas видео

-- Path 2: Baurzhan → Data Analysis (completed; gaps: python=1, sql=4, cleaning=6, viz=7)
(3,  2, 1,  2,  1, 1),   -- Python → официальная документация
(4,  2, 4,  12, 2, 1),   -- SQL → видеокурс
(5,  2, 6,  19, 3, 1),   -- чистка → Tidy Data статья
(6,  2, 7,  22, 4, 1),   -- визуализация → Storytelling with Data

-- Path 3: Kamila → Deep Learning (gap: probability_stats=9)
(7,  3, 9,  11, 1, 0),   -- вероятность → задачи на PyMC

-- Path 4: Dias → Data Analysis (gaps: python=1, stats=2, sql=4, cleaning=6, viz=7)
(8,  4, 1,  1,  1, 0),   -- Python → видеокурс
(9,  4, 2,  6,  2, 0),   -- статистика → видео
(10, 4, 4,  12, 3, 0),   -- SQL → видеокурс
(11, 4, 6,  17, 4, 0),   -- чистка → Pandas видео
(12, 4, 7,  20, 5, 0),   -- визуализация → Matplotlib видео

-- Path 5: Aigerim → Data Analysis (gaps: python=1, sql=4, cleaning=6, viz=7)
(13, 5, 1,  2,  1, 0),   -- Python → документация (reading)
(14, 5, 4,  12, 2, 0),   -- SQL → видеокурс
(15, 5, 6,  19, 3, 0),   -- чистка → Tidy Data статья
(16, 5, 7,  22, 4, 0),   -- визуализация → Storytelling статья

-- Path 6: Farukh → MLOps (gaps: stats=2, math=3, cleaning=6, prob=9, ml=12, eval=14)
(17, 6, 2,  6,  1, 0),   -- статистика → видео
(18, 6, 3,  8,  2, 0),   -- математика → 3Blue1Brown
(19, 6, 6,  17, 3, 0),   -- чистка → Pandas видео
(20, 6, 9,  10, 4, 0),   -- вероятность → видеокурс
(21, 6, 12, 23, 5, 0),   -- ML → Scikit-learn видео
(22, 6, 14, 28, 6, 0),   -- оценка моделей → задачи на метрики

-- Path 7: Gulnara → ML Basics (completed; gap: math=3)
(23, 7, 3,  8,  1, 1),   -- математика → 3Blue1Brown

-- Path 8: Hasan → Data Analysis (gaps: stats=2, sql=4, cleaning=6, viz=7)
(24, 8, 2,  6,  1, 0),   -- статистика → видео (auditory ✓)
(25, 8, 4,  12, 2, 0),   -- SQL → видеокурс (auditory ✓)
(26, 8, 6,  17, 3, 0),   -- чистка → Pandas видео
(27, 8, 7,  20, 4, 0),   -- визуализация → Matplotlib видео

-- Path 9: Inkar → NLP (gaps: cleaning=6, python_adv=8, ml=12)
(28, 9, 6,  19, 1, 0),   -- чистка → Tidy Data статья
(29, 9, 8,  5,  2, 0),   -- Advanced Python → Real Python статья
(30, 9, 12, 24, 3, 0),   -- ML → Hands-On ML книга

-- Path 10: Altynai → React Basics (gaps: js_basics=22, css_adv=24, js_adv=25, http=28)
(31, 10, 22, 52, 1, 0),  -- JS → видеокурс
(32, 10, 24, 49, 2, 0),  -- CSS Advanced → видеокурс
(33, 10, 25, 56, 3, 0),  -- JS Advanced → видео
(34, 10, 28, 61, 4, 0),  -- HTTP & API → видеокурс

-- Path 11: Marat → React Advanced (gaps: js_adv=25, http=28, react=29, node=30, security=32)
(35, 11, 25, 57, 1, 0),  -- JS Advanced → TypeScript задачи (kinesthetic ✓)
(36, 11, 28, 62, 2, 0),  -- HTTP → Postman (kinesthetic ✓)
(37, 11, 29, 69, 3, 0),  -- React → TodoMVC упражнение (kinesthetic ✓)
(38, 11, 30, 73, 4, 0),  -- Node.js → CRUD API упражнение (kinesthetic ✓)
(39, 11, 32, 77, 5, 0),  -- Security → OWASP видео

-- Path 12: Arman → React Basics (gaps: html=21, git=23, js=22, css_adv=24, js_adv=25, http=28)
(40, 12, 21, 45, 1, 0),  -- HTML/CSS → видеокурс (auditory ✓)
(41, 12, 23, 59, 2, 0),  -- Git → видео (auditory ✓)
(42, 12, 22, 52, 3, 0),  -- JS → видеокурс (auditory ✓)
(43, 12, 24, 49, 4, 0),  -- CSS Advanced → видеокурс
(44, 12, 25, 56, 5, 0),  -- JS Advanced → видео (auditory ✓)
(45, 12, 28, 61, 6, 0),  -- HTTP → видеокурс (auditory ✓)

-- Path 13: Madina → React Advanced (completed; gaps: node=30, security=32)
(46, 13, 30, 72, 1, 1),  -- Node.js → видеокурс
(47, 13, 32, 77, 2, 1),  -- Security → OWASP видео

-- Path 14: Daniyar → ML Basics (gap: cleaning=6)
(48, 14, 6,  19, 1, 0),  -- чистка → Tidy Data статья (reading ✓)

-- Path 15: Erlan → React Basics (gaps: css_adv=24, js_adv=25, http=28)
(49, 15, 24, 50, 1, 0),  -- CSS Advanced → CSS Battle (kinesthetic ✓)
(50, 15, 25, 57, 2, 0),  -- JS Advanced → TypeScript задачи (kinesthetic ✓)
(51, 15, 28, 62, 3, 0);  -- HTTP → Postman (kinesthetic ✓)

-- ============================================================
-- EXPLANATIONS
-- ============================================================
INSERT INTO explanations (id, path_step_id, missing_competency, why_required, relation_to_goal, resource_selected, why_resource_matches, reasoning_chain) VALUES

-- Path 1: Aizat → ML Basics
(1, 1,
 'Mathematics Fundamentals',
 '«Mathematics Fundamentals» — обязательный prerequisite для «Machine Learning Basics». Алгоритмы ML используют линейную алгебру и матрицы.',
 'Цепочка: Mathematics Fundamentals → Machine Learning Basics',
 'Линейная алгебра: курс 3Blue1Brown',
 'Выбран: соответствует стилю (visual), сложность 2/5, продолжительность ~5ч.',
 '[3, 12]'),

(2, 2,
 'Data Cleaning and Preprocessing',
 '«Data Cleaning» — обязательный prerequisite для «Machine Learning Basics». Чистые данные критичны для качества модели.',
 'Цепочка: Data Cleaning → Machine Learning Basics',
 'Pandas: чистка данных (видеокурс)',
 'Выбран: соответствует стилю (visual), сложность 2/5, продолжительность ~6ч.',
 '[6, 12]'),

-- Path 2: Baurzhan → Data Analysis (completed)
(3, 3,
 'Python Programming Fundamentals',
 '«Python Fundamentals» является базовым prerequisite для «Data Analysis». Pandas, Matplotlib и инструменты анализа требуют Python.',
 'Цепочка: Python Fundamentals → Data Cleaning → Data Analysis',
 'Python: официальная документация и туториалы',
 'Выбран: соответствует стилю (reading), официальная документация, сложность 1/5.',
 '[1, 6, 11]'),

(4, 4,
 'SQL and Databases',
 '«SQL and Databases» необходим для «Data Analysis» — реальные данные хранятся в реляционных БД.',
 'Цепочка: SQL and Databases → Data Analysis',
 'SQL для аналитиков (видеокурс)',
 'Ближайший доступный вариант, сложность 1/5, продолжительность ~6ч.',
 '[4, 11]'),

-- Path 9: Inkar → NLP
(5, 28,
 'Data Cleaning and Preprocessing',
 '«Data Cleaning» — обязательный prerequisite для «Natural Language Processing». Обработка текста требует очистки и нормализации.',
 'Цепочка: Data Cleaning → Machine Learning Basics → NLP',
 'Tidy Data: принципы чистых данных (статья)',
 'Выбран: соответствует стилю (reading), академическая статья, сложность 2/5.',
 '[6, 12, 15]'),

(6, 29,
 'Advanced Python',
 '«Advanced Python» необходим для «NLP» — работа с текстом использует генераторы, регулярные выражения и асинхронные паттерны.',
 'Цепочка: Advanced Python → Natural Language Processing',
 'Real Python: продвинутые паттерны',
 'Выбран: соответствует стилю (reading), сложность 3/5, продолжительность ~8ч.',
 '[8, 15]'),

-- Path 10: Altynai → React Basics
(7, 31,
 'JavaScript Fundamentals',
 '«JavaScript Fundamentals» — основной prerequisite для «React Fundamentals». React написан на JS.',
 'Цепочка: JavaScript Fundamentals → CSS Advanced → React Fundamentals',
 'JavaScript: курс с нуля до Pro (видео)',
 'Выбран: соответствует стилю (visual), видеоформат, сложность 2/5, продолжительность ~12ч.',
 '[22, 24, 29]'),

(8, 34,
 'HTTP Protocol and REST APIs',
 '«HTTP and REST APIs» необходим для «React Fundamentals» — React-приложения взаимодействуют с backend через REST.',
 'Цепочка: HTTP Protocol → React Fundamentals',
 'HTTP, REST API и Fetch: полный курс (видео)',
 'Выбран: соответствует стилю (visual), видеоформат, сложность 2/5, продолжительность ~6ч.',
 '[28, 29]');
