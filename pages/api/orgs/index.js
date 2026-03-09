import { requireUser } from '../../../lib/apiGuard';
import { createOrganizationForUser, listOrganizationsForUser } from '../../../lib/platformStore';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const orgs = await listOrganizationsForUser(user.id);
    return res.status(200).json(orgs);
  }

  if (req.method === 'POST') {
    const org = await createOrganizationForUser(user.id, req.body?.name || 'New Organization');
    return res.status(201).json(org);
  }

  return res.status(405).end();
}
