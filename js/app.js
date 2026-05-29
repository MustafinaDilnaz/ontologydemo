class OntologyDemo {
  constructor() {
    this.reasoner = null;
    this.graph = null;
    this.filterPanel = null;
    this.legendPanel = null;
    this.selectedLearner = null;
    this.currentTab = 'overview';

    this.learnerService = new LearnerService(ontologyData);
    this.competencyService = new CompetencyService(ontologyData);
    this.resourceService = new ResourceService(ontologyData);

    this.init();
  }

  async init() {
    console.log('🎓 Enhanced Ontology Demo initializing...');

    try {
      await this.syncFromDatabase();

      this.store = new OntologyStore(ontologyData);
      this.reasoner = new PathGenerator(this.store);
      window._pathGeneratorInstance = this.reasoner;
      console.log('✓ Reasoner initialized');

      this.setupEventListeners();
      console.log('✓ Event listeners attached');

      this.renderOverview();
      console.log('✓ Overview rendered');

      this.deferredGraphInit = true;

      console.log('✅ Enhanced Ontology Demo ready!');
    } catch (error) {
      console.error('❌ Initialization error:', error);
      this.showNotification('Failed to initialize application', 'error');
    }
  }

  async syncFromDatabase() {
    try {
      const [learnersRes, goalsRes, statsRes] = await Promise.all([
        fetch('/api/learners'),
        fetch('/api/goals'),
        fetch('/api/stats'),
      ]);

      if (!learnersRes.ok || !goalsRes.ok) return;

      const [learnersArr, goalsMap] = await Promise.all([
        learnersRes.json(),
        goalsRes.json(),
      ]);

      // Обновляем ONTOLOGY.learners данными из БД, сохраняя domain и bio из JS
      learnersArr.forEach(db => {
        const existing = ONTOLOGY.learners[db.id] || {};
        ONTOLOGY.learners[db.id] = {
          ...existing,
          id:               db.id,
          slug:             db.slug,
          name:             db.name,
          learningStyle:    db.learningStyle,
          availableHours:   db.availableHours,
          performanceScore: db.performanceScore,
          domain:           db.domain || existing.domain || 'data_science',
          masteredIds:      db.masteredIds,
        };
      });

      // Обновляем цели из БД
      Object.entries(goalsMap).forEach(([learnerId, goals]) => {
        ONTOLOGY.learningGoals[Number(learnerId)] = goals;
      });

      // Пересобираем ontologyData для OntologyStore
      learnersArr.forEach(db => {
        const l = ONTOLOGY.learners[db.id];
        ontologyData.learners[db.id] = {
          ...ontologyData.learners[db.id],
          ...l,
          masteredCompetencies: l.masteredIds,
          competencyStatus:     { masteredCompetencies: l.masteredIds },
          targetCompetency:     ONTOLOGY.learningGoals[l.id]?.[0]?.goalCompetencyId || null,
          goals: {
            targetCompetencies: (ONTOLOGY.learningGoals[l.id] || []).map(g => g.goalCompetencyId),
            primaryGoal:        ONTOLOGY.learningGoals[l.id]?.[0]?.label || null,
          },
          learningPreferences: { primaryLearningStyle: l.learningStyle },
          constraints:         { timeAvailabilityPerWeek: l.availableHours },
          affectiveProfile:    { motivationLevel: l.performanceScore, selfEfficacy: l.performanceScore },
        };
      });

      // Обновляем статистику из БД (если эндпоинт доступен)
      if (statsRes.ok) {
        const stats = await statsRes.json();
        this.updateElementText('total-competencies', stats.totalCompetencies);
        this.updateElementText('total-resources',    stats.totalResources);
        this.updateElementText('total-learners',     stats.totalLearners);
        this.updateElementText('avg-prerequisites',  stats.avgPrerequisites);
        this.updateElementText('active-paths',       stats.activePaths);
        this.updateElementText('total-masteries',    stats.totalMasteries);
        this.renderCohortAnalytics(stats);
      }

      console.log(`✓ Synced ${learnersArr.length} learners from database`);
    } catch {
      // Сервер недоступен — используем статические данные из ontology-data.js
      console.warn('⚠ DB sync skipped: server unavailable, using static data');
    }
  }

  async patchMastery(learnerId, competencyId, action) {
    const res = await fetch('/api/mastery', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        learnerId:    Number(learnerId),
        competencyId: Number(competencyId),
        action,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { masteredIds } = await res.json();

    const lid = Number(learnerId);

    // Sync ONTOLOGY in-memory
    const l = ONTOLOGY.learners[lid];
    if (l) l.masteredIds = masteredIds;

    // Sync ontologyData for OntologyStore
    const od = ontologyData.learners[lid];
    if (od) {
      od.masteredCompetencies = masteredIds;
      od.competencyStatus     = { masteredCompetencies: masteredIds };
    }

    // Invalidate closure cache for this competency
    if (this.store) this.store.invalidateClosure(competencyId);

    // Refresh D3 graph node colours (mastered = green) then re-apply any active filters
    if (this.graph) {
      this.graph.setSelectedLearner(lid);
      if (this.filterPanel) this.filterPanel.applyFilters();
    }

    // Re-render path planner so new mastery is reflected
    if (this.selectedLearner && Number(this.selectedLearner) === lid) {
      this.renderPathPlanner(this.selectedLearner);
    }

    const comp = ontologyData.competencies?.[Number(competencyId)];
    const compName = comp?.name || `Competency #${competencyId}`;
    this.showNotification(`✓ "${compName}" marked as mastered`, 'success');
  }

  async savePathToDatabase(learnerId, targetCompetencyId, pathData) {
    try {
      const goals  = ONTOLOGY.learningGoals[Number(learnerId)] || [];
      const goal   = goals.find(g => g.goalCompetencyId === Number(targetCompetencyId));
      const goalId = goal?.id || null;

      const steps = (pathData.pathSteps || [])
        .filter(s => !s.isTarget && s.competency?.id && s.resource?.id)
        .map(s => ({
          competencyId: s.competency.id,
          resourceId:   s.resource.id,
          stepOrder:    s.step,
        }));

      if (!steps.length) return;

      const res = await fetch('/api/paths', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          learnerId:          Number(learnerId),
          goalId,
          targetCompetencyId: Number(targetCompetencyId),
          steps,
        }),
      });

      if (!res.ok) return;
      const { pathId, stepsCount } = await res.json();
      console.log(`✓ Path saved: pathId=${pathId}, ${stepsCount} steps`);
    } catch {
      // Не критично — путь всё равно показывается в UI
    }
  }

  setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Event delegation на #learner-grid — карточки рендерятся динамически из БД
    const grid = document.getElementById('learner-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const btn  = e.target.closest('.generate-path-btn');
        const card = e.target.closest('.learner-card');
        if (btn) {
          e.stopPropagation();
          this.generateAndShowPath(btn.dataset.learner);
          return;
        }
        if (card) {
          this.selectLearner(card.dataset.learner);
        }
      });
    }

    // Learner search — filter cards by name
    const learnerSearch = document.getElementById('learner-search');
    if (learnerSearch) {
      learnerSearch.addEventListener('input', debounce((e) => {
        const q = e.target.value.trim().toLowerCase();
        const cards = document.querySelectorAll('#learner-grid .learner-card');
        let visible = 0;
        cards.forEach(card => {
          const name = (card.querySelector('h3')?.textContent || '').toLowerCase();
          const show = !q || name.includes(q);
          card.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        const cnt = document.getElementById('learner-search-count');
        if (cnt) cnt.textContent = q ? `${visible} found` : '';
      }, 200));
    }

    // Mastery toggle — event delegation (buttons rendered dynamically)
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('.mastery-toggle-btn');
      if (!btn || btn.disabled) return;
      e.stopPropagation();
      btn.disabled = true;
      btn.textContent = '⏳ Saving...';
      try {
        await this.patchMastery(btn.dataset.learner, btn.dataset.competency, 'add');
        // on success: renderPathPlanner re-renders the whole path, removing this button from DOM
      } catch {
        btn.disabled = false;
        btn.textContent = '✓ Mark as Mastered';
        this.showNotification('Failed to save mastery — check your connection.', 'error');
      }
    });

    // Window resize handler
    window.addEventListener('resize', debounce(() => {
      if (this.graph && this.currentTab === 'graph') {
        this.graph.resize();
      }
    }, 250));

    // Listen for custom events from graph
    document.addEventListener('competency-explanation', (event) => {
      this.handleCompetencyExplanation(event.detail);
    });

    // Listen for filter changes
    document.addEventListener('filters-changed', (event) => {
      this.handleFilterChange(event.detail);
    });
  }

  switchTab(tabName) {
    console.log(`📑 Switching to tab: ${tabName}`);

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    const tabContent = document.getElementById(`${tabName}-tab`);
    if (tabContent) {
      tabContent.classList.add('active');
    }

    this.currentTab = tabName;

    if (tabName === 'graph') {
      clearTimeout(this._graphInitTimer);
      this._graphInitTimer = setTimeout(() => this.initializeGraphTab(), 100);
    } else if (tabName === 'planner' && this.selectedLearner) {
      this.renderPathPlanner(this.selectedLearner);
    } else if (tabName === 'reasoning') {
      this.initReasoningTree();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  initializeGraphTab() {
    // Guard: user may have navigated away before the 100ms timer fired
    if (this.currentTab !== 'graph') return;

    const graphContainer = document.getElementById('competency-graph');
    if (!graphContainer) {
      console.warn('Graph container not found');
      return;
    }

    const isVisible = graphContainer.offsetParent !== null;
    if (!isVisible) {
      console.log('Graph container not visible yet');
      return;
    }

    if (!this.graph || !graphContainer.querySelector('svg')) {
      this.initializeGraph();
    }

    if (!this.filterPanel) {
      this.initializeFilterPanel();
    }

    if (!this.legendPanel) {
      this.initializeLegendPanel();
    }

    if (this.selectedLearner && this.graph) {
      this.graph.setSelectedLearner(this.selectedLearner);
      if (this.filterPanel) this.filterPanel.applyFilters();
    }

    // Sync path from Planner tab so "Show Only Path" filter works immediately
    if (this.currentGoalId && this.selectedLearner && this.graph) {
      const pathData = this.reasoner?.generateLearningPath(this.selectedLearner, this.currentGoalId);
      if (pathData) this._syncPathToGraph(pathData);
    }
  }

  initializeGraph() {
    const graphContainer = document.getElementById('competency-graph');
    if (!graphContainer) return;

    try {
      if (this.graph) {
        console.log('Destroying old graph');
        this.graph.destroy();
      }

      console.log('Creating new CompetencyGraph');
      this.graph = new CompetencyGraph('competency-graph', ontologyData);

      this.graph.initialize(this.reasoner);

      if (this.selectedLearner) {
        console.log('Setting selected learner:', this.selectedLearner);
        this.graph.setSelectedLearner(this.selectedLearner);
      }

      console.log('✓ Graph initialized successfully');
    } catch (error) {
      console.error('❌ Graph initialization error:', error);
      this.showNotification('Failed to initialize graph', 'error');
    }
  }

  initializeFilterPanel() {
    const filterContainer = document.getElementById('filter-panel');
    if (!filterContainer) {
      console.warn('Filter panel container not found');
      return;
    }

    try {
      console.log('Creating FilterPanel');
      this.filterPanel = new FilterPanel('filter-panel', this.graph, ontologyData);
      this.filterPanel.initialize();
      console.log('✓ Filter panel initialized');
    } catch (error) {
      console.error('❌ Filter panel initialization error:', error);
    }
  }

  initializeLegendPanel() {
    const legendContainer = document.getElementById('legend-panel');
    if (!legendContainer) {
      console.warn('Legend panel container not found');
      return;
    }

    try {
      this.legendPanel = new LegendPanel('legend-panel', this.graph, ontologyData);
      this.legendPanel.initialize();

      if (this.graph) {
        this.legendPanel.updateStatistics();
      }
    } catch (error) {
      console.error('❌ Legend panel initialization error:', error);
    }
  }

  selectLearner(learnerId) {
    console.log(`👤 Selected learner: ${learnerId}`);

    this.selectedLearner = learnerId;

    // Update UI - highlight selected card
    document.querySelectorAll('.learner-card').forEach(card => {
      card.classList.remove('selected');
      if (card.dataset.learner === learnerId) {
        card.classList.add('selected');
      }
    });

    // Update graph if it exists
    if (this.graph) {
      this.graph.setSelectedLearner(learnerId);
    }

    // Update legend panel statistics
    if (this.legendPanel) {
      this.legendPanel.updateStatistics();
    }

    // Update path planner if on that tab
    if (this.currentTab === 'planner') {
      this.renderPathPlanner(learnerId);
    }
    const learner = this.learnerService.getById(learnerId);
    this.showNotification(`Selected learner: ${learner?.name || learnerId}`, 'success');
  }

  generateAndShowPath(learnerId) {
    console.log(`🎯 Generating path for: ${learnerId}`);

    this.selectLearner(learnerId);
    this.switchTab('planner');
  }


  generateLearningPathFromGraph(targetCompetencyId) {
    if (!this.selectedLearner) {
      this.showNotification('Please select a learner first', 'error');
      return;
    }

    if (!this.graph) {
      this.showNotification('Graph not initialized', 'error');
      return;
    }

    try {
      console.log('🛤️ UC-1: Generating learning path to:', targetCompetencyId);

      // Use graph's built-in path generation (which uses reasoner)
      const pathData = this.graph.generateAndHighlightPath(targetCompetencyId);

      // Show notification
      const learner = ontologyData.learners[this.selectedLearner];
      this.showNotification(
        `Learning path generated: ${pathData.pathSteps.length} steps, ~${pathData.totalHours}h total`,
        'success'
      );

      // Update legend statistics
      if (this.legendPanel) {
        this.legendPanel.updateStatistics();
      }

      return pathData;
    } catch (error) {
      console.error('❌ Path generation error:', error);
      this.showNotification('Failed to generate learning path', 'error');
    }
  }

  diagnoseGapsFromGraph(targetCompetencyId) {
    if (!this.selectedLearner) {
      this.showNotification('Please select a learner first', 'error');
      return;
    }

    if (!this.graph) {
      this.showNotification('Graph not initialized', 'error');
      return;
    }

    try {
      console.log('🔍 UC-2: Diagnosing gaps for:', targetCompetencyId);

      // Use graph's gap visualization (which uses reasoner)
      const gapData = this.graph.visualizeGapAnalysis(targetCompetencyId);

      // Show notification
      this.showNotification(
        `Gap analysis complete: ${gapData.totalGaps} gaps found (${gapData.gapsByPriority.critical.length} critical)`,
        gapData.totalGaps > 0 ? 'info' : 'success'
      );

      return gapData;
    } catch (error) {
      console.error('❌ Gap diagnosis error:', error);
      this.showNotification('Failed to diagnose gaps', 'error');
    }
  }


  handleCompetencyExplanation(detail) {
    console.log('💡 UC-3: Showing explanation for:', detail.node.name);

    // Create explanation modal or panel
    this.showExplanationModal(detail.node, detail.explanation);
  }

  showExplanationModal(node, explanation) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'explanation-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>💡 Competency Explanation</h3>
          <button class="modal-close" onclick="this.closest('.explanation-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <h4>${escapeHTML(node.name || '')}</h4>
          <div class="explanation-badges">
            <span class="badge">EQF ${escapeHTML(String(node.eqfLevel ?? ''))}</span>
            <span class="badge">${escapeHTML(String(node.bloomLevel || ''))}</span>
            <span class="badge">${escapeHTML(node.difficultyLevel || 'N/A')}</span>
            ${node.isMastered ? '<span class="badge badge-success">✓ Mastered</span>' : ''}
            ${node.isTarget ? '<span class="badge badge-primary">★ Target</span>' : ''}
          </div>
          <div class="explanation-text">
            ${String(explanation || '').split('\n').map(line => `<p>${escapeHTML(line)}</p>`).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.explanation-modal').remove()">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add styles if not already present
    if (!document.getElementById('explanation-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'explanation-modal-styles';
      style.textContent = `
        .explanation-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 12px;
          max-width: 600px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #1e293b;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          line-height: 1;
          cursor: pointer;
          color: #64748b;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f1f5f9;
          color: #334155;
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .modal-body h4 {
          margin: 0 0 12px 0;
          color: #1e293b;
          font-size: 1.125rem;
        }

        .explanation-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .explanation-badges .badge {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          background: #e0e7ff;
          color: #4338ca;
        }

        .explanation-badges .badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .explanation-badges .badge-primary {
          background: #ddd6fe;
          color: #5b21b6;
        }

        .explanation-text {
          line-height: 1.7;
          color: #475569;
        }

        .explanation-text p {
          margin: 0 0 12px 0;
        }

        .explanation-text p:last-child {
          margin-bottom: 0;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #475569;
        }

        .btn-secondary:hover {
          background: #cbd5e1;
        }
      `;
      document.head.appendChild(style);
    }
  }


  handleFilterChange(detail) {
    console.log('🔧 Filters changed:', {
      visibleNodes: detail.visibleNodes,
      totalNodes: detail.totalNodes
    });

    // Update legend panel statistics
    if (this.legendPanel) {
      this.legendPanel.updateStatistics();
    }

    // Show notification if significant filtering
    const percentage = (detail.visibleNodes / detail.totalNodes) * 100;
    if (percentage < 50) {
      this.showNotification(
        `Showing ${detail.visibleNodes} of ${detail.totalNodes} competencies (${percentage.toFixed(0)}%)`,
        'info'
      );
    }
  }

  renderOverview() {
    const stats = this.calculateStats();

    this.updateElementText('total-competencies', stats.totalCompetencies);
    this.updateElementText('total-resources', stats.totalResources);
    this.updateElementText('total-learners', stats.totalLearners);
    this.updateElementText('avg-prerequisites', stats.avgPrerequisites);

    this.renderLearnerGrid();
  }

  renderCohortAnalytics(stats) {
    const wrap = document.getElementById('cohort-analytics');
    if (!wrap) return;

    // Gap frequency
    const gapList = document.getElementById('gap-frequency-list');
    if (gapList && stats.gapFrequency?.length) {
      gapList.innerHTML = stats.gapFrequency.map(r =>
        `<li>${escapeHTML(r.name)} <span style="color:var(--danger-color);font-weight:600;">${r.learnerCount} learners</span></li>`
      ).join('');
    }

    // Top resources
    const resList = document.getElementById('top-resources-list');
    if (resList && stats.topResources?.length) {
      resList.innerHTML = stats.topResources.map(r =>
        `<li>${escapeHTML(r.name)} <span style="color:var(--secondary-color);font-weight:600;">${r.usageCount}×</span></li>`
      ).join('');
    }

    // Readiness distribution — mini bar chart
    const rdiv = document.getElementById('readiness-distribution');
    if (rdiv && stats.readinessBuckets?.length) {
      const max = Math.max(...stats.readinessBuckets.map(b => b.learnerCount), 1);
      const colors = { 'Beginner': '#ef4444', 'Developing': '#f59e0b', 'Proficient': '#3b82f6', 'Advanced': '#10b981' };
      rdiv.innerHTML = stats.readinessBuckets.map(b => {
        const pct   = Math.round(b.learnerCount / max * 100);
        const key   = Object.keys(colors).find(k => b.bucket.startsWith(k)) || 'Proficient';
        const color = colors[key];
        return `
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
              <span style="color:var(--text-primary);font-weight:500;">${escapeHTML(b.bucket)}</span>
              <span style="color:${color};font-weight:700;">${b.learnerCount}</span>
            </div>
            <div style="background:#e2e8f0;border-radius:4px;height:8px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width 0.4s;"></div>
            </div>
          </div>`;
      }).join('');
    }

    wrap.style.display = 'block';
  }

  renderLearnerGrid() {
    const grid = document.getElementById('learner-grid');
    if (!grid) return;

    const DOMAIN_LABEL = { data_science: 'Data Science', web_dev: 'Web Development' };
    const DOMAIN_COLOR = { data_science: '#2563eb', web_dev: '#7c3aed' };
    const STYLE_LABEL  = { visual: 'Visual', auditory: 'Auditory', reading: 'Reading/Writing', kinesthetic: 'Kinesthetic' };

    const learners = Object.values(ONTOLOGY.learners).sort((a, b) => a.id - b.id);

    grid.innerHTML = learners.map(l => {
      const goals    = ONTOLOGY.learningGoals[l.id] || [];
      const goalText = goals[0]?.label || 'Not specified';

      const masteredIds = l.masteredIds || [];
      const shown       = masteredIds.slice(0, 4);
      const extra       = masteredIds.length - shown.length;

      const masteredBadges = shown.map(id => {
        const c = ONTOLOGY.competencies[id];
        return c ? `<span class="badge badge-mastered">${escapeHTML(c.name)}</span>` : '';
      }).join('');

      const extraBadge = extra > 0
        ? `<span class="badge" style="background:#e0e7ff;color:#3730a3;">+${extra} more</span>`
        : '';

      const noneBadge = masteredIds.length === 0
        ? `<span class="badge" style="background:#fee2e2;color:#991b1b;">None yet</span>`
        : '';

      const bio = l.bio
        ? `<p class="learner-details"><strong>Background:</strong> ${escapeHTML(l.bio)}</p>`
        : '';

      const domainColor = DOMAIN_COLOR[l.domain] || '#64748b';
      const domainText  = DOMAIN_LABEL[l.domain]  || l.domain || '';
      const styleText   = STYLE_LABEL[l.learningStyle] || l.learningStyle;

      return `
        <div class="learner-card" data-learner="${l.id}">
          <div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;
                      letter-spacing:0.06em;color:${domainColor};margin-bottom:6px;">
            ${escapeHTML(domainText)}
          </div>
          <h3>${escapeHTML(l.name)}</h3>
          <div class="learner-goal">🎯 Goal: ${escapeHTML(goalText)}</div>
          ${bio}
          <div class="learner-details">
            <strong>Mastered Competencies:</strong>
            <div style="margin-top:5px;">${noneBadge}${masteredBadges}${extraBadge}</div>
          </div>
          <div class="learner-details" style="margin-top:10px;">
            <span class="badge badge-style">${escapeHTML(styleText)} Learner</span>
            <span class="badge badge-time">${l.availableHours} hrs/week</span>
          </div>
          <button class="btn btn-primary generate-path-btn" data-learner="${l.id}"
                  style="margin-top:15px;width:100%;">
            Generate Learning Path →
          </button>
        </div>`;
    }).join('');
  }

  calculateStats() {
    const competencies = this.competencyService.getAll();
    const resources = this.resourceService.getAll();
    const learners = this.learnerService.getAll();

    const totalPrereqs = competencies.reduce((sum, c) => sum + (c.prerequisites?.length || 0), 0);
    const avgPrerequisites = competencies.length > 0
      ? (totalPrereqs / competencies.length).toFixed(1)
      : '0';

    return {
      totalCompetencies: competencies.length,
      totalResources: resources.length,
      totalLearners: learners.length,
      avgPrerequisites
    };
  }


  renderPathPlanner(learnerId) {
    const learner = this.learnerService.getById(learnerId);
    if (!learner) return;

    this.renderLearnerProfile(learnerId);

    // НОВОЕ: если у learner несколько целей — показать селект
    const goals = ONTOLOGY.learningGoals[learner.id] || [];
    if (goals.length > 1) {
      this.renderGoalSelector(learnerId, goals);
    }

    const targetCompetency = this.learnerService.getTargetCompetency(learnerId);
    if (!targetCompetency) return;

    this.currentGoalId = targetCompetency;

    const gapData = this.reasoner.detectGaps(learnerId, targetCompetency);
    this.renderGapAnalysisEnhanced(gapData, learnerId);

    const pathData = this.reasoner.generateLearningPath(learnerId, targetCompetency);
    this.renderLearningPathEnhanced(pathData, learnerId);
    this.savePathToDatabase(learnerId, targetCompetency, pathData);
    this._syncPathToGraph(pathData);
  }

  // Push Planner path IDs into the graph so "Show Only Path" filter works cross-tab
  _syncPathToGraph(pathData) {
    if (!this.graph) return;
    const ids = (pathData?.pathSteps || []).map(s => s.competency?.id).filter(Boolean);
    this.graph.state.highlightedPath = ids;
  }

  renderLearnerProfile(learnerId) {
    const learner = this.learnerService.getById(learnerId);
    if (!learner) return;

    // Update basic info
    this.updateElementText('selected-learner-name', learner.name);
    this.updateElementText('selected-learner-goal',
      learner.goal || learner.goals?.primaryGoal || 'Not specified'
    );

    // Enhanced profile details
    const profileContainer = document.getElementById('learner-profile-details');
    if (profileContainer) {
      const masteredCount = this.learnerService.getMasteredCompetencies(learnerId).length;
      const targetCompetency = this.learnerService.getTargetCompetency(learnerId);
      const allPrereqs = this.reasoner.getTransitivePrerequisites(targetCompetency);
      const gapCount = allPrereqs.filter(id =>
        !this.learnerService.getMasteredCompetencies(learnerId).includes(id)
      ).length;

      profileContainer.innerHTML = `
        <div class="profile-summary">
          <div class="profile-metric">
            <span class="metric-label">Mastered</span>
            <span class="metric-value">${masteredCount}</span>
          </div>
          <div class="profile-metric">
            <span class="metric-label">Gaps</span>
            <span class="metric-value">${gapCount}</span>
          </div>
          ${learner.constraints?.timeAvailabilityPerWeek ? `
            <div class="profile-metric">
              <span class="metric-label">Hours/Week</span>
              <span class="metric-value">${learner.constraints.timeAvailabilityPerWeek}</span>
            </div>
          ` : ''}
          ${learner.affectiveProfile?.motivationLevel ? `
            <div class="profile-metric">
              <span class="metric-label">Motivation</span>
              <span class="metric-value">${Math.round(learner.affectiveProfile.motivationLevel * 100)}%</span>
            </div>
          ` : ''}
        </div>

        ${learner.learningPreferences?.primaryLearningStyle ? `
          <div class="profile-section">
            <h4>🎯 Learning Style</h4>
            <div class="tags">
              <span class="tag tag-primary">${learner.learningPreferences.primaryLearningStyle}</span>
              ${learner.learningPreferences.secondaryLearningStyle ?
            `<span class="tag tag-secondary">${learner.learningPreferences.secondaryLearningStyle}</span>` : ''}
            </div>
          </div>
        ` : ''}


        ${learner.performanceMetrics?.commonStruggingPoints?.length > 0 ? `
          <div class="profile-section">
            <h4>⚠️ Support Needs</h4>
            <div class="tags">
              ${learner.performanceMetrics.commonStruggingPoints.map(point =>
              `<span class="tag tag-warning">${point}</span>`
            ).join('')}
            </div>
          </div>
        ` : ''}
      `;
    }
  }

  renderGoalSelector(learnerId, goals) {
    const container = document.getElementById('learner-profile-details-planner');
    if (!container) return;

    const mastered = new Set(this.store.getMasteredCompetencies(learnerId));

    const optionsHtml = goals.map(g => {
      const closure  = this.store.getTransitiveClosure(g.goalCompetencyId);
      const gaps     = [...closure].filter(id => !mastered.has(id));
      const estHours = gaps.reduce((sum, id) => {
        const comp = this.store.getCompetencyById(id);
        return sum + (comp?.estimatedHours || 10);
      }, 0);
      const preview = gaps.length ? ` — ${gaps.length} steps, ${estHours}h` : ' — ready!';
      return `<option value="${g.goalCompetencyId}">${g.label}${preview}</option>`;
    }).join('');

    const selectorHtml = `
      <div class="profile-section" style="margin-top: 10px;">
        <h4 style="margin: 0 0 8px 0;">🎯 Select Goal</h4>
        <select id="goal-selector" style="width:100%; padding:8px; border-radius:6px; border:1px solid #e2e8f0; font-size:0.95rem;">
          ${optionsHtml}
        </select>
      </div>
    `;
    container.innerHTML = selectorHtml;

    document.getElementById('goal-selector')?.addEventListener('change', (e) => {
      const targetId = Number(e.target.value);
      this.currentGoalId = targetId;
      const gapData = this.reasoner.detectGaps(learnerId, targetId);
      this.renderGapAnalysisEnhanced(gapData, learnerId);
      const pathData = this.reasoner.generateLearningPath(learnerId, targetId);
      this.renderLearningPathEnhanced(pathData, learnerId);
      this.savePathToDatabase(learnerId, targetId, pathData);
      this._syncPathToGraph(pathData);
    });
  }

  // ── Reasoning tree ──────────────────────────────────────────────────────────

  initReasoningTree() {
    const learnerSel = document.getElementById('rt-learner-select');
    const goalSel    = document.getElementById('rt-goal-select');
    if (!learnerSel) return;

    // Populate learner dropdown (once)
    if (!learnerSel.dataset.populated) {
      learnerSel.dataset.populated = '1';
      Object.values(ONTOLOGY.learners).sort((a, b) => a.id - b.id).forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = l.name;
        learnerSel.appendChild(opt);
      });

      // Pre-select current learner if available
      if (this.selectedLearner) learnerSel.value = this.selectedLearner;

      const updateGoals = () => {
        const lid = Number(learnerSel.value);
        goalSel.innerHTML = '';
        (ONTOLOGY.learningGoals[lid] || []).forEach(g => {
          const opt = document.createElement('option');
          opt.value = g.goalCompetencyId;
          opt.textContent = g.label;
          goalSel.appendChild(opt);
        });
        // Pre-select current goal
        if (this.currentGoalId) goalSel.value = this.currentGoalId;
        this._drawReasoningTree(lid, Number(goalSel.value));
      };

      learnerSel.addEventListener('change', updateGoals);
      goalSel.addEventListener('change', () => {
        this._drawReasoningTree(Number(learnerSel.value), Number(goalSel.value));
      });

      updateGoals();
    } else {
      // Tab revisited — just redraw with current selections
      if (this.selectedLearner) learnerSel.value = this.selectedLearner;
      this._drawReasoningTree(Number(learnerSel.value), Number(goalSel.value));
    }
  }

  _drawReasoningTree(learnerId, goalCompetencyId) {
    const container = document.getElementById('reasoning-tree-container');
    const placeholder = document.getElementById('reasoning-tree-placeholder');
    if (!container || !goalCompetencyId) return;

    const gapData = this.reasoner.detectGaps(learnerId, goalCompetencyId);
    const mastered = new Set(this.store.getMasteredCompetencies(learnerId));
    const critSet  = new Set((gapData.gapsByPriority.critical || []).map(g => g.competencyId));
    const highSet  = new Set((gapData.gapsByPriority.high     || []).map(g => g.competencyId));

    // Build hierarchy using per-path ancestor tracking.
    // A node can appear in multiple branches (shared prerequisite is fine).
    // Only the current root→node path is checked to detect and break true cycles.
    const buildNode = (compId, ancestors = new Set()) => {
      const key = Number(compId);
      if (ancestors.has(key)) return null; // cycle — stop this branch only

      const comp = this.store.getCompetencyById(compId);
      if (!comp) return null;

      const priority = key === goalCompetencyId ? 'target'
        : mastered.has(key) ? 'mastered'
        : critSet.has(key)  ? 'critical'
        : highSet.has(key)  ? 'high'
        : 'medium';

      const childAncestors = new Set(ancestors);
      childAncestors.add(key);

      const prereqs = Array.from(this.store.getDirectPrerequisites(compId));
      return {
        id: key,
        name: comp.name,
        priority,
        bloom: comp.bloomLevel  || comp.taxonomies?.bloomLevel  || '',
        eqf:   comp.eqfLevel    || comp.taxonomies?.eqfLevel    || '',
        desc:  comp.description || '',
        children: prereqs.map(p => buildNode(p, childAncestors)).filter(Boolean),
      };
    };

    const treeData = buildNode(goalCompetencyId);
    if (!treeData) return;

    if (placeholder) placeholder.style.display = 'none';
    container.innerHTML = '';

    const W = container.clientWidth  || 700;
    const H = container.clientHeight || 440;

    const colorMap = {
      target:   '#7c3aed',
      mastered: '#10b981',
      critical: '#ef4444',
      high:     '#f59e0b',
      medium:   '#3b82f6',
    };

    const svg = d3.select(container).append('svg')
      .attr('width',  W)
      .attr('height', H)
      .style('font', '12px sans-serif');

    const g = svg.append('g');

    // Zoom & pan
    svg.call(d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform)));

    const root = d3.hierarchy(treeData);
    const layout = d3.tree().size([H - 60, W - 180]);
    layout(root);

    // Links
    g.selectAll('.rt-link')
      .data(root.links())
      .join('path')
      .attr('class', 'rt-link')
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1.5)
      .attr('d', d3.linkHorizontal()
        .x(d => d.y + 90)
        .y(d => d.x + 30));

    const tooltip = document.getElementById('rt-tooltip');

    // Nodes
    const node = g.selectAll('.rt-node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'rt-node')
      .attr('transform', d => `translate(${d.y + 90},${d.x + 30})`)
      .style('cursor', 'pointer')
      .on('mousemove', (event, d) => {
        const priorityLabel = {
          target:   'Target goal',
          mastered: 'Already mastered ✓',
          critical: 'Critical — direct prerequisite of the goal',
          high:     `High — blocks ${d.data.children?.length || '2+'} other competencies`,
          medium:   'Medium — transitive prerequisite',
        }[d.data.priority] || '';
        const descShort = d.data.desc.slice(0, 120);
        tooltip.innerHTML =
          `<strong>${escapeHTML(d.data.name)}</strong><br>` +
          (d.data.bloom ? `Bloom: ${escapeHTML(String(d.data.bloom))} &nbsp;|&nbsp; EQF ${escapeHTML(String(d.data.eqf))}<br>` : '') +
          `<em style="color:#94a3b8;">${escapeHTML(priorityLabel)}</em><br>` +
          `<span style="color:#cbd5e1;">${escapeHTML(descShort)}${d.data.desc.length > 120 ? '…' : ''}</span>`;
        tooltip.style.display  = 'block';
        tooltip.style.left     = (event.clientX + 14) + 'px';
        tooltip.style.top      = (event.clientY - 10) + 'px';
      })
      .on('mouseleave', () => { tooltip.style.display = 'none'; });

    node.append('circle')
      .attr('r', d => d.data.priority === 'target' ? 18 : 13)
      .attr('fill', d => colorMap[d.data.priority] || '#3b82f6')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    node.append('text')
      .attr('dy', d => (d.data.priority === 'target' ? 22 : 17))
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#1e293b')
      .text(d => d.data.name.length > 18 ? d.data.name.slice(0, 16) + '…' : d.data.name);
  }

  // ── Gap analysis ─────────────────────────────────────────────────────────────

  renderGapAnalysisEnhanced(gapData, learnerId) {
    const container = document.getElementById('gap-analysis');
    if (!container) return;

    const learner = ontologyData.learners[learnerId]
      || Object.values(ontologyData.learners).find(l => l.slug === String(learnerId));

    if (gapData.totalGaps === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✅</div>
          <h3>No Gaps Found!</h3>
          <p>${escapeHTML(learner.name)} has mastered all prerequisites.</p>
          <p class="success-message">🎉 Ready to pursue the target competency!</p>
        </div>
      `;
      return;
    }

    const criticalGaps = gapData.gapsByPriority.critical || [];
    const highGaps = gapData.gapsByPriority.high || [];
    const mediumGaps = gapData.gapsByPriority.medium || [];
    const totalHours = gapData.recommendedSequence.reduce((sum, compId) => {
      const comp = ontologyData.competencies[compId];
      return sum + (comp?.estimatedHours || 0);
    }, 0);

    let html = `
      <div class="gap-summary">
        <div class="summary-stat">
          <span class="stat-number">${gapData.totalGaps}</span>
          <span class="stat-label">Total Gaps</span>
        </div>
        <div class="summary-stat">
          <span class="stat-number">${criticalGaps.length}</span>
          <span class="stat-label">Critical</span>
        </div>
        <div class="summary-stat">
          <span class="stat-number">${highGaps.length}</span>
          <span class="stat-label">High Priority</span>
        </div>
        <div class="summary-stat">
          <span class="stat-number">${totalHours}h</span>
          <span class="stat-label">Est. Time</span>
        </div>
      </div>
    `;

    // Critical gaps
    if (criticalGaps.length > 0) {
      html += `
        <div class="gap-category">
          <h4>
            🔴 Critical Gaps
            <span class="priority-badge priority-critical">${criticalGaps.length}</span>
            <span class="info-icon" data-tooltip="Critical: direct prerequisite of the target competency — must be mastered first.">ⓘ</span>
          </h4>
          <p class="category-description">Direct prerequisites that must be completed first.</p>
      `;

      criticalGaps.forEach(gap => {
        const comp = gap.competency;
        html += `
          <div class="competency-gap critical-priority">
            <div class="gap-header">
              <div class="gap-title">${escapeHTML(comp.name)}</div>
              <div class="gap-badges">
                <span class="badge">${escapeHTML(String(comp.bloomLevel || comp.taxonomies?.bloomLevel || ''))}</span>
                <span class="badge">EQF ${escapeHTML(String(comp.eqfLevel || comp.taxonomies?.eqfLevel || ''))}</span>
              </div>
            </div>
            <div class="gap-details">
              <p>${escapeHTML(comp.description || '')}</p>
              <div class="gap-reason">
                <strong>Why critical:</strong> ${escapeHTML(gap.reason || '')}
              </div>
            </div>
          </div>
        `;
      });

      html += '</div>';
    }

    // High priority gaps
    if (highGaps.length > 0) {
      html += `
        <div class="gap-category">
          <h4>
            🟡 High Priority Gaps
            <span class="priority-badge priority-high">${highGaps.length}</span>
            <span class="info-icon" data-tooltip="High: blocks 2 or more other required competencies — resolving it unblocks the most progress.">ⓘ</span>
          </h4>
          <p class="category-description">Important foundations that block multiple competencies.</p>
      `;

      highGaps.forEach(gap => {
        const comp = gap.competency;
        html += `
          <div class="competency-gap high-priority">
            <div class="gap-header">
              <div class="gap-title">${escapeHTML(comp.name)}</div>
              <div class="gap-badges">
                <span class="badge">${escapeHTML(String(comp.bloomLevel || comp.taxonomies?.bloomLevel || ''))}</span>
              </div>
            </div>
            <div class="gap-details">
              <p>${escapeHTML(comp.description || '')}</p>
              <div class="gap-reason">
                <strong>Blocks:</strong> ${Number(gap.blocksCount)} other competenc${gap.blocksCount === 1 ? 'y' : 'ies'}
              </div>
            </div>
          </div>
        `;
      });

      html += '</div>';
    }

    // Medium priority gaps
    if (mediumGaps.length > 0) {
      html += `
        <div class="gap-category">
          <h4>
            🔵 Medium Priority Gaps
            <span class="priority-badge priority-medium">${mediumGaps.length}</span>
            <span class="info-icon" data-tooltip="Medium: transitive prerequisite — required indirectly through a chain of dependencies.">ⓘ</span>
          </h4>
          <p class="category-description">Foundational skills needed further along the learning chain.</p>
      `;

      mediumGaps.forEach(gap => {
        const comp = gap.competency;
        html += `
          <div class="competency-gap medium-priority">
            <div class="gap-header">
              <div class="gap-title">${escapeHTML(comp.name)}</div>
              <div class="gap-badges">
                <span class="badge">${escapeHTML(String(comp.bloomLevel || comp.taxonomies?.bloomLevel || ''))}</span>
                <span class="badge">EQF ${escapeHTML(String(comp.eqfLevel || comp.taxonomies?.eqfLevel || ''))}</span>
              </div>
            </div>
            <div class="gap-details">
              <p>${escapeHTML(comp.description || '')}</p>
              <div class="gap-reason">
                <strong>Role:</strong> ${escapeHTML(gap.reason || '')}
              </div>
            </div>
          </div>
        `;
      });

      html += '</div>';
    }

    container.innerHTML = html;
  }

  renderLearningPathEnhanced(pathData, learnerId) {
    const container = document.getElementById('learning-path');
    if (!container) return;

    const learner = ontologyData.learners[learnerId]
      || Object.values(ontologyData.learners).find(l => l.slug === String(learnerId));
    const steps = pathData.pathSteps;

    if (steps.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎯</div>
          <h3>Goal Achieved!</h3>
          <p>${learner.name} has completed all requirements.</p>
        </div>
      `;
      return;
    }

    let html = '<div class="path-container">';

    steps.forEach((step, index) => {
      const comp = step.competency;
      if (!comp) return; // safety: skip steps with missing competency data
      const isLast = index === steps.length - 1;
      const res    = step.resource;

      html += `
        <div class="path-step ${step.isTarget ? 'target-step' : ''}">
          <div class="step-number">${step.step}</div>
          <h4>${escapeHTML(comp.name)}</h4>

          <div class="step-metadata">
            <span class="badge">${comp.taxonomies?.bloomLevel || comp.bloomLevel || '—'}</span>
            <span class="badge">EQF ${comp.taxonomies?.eqfLevel || comp.eqfLevel || '—'}</span>
            <span class="badge">${step.estimatedHours || comp.estimatedHours || 0}h</span>
            ${step.priority ? `<span class="badge badge-priority">${step.priority}</span>` : ''}
          </div>

          <p class="step-description">${escapeHTML(comp.description || '')}</p>

          ${res ? `
            <div class="step-resource" style="margin-top:8px; font-size:0.87rem; color:var(--text-secondary);">
              📖 <strong>${escapeHTML(res.name)}</strong>
              <span class="badge" style="margin-left:4px;">${res.type || ''}</span>
            </div>
          ` : `
            <div style="margin-top:8px; font-size:0.82rem; color:var(--text-secondary); font-style:italic;">
              No resource mapped for this competency
            </div>
          `}

          ${step.isTarget ? `
            <div class="target-indicator">
              🎯 <strong>Target Competency</strong> — Your final goal!
            </div>
          ` : `
            <button class="btn mastery-toggle-btn"
                    data-learner="${learnerId}" data-competency="${comp.id}"
                    style="margin-top:10px; font-size:12px; padding:5px 12px; background:var(--success-color); color:#fff; border:none; border-radius:4px; cursor:pointer;">
              ✓ Mark as Mastered
            </button>
          `}
        </div>
      `;

      if (!isLast) {
        html += '<div class="arrow-down">⬇</div>';
      }
    });

    html += '</div>';

    // Add summary
    const timeAvailable = learner.constraints?.timeAvailabilityPerWeek || 10;
    const weeksNeeded = Math.ceil(pathData.totalHours / timeAvailable);

    html += `
      <div class="summary-box">
        <h3>📊 Path Summary</h3>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-value">${steps.length}</span>
            <span class="stat-label stat-color">Steps</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${pathData.totalHours}h</span>
            <span class="stat-label stat-color">Total Time</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${weeksNeeded}</span>
            <span class="stat-label stat-color">Weeks</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${Math.round(pathData.readinessScore * 100)}%</span>
            <span class="stat-label stat-color">Readiness</span>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }


  updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 400px;
      font-size: 14px;
      line-height: 1.5;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  getGraph() {
    return this.graph;
  }

  getReasoner() {
    return this.reasoner;
  }

  getFilterPanel() {
    return this.filterPanel;
  }

  getLegendPanel() {
    return this.legendPanel;
  }
}


document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM Content Loaded - Starting Enhanced Ontology Demo');

  try {
    window.demo = new OntologyDemo();

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.focus();
      }

      if (e.key === 'Escape') {
        if (window.demo.graph) {
          window.demo.graph.clearHighlight();
        }
      }
    });

    console.log('✨ Enhanced Ontology Demo fully initialized!');
    console.log('📌 Available commands:');
    console.log('  - window.demo.getGraph()');
    console.log('  - window.demo.getReasoner()');
    console.log('  - window.demo.getFilterPanel()');
    console.log('  - window.demo.getLegendPanel()');

  } catch (error) {
    console.error('❌ Fatal initialization error:', error);
    alert('Failed to initialize application. Please refresh the page.');
  }
});

window.addEventListener('error', (event) => {
  console.error('🔥 Application error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Unhandled promise rejection:', event.reason);
});

