import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../lib/apiGuard';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    if (req.body?.kind === 'opportunity') {
      const opp = await prisma.opportunity.create({ data: { title: req.body.title, type: req.body.type || 'JV', payload: req.body.payload || {}, status: 'OPEN' } });
      return res.status(201).json(opp);
    }
    const membership = user.organizationMembers[0];
    if (!membership) return res.status(400).json({ error: 'organization membership required' });
    const listing = await prisma.listing.create({ data: { organizationId: membership.organizationId, title: req.body.title, payload: req.body.payload || {}, status: 'OPEN' } });
    return res.status(201).json(listing);
  }

  const [listings, opportunities] = await Promise.all([
    prisma.listing.findMany({ orderBy: { id: 'desc' } }),
    prisma.opportunity.findMany({ orderBy: { createdAt: 'desc' } })
  ]);
  return res.status(200).json({ listings, opportunities });
}
