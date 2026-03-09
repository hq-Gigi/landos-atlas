import { requireProjectAccess } from '../../../../../lib/apiGuard';
import { generateAndPersistScenarios, getProjectState, saveLandProfile, saveProjectStrategy } from '../../../../../lib/platformStore';

export default async function handler(req, res) {
  const projectId = req.query.projectId;
  const access = await requireProjectAccess(req, res, projectId);
  if (!access) return;

  if (req.method === 'POST') {
    const objective = req.body?.objective || 'BALANCED';
    const goal = req.body?.objective || req.body?.goal || 'BALANCED';
    const targetPlotSize = Number(req.body?.targetPlotSize || 500);
    const roadWidth = Number(req.body?.roadWidth || 9);

    await saveProjectStrategy(projectId, { objective, goal });
    if (req.body?.assumptions) {
      await saveLandProfile(projectId, {
        zoning: req.body?.zoning || null,
        constraints: req.body?.constraints || {},
        assumptions: {
          ...req.body.assumptions,
          targetPlotSize,
          roadWidth,
          objective,
          goal
        }
      });
    }

    const scenarios = await generateAndPersistScenarios(projectId);
    return res.status(201).json(scenarios);
  }

  const state = await getProjectState(projectId);
  return res.status(200).json(state.scenarios);
}
