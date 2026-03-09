import { requireProjectAccess } from '../../../../lib/apiGuard';
import { generateAndPersistScenarios, getProjectState, logActivity } from '../../../../lib/platformStore';

export default async function handler(req, res) {
  const { projectId } = req.query;
  const access = await requireProjectAccess(req, res, projectId);
  if (!access) return;
  if (req.method === 'POST') {
    const scenarios = await generateAndPersistScenarios(projectId);
    await logActivity(projectId, access.user.id, 'SCENARIOS_REGENERATED', { count: scenarios.length });
    return res.status(200).json({ scenarios });
  }
  const state = await getProjectState(projectId);
  return res.status(200).json({ scenarios: state?.scenarios || [] });
}
