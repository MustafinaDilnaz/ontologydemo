// =============================================================================
// ENHANCED COMPETENCY GRAPH - Ontology-Based Educational Framework
// =============================================================================
// Supports UC-1 (Path Generation), UC-2 (Gap Diagnosis), UC-3 (Explainability)
// Performance optimized with incremental updates and efficient data structures
// =============================================================================

class CompetencyGraph {
  constructor(containerId, ontologyData) {
    this.containerId = containerId;
    this.ontologyData = ontologyData;
    
    // Core D3 components
    this.svg = null;
    this.g = null;
    this.width = 0;
    this.height = 0;
    this.simulation = null;
    
    // State management
    this.state = {
      selectedLearner: null,
      highlightedPath: [],
      activeFilters: {
        showOnlyPath: false,
        eqfRange: { min: 1, max: 8 },
        showMasteredOnly: false
      },
      hoveredNode: null
    };
    
    // Graph data
    this.nodes = [];
    this.links = [];
    
    // Cache for performance
    this.cache = {
      prerequisiteChains: new Map(),
      pathsToTarget: new Map()
    };
    
    // Reasoner instance
    this.reasoner = null;
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  initialize(reasoner) {
    this.reasoner = reasoner;
    this.validateOntology();
    this.setupSVG();
    this.setupZoom();
    this.setupMarkers();
    this.render();
  }

  validateOntology() {
    const issues = [];
    
    // Check for missing prerequisites
    Object.values(this.ontologyData.competencies).forEach(comp => {
      comp.prerequisites?.forEach(prereqId => {
        if (!this.ontologyData.competencies[prereqId]) {
          issues.push(`Missing prerequisite: ${prereqId} for ${comp.id}`);
        }
      });
    });
    
    // Check for circular dependencies
    const cycles = this.detectCycles();
    if (cycles.length > 0) {
      issues.push(`Circular dependencies detected: ${cycles.join(', ')}`);
    }
    
    if (issues.length > 0) {
      console.warn('Ontology validation issues:', issues);
    }
    
    return issues;
  }

  detectCycles() {
    const cycles = [];
    const visited = new Set();
    const recStack = new Set();
    
    const dfs = (nodeId, path = []) => {
      if (recStack.has(nodeId)) {
        cycles.push([...path, nodeId].join(' → '));
        return;
      }
      if (visited.has(nodeId)) return;
      
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);
      
      const comp = this.ontologyData.competencies[nodeId];
      comp.prerequisites?.forEach(prereqId => {
        dfs(prereqId, [...path]);
      });
      
      recStack.delete(nodeId);
    };
    
    Object.keys(this.ontologyData.competencies).forEach(id => dfs(id));
    return cycles;
  }

