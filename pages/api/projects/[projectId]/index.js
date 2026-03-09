import { requireProjectAccess } from '../../../../lib/apiGuard';
import { getProjectState, saveLandProfile, updateBoundary } from '../../../../lib/platformStore';
import { normalizeAssumptions, validatePolygon } from '../../../../lib/validation';

export default async function handler(req, res) {
  const projectId = req.query.projectId;
  const access = await requireProjectAccess(req, res, projectId);
  if (!access) return;

  if (req.method === 'GET') {
    const state = await getProjectState(projectId);
    return res.status(200).json(state);
  }

  if (req.method === 'PATCH') {
    if (req.body?.boundary) {
      if (!validatePolygon(req.body.boundary)) return res.status(400).json({ error: 'invalid boundary polygon' });
      await updateBoundary(projectId, req.body.boundary);
    }
    if (req.body?.landProfile) {
      await saveLandProfile(projectId, {
        ...req.body.landProfile,
        assumptions: normalizeAssumptions(req.body.landProfile.assumptions || {})
      });
    }
    const state = await getProjectState(projectId);
    return res.status(200).json(state);
  }

  return res.status(405).end();
}
