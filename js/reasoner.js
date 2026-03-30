
class OntologyReasoner {
  constructor(ontologyData) {
    // Extract from ontologyData object
    this.learners = ontologyData.learners || {};
    this.competencies = ontologyData.competencies || {};
    this.resources = ontologyData.learningResources || {};
    
    // Store the full ontology data
    this.ontologyData = ontologyData;
    
    // Build indexes for efficient querying
    this.buildIndexes();
    
    // Initialize explanation templates
    this.initializeExplanationSystem();
  }
  
  buildIndexes() {
    // Prerequisite graph for efficient traversal
    this.prerequisiteGraph = new Map();
    this.dependentGraph = new Map();
    
    // Resource indexes
    this.resourcesByCompetency = new Map();
    this.resourcesByStyle = new Map();
    this.resourcesByDifficulty = new Map();
    
    // Build graphs
    Object.values(this.competencies).forEach(comp => {
      // Prerequisites
      this.prerequisiteGraph.set(comp.id, new Set(comp.prerequisites || []));
      
      // Dependents (reverse index)
      (comp.prerequisites || []).forEach(prereqId => {
        if (!this.dependentGraph.has(prereqId)) {
          this.dependentGraph.set(prereqId, new Set());
        }
        this.dependentGraph.get(prereqId).add(comp.id);
      });
    });
    
    // Index resources
    Object.values(this.resources).forEach(resource => {
      if (resource.teachesCompetencies && Array.isArray(resource.teachesCompetencies)) {
        resource.teachesCompetencies.forEach(tc => {
          const compId = tc.competencyId || tc;
          if (!this.resourcesByCompetency.has(compId)) {
            this.resourcesByCompetency.set(compId, []);
          }
          this.resourcesByCompetency.get(compId).push(resource);
        });
      }
    });
    
    console.log('✓ Indexes built:', {
      competencies: Object.keys(this.competencies).length,
      learners: Object.keys(this.learners).length,
      resources: Object.keys(this.resources).length,
      prerequisiteGraph: this.prerequisiteGraph.size,
      resourcesByCompetency: this.resourcesByCompetency.size
    });
  }
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  initializeExplanationSystem() {
    this.explanationTemplates = {
      resourceSelection: {
        styleMatch: "This resource is excellent for {primaryStyle} learners like you.",
        difficultyMatch: "The {difficulty} difficulty level matches your current performance.",
        qualityHigh: "This is a high-quality resource with a {rating}/5.0 rating."
      },
      
      gapJustification: {
        criticalGap: "{competencyName} is a critical prerequisite directly required for {targetName}.",
        highPriorityGap: "{competencyName} is essential because it blocks {blockedCount} other prerequisites."
      },
      
      pathRationale: {
        sequencing: "This learning sequence ensures you master prerequisites before advancing.",
        timeOptimal: "This path optimizes for your {timeAvailability} hours/week availability."
      }
    };
  }
  
  // ============================================================================
  // PREREQUISITE GAP DETECTION
  // ============================================================================
  
  getTransitivePrerequisites(competencyId) {
    const prerequisites = new Set();
    const visited = new Set();
    const queue = [competencyId];
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (visited.has(current)) continue;
      visited.add(current);
      
      const prereqs = this.prerequisiteGraph.get(current) || new Set();
      prereqs.forEach(prereqId => {
        prerequisites.add(prereqId);
        queue.push(prereqId);
      });
    }
    
