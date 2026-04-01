class ResourceService {
  constructor(ontologyData) {
    this.resources = ontologyData.learningResources || {};
  }

  getAll() {
    return Object.values(this.resources);
  }

  getById(id) {
    return this.resources[id] || null;
  }

  getByCompetency(competencyId) {
    return Object.values(this.resources).filter(resource =>
      Array.isArray(resource.teachesCompetencies) &&
      resource.teachesCompetencies.some(tc => (tc.competencyId || tc) === competencyId)
    );
  }
}

if (typeof window !== 'undefined') window.ResourceService = ResourceService;
if (typeof module !== 'undefined' && module.exports) module.exports = { ResourceService };