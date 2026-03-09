import { platformStore } from '../../../lib/platformStore';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const orgs = await platformStore.listOrganizations();
    return res.status(200).json(orgs);
  }

  if (req.method === 'POST') {
    const org = await platformStore.createOrganization(req.body?.name || 'New Organization');
    return res.status(201).json(org);
  }

  return res.status(405).end();
}
