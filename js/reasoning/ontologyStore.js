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
        this.closureCache = new Map(); // goalId → Set<prerequisiteId>

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
                const compId = Number(tc.competencyId || tc); // всегда число
                if (!compId) return;
                if (!this.resourcesByCompetency.has(compId)) {
                    this.resourcesByCompetency.set(compId, []);
                }
                this.resourcesByCompetency.get(compId).push(resource);
            });
        });
    }

    getLearnerById(id) {
        if (this.learners[id] !== undefined) return this.learners[id];
        return Object.values(this.learners).find(l => l.slug === String(id)) || null;
    }

    getCompetencyById(id) {
        return this.competencies[id] || this.competencies[Number(id)] || null;
    }

    getResourceByCompetency(compId) {
        return this.resourcesByCompetency.get(Number(compId)) || [];
    }

    getDirectPrerequisites(compId) {
        return this.prerequisiteGraph.get(Number(compId)) || new Set();
    }

    getDependents(compId) {
        return this.dependentGraph.get(Number(compId)) || new Set();
    }

    // Returns Set of all transitive prerequisite IDs for goalId (not including goalId itself).
    // The cache stores the canonical set; callers receive a copy so external mutation
    // cannot corrupt subsequent lookups.
    // Cycle-safe: goalId is always excluded — even if it appears in its own prerequisite chain,
    // the BFS visited-check prevents re-queuing, and the final delete removes it.
    getTransitiveClosure(goalId) {
        const key = Number(goalId);
        if (this.closureCache.has(key)) return new Set(this.closureCache.get(key));

        const visited = new Set();
        const queue = [key];
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current)) continue;
            visited.add(current);
            const prereqs = this.prerequisiteGraph.get(current) || new Set();
            for (const p of prereqs) {
                if (!visited.has(p)) queue.push(p);
            }
        }
        visited.delete(key); // exclude the goal itself from its own prerequisites
        this.closureCache.set(key, visited); // canonical copy stays in cache
        return new Set(visited);             // caller gets an independent copy
    }

    // Removes all closure entries that contain competencyId (as key or member).
    invalidateClosure(competencyId) {
        const id = Number(competencyId);
        for (const [key, set] of this.closureCache) {
            if (key === id || set.has(id)) {
                this.closureCache.delete(key);
            }
        }
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