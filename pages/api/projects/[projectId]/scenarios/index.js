import { requireProjectAccess } from '../../../../../lib/apiGuard';
import { generateAndPersistScenarios, getProjectState } from '../../../../../lib/platformStore';

export default async function handler(req, res) {
  const projectId = req.query.projectId;
  const access = await requireProjectAccess(req, res, projectId);
  if (!access) return;

  if (req.method === 'POST') {
    const scenarios = await generateAndPersistScenarios(projectId);
    return res.status(201).json(scenarios);
  }

  const state = await getProjectState(projectId);
  return res.status(200).json(state.scenarios);
}
