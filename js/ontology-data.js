// ================================================================
// ADAPTER LAYER
// Преобразует новую структуру ONTOLOGY в формат, который ожидают
// существующие файлы: app.js, reasoner.js, graph.js, services
// ================================================================

var ONTOLOGY = {

  // ─────────────────────────────────────────────────────────
  // LEARNERS
  // ─────────────────────────────────────────────────────────
  learners: {
    // ── DATA SCIENCE ────────────────────────────────────────
    1:  { id:1,  slug:'aizat',    name:'Aizat Seitkali',
          learningStyle:'visual',      availableHours:15, performanceScore:0.75,
          domain:'data_science', masteredIds:[1,2,5],
          bio:'Business graduate transitioning to DS. Knows Python basics and statistics.' },
    2:  { id:2,  slug:'baurzhan', name:'Baurzhan Akhmetov',
          learningStyle:'reading',     availableHours:10, performanceScore:0.82,
          domain:'data_science', masteredIds:[2,3,9,10],
          bio:'Mathematician. Knows R and probability theory well, but has not coded Python yet.' },
    3:  { id:3,  slug:'kamila',   name:'Kamila Nurmagambetova',
          learningStyle:'kinesthetic', availableHours:20, performanceScore:0.90,
          domain:'data_science', masteredIds:[1,2,3,5,6,8,12,14],
          bio:'Senior software developer targeting ML. Strong programming foundation.' },
    4:  { id:4,  slug:'dias',     name:'Dias Bekov',
          learningStyle:'visual',      availableHours:12, performanceScore:0.50,
          domain:'data_science', masteredIds:[],
          bio:'Career changer from healthcare. Complete beginner — needs full Data Analysis path.' },
    5:  { id:5,  slug:'aigerim',  name:'Aigerim Kasymova',
          learningStyle:'reading',     availableHours:8,  performanceScore:0.65,
          domain:'data_science', masteredIds:[2],
          bio:'Humanities graduate. Has statistics theory but no programming experience.' },
    6:  { id:6,  slug:'farukh',   name:'Farukh Tashkentov',
          learningStyle:'visual',      availableHours:18, performanceScore:0.88,
          domain:'data_science', masteredIds:[1,4,5,8,21,22,23,25,28],
          bio:'Full-stack developer. Knows both Python (DS side) and web tech. Targeting MLOps.' },
    7:  { id:7,  slug:'gulnara',  name:'Gulnara Beisova',
          learningStyle:'kinesthetic', availableHours:14, performanceScore:0.72,
          domain:'data_science', masteredIds:[1,2,6,7,11],
          bio:'Data analyst with strong EDA skills, moving toward predictive modelling.' },
    8:  { id:8,  slug:'hasan',    name:'Hasan Abenov',
          learningStyle:'auditory',    availableHours:10, performanceScore:0.60,
          domain:'data_science', masteredIds:[1],
          bio:'Recent Python learner. Knows basics, wants to reach Data Analysis.' },
    9:  { id:9,  slug:'inkar',    name:'Inkar Zhaksybekova',
          learningStyle:'reading',     availableHours:20, performanceScore:0.95,
          domain:'data_science', masteredIds:[1,2,3,9,10,20],
          bio:'Academic researcher with strong theoretical background. Goal: add NLP.' },
    10: { id:10, slug:'zhandos',  name:'Zhandos Kairbekov',
          learningStyle:'kinesthetic', availableHours:6,  performanceScore:0.45,
          domain:'data_science', masteredIds:[1],
          bio:'Undergraduate student, limited time. ML Basics as first milestone.' },
    // ── WEB DEVELOPMENT ─────────────────────────────────────
    11: { id:11, slug:'altynai',  name:'Altynai Sultanova',
          learningStyle:'visual',      availableHours:12, performanceScore:0.68,
          domain:'web_dev', masteredIds:[21,23],
          bio:'Designer learning to code. Has HTML/CSS and Git, now diving into JavaScript.' },
    12: { id:12, slug:'marat',    name:'Marat Omarov',
          learningStyle:'kinesthetic', availableHours:16, performanceScore:0.80,
          domain:'web_dev', masteredIds:[21,22,23,24],
          bio:'Junior frontend developer. Comfortable with HTML/CSS/JS. Ready for React.' },
    13: { id:13, slug:'saltanat', name:'Saltanat Iskakova',
          learningStyle:'reading',     availableHours:9,  performanceScore:0.73,
          domain:'web_dev', masteredIds:[4,23,30],
          bio:'Backend developer (Node.js). Knows databases and server-side, not frontend.' },
    14: { id:14, slug:'arman',    name:'Arman Zhumabek',
          learningStyle:'auditory',    availableHours:14, performanceScore:0.55,
          domain:'web_dev', masteredIds:[],
          bio:'Absolute beginner. Wants to become a web developer from scratch.' },
    15: { id:15, slug:'madina',   name:'Madina Dzhaksybetova',
          learningStyle:'visual',      availableHours:20, performanceScore:0.92,
          domain:'web_dev', masteredIds:[21,22,23,24,25,26,27,28,29,31],
          bio:'Senior frontend engineer. Knows almost everything except Advanced React and Full-Stack.' },
    // ── ADDITIONAL ──────────────────────────────────────────
    16: { id:16, slug:'daniyar',  name:'Daniyar Bekzhanov',
          learningStyle:'reading',     availableHours:12, performanceScore:0.70,
          domain:'data_science', masteredIds:[1,2,3],
          bio:'Self-taught programmer. Has Python, statistics and math. Ready to start ML.' },
    17: { id:17, slug:'zhuldyz',  name:'Zhuldyz Bekova',
          learningStyle:'visual',      availableHours:10, performanceScore:0.58,
          domain:'data_science', masteredIds:[1,2],
          bio:'Recent bootcamp graduate. Knows Python and basic statistics, aiming for Data Analysis.' },
    18: { id:18, slug:'erlan',    name:'Erlan Nurbekov',
          learningStyle:'kinesthetic', availableHours:15, performanceScore:0.75,
          domain:'web_dev', masteredIds:[21,22,23],
          bio:'Frontend hobbyist. Has HTML, JS and Git basics. Wants to build full React apps.' },
    19: { id:19, slug:'ainur',    name:'Ainur Tulegenova',
          learningStyle:'auditory',    availableHours:8,  performanceScore:0.62,
          domain:'data_science', masteredIds:[1,2,5,6],
          bio:'Analyst transitioning to DS. Knows Python, statistics, CLI and data cleaning basics.' },
    20: { id:20, slug:'timur',    name:'Timur Ramazanov',
          learningStyle:'visual',      availableHours:20, performanceScore:0.85,
          domain:'web_dev', masteredIds:[21,22,23,24,25,28],
          bio:'Experienced frontend developer. Knows HTML/CSS/JS and APIs. Targeting React Advanced.' },
  },

  // ─────────────────────────────────────────────────────────
  // COMPETENCIES
  // ─────────────────────────────────────────────────────────
  competencies: {
    // DATA SCIENCE — Level 1 (eqf 3-5, bloom 2-3)
    1:  { id:1,  slug:'python_basics',           domain:'data_science', bloomLevel:3, eqfLevel:4,
          name:'Python Fundamentals',
          description:'Variables, loops, functions, OOP basics in Python' },
    2:  { id:2,  slug:'statistics_fundamentals', domain:'data_science', bloomLevel:2, eqfLevel:4,
          name:'Statistics Fundamentals',
          description:'Descriptive stats, probability, distributions, hypothesis testing' },
    3:  { id:3,  slug:'math_fundamentals',       domain:'data_science', bloomLevel:2, eqfLevel:4,
          name:'Mathematics Fundamentals',
          description:'Linear algebra, calculus basics, matrix operations' },
    4:  { id:4,  slug:'sql_databases',           domain:'data_science', bloomLevel:3, eqfLevel:5,
          name:'SQL and Databases',
          description:'SQL queries, joins, aggregations, database design basics' },
    5:  { id:5,  slug:'command_line',            domain:'data_science', bloomLevel:2, eqfLevel:3,
          name:'Command Line and Git',
          description:'Bash basics, Git version control, GitHub workflow' },
    // DATA SCIENCE — Level 2 (eqf 5, bloom 3-4)
    6:  { id:6,  slug:'data_cleaning',           domain:'data_science', bloomLevel:3, eqfLevel:5,
          name:'Data Cleaning',
          description:'Handling missing values, outliers, feature engineering with Pandas' },
    7:  { id:7,  slug:'data_visualization',      domain:'data_science', bloomLevel:3, eqfLevel:5,
          name:'Data Visualization',
          description:'Matplotlib, Seaborn, Plotly; chart selection and design principles' },
    8:  { id:8,  slug:'python_advanced',         domain:'data_science', bloomLevel:4, eqfLevel:5,
          name:'Advanced Python',
          description:'Decorators, generators, async, profiling, packaging' },
    9:  { id:9,  slug:'probability_statistics',  domain:'data_science', bloomLevel:3, eqfLevel:5,
          name:'Probability and Statistical Modeling',
          description:'Bayesian inference, regression, ANOVA, time series analysis' },
    10: { id:10, slug:'r_programming',           domain:'data_science', bloomLevel:3, eqfLevel:5,
          name:'R Programming',
          description:'Data wrangling and visualization with R, tidyverse, ggplot2' },
    // DATA SCIENCE — Level 3 (eqf 6, bloom 3-4)
    11: { id:11, slug:'data_analysis',           domain:'data_science', bloomLevel:4, eqfLevel:6,
          name:'Data Analysis',
          description:'EDA, business metrics, A/B testing, insight communication' },
    12: { id:12, slug:'machine_learning_basics', domain:'data_science', bloomLevel:3, eqfLevel:6,
          name:'Machine Learning Basics',
          description:'Supervised/unsupervised learning, scikit-learn, model evaluation' },
    13: { id:13, slug:'feature_engineering',     domain:'data_science', bloomLevel:4, eqfLevel:6,
          name:'Feature Engineering',
          description:'Feature selection, encoding, scaling, dimensionality reduction PCA' },
    14: { id:14, slug:'model_evaluation',        domain:'data_science', bloomLevel:4, eqfLevel:6,
          name:'Model Evaluation',
          description:'Cross-validation, metrics ROC F1 MAE, overfitting, bias-variance' },
    15: { id:15, slug:'nlp_basics',              domain:'data_science', bloomLevel:4, eqfLevel:6,
          name:'Natural Language Processing',
          description:'Text preprocessing, TF-IDF, word embeddings, sentiment analysis' },
    // DATA SCIENCE — Level 4 (eqf 7, bloom 4-5)
    16: { id:16, slug:'deep_learning',           domain:'data_science', bloomLevel:4, eqfLevel:7,
          name:'Deep Learning',
          description:'Neural network architecture, backpropagation, CNNs, RNNs with PyTorch' },
    17: { id:17, slug:'mlops',                   domain:'data_science', bloomLevel:5, eqfLevel:7,
          name:'MLOps and Model Deployment',
          description:'Docker, FastAPI, CI/CD pipelines, model monitoring and versioning' },
    18: { id:18, slug:'data_engineering',        domain:'data_science', bloomLevel:5, eqfLevel:7,
          name:'Data Engineering',
          description:'ETL pipelines, Apache Spark, Airflow, data warehousing BigQuery' },
    19: { id:19, slug:'reinforcement_learning',  domain:'data_science', bloomLevel:4, eqfLevel:7,
          name:'Reinforcement Learning',
          description:'MDP, Q-learning, policy gradients, OpenAI Gym environments' },
    20: { id:20, slug:'research_methods',        domain:'data_science', bloomLevel:5, eqfLevel:7,
          name:'Research Methods',
          description:'Literature review, experiment design, statistical reporting, LaTeX' },
    // WEB DEV — Level 1 (eqf 3-4, bloom 2-3)
    21: { id:21, slug:'html_css',            domain:'web_dev', bloomLevel:2, eqfLevel:3,
          name:'HTML and CSS Fundamentals',
          description:'Semantic HTML5, CSS3, Flexbox, Grid, responsive design basics' },
    22: { id:22, slug:'js_basics',           domain:'web_dev', bloomLevel:3, eqfLevel:4,
          name:'JavaScript Fundamentals',
          description:'Variables, functions, DOM manipulation, events, ES6+ syntax' },
    23: { id:23, slug:'web_git',             domain:'web_dev', bloomLevel:2, eqfLevel:3,
          name:'Git for Web Development',
          description:'Git workflow, branching, pull requests, GitHub Pages deployment' },
    // WEB DEV — Level 2 (eqf 5, bloom 3-4)
    24: { id:24, slug:'css_advanced',        domain:'web_dev', bloomLevel:3, eqfLevel:5,
          name:'Advanced CSS and Design Systems',
          description:'Animations, CSS variables, BEM methodology, design tokens, Tailwind' },
    25: { id:25, slug:'js_advanced',         domain:'web_dev', bloomLevel:4, eqfLevel:5,
          name:'Advanced JavaScript',
          description:'Async/await, Promises, closures, prototypes, modules, TypeScript intro' },
    26: { id:26, slug:'web_accessibility',   domain:'web_dev', bloomLevel:3, eqfLevel:5,
          name:'Web Accessibility and UX',
          description:'WCAG 2.1, ARIA, semantic markup, keyboard navigation, screen readers' },
    27: { id:27, slug:'browser_devtools',    domain:'web_dev', bloomLevel:3, eqfLevel:5,
          name:'Browser DevTools and Debugging',
          description:'Chrome DevTools, network tab, performance profiling, debugging JS' },
    28: { id:28, slug:'http_and_apis',       domain:'web_dev', bloomLevel:3, eqfLevel:5,
          name:'HTTP Protocol and REST APIs',
          description:'HTTP methods, status codes, fetch API, JSON, REST principles, Postman' },
    // WEB DEV — Level 3 (eqf 6, bloom 3-4)
    29: { id:29, slug:'react_basics',        domain:'web_dev', bloomLevel:3, eqfLevel:6,
          name:'React Fundamentals',
          description:'Components, props, state, hooks, JSX, React Router, Context API' },
    30: { id:30, slug:'nodejs_basics',       domain:'web_dev', bloomLevel:3, eqfLevel:6,
          name:'Node.js and Express',
          description:'Node.js runtime, Express server, middleware, routing, REST API design' },
    31: { id:31, slug:'databases_web',       domain:'web_dev', bloomLevel:3, eqfLevel:6,
          name:'Databases for Web Applications',
          description:'SQL with Postgres, NoSQL with MongoDB, ORM/ODM, database design' },
    32: { id:32, slug:'web_security',        domain:'web_dev', bloomLevel:4, eqfLevel:6,
          name:'Web Security Fundamentals',
          description:'OWASP Top 10, XSS, CSRF, SQL injection, authentication, HTTPS' },
    // WEB DEV — Level 4 (eqf 7, bloom 4-5)
    33: { id:33, slug:'react_advanced',      domain:'web_dev', bloomLevel:4, eqfLevel:7,
          name:'Advanced React and State Management',
          description:'Redux, Zustand, performance optimization, SSR, Next.js, testing' },
    34: { id:34, slug:'fullstack_project',   domain:'web_dev', bloomLevel:5, eqfLevel:7,
          name:'Full-Stack Application Development',
          description:'System design, CI/CD, Docker, cloud deployment, AWS/Vercel basics' },
    35: { id:35, slug:'web_performance',     domain:'web_dev', bloomLevel:4, eqfLevel:7,
          name:'Web Performance Optimization',
          description:'Core Web Vitals, lazy loading, caching, CDN, Lighthouse audits' },
  },

  // ─────────────────────────────────────────────────────────
  // PREREQUISITES  { competencyId: [requiredIds] }
  // ─────────────────────────────────────────────────────────
  prerequisites: {
    // Data Science
    4:  [1],             // sql_databases        → python_basics
    5:  [1],             // command_line         → python_basics
    6:  [1],             // data_cleaning        → python_basics
    7:  [1, 2],          // data_visualization   → python_basics, statistics
    8:  [1],             // python_advanced      → python_basics
    9:  [2, 3],          // probability_stats    → statistics, math
    10: [2],             // r_programming        → statistics
    11: [1, 2, 4, 6, 7], // data_analysis        → python, stats, sql, cleaning, viz
    12: [1, 2, 3, 6],    // ml_basics            → python, stats, math, cleaning
    13: [6, 12],         // feature_engineering  → cleaning, ml_basics
    14: [9, 12],         // model_evaluation     → probability, ml_basics
    15: [6, 8, 12],      // nlp_basics           → cleaning, advanced_python, ml_basics
    16: [3, 12, 14],     // deep_learning        → math, ml_basics, model_eval
    17: [5, 12, 14],     // mlops                → cli, ml_basics, model_eval
    18: [4, 5, 8],       // data_engineering     → sql, cli, advanced_python
    19: [9, 16],         // reinforcement_learning
    20: [2, 9, 11],      // research_methods
    // Web Development
    22: [21],            // js_basics            → html_css
    24: [21, 22],        // css_advanced         → html_css, js_basics
    25: [22],            // js_advanced          → js_basics
    26: [21, 22],        // web_accessibility    → html_css, js_basics
    27: [22],            // browser_devtools     → js_basics
    28: [22],            // http_and_apis        → js_basics
    29: [24, 25, 28],    // react_basics         → css_adv, js_adv, http
    30: [23, 25, 28],    // nodejs_basics        → git, js_adv, http
    31: [4,  30],        // databases_web        → sql, nodejs
    32: [28, 30],        // web_security         → http, nodejs
    33: [29, 32],        // react_advanced       → react_basics, security
    34: [23, 29, 30, 31, 32], // fullstack       → git, react, node, db, security
    35: [24, 27, 29],    // web_performance      → css_adv, devtools, react
  },

  // ─────────────────────────────────────────────────────────
  // RESOURCES  { competencyId: [resourceObjects] }
  // ─────────────────────────────────────────────────────────
  resources: {
    1: [
      { id:1,  name:'Python для начинающих (видеокурс)',              type:'video',    difficulty:1, durationHours:7,  suitableStyles:['visual','kinesthetic'] },
      { id:2,  name:'Python: официальная документация и туториалы',  type:'article',  difficulty:1, durationHours:5,  suitableStyles:['reading'] },
      { id:3,  name:'Python: 100 упражнений на Exercism',            type:'exercise', difficulty:2, durationHours:10, suitableStyles:['kinesthetic'] },
    ],
    2: [
      { id:6,  name:'Статистика для Data Science (видео)',            type:'video',    difficulty:1, durationHours:8,  suitableStyles:['visual','auditory'] },
      { id:7,  name:'Think Stats: вероятность и статистика на Python',type:'article',  difficulty:2, durationHours:12, suitableStyles:['reading'] },
    ],
    3: [
      { id:8,  name:'Линейная алгебра: курс 3Blue1Brown',            type:'video',    difficulty:2, durationHours:5,  suitableStyles:['visual'] },
      { id:9,  name:'Mathematics for Machine Learning (учебник)',    type:'article',  difficulty:3, durationHours:15, suitableStyles:['reading'] },
    ],
    4: [
      { id:12, name:'SQL для аналитиков (видеокурс)',                type:'video',    difficulty:1, durationHours:6,  suitableStyles:['visual','auditory'] },
      { id:13, name:'SQLZoo и LeetCode SQL задачи',                  type:'exercise', difficulty:2, durationHours:8,  suitableStyles:['kinesthetic'] },
      { id:14, name:'Проект: анализ данных в PostgreSQL',            type:'project',  difficulty:3, durationHours:10, suitableStyles:['kinesthetic','visual'] },
    ],
    5: [
      { id:15, name:'Git и командная строка (видео)',                type:'video',    difficulty:1, durationHours:4,  suitableStyles:['visual','auditory'] },
      { id:16, name:'Learn Git Branching: интерактивный тренажер',   type:'exercise', difficulty:1, durationHours:3,  suitableStyles:['kinesthetic'] },
    ],
    6: [
      { id:17, name:'Pandas: чистка данных (видеокурс)',             type:'video',    difficulty:2, durationHours:6,  suitableStyles:['visual'] },
      { id:18, name:'Kaggle: Data Cleaning Challenge',               type:'exercise', difficulty:2, durationHours:8,  suitableStyles:['kinesthetic'] },
      { id:19, name:'Tidy Data: принципы чистых данных (статья)',    type:'article',  difficulty:2, durationHours:4,  suitableStyles:['reading'] },
    ],
    7: [
      { id:20, name:'Data Visualization с Matplotlib и Seaborn',    type:'video',    difficulty:2, durationHours:5,  suitableStyles:['visual'] },
      { id:21, name:'Проект: интерактивный дашборд на Plotly',      type:'project',  difficulty:3, durationHours:12, suitableStyles:['kinesthetic','visual'] },
      { id:22, name:'Storytelling with Data: книга по визуализации', type:'article',  difficulty:2, durationHours:8,  suitableStyles:['reading'] },
    ],
    8: [
      { id:4,  name:'Advanced Python: курс Corey Schafer',           type:'video',    difficulty:3, durationHours:6,  suitableStyles:['visual'] },
      { id:5,  name:'Real Python: продвинутые паттерны',             type:'article',  difficulty:3, durationHours:8,  suitableStyles:['reading'] },
    ],
    9: [
      { id:10, name:'Теория вероятностей: практический курс',        type:'video',    difficulty:2, durationHours:9,  suitableStyles:['visual','auditory'] },
      { id:11, name:'Байесовская статистика: задачи на PyMC',        type:'exercise', difficulty:4, durationHours:12, suitableStyles:['kinesthetic','reading'] },
    ],
    10: [
      { id:43, name:'R для статистики: tidyverse и ggplot2',         type:'video',    difficulty:2, durationHours:9,  suitableStyles:['visual'] },
      { id:44, name:'R for Data Science: книга Hadley Wickham',      type:'article',  difficulty:2, durationHours:12, suitableStyles:['reading'] },
    ],
    11: [
      { id:38, name:'EDA и AB тестирование (видеокурс)',              type:'video',    difficulty:3, durationHours:8,  suitableStyles:['visual','auditory'] },
      { id:39, name:'Проект: бизнес-анализ реальных данных',         type:'project',  difficulty:3, durationHours:12, suitableStyles:['kinesthetic','visual'] },
      { id:40, name:'Python for Data Analysis: книга McKinney',      type:'article',  difficulty:3, durationHours:14, suitableStyles:['reading'] },
    ],
    12: [
      { id:23, name:'ML с нуля: Scikit-learn на практике',           type:'video',    difficulty:3, durationHours:10, suitableStyles:['visual','auditory'] },
      { id:24, name:'Hands-On Machine Learning: книга Geron',        type:'article',  difficulty:3, durationHours:20, suitableStyles:['reading'] },
      { id:25, name:'Kaggle: соревнование Titanic и House Prices',   type:'project',  difficulty:3, durationHours:15, suitableStyles:['kinesthetic'] },
    ],
    13: [
      { id:26, name:'Feature Engineering для ML (видеокурс)',         type:'video',    difficulty:3, durationHours:7,  suitableStyles:['visual'] },
    ],
    14: [
      { id:27, name:'Practical Guide to Model Evaluation',           type:'article',  difficulty:3, durationHours:6,  suitableStyles:['reading'] },
      { id:28, name:'Задачи на метрики качества моделей',            type:'exercise', difficulty:3, durationHours:5,  suitableStyles:['kinesthetic','reading'] },
    ],
    15: [
      { id:32, name:'NLP с нуля: от токенизации до BERT',            type:'video',    difficulty:4, durationHours:12, suitableStyles:['visual','auditory'] },
      { id:33, name:'Проект: анализ тональности отзывов',            type:'project',  difficulty:4, durationHours:15, suitableStyles:['kinesthetic'] },
    ],
    16: [
      { id:29, name:'Deep Learning Specialization от Coursera',      type:'video',    difficulty:4, durationHours:25, suitableStyles:['visual','auditory'] },
      { id:30, name:'PyTorch: CNN для классификации изображений',    type:'project',  difficulty:4, durationHours:20, suitableStyles:['kinesthetic'] },
    ],
    17: [
      { id:34, name:'MLOps: Docker, FastAPI и DVC (видеокурс)',      type:'video',    difficulty:4, durationHours:10, suitableStyles:['visual'] },
      { id:35, name:'Проект: деплой ML-модели в production',         type:'project',  difficulty:5, durationHours:20, suitableStyles:['kinesthetic'] },
    ],
    18: [
      { id:36, name:'Apache Spark и Airflow: основы (видео)',         type:'video',    difficulty:4, durationHours:12, suitableStyles:['visual','auditory'] },
      { id:37, name:'Проект: ETL-пайплайн с BigQuery',               type:'project',  difficulty:5, durationHours:18, suitableStyles:['kinesthetic'] },
    ],
    19: [
      { id:31, name:'Sutton and Barto: Reinforcement Learning (PDF)', type:'article', difficulty:5, durationHours:30, suitableStyles:['reading'] },
    ],
    20: [
      { id:41, name:'Research Design: учебник Creswell',             type:'article',  difficulty:3, durationHours:10, suitableStyles:['reading'] },
      { id:42, name:'LaTeX и Overleaf: академическое письмо',        type:'exercise', difficulty:2, durationHours:5,  suitableStyles:['reading','kinesthetic'] },
    ],
    // ── WEB DEVELOPMENT ─────────────────────────────────────
    21: [
      { id:45, name:'HTML и CSS: полный курс для начинающих',        type:'video',    difficulty:1, durationHours:8,  suitableStyles:['visual','auditory'] },
      { id:46, name:'freeCodeCamp: Responsive Web Design',           type:'exercise', difficulty:1, durationHours:12, suitableStyles:['kinesthetic'] },
      { id:47, name:'MDN Web Docs: HTML и CSS Reference',            type:'article',  difficulty:1, durationHours:6,  suitableStyles:['reading'] },
      { id:48, name:'Проект: верстка страницы по макету Figma',      type:'project',  difficulty:2, durationHours:10, suitableStyles:['kinesthetic','visual'] },
    ],
    22: [
      { id:52, name:'JavaScript: курс с нуля до Pro (видео)',        type:'video',    difficulty:2, durationHours:12, suitableStyles:['visual','auditory'] },
      { id:53, name:'JavaScript30: 30 проектов за 30 дней',         type:'exercise', difficulty:2, durationHours:15, suitableStyles:['kinesthetic'] },
      { id:54, name:'Eloquent JavaScript: книга (бесплатно)',        type:'article',  difficulty:2, durationHours:18, suitableStyles:['reading'] },
      { id:55, name:'Проект: интерактивный ToDo на ванильном JS',   type:'project',  difficulty:2, durationHours:8,  suitableStyles:['kinesthetic','visual'] },
    ],
    23: [
      { id:59, name:'Git для веб-разработчиков (видео)',             type:'video',    difficulty:1, durationHours:4,  suitableStyles:['visual','auditory'] },
      { id:60, name:'GitHub Flow: практика с реальными PR',         type:'exercise', difficulty:2, durationHours:5,  suitableStyles:['kinesthetic'] },
    ],
    24: [
      { id:49, name:'CSS: Flexbox, Grid и анимации (видеокурс)',     type:'video',    difficulty:2, durationHours:7,  suitableStyles:['visual'] },
      { id:50, name:'CSS Battle: задачи на чистый CSS',              type:'exercise', difficulty:2, durationHours:5,  suitableStyles:['kinesthetic'] },
      { id:51, name:'Tailwind CSS: документация и практика',         type:'article',  difficulty:2, durationHours:6,  suitableStyles:['reading'] },
    ],
    25: [
      { id:56, name:'JavaScript: async, Promises и TypeScript',     type:'video',    difficulty:3, durationHours:9,  suitableStyles:['visual','auditory'] },
      { id:57, name:'TypeScript Exercises: задачи на типизацию',    type:'exercise', difficulty:3, durationHours:7,  suitableStyles:['kinesthetic','reading'] },
      { id:58, name:"You Don't Know JS: книга серии (бесплатно)",   type:'article',  difficulty:3, durationHours:14, suitableStyles:['reading'] },
    ],
    26: [
      { id:64, name:'Web Accessibility: WCAG и ARIA (видео)',        type:'video',    difficulty:2, durationHours:5,  suitableStyles:['visual','auditory'] },
      { id:65, name:'MDN: Accessibility Guide и чеклисты',          type:'article',  difficulty:2, durationHours:4,  suitableStyles:['reading'] },
    ],
    27: [
      { id:66, name:'Chrome DevTools: профилирование и отладка',    type:'video',    difficulty:2, durationHours:4,  suitableStyles:['visual'] },
      { id:67, name:'DevTools Challenges: практика отладки',         type:'exercise', difficulty:2, durationHours:3,  suitableStyles:['kinesthetic'] },
    ],
    28: [
      { id:61, name:'HTTP, REST API и Fetch: полный курс (видео)',   type:'video',    difficulty:2, durationHours:6,  suitableStyles:['visual','auditory'] },
      { id:62, name:'Postman: тестирование API на практике',         type:'exercise', difficulty:2, durationHours:5,  suitableStyles:['kinesthetic'] },
      { id:63, name:'REST API Design Best Practices (статья)',       type:'article',  difficulty:3, durationHours:4,  suitableStyles:['reading'] },
    ],
    29: [
      { id:68, name:'React: полный курс с нуля (видеокурс)',        type:'video',    difficulty:3, durationHours:14, suitableStyles:['visual','auditory'] },
      { id:69, name:'React Tutorial: TodoMVC и приложение с API',   type:'exercise', difficulty:3, durationHours:10, suitableStyles:['kinesthetic'] },
      { id:70, name:'React документация: официальный туториал',     type:'article',  difficulty:3, durationHours:8,  suitableStyles:['reading'] },
      { id:71, name:'Проект: SPA-приложение с React Router и API',  type:'project',  difficulty:3, durationHours:16, suitableStyles:['kinesthetic','visual'] },
    ],
    30: [
      { id:72, name:'Node.js и Express: REST API с нуля (видео)',   type:'video',    difficulty:3, durationHours:10, suitableStyles:['visual','auditory'] },
      { id:73, name:'Проект: CRUD API с Express и SQLite',          type:'exercise', difficulty:3, durationHours:8,  suitableStyles:['kinesthetic'] },
      { id:74, name:'Node.js Best Practices: репозиторий GitHub',   type:'article',  difficulty:3, durationHours:6,  suitableStyles:['reading'] },
    ],
    31: [
      { id:75, name:'PostgreSQL + Prisma ORM для веба (видео)',     type:'video',    difficulty:3, durationHours:8,  suitableStyles:['visual','auditory'] },
      { id:76, name:'Проект: API с базой данных и аутентификацией', type:'project',  difficulty:4, durationHours:12, suitableStyles:['kinesthetic'] },
    ],
    32: [
      { id:77, name:'Web Security: OWASP Top 10 (видеокурс)',       type:'video',    difficulty:3, durationHours:7,  suitableStyles:['visual','auditory'] },
      { id:78, name:'OWASP Testing Guide: практическое руководство',type:'article',  difficulty:4, durationHours:9,  suitableStyles:['reading'] },
    ],
    33: [
      { id:79, name:'Next.js, Redux и оптимизация React (видео)',   type:'video',    difficulty:4, durationHours:16, suitableStyles:['visual','auditory'] },
    ],
    34: [
      { id:80, name:'Capstone: Full-Stack приложение с деплоем',    type:'project',  difficulty:5, durationHours:30, suitableStyles:['kinesthetic','visual'] },
    ],
    35: [
      { id:66, name:'Chrome DevTools: профилирование и отладка',    type:'video',    difficulty:2, durationHours:4,  suitableStyles:['visual'] },
      { id:79, name:'Next.js, Redux и оптимизация React (видео)',   type:'video',    difficulty:4, durationHours:16, suitableStyles:['visual','auditory'] },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // LEARNING GOALS  { learnerId: [goalObjects] }
  // ─────────────────────────────────────────────────────────
  learningGoals: {
    1:  [{ id:1,  goalCompetencyId:12, label:'Machine Learning Basics' },
         { id:2,  goalCompetencyId:11, label:'Data Analysis' }],
    2:  [{ id:3,  goalCompetencyId:11, label:'Data Analysis' },
         { id:4,  goalCompetencyId:12, label:'Machine Learning Basics' }],
    3:  [{ id:5,  goalCompetencyId:16, label:'Deep Learning' },
         { id:6,  goalCompetencyId:17, label:'MLOps' }],
    4:  [{ id:7,  goalCompetencyId:11, label:'Data Analysis' }],
    5:  [{ id:8,  goalCompetencyId:11, label:'Data Analysis' }],
    6:  [{ id:9,  goalCompetencyId:17, label:'MLOps' },
         { id:10, goalCompetencyId:18, label:'Data Engineering' }],
    7:  [{ id:11, goalCompetencyId:12, label:'Machine Learning Basics' },
         { id:12, goalCompetencyId:13, label:'Feature Engineering' }],
    8:  [{ id:13, goalCompetencyId:11, label:'Data Analysis' }],
    9:  [{ id:14, goalCompetencyId:20, label:'Research Methods' },
         { id:15, goalCompetencyId:15, label:'NLP' }],
    10: [{ id:16, goalCompetencyId:12, label:'Machine Learning Basics' }],
    11: [{ id:17, goalCompetencyId:29, label:'React Basics' },
         { id:18, goalCompetencyId:34, label:'Full-Stack Project' }],
    12: [{ id:19, goalCompetencyId:33, label:'Advanced React' },
         { id:20, goalCompetencyId:35, label:'Web Performance' }],
    13: [{ id:21, goalCompetencyId:34, label:'Full-Stack Project' },
         { id:22, goalCompetencyId:32, label:'Web Security' }],
    14: [{ id:23, goalCompetencyId:29, label:'React Basics' },
         { id:24, goalCompetencyId:30, label:'Node.js and Express' }],
    15: [{ id:25, goalCompetencyId:33, label:'Advanced React' },
         { id:26, goalCompetencyId:34, label:'Full-Stack Project' }],
    16: [{ id:27, goalCompetencyId:12, label:'Machine Learning Basics' },
         { id:28, goalCompetencyId:11, label:'Data Analysis' }],
    17: [{ id:29, goalCompetencyId:11, label:'Data Analysis' }],
    18: [{ id:30, goalCompetencyId:29, label:'React Basics' }],
    19: [{ id:31, goalCompetencyId:11, label:'Data Analysis' }],
    20: [{ id:32, goalCompetencyId:33, label:'Advanced React' }],
  },
};

// ================================================================
// REASONING ENGINE (thin adapters — delegate to PathGenerator)
// ================================================================

window._pathGeneratorInstance = null; // будет установлен из app.js

/** Remove already mastered competencies from a required set. */
function filterMastered(allRequired, masteredSet) {
  return new Set([...allRequired].filter(id => !masteredSet.has(id)));
}

/** SWRL resource matching — style + difficulty + time budget */
function selectBestResource(competencyId, learner) {
  const candidates = ONTOLOGY.resources[competencyId] || [];
  if (!candidates.length) return null;
  const target = 1 + Math.round(learner.performanceScore * 4);
  const score = r =>
    (r.suitableStyles.includes(learner.learningStyle) ? 3 : 0) +
    (Math.abs(r.difficulty - target) <= 1              ? 2 : 0) +
    (r.durationHours <= learner.availableHours          ? 1 : 0);
  return [...candidates].sort((a, b) => score(b) - score(a))[0];
}

// Тонкие обёртки — делегируют в PathGenerator
window.computeTransitiveClosure = (goalId) => {
  if (!window._pathGeneratorInstance) throw new Error('PathGenerator not initialized');
  return window._pathGeneratorInstance.computeTransitiveClosure(goalId);
};

window.topologicalSort = (gapSet) => {
  if (!window._pathGeneratorInstance) throw new Error('PathGenerator not initialized');
  return window._pathGeneratorInstance.topologicalSort(gapSet);
};

window.generatePath = (learnerId, goalId) => {
  if (!window._pathGeneratorInstance) throw new Error('PathGenerator not initialized');
  return window._pathGeneratorInstance.generateLearningPath(learnerId, goalId);
};

// ── Expose to global scope ──────────────────────────────────
window.ONTOLOGY           = ONTOLOGY;
window.filterMastered     = filterMastered;
window.selectBestResource = selectBestResource;


var ontologyData = {

  learners: Object.fromEntries(
    Object.entries(ONTOLOGY.learners).map(([id, l]) => [id, {
      ...l,
      masteredCompetencies: l.masteredIds,
      competencyStatus: { masteredCompetencies: l.masteredIds },
      targetCompetency: ONTOLOGY.learningGoals[id]?.[0]?.goalCompetencyId || null,
      goals: {
        targetCompetencies: (ONTOLOGY.learningGoals[id] || []).map(g => g.goalCompetencyId),
        primaryGoal: ONTOLOGY.learningGoals[id]?.[0]?.label || null,
      },
      learningPreferences: { primaryLearningStyle: l.learningStyle },
      constraints: { timeAvailabilityPerWeek: l.availableHours },
      affectiveProfile: {
        motivationLevel: l.performanceScore,
        selfEfficacy:    l.performanceScore,
      },
    }])
  ),

  competencies: Object.fromEntries(
    Object.entries(ONTOLOGY.competencies).map(([id, c]) => [id, {
      ...c,
      prerequisites: ONTOLOGY.prerequisites[id] || [],
      taxonomies: { bloomLevel: c.bloomLevel, eqfLevel: c.eqfLevel },
      estimatedHours: c.bloomLevel * 2 + c.eqfLevel * 1.5,
    }])
  ),

  learningResources: Object.fromEntries(
    Object.entries(ONTOLOGY.resources).flatMap(([compId, resList]) =>
      resList.map(r => [r.id, {
        ...r,
        teachesCompetencies: [{ competencyId: Number(compId) }],
        suitableForStyle: r.suitableStyles,
        hasLearningStyle: r.suitableStyles?.[0] || null,
      }])
    )
  ),
};

window.ontologyData = ontologyData;