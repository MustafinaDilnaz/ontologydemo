
class OntologyDemo {
  constructor() {
    this.reasoner = null;
    this.graph = null;
    this.filterPanel = null;
    this.legendPanel = null;
    this.selectedLearner = null;
    this.currentTab = 'overview';
    
    this.init();
  }

  init() {
    console.log('🎓 Enhanced Ontology Demo initializing...');
    
    try {
      // Initialize reasoner
      this.reasoner = new OntologyReasoner(ontologyData);
      console.log('✓ Reasoner initialized');
      
      // Setup event listeners
      this.setupEventListeners();
      console.log('✓ Event listeners attached');
      
      // Render initial content
      this.renderOverview();
      console.log('✓ Overview rendered');
      
      // Initialize graph (deferred until tab is viewed)
      this.deferredGraphInit = true;
      
      console.log('✅ Enhanced Ontology Demo ready!');
    } catch (error) {
      console.error('❌ Initialization error:', error);
      this.showNotification('Failed to initialize application', 'error');
    }
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Learner selection cards
    document.querySelectorAll('.learner-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const learnerId = e.currentTarget.dataset.learner;
        this.selectLearner(learnerId);
      });
    });

    // Generate path buttons
    document.querySelectorAll('.generate-path-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const learnerId = e.target.dataset.learner;
        this.generateAndShowPath(learnerId);
      });
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
    
    // Update tab buttons
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

    // Tab-specific initialization
    if (tabName === 'graph') {
      setTimeout(() => this.initializeGraphTab(), 100);
    } else if (tabName === 'planner' && this.selectedLearner) {
      this.renderPathPlanner(this.selectedLearner);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  initializeGraphTab() {
    const graphContainer = document.getElementById('competency-graph');
    if (!graphContainer) {
      console.warn('Graph container not found');
      return;
    }

    // Check if container is visible
    const isVisible = graphContainer.offsetParent !== null;
    if (!isVisible) {
      console.log('Graph container not visible yet');
      return;
    }

    // Initialize graph if needed
    if (!this.graph || !graphContainer.querySelector('svg')) {
      this.initializeGraph();
    }

    // Initialize panels if needed
    if (!this.filterPanel) {
      this.initializeFilterPanel();
    }

    if (!this.legendPanel) {
      this.initializeLegendPanel();
    }

    // Update with selected learner
    if (this.selectedLearner && this.graph) {
      this.graph.setSelectedLearner(this.selectedLearner);
    }
  }

  initializeGraph() {
    const graphContainer = document.getElementById('competency-graph');
    if (!graphContainer) return;

    try {
      // Destroy existing graph
      if (this.graph) {
        console.log('Destroying old graph');
        this.graph.destroy();
      }
      
      // Create new graph
      console.log('Creating new CompetencyGraph');
      this.graph = new CompetencyGraph('competency-graph', ontologyData);
      
      // Initialize with reasoner
      this.graph.initialize(this.reasoner);
      
      // Set selected learner if any
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
      console.log('Creating LegendPanel');
      this.legendPanel = new LegendPanel('legend-panel', this.graph, ontologyData);
      this.legendPanel.initialize();
      console.log('✓ Legend panel initialized');
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

    this.showNotification(`Selected learner: ${ontologyData.learners[learnerId].name}`, 'success');
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
          <h4>${node.name}</h4>
          <div class="explanation-badges">
            <span class="badge">EQF ${node.eqfLevel}</span>
            <span class="badge">${node.bloomLevel}</span>
            <span class="badge">${node.difficultyLevel || 'N/A'}</span>
            ${node.isMastered ? '<span class="badge badge-success">✓ Mastered</span>' : ''}
            ${node.isTarget ? '<span class="badge badge-primary">★ Target</span>' : ''}
          </div>
          <div class="explanation-text">
            ${explanation.split('\n').map(line => `<p>${line}</p>`).join('')}
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
  }

  calculateStats() {
    const competencies = Object.values(ontologyData.competencies);
    const resources = Object.values(ontologyData.learningResources);
    const learners = Object.values(ontologyData.learners);

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
    const learner = ontologyData.learners[learnerId];
    if (!learner) {
      console.warn(`Learner ${learnerId} not found`);
      return;
    }

    console.log(`📊 Rendering enhanced path planner for: ${learner.name}`);

    // Update learner profile display
    this.renderLearnerProfile(learnerId);

    // Get target competency
    const targetCompetency = learner.targetCompetency || learner.goals?.targetCompetencies?.[0];
    
    if (!targetCompetency) {
      console.warn('No target competency found for learner');
      return;
    }

    // Generate gap analysis
    const gapData = this.reasoner.detectGaps(learnerId, targetCompetency);
    this.renderGapAnalysisEnhanced(gapData, learnerId);

    // Generate learning path
    const pathData = this.reasoner.generateLearningPath(learnerId, targetCompetency);
    this.renderLearningPathEnhanced(pathData, learnerId);
  }

  renderLearnerProfile(learnerId) {
    const learner = ontologyData.learners[learnerId];
    if (!learner) return;

    // Update basic info
    this.updateElementText('selected-learner-name', learner.name);
    this.updateElementText('selected-learner-goal', 
      learner.goal || learner.goals?.primaryGoal || 'Not specified'
    );

    // Enhanced profile details
    const profileContainer = document.getElementById('learner-profile-details');
    if (profileContainer) {
      const masteredCount = learner.competencyStatus?.masteredCompetencies?.length || 
                           learner.masteredCompetencies?.length || 0;
      const allPrereqs = this.reasoner.getTransitivePrerequisites(
        learner.targetCompetency || learner.goals?.targetCompetencies?.[0]
      );
      const gapCount = allPrereqs.filter(id => 
        !(learner.competencyStatus?.masteredCompetencies || learner.masteredCompetencies || []).includes(id)
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

        ${learner.cognitiveProfile ? `
          <div class="profile-section">
            <h4>🧠 Cognitive Profile</h4>
            <div class="cognitive-traits">
              ${learner.cognitiveProfile.processingSpeed ? `
                <div class="trait">
                  <span class="trait-label">Processing Speed:</span>
                  <span class="trait-value">${learner.cognitiveProfile.processingSpeed}</span>
                </div>
              ` : ''}
              ${learner.cognitiveProfile.attentionSpan ? `
                <div class="trait">
                  <span class="trait-label">Attention Span:</span>
                  <span class="trait-value">${learner.cognitiveProfile.attentionSpan} min</span>
                </div>
              ` : ''}
              ${learner.cognitiveProfile.metacognitiveSkill ? `
                <div class="trait">
                  <span class="trait-label">Metacognitive Skill:</span>
                  <span class="trait-value">${learner.cognitiveProfile.metacognitiveSkill}</span>
                </div>
              ` : ''}
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

  renderGapAnalysisEnhanced(gapData, learnerId) {
    const container = document.getElementById('gap-analysis');
    if (!container) return;

    const learner = ontologyData.learners[learnerId];
    
    if (gapData.totalGaps === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✅</div>
          <h3>No Gaps Found!</h3>
          <p>${learner.name} has mastered all prerequisites.</p>
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
          </h4>
          <p class="category-description">Direct prerequisites that must be completed first.</p>
      `;

      criticalGaps.forEach(gap => {
        const comp = gap.competency;
        html += `
          <div class="competency-gap critical-priority">
            <div class="gap-header">
              <div class="gap-title">${comp.name}</div>
              <div class="gap-badges">
                <span class="badge">${comp.bloomLevel || comp.taxonomies?.bloomLevel}</span>
                <span class="badge">EQF ${comp.eqfLevel || comp.taxonomies?.eqfLevel}</span>
              </div>
            </div>
            <div class="gap-details">
              <p>${comp.description}</p>
              <div class="gap-reason">
                <strong>Why critical:</strong> ${gap.reason}
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
          </h4>
          <p class="category-description">Important foundations that block multiple competencies.</p>
      `;

      highGaps.forEach(gap => {
        const comp = gap.competency;
        html += `
          <div class="competency-gap high-priority">
            <div class="gap-header">
              <div class="gap-title">${comp.name}</div>
              <div class="gap-badges">
                <span class="badge">${comp.bloomLevel || comp.taxonomies?.bloomLevel}</span>
              </div>
            </div>
            <div class="gap-details">
              <p>${comp.description}</p>
              <div class="gap-reason">
                <strong>Blocks:</strong> ${gap.blocksCount} other competenc${gap.blocksCount === 1 ? 'y' : 'ies'}
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

    const learner = ontologyData.learners[learnerId];
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
      const isLast = index === steps.length - 1;

      html += `
        <div class="path-step ${step.isTarget ? 'target-step' : ''}">
          <div class="step-number">${step.step}</div>
          <h4>${comp.name}</h4>
          
          <div class="step-metadata">
            <span class="badge">${comp.taxonomies?.bloomLevel || comp.bloomLevel}</span>
            <span class="badge">EQF ${comp.taxonomies?.eqfLevel || comp.eqfLevel}</span>
            <span class="badge">${step.estimatedHours || comp.estimatedHours || 0}h</span>
            ${step.priority ? `<span class="badge badge-priority">${step.priority}</span>` : ''}
          </div>

          <p class="step-description">${comp.description}</p>

          ${step.isTarget ? `
            <div class="target-indicator">
              🎯 <strong>Target Competency</strong> - Your final goal!
            </div>
          ` : ''}
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
            <span class="stat-label">Steps</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${pathData.totalHours}h</span>
            <span class="stat-label">Total Time</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${weeksNeeded}</span>
            <span class="stat-label">Weeks</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${Math.round(pathData.readinessScore * 100)}%</span>
            <span class="stat-label">Readiness</span>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

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

  // Public API for external access
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
    // Create global instance
    window.demo = new OntologyDemo();
    
    // Add global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K: Focus search (if filter panel exists)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.focus();
      }

      // Escape: Clear highlights/filters
      if (e.key === 'Escape') {
        if (window.demo.graph) {
          window.demo.graph.clearPathHighlight();
          window.demo.graph.clearGapHighlight();
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

// Error handling
window.addEventListener('error', (event) => {
  console.error('🔥 Application error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Unhandled promise rejection:', event.reason);
});

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}