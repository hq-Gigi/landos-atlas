import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../lib/apiGuard';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const user = await requireUser(req, res);
  if (!user) return;
  const orgIds = user.organizationMembers.map((m) => m.organizationId);
  const payments = await prisma.payment.findMany({
    where: { project: { organizationId: { in: orgIds } } },
    orderBy: { createdAt: 'desc' },
    take: 200
  });
  return res.status(200).json(payments);
}
