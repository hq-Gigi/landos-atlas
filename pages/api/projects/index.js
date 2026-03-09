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
    const project = await createProject(orgId, req.body || {});
    return res.status(201).json(project);
  }

  return res.status(405).end();
}
