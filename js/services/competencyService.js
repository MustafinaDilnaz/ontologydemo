class CompetencyService {
  constructor(ontologyData) {
    this.competencies = ontologyData.competencies || {};
  }

  getAll() {
    return Object.values(this.competencies);
  }

  getById(id) {
    return this.competencies[id] || null;
  }

  getPrerequisites(id) {
    const competency = this.getById(id);
    return competency?.prerequisites || [];
  }

  getEstimatedHours(id) {
    return this.getById(id)?.estimatedHours || 0;
  }
}

if (typeof window !== 'undefined') window.CompetencyService = CompetencyService;
if (typeof module !== 'undefined' && module.exports) module.exports = { CompetencyService };