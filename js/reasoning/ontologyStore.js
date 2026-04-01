class OntologyStore {
  constructor(ontologyData) {
    this.ontologyData = ontologyData || {};
    this.learners = this.ontologyData.learners || {};
    this.competencies = this.ontologyData.competencies || {};
    this.resources = this.ontologyData.learningResources || {};

    this.buildIndexes();
  }

  buildIndexes() {
    this.prerequisiteGraph = new Map();
    this.dependentGraph = new Map();
    this.resourcesByCompetency = new Map();

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
      if (!Array.isArray(resource.teachesCompetencies)) return;

      resource.teachesCompetencies.forEach((tc) => {
        const compId = tc.competencyId || tc;
        if (!compId) return;

        if (!this.resourcesByCompetency.has(compId)) {
          this.resourcesByCompetency.set(compId, []);
        }
        this.resourcesByCompetency.get(compId).push(resource);
      });
    });
  }

  getLearnerById(id) {
    return this.learners[id] || null;
  }

  getCompetencyById(id) {
    return this.competencies[id] || null;
  }

  getResourceByCompetency(compId) {
    return this.resourcesByCompetency.get(compId) || [];
  }

  getDirectPrerequisites(compId) {
    return this.prerequisiteGraph.get(compId) || new Set();
  }

  getDependents(compId) {
    return this.dependentGraph.get(compId) || new Set();
  }

  getMasteredCompetencies(learnerId) {
    const learner = this.getLearnerById(learnerId);
    if (!learner) return [];

    return (
      learner.competencyStatus?.masteredCompetencies ||
      learner.masteredCompetencies ||
      []
    );
  }

  getTargetCompetency(learnerId) {
    const learner = this.getLearnerById(learnerId);
    if (!learner) return null;

    return learner.targetCompetency || learner.goals?.targetCompetencies?.[0] || null;
  }
}

if (typeof window !== "undefined") {
  window.OntologyStore = OntologyStore;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { OntologyStore };
}