  setupSVG() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container #${this.containerId} not found`);
    }

    this.width = container.clientWidth;
    this.height = container.clientHeight;
    container.innerHTML = '';

    this.svg = d3.select(`#${this.containerId}`)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    this.g = this.svg.append('g').attr('class', 'graph-container');
  }

  setupZoom() {
    const zoom = d3.zoom()
      .extent([[0, 0], [this.width, this.height]])
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(zoom);
    this.zoomBehavior = zoom;
  }

  setupMarkers() {
    const defs = this.svg.append('defs');
    
    // Standard prerequisite arrow
    defs.append('marker')
      .attr('id', 'arrow-prerequisite')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');
    
    // Highlighted path arrow
    defs.append('marker')
      .attr('id', 'arrow-path')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#f59e0b');
  }

  // ===========================================================================
  // UC-1: LEARNING PATH GENERATION & VISUALIZATION
  // ===========================================================================

  setSelectedLearner(learnerId) {
    this.state.selectedLearner = learnerId;
    this.cache.pathsToTarget.clear(); // Invalidate cache
    this.updateVisualization();
  }

  /**
   * UC-1: Generate and highlight learning path to target competency
   */
  generateAndHighlightPath(targetCompetencyId) {
    if (!this.state.selectedLearner) {
      console.warn('No learner selected');
      return null;
    }

    const learner = this.ontologyData.learners[this.state.selectedLearner];
    
    // Use reasoner to generate optimal path
    const pathData = this.reasoner.generateLearningPath(
      this.state.selectedLearner,
      targetCompetencyId
    );
    
    // Extract competency IDs in order
    const pathCompetencies = pathData.pathSteps.map(step => step.competency.id);
    
    // Update state and visualize
    this.state.highlightedPath = pathCompetencies;
    this.highlightLearningPath(pathCompetencies);
    
    return pathData;
  }

  highlightLearningPath(pathCompetencies) {
    const pathSet = new Set(pathCompetencies);
    
    // Create path edges
    const pathEdges = new Set();
    for (let i = 0; i < pathCompetencies.length - 1; i++) {
      const target = pathCompetencies[i + 1];
      const source = pathCompetencies[i];
      pathEdges.add(`${source}-${target}`);
    }
    
    // Highlight nodes in path
    this.g.selectAll('.node circle')
      .transition()
      .duration(500)
      .attr('opacity', d => pathSet.has(d.id) ? 1 : 0.2)
      .attr('stroke-width', d => pathSet.has(d.id) ? 4 : 2.5)
      .attr('stroke', d => {
        if (!pathSet.has(d.id)) return this.getNodeBorderColor(d);
        const index = pathCompetencies.indexOf(d.id);
        return d3.interpolateWarm(index / pathCompetencies.length);
      });
    
    // Add step numbers to path nodes
    this.g.selectAll('.node')
      .selectAll('.step-number')
      .remove();
    
    this.g.selectAll('.node')
      .filter(d => pathSet.has(d.id))
      .append('circle')
      .attr('class', 'step-number')
      .attr('r', 12)
      .attr('cx', 25)
      .attr('cy', -25)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
    
    this.g.selectAll('.node')
      .filter(d => pathSet.has(d.id))
      .append('text')
      .attr('class', 'step-number')
      .attr('x', 25)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text(d => pathCompetencies.indexOf(d.id) + 1);
    
    // Highlight links in path
    this.g.selectAll('.link')
      .transition()
      .duration(500)
      .attr('stroke', d => {
        const edgeKey = `${d.source.id}-${d.target.id}`;
        return pathEdges.has(edgeKey) ? '#f59e0b' : '#cbd5e1';
      })
      .attr('stroke-width', d => {
        const edgeKey = `${d.source.id}-${d.target.id}`;
        return pathEdges.has(edgeKey) ? 4 : 2.5;
      })
      .attr('stroke-opacity', d => {
        const edgeKey = `${d.source.id}-${d.target.id}`;
        return pathEdges.has(edgeKey) ? 1 : 0.2;
      })
      .attr('marker-end', d => {
        const edgeKey = `${d.source.id}-${d.target.id}`;
        return pathEdges.has(edgeKey) ? 'url(#arrow-path)' : 'url(#arrow-prerequisite)';
      });
    
    // Dim text for non-path nodes
    this.g.selectAll('.node text')
      .transition()
      .duration(500)
      .attr('opacity', d => pathSet.has(d.id) ? 1 : 0.3);
  }

  clearPathHighlight() {
    this.state.highlightedPath = [];
    
    // Reset all nodes
    this.g.selectAll('.node circle')
      .transition()
      .duration(300)
      .attr('opacity', 1)
      .attr('stroke-width', d => d.isTarget ? 5 : 2.5)
      .attr('stroke', d => this.getNodeBorderColor(d));
    
    // Remove step numbers
    this.g.selectAll('.step-number').remove();
    
    // Reset all links
    this.g.selectAll('.link')
      .transition()
      .duration(300)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.6)
      .attr('opacity', 1)
      .attr('marker-end', 'url(#arrow-prerequisite)');
    
    // Reset text
    this.g.selectAll('.node text')
      .transition()
      .duration(300)
      .attr('opacity', 1);
  }

  // ===========================================================================
  // UC-2: GAP DIAGNOSIS VISUALIZATION
  // ===========================================================================

  /**
   * UC-2: Visualize prerequisite gaps with priority classification
   */
  visualizeGapAnalysis(targetCompetencyId) {
    if (!this.state.selectedLearner) {
      console.warn('No learner selected');
      return null;
    }

    // Get gap analysis from reasoner
    const gapData = this.reasoner.detectGaps(
      this.state.selectedLearner,
      targetCompetencyId
    );
    
    // Visualize gaps by priority
    this.highlightGapsByPriority(gapData);
    
    return gapData;
  }

  highlightGapsByPriority(gapData) {
    // Create priority sets
    const critical = new Set(gapData.gapsByPriority.critical.map(g => g.competencyId));
    const high = new Set(gapData.gapsByPriority.high.map(g => g.competencyId));
    const medium = new Set(gapData.gapsByPriority.medium.map(g => g.competencyId));
    const low = new Set(gapData.gapsByPriority.low.map(g => g.competencyId));
    
    // Color coding for priorities
    const priorityColors = {
      critical: '#ef4444',  // Red
      high: '#f59e0b',      // Orange
      medium: '#eab308',    // Yellow
      low: '#94a3b8'        // Gray
    };
    
    // Update node appearance based on gap priority
    this.g.selectAll('.node circle')
      .transition()
      .duration(500)
      .attr('stroke', d => {
        if (critical.has(d.id)) return priorityColors.critical;
        if (high.has(d.id)) return priorityColors.high;
        if (medium.has(d.id)) return priorityColors.medium;
        if (low.has(d.id)) return priorityColors.low;
        return this.getNodeBorderColor(d);
      })
      .attr('stroke-width', d => {
        if (critical.has(d.id)) return 5;
        if (high.has(d.id)) return 4;
        if (medium.has(d.id)) return 3;
        return 2.5;
      })
      .attr('opacity', d => {
        const isGap = critical.has(d.id) || high.has(d.id) ||
                      medium.has(d.id) || low.has(d.id);
        return isGap || d.isTarget || d.isMastered ? 1 : 0.3;
      });

    // Add priority badges
    this.g.selectAll('.node')
      .selectAll('.priority-badge')
      .remove();
    
    this.g.selectAll('.node')
      .filter(d => critical.has(d.id) || high.has(d.id) || 
                   medium.has(d.id) || low.has(d.id))
      .append('text')
      .attr('class', 'priority-badge')
      .attr('x', -25)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', d => {
        if (critical.has(d.id)) return priorityColors.critical;
        if (high.has(d.id)) return priorityColors.high;
        if (medium.has(d.id)) return priorityColors.medium;
        return priorityColors.low;
      })
      .text(d => {
        if (critical.has(d.id)) return '⚠ CRITICAL';
        if (high.has(d.id)) return '⬆ HIGH';
        if (medium.has(d.id)) return '➡ MED';
        return '⬇ LOW';
      });
  }

  clearGapHighlight() {
    // Remove priority badges
    this.g.selectAll('.priority-badge').remove();

    // Reset node appearance
    this.g.selectAll('.node circle')
      .transition()
      .duration(300)
      .attr('stroke', d => this.getNodeBorderColor(d))
      .attr('stroke-width', d => d.isTarget ? 5 : 2.5)
      .attr('opacity', 1);
  }

  // ===========================================================================
  // RENDERING & DATA PREPARATION
  // ===========================================================================

  render() {
    const { nodes, links } = this.prepareGraphData();
    this.nodes = nodes;
    this.links = links;

    this.renderLinks(links);
    this.renderNodes(nodes);
    this.startSimulation(nodes, links);
  }

  updateVisualization() {
    const { nodes, links } = this.prepareGraphData();

    // Carry over simulation positions so x/y are never undefined after rebind
    const posById = new Map((this.nodes || []).map(n => [n.id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy }]));
    nodes.forEach(n => {
      const prev = posById.get(n.id);
      if (prev) {
        n.x = prev.x; n.y = prev.y;
        n.vx = prev.vx; n.vy = prev.vy;
      }
    });

    this.nodes = nodes;
    this.links = links;

    this.updateNodes(nodes);
    this.updateLinks(links);

    if (this.simulation) {
      this._tickCount = 0;
      this.simulation.nodes(nodes);
      this.simulation.force('link')?.links(links);
      this.simulation.alpha(0.3).restart();
    }
  }

  prepareGraphData() {
    const competencies = this.ontologyData.competencies;
    const nodes = [];
    const links = [];
    const learner = this.state.selectedLearner 
      ? this.ontologyData.learners[this.state.selectedLearner] 
      : null;

    // Apply filters
    const passesFilter = (comp) => {
      const filters = this.state.activeFilters;
      
      // EQF range filter
      if (comp.eqfLevel < filters.eqfRange.min || 
          comp.eqfLevel > filters.eqfRange.max) {
        return false;
      }
      
      // Show only mastered filter
      if (filters.showMasteredOnly && learner) {
        const mastered = learner.competencyStatus?.masteredCompetencies || learner.masteredIds || [];
        return mastered.includes(comp.id);
      }
      
      // Show only path filter
      if (filters.showOnlyPath && this.state.highlightedPath.length > 0) {
        return this.state.highlightedPath.includes(comp.id);
      }
      
      return true;
    };

    // Create nodes
    Object.values(competencies).forEach(comp => {
      if (!passesFilter(comp)) return;
      
      const bloomVal = comp.taxonomies?.bloomLevel || comp.bloomLevel || 3;
      const eqfVal   = comp.taxonomies?.eqfLevel   || comp.eqfLevel   || 5;
      const node = {
        id: comp.id,
        name: comp.name || comp.shortName,
        bloomLevel: bloomVal,
        eqfLevel: eqfVal,
        description: comp.description,
        type: comp.competencyType || comp.type,
        estimatedHours: comp.difficulty?.typicalMasteryTime?.novice || comp.estimatedHours,
        isMastered: learner ? (learner.competencyStatus?.masteredCompetencies || learner.masteredIds || []).includes(comp.id) : false,
        isTarget: learner ? learner.goals?.targetCompetencies?.includes(comp.id) : false,
        prerequisites: comp.prerequisites || [],
        // Derived from EQF level when not explicitly set
        difficultyLevel: comp.difficulty?.absoluteDifficulty || comp.difficultyLevel
          || (eqfVal <= 4 ? 'Beginner' : eqfVal <= 6 ? 'Intermediate' : 'Advanced'),
        complexityScore: comp.difficulty?.relativeComplexity || comp.complexityScore,
        domain: comp.domain || comp.belongsToDomain,
        // Derived from bloom + eqf when not explicitly set (scale 0–10)
        cognitiveLoad: comp.cognitiveLoad?.estimatedCognitiveLoadUnits
          ?? Math.round(((bloomVal / 6) + ((eqfVal - 3) / 5)) * 5),
      };
      nodes.push(node);
    });

    // Create links
    const nodeIds = new Set(nodes.map(n => n.id));
    Object.values(competencies).forEach(comp => {
      if (!nodeIds.has(comp.id)) return;
      
      (comp.prerequisites || []).forEach(prereqId => {
        if (nodeIds.has(prereqId)) {
          links.push({
            source: prereqId,
            target: comp.id,
            type: 'prerequisite'
          });
        }
      });
    });

    return { nodes, links };
  }

  renderLinks(links) {
    const linkGroup = this.g.selectAll('.links').data([0]);
    linkGroup.enter().append('g').attr('class', 'links');
    
    const link = this.g.select('.links')
      .selectAll('line')
      .data(links, d => {
        const s = typeof d.source === 'object' ? d.source.id : d.source;
        const t = typeof d.target === 'object' ? d.target.id : d.target;
        return `${s}-${t}`;
      });
    
    link.exit().remove();
    
    link.enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.6)
      .attr('opacity', 1)
      .attr('marker-end', 'url(#arrow-prerequisite)');
  }

  renderNodes(nodes) {
    const nodeGroup = this.g.selectAll('.nodes').data([0]);
    nodeGroup.enter().append('g').attr('class', 'nodes');
    
    const node = this.g.select('.nodes')
      .selectAll('.node')
      .data(nodes, d => d.id);
    
    node.exit().remove();
    
    const nodeEnter = node.enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', (event, d) => this.dragStarted(event, d))
        .on('drag', (event, d) => this.dragged(event, d))
        .on('end', (event, d) => this.dragEnded(event, d)));
    
    // Circle
    nodeEnter.append('circle')
      .attr('r', 35)
      .attr('fill', d => this.getNodeColor(d))
      .attr('stroke', d => this.getNodeBorderColor(d))
      .attr('stroke-width', d => d.isTarget ? 5 : 2.5)
      .style('cursor', 'pointer')
      .on('click', (event, d) => this.onNodeClick(event, d))
      .on('mouseover', (event, d) => this.onNodeHover(event, d))
      .on('mouseout', (event, d) => this.onNodeHoverOut(event, d));
    
    // Abbreviation
    nodeEnter.append('text')
      .attr('class', 'node-abbrev')
      .text(d => this.getAbbreviation(d.name))
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');
    
    // Name label
    nodeEnter.append('text')
      .attr('class', 'node-name')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '52px')
      .attr('fill', '#1e293b')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .style('pointer-events', 'none');
    
    // EQF level
    nodeEnter.append('text')
      .attr('class', 'node-eqf')
      .text(d => `EQF ${d.eqfLevel}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '66px')
      .attr('fill', '#64748b')
      .attr('font-size', '9px')
      .style('pointer-events', 'none');
    
    // Tooltip
    nodeEnter.append('title')
      .text(d => this.getEnhancedTooltipText(d));
  }

  updateNodes(nodes) {
    const node = this.g.select('.nodes')
      .selectAll('.node')
      .data(nodes, d => d.id);
    
    // Update colors based on learner state
    node.select('circle')
      .transition()
      .duration(300)
      .attr('fill', d => this.getNodeColor(d))
      .attr('stroke', d => this.getNodeBorderColor(d))
      .attr('stroke-width', d => d.isTarget ? 5 : 2.5);
    
    // Update tooltips
    node.select('title')
      .text(d => this.getEnhancedTooltipText(d));
  }

  updateLinks(links) {
    // Rebind line elements to new link objects (source/target are node id numbers here,
    // before forceLink replaces them with node object references).
    // Key by index since source/target may still be raw ids or already-resolved objects.
    const line = this.g.select('.links')
      .selectAll('line')
      .data(links);

    line.exit().remove();

    line.enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.6)
      .attr('opacity', 1)
      .attr('marker-end', 'url(#arrow-prerequisite)');
  }

  // ===========================================================================
  // FORCE SIMULATION
  // ===========================================================================

  startSimulation(nodes, links) {
    // Stop existing simulation
    if (this.simulation) {
      this.simulation.stop();
    }

    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(150)
        .strength(0.8))
      .force('charge', d3.forceManyBody()
        .strength(-800)
        .distanceMax(400))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide()
        .radius(60)
        .strength(0.7))
      .force('x', d3.forceX(this.width / 2).strength(0.05))
      .force('y', d3.forceY(this.height / 2).strength(0.05));

    this._tickCount = 0;
    this.simulation.on('tick', () => {
      this._tickCount++;

      this.g.select('.links').selectAll('line')
        .attr('x1', d => d.source?.x ?? 0)
        .attr('y1', d => d.source?.y ?? 0)
        .attr('x2', d => d.target?.x ?? 0)
        .attr('y2', d => d.target?.y ?? 0);

      this.g.select('.nodes').selectAll('.node')
        .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);

      if (this._tickCount > 300 || this.simulation.alpha() < 0.01) {
        this.simulation.stop();
      }
    });
  }

  // ===========================================================================
  // INTERACTION HANDLERS
  // ===========================================================================

  onNodeClick(event, d) {
    event.stopPropagation();
    
    // Generate explanation for clicked competency
    if (this.state.selectedLearner) {
      this.showCompetencyExplanation(d);
    }
    
    // Highlight prerequisites and dependents
    this.highlightCompetencyNeighborhood(d.id);
  }

  onNodeHover(event, d) {
    this.state.hoveredNode = d.id;
    
    // Enlarge node
    d3.select(event.currentTarget)
      .transition()
      .duration(200)
      .attr('r', 42);
  }

  onNodeHoverOut(event, d) {
    this.state.hoveredNode = null;
    
    // Restore size
    d3.select(event.currentTarget)
      .transition()
      .duration(200)
      .attr('r', 35);
  }

  highlightCompetencyNeighborhood(competencyId) {
    const prereqs = this.reasoner.getTransitivePrerequisites(competencyId);
    prereqs.push(competencyId);
    
    const dependents = this.reasoner.getDependents(competencyId);
    const neighborhood = new Set([...prereqs, ...dependents]);
    
    // Highlight neighborhood
    this.g.selectAll('.node circle')
      .transition()
      .duration(300)
      .attr('opacity', d => neighborhood.has(d.id) ? 1 : 0.2);
    
    this.g.selectAll('.link')
      .transition()
      .duration(300)
      .attr('stroke-opacity', d => {
        return (neighborhood.has(d.source.id) && neighborhood.has(d.target.id)) ? 0.8 : 0.1;
      });
  }

  // ===========================================================================
  // UC-3: EXPLAINABILITY
  // ===========================================================================

  /**
   * UC-3: Generate template-based explanation for a competency
   */
  showCompetencyExplanation(node) {
    if (!this.state.selectedLearner) return;
    
    const learner = this.ontologyData.learners[this.state.selectedLearner];
    const explanation = this.generateExplanation(node, learner);
    
    // Dispatch custom event with explanation
    const event = new CustomEvent('competency-explanation', {
      detail: { node, explanation }
    });
    document.dispatchEvent(event);
    
    console.log('='.repeat(60));
    console.log('COMPETENCY EXPLANATION');
    console.log('='.repeat(60));
    console.log(explanation);
  }

  generateExplanation(node, learner) {
    const templates = {
      mastered: `✓ You have already mastered "${node.name}". This demonstrates ${node.bloomLevel}-level competency in ${node.domain}.`,
      
      target: `★ "${node.name}" is your target goal. Achieving this will enable you to ${this.getCompetencyApplication(node)}.`,
      
      directPrerequisite: `⚠ "${node.name}" is a DIRECT prerequisite for your goal. You must master this before advancing because: ${this.getPrerequisiteRationale(node)}`,
      
      indirectPrerequisite: `➡ "${node.name}" is an INDIRECT prerequisite. It supports foundational knowledge needed for: ${this.getDependentsList(node.id)}`,
      
      recommendation: `Recommended path: Start with "${node.name}" (${node.estimatedHours}h, ${node.difficultyLevel}). This will prepare you for ${this.getNextSteps(node.id)}.`
    };
    
    let explanation = '';
    
    // Status
    if (node.isMastered) {
      explanation += templates.mastered + '\n\n';
    } else if (node.isTarget) {
      explanation += templates.target + '\n\n';
    }
    
    // Prerequisite relationships
    if (this.isDirectPrerequisiteForTarget(node.id)) {
      explanation += templates.directPrerequisite + '\n\n';
    } else if (this.isIndirectPrerequisiteForTarget(node.id)) {
      explanation += templates.indirectPrerequisite + '\n\n';
    }
    
    // Recommendation
    if (!node.isMastered && !node.isTarget) {
      explanation += templates.recommendation + '\n\n';
    }
    
    // Metadata
    explanation += `📊 Metadata:\n`;
    explanation += `   • Bloom Level: ${node.bloomLevel}\n`;
    explanation += `   • EQF Level: ${node.eqfLevel}\n`;
    explanation += `   • Difficulty: ${node.difficultyLevel}\n`;
    explanation += `   • Est. Time: ${node.estimatedHours} hours\n`;
    if (node.cognitiveLoad) {
      explanation += `   • Cognitive Load: ${node.cognitiveLoad}/10\n`;
    }
    
    return explanation;
  }

  isDirectPrerequisiteForTarget(competencyId) {
    if (!this.state.selectedLearner) return false;
    const learner = this.ontologyData.learners[this.state.selectedLearner];
    const target = learner.goals?.targetCompetencies?.[0];
    if (!target) return false;
    
    const targetComp = this.ontologyData.competencies[target];
    return targetComp?.prerequisites?.includes(competencyId);
  }

  isIndirectPrerequisiteForTarget(competencyId) {
    if (!this.state.selectedLearner) return false;
    const learner = this.ontologyData.learners[this.state.selectedLearner];
    const target = learner.goals?.targetCompetencies?.[0];
    if (!target) return false;
    
    const allPrereqs = this.reasoner.getTransitivePrerequisites(target);
    return allPrereqs.includes(competencyId) && !this.isDirectPrerequisiteForTarget(competencyId);
  }

  getCompetencyApplication(node) {
    const outcomes = node.learningOutcomes || [];
    if (outcomes.length > 0) {
      return outcomes[0].outcome || outcomes[0];
    }
    return `work with ${node.name} concepts`;
  }

  getPrerequisiteRationale(node) {
    // Simplified - in real system, fetch from ontology
    return `${node.name} provides essential foundational knowledge`;
  }

  getDependentsList(competencyId) {
    const dependents = this.reasoner.getDependents(competencyId);
    const names = dependents
      .slice(0, 3)
      .map(id => this.ontologyData.competencies[id]?.name || id);
    return names.join(', ');
  }

  getNextSteps(competencyId) {
    const dependents = this.reasoner.getDependents(competencyId);
    if (dependents.length > 0) {
      return this.ontologyData.competencies[dependents[0]]?.name || 'advanced topics';
    }
    return 'your target goal';
  }

  clearHighlight() {
    this.clearPathHighlight();
    this.clearGapHighlight();
  }

  // Getters for direct property access by FilterPanel and LegendPanel
  get selectedLearner() { return this.state.selectedLearner; }
  get highlightedPath() { return this.state.highlightedPath; }

  // ===========================================================================
  // FILTERS & CONTROLS
  // ===========================================================================

  setFilter(filterName, value) {
    this.state.activeFilters[filterName] = value;
    this.updateVisualization();
  }

  toggleShowOnlyPath() {
    this.state.activeFilters.showOnlyPath = !this.state.activeFilters.showOnlyPath;
    this.updateVisualization();
  }

  setEQFRange(min, max) {
    this.state.activeFilters.eqfRange = { min, max };
    this.updateVisualization();
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  getNodeColor(node) {
    if (node.isTarget) return '#7c3aed';
    if (node.isMastered) return '#10b981';
    
    const colorsByEQF = {
      4: '#3b82f6', 5: '#06b6d4', 6: '#8b5cf6',
      7: '#ec4899', 8: '#f43f5e'
    };
    return colorsByEQF[node.eqfLevel] || '#6366f1';
  }

  getNodeBorderColor(node) {
    if (node.isTarget) return '#5b21b6';
    if (node.isMastered) return '#059669';
    return '#475569';
  }

  getAbbreviation(name) {
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 3).toUpperCase();
    }
    return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
  }

  getEnhancedTooltipText(node) {
    let text = `${node.name}\n${'═'.repeat(40)}\n`;
    text += `Type: ${node.type} | ${node.bloomLevel} | EQF ${node.eqfLevel}\n`;
    
    if (node.difficultyLevel) {
      text += `Difficulty: ${node.difficultyLevel}`;
      if (node.cognitiveLoad) {
        text += ` (Load: ${node.cognitiveLoad}/10)`;
      }
      text += '\n';
    }
    
    text += `Est. Time: ${node.estimatedHours}h\n\n`;
    text += `${node.description}\n`;
    
    if (node.prerequisites.length > 0) {
      text += `\n${'─'.repeat(40)}\nPrerequisites:\n`;
      node.prerequisites.forEach(pid => {
        const p = this.ontologyData.competencies[pid];
        text += `  • ${p?.name || pid}\n`;
      });
    }
    
    if (node.isMastered) text += `\n✓ MASTERED`;
    if (node.isTarget) text += `\n★ TARGET`;
    
    return text;
  }

  // Drag handlers
  dragStarted(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragEnded(event, d) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  resetZoom() {
    this.svg.transition()
      .duration(750)
      .call(this.zoomBehavior.transform, d3.zoomIdentity);
  }

  resize() {
    const container = document.getElementById(this.containerId);
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    
    this.svg
      .attr('width', this.width)
      .attr('height', this.height);
    
    if (this.simulation) {
      this.simulation
        .force('center', d3.forceCenter(this.width / 2, this.height / 2))
        .alpha(0.3)
        .restart();
    }
  }

  destroy() {
    if (this.simulation) {
      this.simulation.stop();
    }
    this.svg.remove();
  }

  getStatistics() {
    return {
      totalNodes: this.nodes.length,
      totalLinks: this.links.length,
      masteredNodes: this.nodes.filter(n => n.isMastered).length,
      averageComplexity: (this.nodes.reduce((sum, n) => sum + (n.cognitiveLoad || 0), 0) / this.nodes.length).toFixed(1)
    };
  }
}

