import { getProjectState } from '../../../lib/db';

export default function handler(req, res) {
  const { projectId, audience = 'developer' } = req.body || {};
  const state = getProjectState(projectId);
  if (!state) return res.status(404).json({ error: 'project not found' });
  const top = [...state.scenarios].sort((a, b) => b.optimizationScore - a.optimizationScore)[0];
  return res.status(200).json({
    projectId,
    audience,
    recommendation: {
      scenarioId: top.id,
      narrative: `Prioritize ${top.name}. It delivers ${top.metrics.yieldUnits} units, margin ${top.metrics.margin}, and ${top.feasibility} feasibility alignment.`,
      boardMemo: `Board memo: adopt ${top.name} and stage execution with monthly risk checkpoints.`
    },
    schemaVersion: '1.0.0'
  });
}
