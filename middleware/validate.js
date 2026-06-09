function validateCompetency(req, res, next) {
  const { name, bloom_level, eqf_level } = req.body;
  const errors = [];
  // name required on POST; optional on PATCH but must be valid if supplied
  if (req.method === 'POST' && (!name || name.trim().length < 2))
    errors.push('name must be at least 2 characters');
  else if (req.method !== 'POST' && name !== undefined && name.trim().length < 2)
    errors.push('name must be at least 2 characters');
  if (bloom_level !== undefined && (bloom_level < 1 || bloom_level > 6)) errors.push('bloom_level must be 1–6');
  if (eqf_level   !== undefined && (eqf_level   < 1 || eqf_level   > 8)) errors.push('eqf_level must be 1–8');
  if (errors.length) return res.status(400).json({ errors });
  next();
}

function validateResource(req, res, next) {
  const { name, type, difficulty, duration_hours } = req.body;
  const errors = [];
  const validTypes = ['video','article','exercise','project'];
  if (!name) errors.push('name required');
  if (type && !validTypes.includes(type)) errors.push(`type must be one of: ${validTypes.join(', ')}`);
  if (difficulty    !== undefined && (difficulty    < 1 || difficulty    > 5)) errors.push('difficulty must be 1–5');
  if (duration_hours !== undefined && duration_hours <= 0) errors.push('duration_hours must be > 0');
  if (errors.length) return res.status(400).json({ errors });
  next();
}

module.exports = { validateCompetency, validateResource };