    return Array.from(prerequisites);
  }
  
  detectGaps(learnerId, targetCompetencyId) {
    const learner = this.learners[learnerId];
    const target = this.competencies[targetCompetencyId];
    
    if (!learner || !target) {
      console.warn(`Invalid learner (${learnerId}) or competency (${targetCompetencyId})`);
      return {
        totalGaps: 0,
        gapsByPriority: { critical: [], high: [], medium: [] },
        recommendedSequence: []
      };
    }
    
    // Get all transitive prerequisites
    const allPrerequisites = this.getTransitivePrerequisites(targetCompetencyId);
    
    // Identify gaps (not mastered)
    const masteredSet = new Set(
      learner.competencyStatus?.masteredCompetencies || 
      learner.masteredCompetencies || 
      []
    );
    const gaps = allPrerequisites.filter(compId => !masteredSet.has(compId));
    
    // Classify gaps by priority
    const gapAnalysis = this.classifyGapPriority(gaps, targetCompetencyId, masteredSet);
    
    // Compute optimal learning sequence
    const learningSequence = this.computeOptimalSequence(gaps, targetCompetencyId);
    
    return {
      targetCompetency: target,
      totalGaps: gaps.length,
      gapsByPriority: gapAnalysis,
      recommendedSequence: learningSequence.map(item => item.competencyId || item),
      readinessScore: this.calculateReadiness(learner, targetCompetencyId)
    };
  }
  
  classifyGapPriority(gaps, targetCompetencyId, masteredSet) {
    const target = this.competencies[targetCompetencyId];
    const directPrereqs = new Set(target.prerequisites || []);
    
    const classified = {
      critical: [],
      high: [],
      medium: []
    };
    
    // Count how many gaps each gap blocks
    const blockingCount = new Map();
    gaps.forEach(gapId => {
      const dependents = this.dependentGraph.get(gapId) || new Set();
      const blockedGaps = Array.from(dependents).filter(depId => 
        gaps.includes(depId) && !masteredSet.has(depId)
      );
      blockingCount.set(gapId, blockedGaps.length);
    });
    
    // Classify each gap
    gaps.forEach(gapId => {
      const comp = this.competencies[gapId];
      if (!comp) return;
      
      const blocksCount = blockingCount.get(gapId);
      
      if (directPrereqs.has(gapId)) {
        classified.critical.push({
          competencyId: gapId,
          competency: comp,
          blocksCount: blocksCount,
          reason: "Direct prerequisite for target competency"
        });
      } else if (blocksCount >= 2) {
        classified.high.push({
          competencyId: gapId,
          competency: comp,
          blocksCount: blocksCount,
          reason: `Blocks ${blocksCount} other prerequisites`
        });
      } else {
        classified.medium.push({
          competencyId: gapId,
          competency: comp,
          blocksCount: blocksCount || 0,
          reason: "Foundational prerequisite"
        });
      }
    });
    
    return classified;
  }
  
  computeOptimalSequence(gaps, targetCompetencyId) {
    const sequence = [];
    const visited = new Set();
    const inProgress = new Set();
    
    const visit = (compId) => {
      if (visited.has(compId)) return;
      if (inProgress.has(compId)) {
        console.warn(`Circular dependency detected involving ${compId}`);
        return;
      }
      
      inProgress.add(compId);
      
      const prereqs = this.prerequisiteGraph.get(compId) || new Set();
      prereqs.forEach(prereqId => {
        if (gaps.includes(prereqId)) {
          visit(prereqId);
        }
      });
      
      inProgress.delete(compId);
      visited.add(compId);
      
      if (gaps.includes(compId)) {
        sequence.push(compId);
      }
    };
    
    gaps.forEach(gapId => visit(gapId));
    
    return sequence.map((compId, index) => ({
      step: index + 1,
      competencyId: compId,
      competency: this.competencies[compId]
    }));
  }
  
  calculateReadiness(learner, targetCompetencyId) {
    const allPrereqs = this.getTransitivePrerequisites(targetCompetencyId);
    const masteredSet = new Set(
      learner.competencyStatus?.masteredCompetencies || 
      learner.masteredCompetencies || 
      []
    );
    
    if (allPrereqs.length === 0) return 1.0;
    
    const masteredCount = allPrereqs.filter(p => masteredSet.has(p)).length;
    const prerequisiteScore = masteredCount / allPrereqs.length;
    
    const confidenceScore = learner.affectiveProfile?.selfEfficacy || 0.5;
    const motivationScore = learner.affectiveProfile?.motivationLevel || 0.5;
    
    const readiness = (
      prerequisiteScore * 0.60 +
      confidenceScore * 0.20 +
      motivationScore * 0.20
    );
    
    return Math.round(readiness * 100) / 100;
  }
  
  // ============================================================================
  // LEARNING PATH GENERATION
  // ============================================================================
  
  generateLearningPath(learnerId, targetCompetencyId) {
    const gapAnalysis = this.detectGaps(learnerId, targetCompetencyId);
    const learner = this.learners[learnerId];
    
    if (!learner) {
      return {
        pathSteps: [],
        totalHours: 0,
        readinessScore: 0
      };
    }
    
    const pathSteps = gapAnalysis.recommendedSequence.map((compId, index) => {
      const comp = this.competencies[compId];
      const hours = comp?.estimatedHours || 10;
      
      return {
        step: index + 1,
        competency: comp,
        estimatedHours: hours,
        isTarget: false,
        priority: gapAnalysis.gapsByPriority.critical.some(g => g.competencyId === compId) ? 'critical' : 'high'
      };
    });
    
    // Add target competency as final step
    const targetComp = this.competencies[targetCompetencyId];
    if (targetComp) {
      pathSteps.push({
        step: pathSteps.length + 1,
        competency: targetComp,
        estimatedHours: targetComp.estimatedHours || 15,
        isTarget: true,
        priority: 'target'
      });
    }
    
    const totalHours = pathSteps.reduce((sum, step) => sum + (step.estimatedHours || 0), 0);
    
    return {
      pathSteps,
      totalHours,
      readinessScore: gapAnalysis.readinessScore
    };
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  template(templateName, variables) {
    const category = Object.keys(this.explanationTemplates).find(cat =>
      this.explanationTemplates[cat][templateName]
    );
    
    if (!category) return '';
    
    let template = this.explanationTemplates[category][templateName];
    
    Object.keys(variables).forEach(key => {
      template = template.replace(new RegExp(`{${key}}`, 'g'), variables[key]);
    });
    
    return template;
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.OntologyReasoner = OntologyReasoner;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OntologyReasoner };
}