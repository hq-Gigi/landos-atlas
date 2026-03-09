import { getProjectState } from '../../../../../lib/db';

export default function handler(req, res) {
  const state = getProjectState(req.query.projectId);
  if (!state) return res.status(404).json({ error: 'project not found' });
  const best = state.scenarios.sort((a, b) => b.optimizationScore - a.optimizationScore)[0];
  return res.status(200).json({ projectId: req.query.projectId, selectedScenario: best.id, confidence: best.feasibility, summary: `Best option is ${best.name} with score ${best.optimizationScore}.` });
}
