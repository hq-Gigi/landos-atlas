import { requireProjectAccess } from '../../../../lib/apiGuard';
import { getProjectState } from '../../../../lib/platformStore';

export default async function handler(req, res) {
  const { projectId } = req.query;
  const access = await requireProjectAccess(req, res, projectId);
  if (!access) return;
  const state = await getProjectState(projectId);
  if (!state) return res.status(404).json({ error: 'project not found' });
  return res.status(200).json(state);
}
