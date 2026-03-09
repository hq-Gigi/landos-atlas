import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../lib/apiGuard';
import { buildListingCreateData, getProjectIntel } from '../../../lib/marketplace';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  const listing = await prisma.listing.findUnique({ where: { id: req.query.id }, include: { organization: true, project: true } });
  if (!listing) return res.status(404).json({ error: 'listing not found' });

  if (req.method === 'GET') {
    const projectIntel = await getProjectIntel(listing.projectId);
    return res.status(200).json({ ...listing, projectIntel });
  }

  if (req.method === 'PATCH') {
    const membership = user.organizationMembers.find((m) => m.organizationId === listing.organizationId);
    if (!membership || !['OWNER', 'ADMIN', 'ANALYST'].includes(membership.role)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    const data = buildListingCreateData({ ...listing, ...req.body }, listing.organizationId);
    const updated = await prisma.listing.update({ where: { id: listing.id }, data, include: { organization: true, project: true } });
    return res.status(200).json(updated);
  }

  return res.status(405).end();
}
