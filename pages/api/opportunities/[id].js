import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../lib/apiGuard';
import { buildOpportunityCreateData, getProjectIntel } from '../../../lib/marketplace';

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: req.query.id },
    include: { organization: true, project: true, scenario: true }
  });
  if (!opportunity) return res.status(404).json({ error: 'opportunity not found' });

  if (req.method === 'GET') {
    const projectIntel = await getProjectIntel(opportunity.projectId);
    return res.status(200).json({ ...opportunity, projectIntel });
  }

  if (req.method === 'PATCH') {
    const membership = user.organizationMembers.find((m) => m.organizationId === opportunity.organizationId);
    if (!membership || !['OWNER', 'ADMIN', 'ANALYST'].includes(membership.role)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    const data = buildOpportunityCreateData({ ...opportunity, ...req.body }, opportunity.organizationId);
    const updated = await prisma.opportunity.update({ where: { id: opportunity.id }, data, include: { organization: true, project: true, scenario: true } });
    return res.status(200).json(updated);
  }

  return res.status(405).end();
}
