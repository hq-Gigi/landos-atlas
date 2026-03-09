import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../lib/apiGuard';
import { buildOpportunityCreateData, validateMarketplacePayload, withSearchFilter } from '../../../lib/marketplace';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    const membership = user.organizationMembers.find((m) => ['OWNER', 'ADMIN', 'ANALYST'].includes(m.role));
    if (!membership) return res.status(403).json({ error: 'organization membership required' });
    const error = validateMarketplacePayload(req.body || {});
    if (error) return res.status(400).json({ error });
    const opportunity = await prisma.opportunity.create({ data: buildOpportunityCreateData(req.body, membership.organizationId) });
    return res.status(201).json(opportunity);
  }

  if (req.method !== 'GET') return res.status(405).end();
  const opportunities = await prisma.opportunity.findMany({ include: { organization: true, project: true }, orderBy: { createdAt: 'desc' } });
  return res.status(200).json(withSearchFilter(opportunities, req.query?.q));
}
