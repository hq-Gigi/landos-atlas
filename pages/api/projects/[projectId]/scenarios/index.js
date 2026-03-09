import { getProjectState } from '../../../../../lib/db';

export default function handler(req, res) {
  const state = getProjectState(req.query.projectId);
  if (!state) return res.status(404).json({ error: 'project not found' });
  return res.status(200).json(state.scenarios);
}
