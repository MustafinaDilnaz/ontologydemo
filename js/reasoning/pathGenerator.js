class PathGenerator {
  constructor(store) {
    this.store = store;
    this.initializeExplanationSystem();
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
    return this.store.getTransitiveClosure(goalId);
  }

  getTransitivePrerequisites(competencyId) {
    return Array.from(this.computeTransitiveClosure(competencyId));
  }

  getDependents(compId) {
    return Array.from(this.store.getDependents(Number(compId)));
  }

  topologicalSort(gapsSet) {
    const inDegree = {};
    const adj = {};

    for (const id of gapsSet) {
      inDegree[id] = 0;
      adj[id] = [];
    }

    for (const id of gapsSet) {
      const prereqs = this.store.getDirectPrerequisites(id);
      for (const prereqId of prereqs) {
        if (gapsSet.has(prereqId)) {
          adj[prereqId].push(id);
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
        "[PathGenerator] Cycle detected:",
        [...gapsSet].filter((id) => !sorted.includes(id))
      );
    }

    return sorted;
  }

  classifyGapPriority(gaps, targetCompetencyId, masteredSet) {
    const target = this.store.getCompetencyById(targetCompetencyId);
    const directPrereqs = new Set(target?.prerequisites || []);

    const classified = {
      critical: [],
      high: [],
      medium: []
    };

    const gapsSet = new Set(gaps);
    const blockingCount = new Map();

    gaps.forEach((gapId) => {
      const dependents = this.store.getDependents(gapId);
      let blockedCount = 0;

      dependents.forEach((depId) => {
        if (gapsSet.has(depId) && !masteredSet.has(depId)) {
          blockedCount++;
        }
      });

      blockingCount.set(gapId, blockedCount);
    });

    gaps.forEach((gapId) => {
      const comp = this.store.getCompetencyById(gapId);
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

  detectGaps(learnerId, targetCompetencyId) {
    const learner = this.store.getLearnerById(learnerId);
    const target = this.store.getCompetencyById(targetCompetencyId);

    if (!learner || !target) {
      console.warn(`[PathGenerator] Invalid learner (${learnerId}) or competency (${targetCompetencyId})`);
      return {
        totalGaps: 0,
        gapsByPriority: { critical: [], high: [], medium: [] },
        recommendedSequence: [],
        readinessScore: 0,
        targetCompetency: null
      };
    }

    const masteredSet = new Set(this.store.getMasteredCompetencies(learnerId));
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

  selectResourceForCompetency(compId, learner) {
    const resources = this.store.getResourceByCompetency(compId);
    if (resources.length === 0) return null;

    const learnerStyle =
      learner.learningStyle ||
      learner.primaryStyle ||
      learner.hasLearningStyle ||
      learner.learningPreferences?.primaryLearningStyle;

    const normalizedStyle = typeof learnerStyle === "string"
      ? learnerStyle.toLowerCase().replace("/", "").replace(/\s+/g, "")
      : null;

    const styleMatched = resources.find((resource) => {
      if (resource.suitableForStyle) {
        if (resource.suitableForStyle === learnerStyle) return true;
        if (Array.isArray(resource.suitableForStyle) && resource.suitableForStyle.includes(learnerStyle)) {
          return true;
        }
      }

      if (resource.learningStyleSuitability && normalizedStyle) {
        const map = {
          visual: "visual",
          auditory: "auditory",
          readingwriting: "readingWriting",
          kinesthetic: "kinesthetic"
        };
        const key = map[normalizedStyle];
        return key && resource.learningStyleSuitability[key] > 0.7;
      }

      return false;
    });

    return styleMatched || resources[0];
  }

  generateLearningPath(learnerId, targetCompetencyId) {
    const learner = this.store.getLearnerById(learnerId);
    const targetComp = this.store.getCompetencyById(targetCompetencyId);

    if (!learner || !targetComp) {
      return {
        pathSteps: [],
        totalHours: 0,
        readinessScore: 0
      };
    }

    const mastered = new Set(this.store.getMasteredCompetencies(learnerId));
    const allRequired = this.computeTransitiveClosure(targetCompetencyId);
    const gaps = new Set([...allRequired].filter((id) => !mastered.has(id)));
    const sorted = this.topologicalSort(gaps);

    const gapAnalysis = this.classifyGapPriority([...gaps], targetCompetencyId, mastered);
    const criticalSet = new Set(gapAnalysis.critical.map((g) => g.competencyId));

    const pathSteps = sorted
      .map((compId, index) => {
        const comp = this.store.getCompetencyById(compId);
        if (!comp) return null; // orphaned competency id — skip
        return {
          step: index + 1,
          competency: comp,
          resource: this.selectResourceForCompetency(compId, learner), // may be null
          estimatedHours: comp.estimatedHours || 10,
          isTarget: false,
          priority: criticalSet.has(compId) ? "critical" : "high"
        };
      })
      .filter(Boolean);

    pathSteps.push({
      step: pathSteps.length + 1,
      competency: targetComp,
      resource: this.selectResourceForCompetency(targetCompetencyId, learner),
      estimatedHours: targetComp.estimatedHours || 15,
      isTarget: true,
      priority: "target"
    });

    const totalHours = pathSteps.reduce((sum, step) => sum + (step.estimatedHours || 0), 0);

    return {
      pathSteps,
      totalHours,
      readinessScore: this.calculateReadiness(learner, targetCompetencyId)
    };
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
  window.PathGenerator = PathGenerator;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PathGenerator };
}