import { enforceRateLimit, requireProjectAccess } from '../../../../../lib/apiGuard';
import { getProjectState, logActivity, recomputeFeasibilityForProject } from '../../../../../lib/platformStore';

export default async function handler(req, res) {
  if (!enforceRateLimit(req, res, { prefix: 'project-feasibility', limit: 50, windowMs: 60_000 })) return;
  const access = await requireProjectAccess(req, res, req.query.projectId);
  if (!access) return;

  if (req.method === 'POST') {
    const assumptions = req.body?.assumptions || {};
    const updated = await recomputeFeasibilityForProject(req.query.projectId, assumptions);
    await logActivity(req.query.projectId, access.user.id, 'FEASIBILITY_RECOMPUTED', { assumptions, scenarios: updated.length });
    return res.status(200).json({ updated });
  }

  const state = await getProjectState(req.query.projectId);
  const scenarios = state?.scenarios || [];
  const ranked = [...scenarios].sort((a, b) => b.optimizationScore - a.optimizationScore);

  return res.status(200).json({
    selectedScenario: ranked[0] || null,
    comparison: ranked.map((s) => ({
      id: s.id,
      name: s.name,
      score: s.optimizationScore,
      feasibility: s.feasibility,
      margin: s.metrics.margin,
      roi: s.metrics.roi,
      timeline: s.metrics.deliveryMonths
    }))
  });
}
