const SWRL_RULES = {
  styleMatch:      (resource, learner) => resource.suitableStyles.includes(learner.learning_style),
  difficultyMatch: (resource, learner) => Math.abs(resource.difficulty - Math.round(1 + learner.performance_score * 4)) <= 1,
  fitsSchedule:    (resource, learner) => resource.duration_hours <= learner.available_hours_week,
  score: (resource, learner) => {
    let s = 0;
    if (SWRL_RULES.styleMatch(resource, learner))      s += 3;
    if (SWRL_RULES.difficultyMatch(resource, learner)) s += 2;
    if (SWRL_RULES.fitsSchedule(resource, learner))    s += 1;
    return s;
  }
};