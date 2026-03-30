// =============================================================================
// FILTER PANEL - Interactive Filtering for Competency Graph
// =============================================================================
// Provides filtering by: EQF level, Bloom level, difficulty, mastery status,
// learning path, domain, and search
// =============================================================================

class FilterPanel {
  constructor(containerId, graph, ontologyData) {
    this.containerId = containerId;
    this.graph = graph;
    this.ontologyData = ontologyData;
    
    // Filter state
    this.filters = {
      eqfRange: { min: 1, max: 8 },
      bloomLevels: new Set(['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']),
      difficultyLevels: new Set(['Beginner', 'Intermediate', 'Advanced']),
      showMastered: true,
      showNotMastered: true,
      showOnlyPath: false,
      domains: new Set(),
      searchQuery: '',
      cognitiveLoadRange: { min: 0, max: 10 }
    };
    
    // UI state
    this.isCollapsed = false;
    this.activeFilterCount = 0;
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      throw new Error(`Container #${this.containerId} not found`);
    }

    this.extractDomains();
    this.render();
    this.attachEventListeners();
    this.updateActiveFilterCount();
  }

  extractDomains() {
    // Extract unique domains from competencies
    Object.values(this.ontologyData.competencies).forEach(comp => {
      const domain = comp.domain || comp.belongsToDomain;
      if (domain) {
        this.filters.domains.add(domain);
      }
    });
  }

  // ===========================================================================
  // RENDERING
  // ===========================================================================

  render() {
    this.container.innerHTML = this.getHTML();
    this.updateFilterUI();
  }

  getHTML() {
    return `
      <div class="filter-panel ${this.isCollapsed ? 'collapsed' : ''}">
        <!-- Header -->
        <div class="filter-header">
          <div class="filter-header-content">
            <h3 class="filter-title">
              <svg class="filter-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filters
              ${this.activeFilterCount > 0 ? `<span class="filter-badge">${this.activeFilterCount}</span>` : ''}
            </h3>
            <button class="filter-collapse-btn" data-action="toggle-collapse">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="${this.isCollapsed ? '9 18 15 12 9 6' : '6 9 12 15 18 9'}"></polyline>
              </svg>
            </button>
          </div>
          
          <!-- Quick Actions -->
          <div class="filter-quick-actions">
            <button class="btn-quick-action" data-action="show-all" title="Show All">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              All
            </button>
            <button class="btn-quick-action" data-action="show-path" title="Show Only Learning Path">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              Path
            </button>
            <button class="btn-quick-action" data-action="show-gaps" title="Show Only Gaps">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Gaps
            </button>
            <button class="btn-quick-action" data-action="reset" title="Reset All Filters">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <polyline points="23 20 23 14 17 14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
              Reset
            </button>
          </div>
        </div>

        <!-- Filter Content -->
        <div class="filter-content ${this.isCollapsed ? 'hidden' : ''}">
          
          <!-- Search -->
          ${this.renderSearchSection()}
          
          <!-- Mastery Status -->
          ${this.renderMasterySection()}
          
          <!-- EQF Level Range -->
          ${this.renderEQFSection()}
          
          <!-- Bloom Taxonomy -->
          ${this.renderBloomSection()}
          
          <!-- Difficulty Level -->
          ${this.renderDifficultySection()}
          
          <!-- Cognitive Load -->
          ${this.renderCognitiveLoadSection()}
          
          <!-- Domains -->
          ${this.renderDomainsSection()}
          
          <!-- Learning Path -->
          ${this.renderPathSection()}
        </div>
      </div>
    `;
  }

  renderSearchSection() {
    return `
      <div class="filter-section">
        <label class="filter-label">
          <svg class="filter-label-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          Search Competencies
        </label>
        <div class="search-input-wrapper">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search by name or description..."
            data-filter="search"
            value="${this.filters.searchQuery}"
          />
          ${this.filters.searchQuery ? `
            <button class="search-clear-btn" data-action="clear-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderMasterySection() {
    return `
      <div class="filter-section">
        <label class="filter-label">Mastery Status</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              class="checkbox-input"
              data-filter="showMastered"
              ${this.filters.showMastered ? 'checked' : ''}
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">
              <span class="status-indicator mastered"></span>
              Show Mastered
            </span>
          </label>
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              class="checkbox-input"
              data-filter="showNotMastered"
              ${this.filters.showNotMastered ? 'checked' : ''}
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">
              <span class="status-indicator not-mastered"></span>
              Show Not Mastered
            </span>
          </label>
        </div>
      </div>
    `;
  }

  renderEQFSection() {
    return `
      <div class="filter-section">
        <label class="filter-label">
          EQF Level Range
          <span class="filter-value-badge">${this.filters.eqfRange.min} - ${this.filters.eqfRange.max}</span>
        </label>
        <div class="range-slider-wrapper">
          <div class="range-inputs">
            <input 
              type="number" 
              class="range-number-input" 
              min="1" 
              max="8"
              value="${this.filters.eqfRange.min}"
              data-filter="eqfMin"
            />
            <span class="range-separator">to</span>
            <input 
              type="number" 
              class="range-number-input" 
              min="1" 
              max="8"
              value="${this.filters.eqfRange.max}"
              data-filter="eqfMax"
            />
          </div>
          <div class="dual-range-slider">
            <input 
              type="range" 
              class="range-slider" 
              min="1" 
              max="8" 
              value="${this.filters.eqfRange.min}"
              data-filter="eqfMinSlider"
            />
            <input 
              type="range" 
              class="range-slider" 
              min="1" 
              max="8" 
              value="${this.filters.eqfRange.max}"
              data-filter="eqfMaxSlider"
            />
          </div>
          <div class="range-labels">
            <span class="range-label">1 (Basic)</span>
            <span class="range-label">8 (Master)</span>
          </div>
        </div>
      </div>
    `;
  }

  renderBloomSection() {
    const bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
    const bloomColors = {
      'Remember': '#64748b',
      'Understand': '#3b82f6',
      'Apply': '#06b6d4',
      'Analyze': '#8b5cf6',
      'Evaluate': '#ec4899',
      'Create': '#f43f5e'
    };

    return `
      <div class="filter-section">
        <label class="filter-label">Bloom's Taxonomy</label>
        <div class="pill-group">
          ${bloomLevels.map(level => `
            <button 
              class="pill-btn ${this.filters.bloomLevels.has(level) ? 'active' : ''}"
              data-filter="bloom"
              data-value="${level}"
              style="--pill-color: ${bloomColors[level]}"
            >
              ${level}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderDifficultySection() {
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    const difficultyIcons = {
      'Beginner': '▪',
      'Intermediate': '▪▪',
      'Advanced': '▪▪▪'
    };

    return `
      <div class="filter-section">
        <label class="filter-label">Difficulty Level</label>
        <div class="pill-group">
          ${difficulties.map(diff => `
            <button 
              class="pill-btn ${this.filters.difficultyLevels.has(diff) ? 'active' : ''}"
              data-filter="difficulty"
              data-value="${diff}"
            >
              <span class="difficulty-icon">${difficultyIcons[diff]}</span>
              ${diff}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderCognitiveLoadSection() {
    return `
      <div class="filter-section">
        <label class="filter-label">
          Cognitive Load
          <span class="filter-value-badge">${this.filters.cognitiveLoadRange.min} - ${this.filters.cognitiveLoadRange.max}</span>
        </label>
        <div class="range-slider-wrapper">
          <div class="range-inputs">
            <input 
              type="number" 
              class="range-number-input" 
              min="0" 
              max="10"
              value="${this.filters.cognitiveLoadRange.min}"
              data-filter="cogLoadMin"
            />
            <span class="range-separator">to</span>
            <input 
              type="number" 
              class="range-number-input" 
              min="0" 
              max="10"
              value="${this.filters.cognitiveLoadRange.max}"
              data-filter="cogLoadMax"
            />
          </div>
          <div class="dual-range-slider">
            <input 
              type="range" 
              class="range-slider" 
              min="0" 
              max="10" 
              value="${this.filters.cognitiveLoadRange.min}"
              data-filter="cogLoadMinSlider"
            />
            <input 
              type="range" 
              class="range-slider" 
              min="0" 
              max="10" 
              value="${this.filters.cognitiveLoadRange.max}"
              data-filter="cogLoadMaxSlider"
            />
          </div>
        </div>
      </div>
    `;
  }

  renderDomainsSection() {
    if (this.filters.domains.size === 0) return '';

    const domains = Array.from(this.filters.domains);
    return `
      <div class="filter-section">
        <label class="filter-label">Domains</label>
        <div class="checkbox-group">
          ${domains.map(domain => `
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                class="checkbox-input"
                data-filter="domain"
                data-value="${domain}"
                checked
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">${domain}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderPathSection() {
    return `
      <div class="filter-section">
        <label class="filter-label">Learning Path</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              class="checkbox-input"
              data-filter="showOnlyPath"
              ${this.filters.showOnlyPath ? 'checked' : ''}
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              Show Only Learning Path
            </span>
          </label>
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

    // Quick actions
    this.container.querySelector('[data-action="show-all"]')?.addEventListener('click', () => {
      this.showAll();
    });
    
    this.container.querySelector('[data-action="show-path"]')?.addEventListener('click', () => {
      this.showOnlyPath();
    });
    
    this.container.querySelector('[data-action="show-gaps"]')?.addEventListener('click', () => {
      this.showOnlyGaps();
    });
    
    this.container.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      this.resetFilters();
    });

    // Search
    const searchInput = this.container.querySelector('[data-filter="search"]');
    if (searchInput) {
      searchInput.addEventListener('input', debounce((e) => {
        this.filters.searchQuery = e.target.value;
        this.applyFilters();
        this.updateActiveFilterCount();
      }, 300));
    }

    this.container.querySelector('[data-action="clear-search"]')?.addEventListener('click', () => {
      this.filters.searchQuery = '';
      this.render();
      this.attachEventListeners();
      this.applyFilters();
    });

    // Checkboxes
    this.container.querySelectorAll('.checkbox-input').forEach(input => {
      input.addEventListener('change', (e) => {
        this.handleCheckboxChange(e);
      });
    });

    // Pills (Bloom, Difficulty)
    this.container.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handlePillClick(e);
      });
    });

    // Range inputs
    this.container.querySelectorAll('.range-number-input').forEach(input => {
      input.addEventListener('change', (e) => {
        this.handleRangeChange(e);
      });
    });

    this.container.querySelectorAll('.range-slider').forEach(input => {
      input.addEventListener('input', (e) => {
        this.handleRangeSliderChange(e);
      });
    });
  }

  handleCheckboxChange(e) {
    const filter = e.target.dataset.filter;
    const value = e.target.dataset.value;
    const checked = e.target.checked;

    if (filter === 'showMastered') {
      this.filters.showMastered = checked;
    } else if (filter === 'showNotMastered') {
      this.filters.showNotMastered = checked;
    } else if (filter === 'showOnlyPath') {
      this.filters.showOnlyPath = checked;
    } else if (filter === 'domain') {
      if (checked) {
        this.filters.domains.add(value);
      } else {
        this.filters.domains.delete(value);
      }
    }

    this.applyFilters();
    this.updateActiveFilterCount();
  }

  handlePillClick(e) {
    const btn = e.currentTarget;
    const filter = btn.dataset.filter;
    const value = btn.dataset.value;
    const isActive = btn.classList.contains('active');

    if (filter === 'bloom') {
      if (isActive) {
        this.filters.bloomLevels.delete(value);
        btn.classList.remove('active');
      } else {
        this.filters.bloomLevels.add(value);
        btn.classList.add('active');
      }
    } else if (filter === 'difficulty') {
      if (isActive) {
        this.filters.difficultyLevels.delete(value);
        btn.classList.remove('active');
      } else {
        this.filters.difficultyLevels.add(value);
        btn.classList.add('active');
      }
    }

    this.applyFilters();
    this.updateActiveFilterCount();
  }

  handleRangeChange(e) {
    const filter = e.target.dataset.filter;
    const value = parseInt(e.target.value);

    if (filter === 'eqfMin') {
      this.filters.eqfRange.min = Math.min(value, this.filters.eqfRange.max);
    } else if (filter === 'eqfMax') {
      this.filters.eqfRange.max = Math.max(value, this.filters.eqfRange.min);
    } else if (filter === 'cogLoadMin') {
      this.filters.cognitiveLoadRange.min = Math.min(value, this.filters.cognitiveLoadRange.max);
    } else if (filter === 'cogLoadMax') {
      this.filters.cognitiveLoadRange.max = Math.max(value, this.filters.cognitiveLoadRange.min);
    }

    this.updateFilterUI();
    this.applyFilters();
    this.updateActiveFilterCount();
  }

  handleRangeSliderChange(e) {
    const filter = e.target.dataset.filter;
    const value = parseInt(e.target.value);

    if (filter === 'eqfMinSlider') {
      this.filters.eqfRange.min = Math.min(value, this.filters.eqfRange.max);
    } else if (filter === 'eqfMaxSlider') {
      this.filters.eqfRange.max = Math.max(value, this.filters.eqfRange.min);
    } else if (filter === 'cogLoadMinSlider') {
      this.filters.cognitiveLoadRange.min = Math.min(value, this.filters.cognitiveLoadRange.max);
    } else if (filter === 'cogLoadMaxSlider') {
      this.filters.cognitiveLoadRange.max = Math.max(value, this.filters.cognitiveLoadRange.min);
    }

    this.updateFilterUI();
    this.applyFilters();
    this.updateActiveFilterCount();
  }

  // ===========================================================================
  // FILTER APPLICATION
  // ===========================================================================

  applyFilters() {
    // Get all nodes from graph
    const allNodes = this.graph.nodes;
    
    const filteredNodes = allNodes.filter(node => {
      // Search query
      if (this.filters.searchQuery) {
        const query = this.filters.searchQuery.toLowerCase();
        const matchesName = node.name.toLowerCase().includes(query);
        const matchesDesc = node.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      // Mastery status
      if (!this.filters.showMastered && node.isMastered) return false;
      if (!this.filters.showNotMastered && !node.isMastered) return false;

      // EQF range
      if (node.eqfLevel < this.filters.eqfRange.min || 
          node.eqfLevel > this.filters.eqfRange.max) {
        return false;
      }

      // Bloom level
      if (!this.filters.bloomLevels.has(node.bloomLevel)) {
        return false;
      }

      // Difficulty
      if (node.difficultyLevel && !this.filters.difficultyLevels.has(node.difficultyLevel)) {
        return false;
      }

      // Cognitive load
      if (node.cognitiveLoad !== undefined && node.cognitiveLoad !== null) {
        if (node.cognitiveLoad < this.filters.cognitiveLoadRange.min ||
            node.cognitiveLoad > this.filters.cognitiveLoadRange.max) {
          return false;
        }
      }

      // Domain
      if (node.domain && !this.filters.domains.has(node.domain)) {
        return false;
      }

      // Learning path
      if (this.filters.showOnlyPath && this.graph.state.highlightedPath.length > 0) {
        if (!this.graph.state.highlightedPath.includes(node.id)) {
          return false;
        }
      }

      return true;
    });

    // Apply visual filtering
    this.visualizeFilteredNodes(filteredNodes);

    // Dispatch event
    this.dispatchFilterChangeEvent(filteredNodes);
  }

  visualizeFilteredNodes(filteredNodes) {
    const filteredIds = new Set(filteredNodes.map(n => n.id));

    // Update node opacity
    this.graph.g.selectAll('.node circle')
      .transition()
      .duration(300)
      .attr('opacity', d => filteredIds.has(d.id) ? 1 : 0.1);

    this.graph.g.selectAll('.node text')
      .transition()
      .duration(300)
      .attr('opacity', d => filteredIds.has(d.id) ? 1 : 0.15);

    // Update link opacity
    this.graph.g.selectAll('.link')
      .transition()
      .duration(300)
      .attr('stroke-opacity', d => {
        const sourceVisible = filteredIds.has(d.source.id);
        const targetVisible = filteredIds.has(d.target.id);
        return (sourceVisible && targetVisible) ? 0.6 : 0.05;
      });
  }

  dispatchFilterChangeEvent(filteredNodes) {
    const event = new CustomEvent('filters-changed', {
      detail: {
        filters: this.filters,
        filteredNodes: filteredNodes,
        totalNodes: this.graph.nodes.length,
        visibleNodes: filteredNodes.length
      }
    });
    document.dispatchEvent(event);
  }

  // ===========================================================================
  // QUICK ACTIONS
  // ===========================================================================

  showAll() {
    // Reset to show everything
    this.filters.showMastered = true;
    this.filters.showNotMastered = true;
    this.filters.showOnlyPath = false;
    this.filters.eqfRange = { min: 1, max: 8 };
    this.filters.cognitiveLoadRange = { min: 0, max: 10 };
    this.filters.bloomLevels = new Set(['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']);
    this.filters.difficultyLevels = new Set(['Beginner', 'Intermediate', 'Advanced']);
    this.filters.searchQuery = '';

    this.render();
    this.attachEventListeners();
    this.applyFilters();
    this.updateActiveFilterCount();
  }

  showOnlyPath() {
    if (this.graph.state.highlightedPath.length === 0) {
      alert('No learning path generated. Please generate a path first.');
      return;
    }

    this.filters.showOnlyPath = true;
    this.render();
    this.attachEventListeners();
    this.applyFilters();
    this.updateActiveFilterCount();
  }

  showOnlyGaps() {
    if (!this.graph.state.selectedLearner) {
      alert('Please select a learner first.');
      return;
    }

    // Show only not mastered competencies
    this.filters.showMastered = false;
    this.filters.showNotMastered = true;
    
    this.render();
    this.attachEventListeners();
    this.applyFilters();
    this.updateActiveFilterCount();
  }

  resetFilters() {
    this.showAll();
  }

  // ===========================================================================
  // UI UPDATES
  // ===========================================================================

  updateFilterUI() {
    // Update range value displays
    const eqfBadge = this.container.querySelector('.filter-section:has([data-filter="eqfMin"]) .filter-value-badge');
    if (eqfBadge) {
      eqfBadge.textContent = `${this.filters.eqfRange.min} - ${this.filters.eqfRange.max}`;
    }

    const cogBadge = this.container.querySelector('.filter-section:has([data-filter="cogLoadMin"]) .filter-value-badge');
    if (cogBadge) {
      cogBadge.textContent = `${this.filters.cognitiveLoadRange.min} - ${this.filters.cognitiveLoadRange.max}`;
    }

    // Sync number inputs with sliders
    const eqfMinInput = this.container.querySelector('[data-filter="eqfMin"]');
    const eqfMaxInput = this.container.querySelector('[data-filter="eqfMax"]');
    const eqfMinSlider = this.container.querySelector('[data-filter="eqfMinSlider"]');
    const eqfMaxSlider = this.container.querySelector('[data-filter="eqfMaxSlider"]');

    if (eqfMinInput) eqfMinInput.value = this.filters.eqfRange.min;
    if (eqfMaxInput) eqfMaxInput.value = this.filters.eqfRange.max;
    if (eqfMinSlider) eqfMinSlider.value = this.filters.eqfRange.min;
    if (eqfMaxSlider) eqfMaxSlider.value = this.filters.eqfRange.max;

    const cogMinInput = this.container.querySelector('[data-filter="cogLoadMin"]');
    const cogMaxInput = this.container.querySelector('[data-filter="cogLoadMax"]');
    const cogMinSlider = this.container.querySelector('[data-filter="cogLoadMinSlider"]');
    const cogMaxSlider = this.container.querySelector('[data-filter="cogLoadMaxSlider"]');

    if (cogMinInput) cogMinInput.value = this.filters.cognitiveLoadRange.min;
    if (cogMaxInput) cogMaxInput.value = this.filters.cognitiveLoadRange.max;
    if (cogMinSlider) cogMinSlider.value = this.filters.cognitiveLoadRange.min;
    if (cogMaxSlider) cogMaxSlider.value = this.filters.cognitiveLoadRange.max;
  }

  updateActiveFilterCount() {
    let count = 0;

    // Check each filter
    if (this.filters.searchQuery) count++;
    if (!this.filters.showMastered || !this.filters.showNotMastered) count++;
    if (this.filters.showOnlyPath) count++;
    if (this.filters.eqfRange.min > 1 || this.filters.eqfRange.max < 8) count++;
    if (this.filters.cognitiveLoadRange.min > 0 || this.filters.cognitiveLoadRange.max < 10) count++;
    if (this.filters.bloomLevels.size < 6) count++;
    if (this.filters.difficultyLevels.size < 3) count++;

    this.activeFilterCount = count;

    // Update badge
    const badge = this.container.querySelector('.filter-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.container.querySelector('.filter-panel').classList.toggle('collapsed');
    this.container.querySelector('.filter-content').classList.toggle('hidden');
    
    // Update icon
    const icon = this.container.querySelector('[data-action="toggle-collapse"] polyline');
    if (icon) {
      icon.setAttribute('points', this.isCollapsed ? '9 18 15 12 9 6' : '6 9 12 15 18 9');
    }
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  getActiveFilters() {
    return { ...this.filters };
  }

  setFilter(filterName, value) {
    if (this.filters.hasOwnProperty(filterName)) {
      this.filters[filterName] = value;
      this.render();
      this.attachEventListeners();
      this.applyFilters();
      this.updateActiveFilterCount();
    }
  }

  clearAllFilters() {
    this.resetFilters();
  }
}

// Utility: debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}