import { enforceRateLimit, requireProjectAccess } from '../../../../../lib/apiGuard';
import { getProjectState, logActivity, recomputeFeasibilityForProject } from '../../../../../lib/platformStore';
import { FEASIBILITY_GOALS, rankScenarioModels } from '../../../../../lib/feasibility';

export default async function handler(req, res) {
  if (!enforceRateLimit(req, res, { prefix: 'project-feasibility', limit: 50, windowMs: 60_000 })) return;
  const access = await requireProjectAccess(req, res, req.query.projectId);
  if (!access) return;

  if (req.method === 'POST') {
    const assumptions = req.body?.assumptions || null;
    const goal = FEASIBILITY_GOALS.includes(req.body?.goal) ? req.body.goal : 'BALANCED';
    const updated = await recomputeFeasibilityForProject(req.query.projectId, assumptions);
    const ranked = rankScenarioModels(updated.map((item) => ({ scenarioId: item.scenarioId, model: item })), goal);
    await logActivity(req.query.projectId, access.user.id, 'FEASIBILITY_RECOMPUTED', { assumptions, scenarios: updated.length, goal });
    return res.status(200).json({ updated: ranked });
  }

  const state = await getProjectState(req.query.projectId);
  const reports = state?.project?.feasibilityReports || [];
  const goal = FEASIBILITY_GOALS.includes(req.query.goal) ? req.query.goal : 'BALANCED';
  const comparison = rankScenarioModels(reports.map((report) => ({
    scenarioId: report.payload?.scenarioId,
    name: report.payload?.scenarioName,
    model: report.payload?.model || {}
  })), goal);

  return res.status(200).json({
    selectedScenario: comparison[0] || null,
    comparison,
    assumptions: state?.project?.feasibilityAssumptions?.[0]?.payload || null,
    goal
  });
}
