class LearnerService {
  constructor(ontologyData) {
    this.learners = ontologyData.learners || {};
  }

  getAll() {
    return Object.values(this.learners);
  }

  getById(id) {
    return this.learners[id] || null;
  }

  create(learner) {
    if (!learner?.id) throw new Error('Learner must have id');
    this.learners[learner.id] = learner;
    return learner;
  }

  markMastered(learnerId, competencyId) {
    const learner = this.getById(learnerId);
    if (!learner) return false;

    if (!learner.masteredCompetencies) learner.masteredCompetencies = [];
    if (!learner.competencyStatus) learner.competencyStatus = {};
    if (!learner.competencyStatus.masteredCompetencies) {
      learner.competencyStatus.masteredCompetencies = [];
    }

    if (!learner.masteredCompetencies.includes(competencyId)) {
      learner.masteredCompetencies.push(competencyId);
    }

    if (!learner.competencyStatus.masteredCompetencies.includes(competencyId)) {
      learner.competencyStatus.masteredCompetencies.push(competencyId);
    }

    return true;
  }

  getMasteredCompetencies(learnerId) {
    const learner = this.getById(learnerId);
    if (!learner) return [];
    return learner.competencyStatus?.masteredCompetencies || learner.masteredCompetencies || [];
  }

  getTargetCompetency(learnerId) {
    const learner = this.getById(learnerId);
    if (!learner) return null;
    return learner.targetCompetency || learner.goals?.targetCompetencies?.[0] || null;
  }
}

if (typeof window !== 'undefined') window.LearnerService = LearnerService;
if (typeof module !== 'undefined' && module.exports) module.exports = { LearnerService };