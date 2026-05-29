const SWRL_RULES = {
  styleMatch: (resource, learner) =>
    (resource.suitableStyles || resource.suitableForStyle || [])
      .includes(learner.learningStyle || learner.learning_style),

  difficultyMatch: (resource, learner) => {
    const score = learner.performanceScore || learner.performance_score || 0.5;
    const target = 1 + Math.round(score * 4);
    return Math.abs(resource.difficulty - target) <= 1;
  },

  fitsSchedule: (resource, learner) => {
    const hours = learner.availableHours || learner.available_hours_week
      || learner.constraints?.timeAvailabilityPerWeek || 10;
    return resource.durationHours <= hours;
  },

  score(resource, learner) {
    let s = 0;
    if (SWRL_RULES.styleMatch(resource, learner))      s += 3;
    if (SWRL_RULES.difficultyMatch(resource, learner)) s += 2;
    if (SWRL_RULES.fitsSchedule(resource, learner))    s += 1;
    return s;
  }
};