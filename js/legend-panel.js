class LegendPanel {
  constructor(containerId, graph, ontologyData) {
    this.containerId = containerId;
    this.graph = graph;
    this.ontologyData = ontologyData;
    
    // State
    this.isCollapsed = false;
    this.activeTab = 'legend'; // 'legend' | 'statistics' | 'help'
    
    // Statistics cache
    this.stats = null;
    this.updateInterval = null;
  }

  initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      throw new Error(`Container #${this.containerId} not found`);
    }

    this.render();
    this.attachEventListeners();
    this.startStatisticsUpdates();
    
    // Listen for graph changes
    document.addEventListener('filters-changed', () => this.updateStatistics());
    document.addEventListener('learner-changed', () => this.updateStatistics());
  }

  render() {
    if (this._rendering) return;
    this._rendering = true;
    this.stats = this.calculateStatistics();
    this.container.innerHTML = this.getHTML();
    this.attachEventListeners();
    this._rendering = false;
  }

  getHTML() {
    return `
      <div class="legend-panel ${this.isCollapsed ? 'collapsed' : ''}">
        <!-- Header -->
        <div class="legend-header">
          <h3 class="legend-title">
            <svg class="legend-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Guide
          </h3>
          <button class="legend-collapse-btn" data-action="toggle-collapse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="${this.isCollapsed ? '9 18 15 12 9 6' : '6 9 12 15 18 9'}"></polyline>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="legend-tabs ${this.isCollapsed ? 'hidden' : ''}">
          <button 
            class="legend-tab ${this.activeTab === 'legend' ? 'active' : ''}" 
            data-tab="legend"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6"></path>
            </svg>
            Legend
          </button>
          <button 
            class="legend-tab ${this.activeTab === 'statistics' ? 'active' : ''}" 
            data-tab="statistics"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="20" x2="12" y2="10"></line>
              <line x1="18" y1="20" x2="18" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="16"></line>
            </svg>
            Stats
          </button>
          <button 
            class="legend-tab ${this.activeTab === 'help' ? 'active' : ''}" 
            data-tab="help"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Help
          </button>
        </div>

        <!-- Content -->
        <div class="legend-content ${this.isCollapsed ? 'hidden' : ''}">
          ${this.activeTab === 'legend' ? this.renderLegendTab() : ''}
          ${this.activeTab === 'statistics' ? this.renderStatisticsTab() : ''}
          ${this.activeTab === 'help' ? this.renderHelpTab() : ''}
        </div>
      </div>
    `;
  }

  renderLegendTab() {
    return `
      <!-- Node Colors by EQF Level -->
      <div class="legend-section">
        <h4 class="legend-section-title">EQF Levels</h4>
        <div class="legend-items">
          ${this.renderEQFLegend()}
        </div>
      </div>

      <!-- Node Status -->
      <div class="legend-section">
        <h4 class="legend-section-title">Competency Status</h4>
        <div class="legend-items">
          <div class="legend-item">
            <svg width="24" height="24">
              <circle cx="12" cy="12" r="10" fill="#10b981" stroke="#059669" stroke-width="2"/>
            </svg>
            <span class="legend-text">Mastered</span>
          </div>
          <div class="legend-item">
            <svg width="24" height="24">
              <circle cx="12" cy="12" r="10" fill="#7c3aed" stroke="#5b21b6" stroke-width="3"/>
            </svg>
            <span class="legend-text">Target Goal</span>
          </div>
          <div class="legend-item">
            <svg width="24" height="24">
              <circle cx="12" cy="12" r="10" fill="#6366f1" stroke="#475569" stroke-width="2"/>
            </svg>
            <span class="legend-text">Not Mastered</span>
          </div>
        </div>
      </div>

      <!-- Difficulty Levels -->
      <div class="legend-section">
        <h4 class="legend-section-title">Difficulty</h4>
        <div class="legend-items">
          <div class="legend-item">
            <span class="difficulty-badge beginner">▪</span>
            <span class="legend-text">Beginner</span>
          </div>
          <div class="legend-item">
            <span class="difficulty-badge intermediate">▪▪</span>
            <span class="legend-text">Intermediate</span>
          </div>
          <div class="legend-item">
            <span class="difficulty-badge advanced">▪▪▪</span>
            <span class="legend-text">Advanced</span>
          </div>
        </div>
      </div>

      <!-- Gap Priority (when applicable) -->
      <div class="legend-section">
        <h4 class="legend-section-title">Gap Priority</h4>
        <div class="legend-items">
          <div class="legend-item">
            <span class="priority-indicator critical">⚠</span>
            <span class="legend-text">Critical</span>
          </div>
          <div class="legend-item">
            <span class="priority-indicator high">⬆</span>
            <span class="legend-text">High</span>
          </div>
          <div class="legend-item">
            <span class="priority-indicator medium">➡</span>
            <span class="legend-text">Medium</span>
          </div>
          <div class="legend-item">
            <span class="priority-indicator low">⬇</span>
            <span class="legend-text">Low</span>
          </div>
        </div>
      </div>

      <!-- Connections -->
      <div class="legend-section">
        <h4 class="legend-section-title">Relationships</h4>
        <div class="legend-items">
          <div class="legend-item">
            <svg width="40" height="20">
              <line x1="0" y1="10" x2="30" y2="10" stroke="#cbd5e1" stroke-width="2"/>
              <polygon points="30,10 25,7 25,13" fill="#94a3b8"/>
            </svg>
            <span class="legend-text">Prerequisite</span>
          </div>
          <div class="legend-item">
            <svg width="40" height="20">
              <line x1="0" y1="10" x2="30" y2="10" stroke="#f59e0b" stroke-width="3"/>
              <polygon points="30,10 25,7 25,13" fill="#f59e0b"/>
            </svg>
            <span class="legend-text">Learning Path</span>
          </div>
        </div>
      </div>
    `;
  }

  renderEQFLegend() {
    const eqfLevels = [
      { level: 4, color: '#3b82f6', label: 'Foundation' },
      { level: 5, color: '#06b6d4', label: 'Intermediate' },
      { level: 6, color: '#8b5cf6', label: 'Advanced' },
      { level: 7, color: '#ec4899', label: 'Expert' },
      { level: 8, color: '#f43f5e', label: 'Master' }
    ];

    return eqfLevels.map(({ level, color, label }) => `
      <div class="legend-item">
        <svg width="24" height="24">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="#475569" stroke-width="2"/>
        </svg>
        <span class="legend-text">EQF ${level} - ${label}</span>
      </div>
    `).join('');
  }

  renderStatisticsTab() {
    if (!this.stats) {
      this.stats = this.calculateStatistics();
    }

    return `
      <div class="statistics-grid">
        <!-- Overview -->
        <div class="stat-card">
          <div class="stat-icon overview">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${this.stats.totalNodes}</div>
            <div class="stat-label">Total Competencies</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon connections">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${this.stats.totalLinks}</div>
            <div class="stat-label">Prerequisites</div>
          </div>
        </div>

        <!-- Mastery -->
        ${this.stats.selectedLearner ? `
          <div class="stat-card highlight">
            <div class="stat-icon mastered">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">${this.stats.masteredNodes}</div>
              <div class="stat-label">Mastered</div>
              <div class="stat-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${this.stats.masteryPercentage}%"></div>
                </div>
                <span class="progress-text">${this.stats.masteryPercentage}%</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon gaps">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">${this.stats.gapNodes}</div>
              <div class="stat-label">Remaining Gaps</div>
            </div>
          </div>
        ` : ''}

        <!-- Complexity -->
        <div class="stat-card">
          <div class="stat-icon complexity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${this.stats.avgCognitiveLoad}</div>
            <div class="stat-label">Avg Cognitive Load</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon time">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${this.stats.totalHours}h</div>
            <div class="stat-label">Total Est. Hours</div>
          </div>
        </div>

        <!-- Distribution -->
        <div class="stat-card full-width">
          <h4 class="stat-card-title">EQF Level Distribution</h4>
          <div class="distribution-chart">
            ${this.renderEQFDistribution()}
          </div>
        </div>

        <div class="stat-card full-width">
          <h4 class="stat-card-title">Bloom Level Distribution</h4>
          <div class="distribution-chart">
            ${this.renderBloomDistribution()}
          </div>
        </div>
      </div>
    `;
  }

  renderEQFDistribution() {
    const distribution = this.stats.eqfDistribution;
    const maxCount = Math.max(...Object.values(distribution));

    return Object.entries(distribution).map(([level, count]) => {
      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
      return `
        <div class="distribution-item">
          <div class="distribution-label">EQF ${level}</div>
          <div class="distribution-bar">
            <div class="distribution-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="distribution-value">${count}</div>
        </div>
      `;
    }).join('');
  }

  renderBloomDistribution() {
    const distribution = this.stats.bloomDistribution;
    const maxCount = Math.max(...Object.values(distribution));

    return Object.entries(distribution).map(([level, count]) => {
      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
      return `
        <div class="distribution-item">
          <div class="distribution-label">${level}</div>
          <div class="distribution-bar">
            <div class="distribution-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="distribution-value">${count}</div>
        </div>
      `;
    }).join('');
  }

  renderHelpTab() {
    return `
      <div class="help-content">
        <div class="help-section">
          <h4 class="help-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Navigation
          </h4>
          <ul class="help-list">
            <li><strong>Zoom:</strong> Scroll mouse wheel or pinch gesture</li>
            <li><strong>Pan:</strong> Click and drag background</li>
            <li><strong>Move Node:</strong> Click and drag any node</li>
            <li><strong>Select:</strong> Click on a node for details</li>
          </ul>
        </div>

        <div class="help-section">
          <h4 class="help-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Use Cases
          </h4>
          <ul class="help-list">
            <li><strong>UC-1:</strong> Generate learning path to target goal</li>
            <li><strong>UC-2:</strong> Diagnose prerequisite gaps</li>
            <li><strong>UC-3:</strong> View explainable recommendations</li>
          </ul>
        </div>

        <div class="help-section">
          <h4 class="help-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6"></path>
            </svg>
            Understanding Nodes
          </h4>
          <ul class="help-list">
            <li><strong>Green:</strong> Already mastered</li>
            <li><strong>Purple:</strong> Target goal</li>
            <li><strong>Blue/Cyan/Pink:</strong> Color by EQF level</li>
            <li><strong>Arrows:</strong> Show prerequisite relationships</li>
          </ul>
        </div>

        <div class="help-section">
          <h4 class="help-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filters
          </h4>
          <ul class="help-list">
            <li>Use filters to focus on specific competencies</li>
            <li>Filter by EQF level, difficulty, or mastery status</li>
            <li>Search by name or description</li>
            <li>Show only learning path for focused view</li>
          </ul>
        </div>

        <div class="help-section">
          <h4 class="help-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Ontology Layers
          </h4>
          <ul class="help-list">
            <li><strong>Learner:</strong> Profile with goals and mastery</li>
            <li><strong>Competency:</strong> Skills with taxonomies</li>
            <li><strong>Content:</strong> Resources (not visualized)</li>
            <li><strong>Process:</strong> Learning paths and sequences</li>
          </ul>
        </div>

        <div class="help-tip">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>Hover over nodes to see detailed tooltips with competency information</span>
        </div>
      </div>
    `;
  }

  // ===========================================================================
  // EVENT HANDLERS
  // ===========================================================================

  attachEventListeners() {
    // Collapse/expand
    this.container.querySelector('[data-action="toggle-collapse"]')?.addEventListener('click', () => {
      this.toggleCollapse();
    });

    // Tab switching
    this.container.querySelectorAll('.legend-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.currentTarget.dataset.tab);
      });
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    this.render();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.container.querySelector('.legend-panel').classList.toggle('collapsed');
    this.container.querySelector('.legend-tabs').classList.toggle('hidden');
    this.container.querySelector('.legend-content').classList.toggle('hidden');
    
    // Update icon
    const icon = this.container.querySelector('[data-action="toggle-collapse"] polyline');
    if (icon) {
      icon.setAttribute('points', this.isCollapsed ? '9 18 15 12 9 6' : '6 9 12 15 18 9');
    }
  }

  // ===========================================================================
  // STATISTICS CALCULATION
  // ===========================================================================

  calculateStatistics() {
    if (!this.graph) {
      return {
        totalNodes: 0,
        totalLinks: 0,
        masteredNodes: 0,
        targetNodes: 0,
        avgPrerequisites: 0,
        maxPrerequisites: 0
      };
    }

    const selectedLearner = this.graph.selectedLearner || null;
    const nodes = this.graph.nodes || [];
    const links = this.graph.links || [];
    const learner = selectedLearner
      ? this.ontologyData.learners[selectedLearner]
      : null;

    // Basic counts
    const totalNodes = nodes.length;
    const totalLinks = links.length;
    const masteredNodes = nodes.filter(n => n.isMastered).length;
    const gapNodes = learner ? totalNodes - masteredNodes : 0;

    // Calculate percentages
    const masteryPercentage = totalNodes > 0 
      ? Math.round((masteredNodes / totalNodes) * 100)
      : 0;

    // Cognitive load
    const nodesWithLoad = nodes.filter(n => n.cognitiveLoad !== undefined && n.cognitiveLoad !== null);
    const avgCognitiveLoad = nodesWithLoad.length > 0
      ? (nodesWithLoad.reduce((sum, n) => sum + n.cognitiveLoad, 0) / nodesWithLoad.length).toFixed(1)
      : 'N/A';

    // Total hours
    const totalHours = nodes.reduce((sum, n) => sum + (n.estimatedHours || 0), 0);

    // EQF distribution
    const eqfDistribution = {};
    for (let i = 1; i <= 8; i++) eqfDistribution[i] = 0;
    nodes.forEach(n => {
      if (n.eqfLevel) eqfDistribution[n.eqfLevel]++;
    });

    // Bloom distribution
    const bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
    const bloomDistribution = {};
    bloomLevels.forEach(level => bloomDistribution[level] = 0);
    const bloomNumberToName = { 1: 'Remember', 2: 'Understand', 3: 'Apply', 4: 'Analyze', 5: 'Evaluate', 6: 'Create' };
    nodes.forEach(n => {
      const bloomName = bloomNumberToName[n.bloomLevel];
      if (bloomName && bloomDistribution.hasOwnProperty(bloomName)) {
        bloomDistribution[bloomName]++;
      }
    });

    return {
      totalNodes,
      totalLinks,
      masteredNodes,
      gapNodes,
      masteryPercentage,
      avgCognitiveLoad,
      totalHours,
      eqfDistribution,
      bloomDistribution,
      selectedLearner: selectedLearner
    };
  }

  updateStatistics() {
    if (this.activeTab === 'statistics' && !this.isCollapsed) {
      this.render();
    } else {
      this.stats = this.calculateStatistics();
    }
  }

  startStatisticsUpdates() {
    // Update statistics every 5 seconds when visible
    this.updateInterval = setInterval(() => {
      if (this.activeTab === 'statistics' && !this.isCollapsed) {
        this.updateStatistics();
      }
    }, 5000);
  }

  stopStatisticsUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  getStatistics() {
    return this.calculateStatistics();
  }

  destroy() {
    this.stopStatisticsUpdates();
  }
}