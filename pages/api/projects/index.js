import { requireUser } from '../../../lib/apiGuard';
import { createProject, listProjects } from '../../../lib/platformStore';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  const orgId = req.query.orgId || req.body?.orgId;
  if (!orgId) return res.status(400).json({ error: 'orgId required' });

  const member = user.organizationMembers.find((m) => m.organizationId === orgId);
  if (!member) return res.status(403).json({ error: 'forbidden' });

  if (req.method === 'GET') {
    const projects = await listProjects(orgId);
    return res.status(200).json(projects);
  }

  if (req.method === 'POST') {
    const name = String(req.body?.name || '').trim();
    const goal = String(req.body?.goal || '').trim();
    const boundary = req.body?.boundary;

    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!goal) return res.status(400).json({ error: 'goal is required' });
    if (!Array.isArray(boundary) || !boundary.length) return res.status(400).json({ error: 'boundary is required' });

    const project = await createProject(orgId, req.body || {});
    return res.status(201).json(project);
  }

  return res.status(405).end();
}
