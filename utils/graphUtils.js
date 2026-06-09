/**
 * Check if adding edge (fromId -> toId) would create a cycle in the DAG.
 * Uses DFS from toId; if fromId is reachable, a cycle would form.
 *
 * @param {Map<number, Set<number>>} adjacency - current prerequisite graph
 *        adjacency.get(A) = Set of competencies that A requires
 * @param {number} fromId - the competency that REQUIRES toId
 * @param {number} toId  - the competency being required
 * @returns {boolean} true if adding this edge creates a cycle
 */
function wouldCreateCycle(adjacency, fromId, toId) {
  const visited = new Set();
  const stack = [toId];
  while (stack.length) {
    const node = stack.pop();
    if (node === fromId) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    const neighbors = adjacency.get(node) || new Set();
    for (const n of neighbors) stack.push(n);
  }
  return false;
}

/**
 * Build adjacency map from the prerequisites table.
 * Returns Map<competencyId, Set<requiresCompetencyId>>
 */
function buildAdjacency(db) {
  const rows = db.prepare('SELECT competency_id, requires_competency_id FROM prerequisites').all();
  const adj = new Map();
  for (const row of rows) {
    if (!adj.has(row.competency_id)) adj.set(row.competency_id, new Set());
    adj.get(row.competency_id).add(row.requires_competency_id);
  }
  return adj;
}

module.exports = { wouldCreateCycle, buildAdjacency };
