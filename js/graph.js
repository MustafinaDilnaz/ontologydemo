class CompetencyGraph {
  constructor(containerId, ontologyData) {
    this.containerId = containerId;
    this.ontologyData = ontologyData;
    this.svg = null;
    this.g = null;
    this.width = 0;
    this.height = 0;
    this.simulation = null;
    this.selectedLearner = null;
    this.nodes = [];
    this.links = [];
    this.highlightedPath = [];
  }

  initialize() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container #${this.containerId} not found`);
      return;
    }

    this.width = container.clientWidth;
    this.height = container.clientHeight;

    // Clear existing SVG
    container.innerHTML = '';

    // Create main SVG element
    this.svg = d3.select(`#${this.containerId}`)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    // Create container group for zoom/pan
    this.g = this.svg.append('g');
    
    // Add zoom behavior
    const zoom = d3.zoom()
      .extent([[0, 0], [this.width, this.height]])
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(zoom);

    // Add arrow markers for directed edges
    this.svg.append('defs').selectAll('marker')
      .data(['prerequisite'])
      .enter().append('marker')
      .attr('id', d => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    // Initial render
    this.render();
  }

  setSelectedLearner(learnerId) {
    this.selectedLearner = learnerId;
    this.render();
  }


  render() {
    // Prepare graph data
    const { nodes, links } = this.prepareGraphData();
    this.nodes = nodes;
    this.links = links;

    // Clear existing elements
    this.g.selectAll('*').remove();

    // Create force simulation
    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(150)
        .strength(1))
      .force('charge', d3.forceManyBody()
        .strength(-1000)
        .distanceMax(400))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide()
        .radius(60)
        .strength(0.7))
      .force('x', d3.forceX(this.width / 2).strength(0.05))
      .force('y', d3.forceY(this.height / 2).strength(0.05));

    // Draw links (edges) first so they appear behind nodes
    const link = this.g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#prerequisite)');

    // Create node groups
    const node = this.g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', (event, d) => this.dragStarted(event, d))
        .on('drag', (event, d) => this.dragged(event, d))
        .on('end', (event, d) => this.dragEnded(event, d)));

    // Add circles to nodes
    node.append('circle')
      .attr('r', 35)
      .attr('fill', d => this.getNodeColor(d))
      .attr('stroke', d => this.getNodeBorderColor(d))
      .attr('stroke-width', d => d.isTarget ? 5 : 2.5)
      .style('cursor', 'pointer')
      .style('filter', d => d.isTarget ? 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.6))' : 'none')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 40);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 35);
      });

    // Add abbreviated text inside circles
    node.append('text')
      .text(d => this.getAbbreviation(d.name))
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Add full competency name below node
    node.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '52px')
      .attr('fill', '#1e293b')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Add EQF level badge
    node.append('text')
      .text(d => `EQF ${d.eqfLevel}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '68px')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Add Bloom level badge
    node.append('text')
      .text(d => d.bloomLevel)
      .attr('text-anchor', 'middle')
      .attr('dy', '-48px')
      .attr('fill', '#64748b')
      .attr('font-size', '9px')
      .attr('font-weight', '500')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // NEW: Add difficulty level indicator (if available)
    node.filter(d => d.difficultyLevel)
      .append('text')
      .text(d => d.difficultyLevel)
      .attr('text-anchor', 'middle')
      .attr('dy', '-60px')
      .attr('fill', d => this.getDifficultyColor(d.difficultyLevel))
      .attr('font-size', '8px')
      .attr('font-weight', '600')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Enhanced tooltips
    node.append('title')
      .text(d => this.getEnhancedTooltipText(d));

    // Update positions on each tick of simulation
    this.simulation.on('tick', () => {
      // Update link positions
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      // Update node positions
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }

  // ==========================================================================
  // DATA PREPARATION
  // ==========================================================================

  prepareGraphData() {
    const competencies = this.ontologyData.competencies;
    const nodes = [];
    const links = [];
    const learner = this.selectedLearner 
      ? this.ontologyData.learners[this.selectedLearner] 
      : null;

    // Create nodes from competencies with enhanced properties
    Object.values(competencies).forEach(comp => {
      const node = {
        id: comp.id,
        name: comp.name,
        bloomLevel: comp.bloomLevel,
        eqfLevel: comp.eqfLevel,
        description: comp.description,
        type: comp.type,
        estimatedHours: comp.estimatedHours,
        isMastered: learner
          ? (learner.masteredIds || learner.masteredCompetencies || []).map(Number).includes(Number(comp.id))
          : false,
        isTarget: learner
          ? Number(learner.targetCompetency) === Number(comp.id)
          : false,
        prerequisites: comp.prerequisites,
        // NEW ENHANCED PROPERTIES
        difficultyLevel: comp.difficultyLevel || null,
        complexityScore: comp.complexityScore || null,
        competencyType: comp.competencyType || comp.type,
        domain: comp.domain || comp.belongsToDomain || null,
        assessmentCriteria: comp.assessmentCriteria || null,
        industryRelevance: comp.industryRelevance || null
      };
      nodes.push(node);
    });

    // Create links from prerequisite relationships
    Object.values(competencies).forEach(comp => {
      comp.prerequisites.forEach(prereqId => {
        links.push({
          source: prereqId,
          target: comp.id,
          type: 'prerequisite'
        });
      });
    });

    return { nodes, links };
  }

  getNodeColor(node) {
    // Priority 1: Target competency (purple)
    if (node.isTarget) {
      return '#7c3aed'; // Purple
    }
    
    // Priority 2: Mastered competency (green)
    if (node.isMastered) {
      return '#10b981'; // Green
    }
    
    // Priority 3: Color by EQF level
    const colorsByEQF = {
      4: '#3b82f6',  // Blue - Foundation
      5: '#06b6d4',  // Cyan - Intermediate
      6: '#8b5cf6',  // Purple - Advanced
      7: '#ec4899',  // Pink - Expert
      8: '#f43f5e'   // Rose - Master
    };
    
    return colorsByEQF[node.eqfLevel] || '#6366f1';
  }

  getNodeBorderColor(node) {
    if (node.isTarget) {
      return '#5b21b6'; // Dark purple
    }
    if (node.isMastered) {
      return '#059669'; // Dark green
    }
    return '#475569'; // Slate
  }

  // NEW: Get color for difficulty level
  getDifficultyColor(difficultyLevel) {
    const colors = {
      'Beginner': '#10b981',
      'Intermediate': '#f59e0b',
      'Advanced': '#ef4444'
    };
    return colors[difficultyLevel] || '#64748b';
  }

  getAbbreviation(name) {
    // Create 2-3 letter abbreviation from competency name
    const words = name.split(' ');
    if (words.length === 1) {
      // Single word: take first 2-3 letters
      return name.substring(0, Math.min(3, name.length)).toUpperCase();
    } else if (words.length === 2) {
      // Two words: first letter of each
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      // Three+ words: first letter of first three words
      return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
    }
  }


  getEnhancedTooltipText(node) {
    let tooltip = `${node.name}\n`;
    tooltip += `═══════════════════════════════\n`;
    
    // Basic Info
    tooltip += `Type: ${node.competencyType || node.type}\n`;
    tooltip += `Bloom Level: ${node.bloomLevel}\n`;
    tooltip += `EQF Level: ${node.eqfLevel}\n`;
    
    // NEW: Enhanced info
    if (node.difficultyLevel) {
      tooltip += `Difficulty: ${node.difficultyLevel}\n`;
    }
    if (node.complexityScore) {
      tooltip += `Complexity: ${node.complexityScore}/10\n`;
    }
    if (node.belongsToDomain) {
      tooltip += `Domain: ${node.belongsToDomain}\n`;
    }
    
    tooltip += `Est. Hours: ${node.estimatedHours}\n`;
    tooltip += `\n${node.description}\n`;
    
    // Prerequisites
    if (node.prerequisites.length > 0) {
      tooltip += `\n━━━ Prerequisites ━━━\n`;
      node.prerequisites.forEach(prereqId => {
        const prereq = this.ontologyData.competencies[prereqId];
        if (prereq) {
          tooltip += `  • ${prereq.name}`;
          if (prereq.difficultyLevel) {
            tooltip += ` [${prereq.difficultyLevel}]`;
          }
          tooltip += `\n`;
        }
      });
    }
    
    // NEW: Assessment criteria
    if (node.assessmentCriteria) {
      tooltip += `\n━━━ Assessment Criteria ━━━\n`;
      const criteria = node.assessmentCriteria.substring(0, 100);
      tooltip += `${criteria}${node.assessmentCriteria.length > 100 ? '...' : ''}\n`;
    }
    
    // NEW: Industry relevance
    if (node.industryRelevance) {
      tooltip += `\n━━━ Industry Relevance ━━━\n`;
      const relevance = node.industryRelevance.substring(0, 80);
      tooltip += `${relevance}${node.industryRelevance.length > 80 ? '...' : ''}\n`;
    }
    
    // Status indicators
    if (node.isMastered) {
      tooltip += `\n✓ MASTERED`;
    }
    if (node.isTarget) {
      tooltip += `\n★ TARGET GOAL`;
    }
    
    return tooltip;
  }

  // Keep old method for compatibility
  getTooltipText(node) {
    return this.getEnhancedTooltipText(node);
  }

  // ==========================================================================
  // DRAG HANDLERS
  // ==========================================================================

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
    // Uncomment to "pin" nodes after dragging:
    // d.fx = null;
    // d.fy = null;
  }

  destroy() {
    if (this.simulation) {
      this.simulation.stop();
    }
  }

  // Reheat simulation (useful after updates)
  reheat() {
    if (this.simulation) {
      this.simulation.alpha(0.5).restart();
    }
  }

  // Reset zoom to initial view
  resetZoom() {
    this.svg.transition()
      .duration(750)
      .call(
        d3.zoom().transform,
        d3.zoomIdentity
      );
  }

  // Highlight specific competency and its dependencies
  highlightCompetency(competencyId) {
    // Get all prerequisites (backward)
    const reasoner = new OntologyReasoner(this.ontologyData);
    const prereqs = reasoner.getTransitivePrerequisites(competencyId);
    prereqs.push(competencyId);
    
    // Get all dependents (forward)
    const dependents = reasoner.getDependents(competencyId);
    
    // Update node styles
    this.g.selectAll('.node circle')
      .transition()
      .duration(300)
      .attr('opacity', d => {
        if (d.id === competencyId) return 1;
        if (prereqs.includes(d.id) || dependents.includes(d.id)) return 1;
        return 0.2;
      });
    
    // Update link styles
    this.g.selectAll('.link')
      .transition()
      .duration(300)
      .attr('stroke-opacity', d => {
        const sourceInPath = prereqs.includes(d.source.id) || dependents.includes(d.source.id);
        const targetInPath = prereqs.includes(d.target.id) || dependents.includes(d.target.id);
        return (sourceInPath && targetInPath) ? 0.8 : 0.1;
      });
  }

  // Clear highlight
  clearHighlight() {
    this.g.selectAll('.node circle')
      .transition()
      .duration(300)
      .attr('opacity', 1);
    
    this.g.selectAll('.link')
      .transition()
      .duration(300)
      .attr('stroke-opacity', 0.6);
  }

  // Resize graph (call when window resizes)
  resize() {
    const container = document.getElementById(this.containerId);
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    
    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);
    
    if (this.simulation) {
      this.simulation
        .force('center', d3.forceCenter(this.width / 2, this.height / 2))
        .force('x', d3.forceX(this.width / 2).strength(0.05))
        .force('y', d3.forceY(this.height / 2).strength(0.05))
        .alpha(0.3)
        .restart();
    }
  }

  // NEW: Get statistics about the graph
  getGraphStatistics() {
    return {
      totalNodes: this.nodes.length,
      totalLinks: this.links.length,
      masteredNodes: this.nodes.filter(n => n.isMastered).length,
      targetNodes: this.nodes.filter(n => n.isTarget).length,
      avgPrerequisites: this.nodes.length > 0 
        ? (this.nodes.reduce((sum, n) => sum + n.prerequisites.length, 0) / this.nodes.length).toFixed(1)
        : 0,
      maxPrerequisites: Math.max(...this.nodes.map(n => n.prerequisites.length), 0)
    };
  }
}

// debounce is provided by js/utils.js (loaded before this file)