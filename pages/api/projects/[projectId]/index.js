import { platformStore } from '../../../../lib/platformStore';

export default async function handler(req, res) {
  const state = await platformStore.getProjectState(req.query.projectId);
  if (!state) return res.status(404).json({ error: 'project not found' });
  return res.status(200).json(state);
}
