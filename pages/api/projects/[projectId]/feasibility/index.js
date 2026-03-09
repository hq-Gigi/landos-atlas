import { requireProjectAccess } from '../../../../../lib/apiGuard';
import { getProjectState } from '../../../../../lib/platformStore';

export default async function handler(req, res) {
  const access = await requireProjectAccess(req, res, req.query.projectId);
  if (!access) return;

  const state = await getProjectState(req.query.projectId);
  const scenarios = state.scenarios;
  const ranked = [...scenarios].sort((a, b) => b.optimizationScore - a.optimizationScore);
  return res.status(200).json({ selectedScenario: ranked[0], comparison: ranked.map((s) => ({ id: s.id, name: s.name, score: s.optimizationScore, feasibility: s.feasibility, margin: s.metrics.margin })) });
}
