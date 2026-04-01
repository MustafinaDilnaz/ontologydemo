class OntologyReasoner {
  constructor(ontologyData) {
    this.learners = ontologyData.learners || {};
    this.competencies = ontologyData.competencies || {};
    this.resources = ontologyData.learningResources || {};
    this.ontologyData = ontologyData;

    this.buildIndexes();
    this.initializeExplanationSystem();
  }

  buildIndexes() {
    this.prerequisiteGraph = new Map();
    this.dependentGraph = new Map();

    this.resourcesByCompetency = new Map();
    this.resourcesByStyle = new Map();
    this.resourcesByDifficulty = new Map();

    Object.values(this.competencies).forEach((comp) => {
      const prereqs = comp.prerequisites || [];
      this.prerequisiteGraph.set(comp.id, new Set(prereqs));

      prereqs.forEach((prereqId) => {
        if (!this.dependentGraph.has(prereqId)) {
          this.dependentGraph.set(prereqId, new Set());
        }
        this.dependentGraph.get(prereqId).add(comp.id);
      });
    });

    Object.values(this.resources).forEach((resource) => {
      if (resource.teachesCompetencies && Array.isArray(resource.teachesCompetencies)) {
        resource.teachesCompetencies.forEach((tc) => {
          const compId = tc.competencyId || tc;
          if (!compId) return;

          if (!this.resourcesByCompetency.has(compId)) {
            this.resourcesByCompetency.set(compId, []);
          }
          this.resourcesByCompetency.get(compId).push(resource);
        });
      }
    });
  }

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

  computeTransitiveClosure(goalId) {
    const visited = new Set();
    const queue = [goalId];

    while (queue.length > 0) {
      const current = queue.shift();

      if (visited.has(current)) continue;
      visited.add(current);

      const directPrereqs = this.prerequisiteGraph.get(current) || new Set();
      for (const prereqId of directPrereqs) {
        if (!visited.has(prereqId)) {
          queue.push(prereqId);
        }
      }
    }

    visited.delete(goalId);
    return visited;
  }

  getTransitivePrerequisites(competencyId) {
    return Array.from(this.computeTransitiveClosure(competencyId));
  }

  detectGaps(learnerId, targetCompetencyId) {
    const learner = this.learners[learnerId];
    const target = this.competencies[targetCompetencyId];

    if (!learner || !target) {
      console.warn(`[Reasoner] Invalid learner (${learnerId}) or competency (${targetCompetencyId})`);
      return {
        totalGaps: 0,
        gapsByPriority: { critical: [], high: [], medium: [] },
        recommendedSequence: [],
        readinessScore: 0,
        targetCompetency: null
      };
    }

    const masteredSet = new Set(
      learner.competencyStatus?.masteredCompetencies ||
      learner.masteredCompetencies ||
      []
    );

    const allPrerequisites = this.computeTransitiveClosure(targetCompetencyId);
    const gaps = [];

    allPrerequisites.forEach((compId) => {
      if (!masteredSet.has(compId)) {
        gaps.push(compId);
      }
    });

    const gapAnalysis = this.classifyGapPriority(gaps, targetCompetencyId, masteredSet);
    const learningSequence = this.topologicalSort(new Set(gaps));

    return {
      targetCompetency: target,
      totalGaps: gaps.length,
      gapsByPriority: gapAnalysis,
      recommendedSequence: learningSequence,
      readinessScore: this.calculateReadiness(learner, targetCompetencyId)
    };
  }

  classifyGapPriority(gaps, targetCompetencyId, masteredSet) {
    const target = this.competencies[targetCompetencyId];
    const directPrereqs = new Set(target?.prerequisites || []);

    const classified = {
      critical: [],
      high: [],
      medium: []
    };

    const gapsSet = new Set(gaps);
    const blockingCount = new Map();

    gaps.forEach((gapId) => {
      const dependents = this.dependentGraph.get(gapId) || new Set();
      let blockedCount = 0;

      dependents.forEach((depId) => {
        if (gapsSet.has(depId) && !masteredSet.has(depId)) {
          blockedCount++;
        }
      });

      blockingCount.set(gapId, blockedCount);
    });

    gaps.forEach((gapId) => {
      const comp = this.competencies[gapId];
      if (!comp) return;

      const blocksCount = blockingCount.get(gapId) || 0;

      if (directPrereqs.has(gapId)) {
        classified.critical.push({
          competencyId: gapId,
          competency: comp,
          blocksCount,
          reason: "Direct prerequisite for target competency"
        });
      } else if (blocksCount >= 2) {
        classified.high.push({
          competencyId: gapId,
          competency: comp,
          blocksCount,
          reason: `Blocks ${blocksCount} other prerequisites`
        });
      } else {
        classified.medium.push({
          competencyId: gapId,
          competency: comp,
          blocksCount,
          reason: "Foundational prerequisite"
        });
      }
    });

    return classified;
  }

  // Алгоритм Кана
  topologicalSort(gapsSet) {
    const inDegree = {};
    const adj = {};

    for (const id of gapsSet) {
      inDegree[id] = 0;
      adj[id] = [];
    }

    for (const id of gapsSet) {
      const prereqs = this.prerequisiteGraph.get(id) || new Set();

      for (const prereqId of prereqs) {
        if (gapsSet.has(prereqId)) {
          adj[prereqId].push(id); // prereq -> dependent
          inDegree[id]++;
        }
      }
    }

    const queue = Object.keys(inDegree).filter((id) => inDegree[id] === 0);
    const sorted = [];

    while (queue.length > 0) {
      const node = queue.shift();
      sorted.push(node);

      for (const dep of adj[node]) {
        inDegree[dep]--;
        if (inDegree[dep] === 0) {
          queue.push(dep);
        }
      }
    }

    if (sorted.length < gapsSet.size) {
      console.warn(
        "[Reasoner] Cycle detected in prerequisite graph:",
        [...gapsSet].filter((id) => !sorted.includes(id))
      );
    }

    return sorted;
  }

  calculateReadiness(learner, targetCompetencyId) {
    const allPrereqs = this.computeTransitiveClosure(targetCompetencyId);
    const masteredSet = new Set(
      learner.competencyStatus?.masteredCompetencies ||
      learner.masteredCompetencies ||
      []
    );

    if (allPrereqs.size === 0) return 1.0;

    const masteredCount = [...allPrereqs].filter((p) => masteredSet.has(p)).length;
    const prerequisiteScore = masteredCount / allPrereqs.size;

    const confidenceScore = learner.affectiveProfile?.selfEfficacy || 0.5;
    const motivationScore = learner.affectiveProfile?.motivationLevel || 0.5;

    const readiness =
      prerequisiteScore * 0.6 +
      confidenceScore * 0.2 +
      motivationScore * 0.2;

    return Math.round(readiness * 100) / 100;
  }

  generateLearningPath(learnerId, targetCompetencyId) {
    const learner = this.learners[learnerId];
    const targetComp = this.competencies[targetCompetencyId];

    if (!learner || !targetComp) {
      return {
        pathSteps: [],
        totalHours: 0,
        readinessScore: 0
      };
    }

    const mastered = new Set(
      learner.competencyStatus?.masteredCompetencies ||
      learner.masteredCompetencies ||
      []
    );

    // 1. Полное замыкание
    const allRequired = this.computeTransitiveClosure(targetCompetencyId);

    // 2. Убираем освоенные
    const gaps = new Set([...allRequired].filter((id) => !mastered.has(id)));

    // 3. Топологическая сортировка Кана
    const sorted = this.topologicalSort(gaps);

    // 4. Приоритеты
    const gapAnalysis = this.classifyGapPriority([...gaps], targetCompetencyId, mastered);
    const criticalSet = new Set(gapAnalysis.critical.map((g) => g.competencyId));

    // 5. Формируем path
    const pathSteps = sorted.map((compId, index) => {
      const comp = this.competencies[compId];
      const recommendedResource = this.selectResourceForCompetency(compId, learner);

      return {
        step: index + 1,
        competency: comp,
        resource: recommendedResource,
        estimatedHours: comp?.estimatedHours || 10,
        isTarget: false,
        priority: criticalSet.has(compId) ? "critical" : "high"
      };
    });

    pathSteps.push({
      step: pathSteps.length + 1,
      competency: targetComp,
      resource: this.selectResourceForCompetency(targetCompetencyId, learner),
      estimatedHours: targetComp.estimatedHours || 15,
      isTarget: true,
      priority: "target"
    });

    const totalHours = pathSteps.reduce(
      (sum, step) => sum + (step.estimatedHours || 0),
      0
    );

    return {
      pathSteps,
      totalHours,
      readinessScore: this.calculateReadiness(learner, targetCompetencyId)
    };
  }

  selectResourceForCompetency(compId, learner) {
    const resources = this.resourcesByCompetency.get(compId) || [];
    if (resources.length === 0) return null;

    const learnerStyle =
      learner.learningStyle ||
      learner.primaryStyle ||
      learner.hasLearningStyle;

    const styleMatched = resources.find(
      (resource) =>
        resource.suitableForStyle &&
        (resource.suitableForStyle === learnerStyle ||
          (Array.isArray(resource.suitableForStyle) &&
            resource.suitableForStyle.includes(learnerStyle)))
    );

    return styleMatched || resources[0];
  }

  template(templateName, variables) {
    const category = Object.keys(this.explanationTemplates).find(
      (cat) => this.explanationTemplates[cat][templateName]
    );

    if (!category) return "";

    let template = this.explanationTemplates[category][templateName];

    Object.keys(variables).forEach((key) => {
      template = template.replace(new RegExp(`{${key}}`, "g"), variables[key]);
    });

    return template;
  }
}

if (typeof window !== "undefined") {
  window.OntologyReasoner = OntologyReasoner;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { OntologyReasoner };
}