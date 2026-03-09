import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../lib/apiGuard';
import { buildListingCreateData, buildOpportunityCreateData, validateMarketplacePayload, withSearchFilter } from '../../../lib/marketplace';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    const membership = user.organizationMembers.find((m) => ['OWNER', 'ADMIN', 'ANALYST'].includes(m.role));
    if (!membership) return res.status(403).json({ error: 'organization membership required' });

    const kind = req.body?.kind === 'opportunity' ? 'opportunity' : 'listing';
    const error = validateMarketplacePayload(req.body || {});
    if (error) return res.status(400).json({ error });

    if (kind === 'opportunity') {
      const record = await prisma.opportunity.create({ data: buildOpportunityCreateData(req.body, membership.organizationId) });
      return res.status(201).json(record);
    }

    const record = await prisma.listing.create({ data: buildListingCreateData(req.body, membership.organizationId) });
    return res.status(201).json(record);
  }

  if (req.method !== 'GET') return res.status(405).end();

  const { q = '', status = 'ALL' } = req.query;
  const statusFilter = status === 'ALL' ? undefined : String(status);

  const [listings, opportunities] = await Promise.all([
    prisma.listing.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: { organization: true, project: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.opportunity.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: { organization: true, project: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return res.status(200).json({
    listings: withSearchFilter(listings, q),
    opportunities: withSearchFilter(opportunities, q)
  });
}
