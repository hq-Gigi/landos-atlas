import { requireUser } from '../../../lib/apiGuard';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;
  return res.status(200).json({ id: user.id, email: user.email, name: user.name, memberships: user.organizationMembers || [] });
}
