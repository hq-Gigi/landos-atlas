import { requireProjectAccess } from '../../../../../lib/apiGuard';
import { getProjectState } from '../../../../../lib/platformStore';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const access = await requireProjectAccess(req, res, req.query.projectId);
  if (!access) return;

  const state = await getProjectState(req.query.projectId);
  const ranked = [...state.scenarios].sort((a, b) => b.optimizationScore - a.optimizationScore);
  const best = ranked[0];
  return res.status(200).json({
    projectId: req.query.projectId,
    projectName: state.project.name,
    landIntelligence: {
      boundaryPoints: state.boundary.length,
      objective: state.project.objective,
      goal: state.project.goal
    },
    topScenario: {
      name: best.name,
      score: best.optimizationScore,
      yieldUnits: best.metrics.yieldUnits,
      revenue: best.metrics.revenue,
      margin: best.metrics.margin,
      deliveryMonths: best.metrics.deliveryMonths
    },
    comparison: ranked.map((s) => ({ id: s.id, name: s.name, score: s.optimizationScore, margin: s.metrics.margin })),
    generatedAt: new Date().toISOString()
  });
}
