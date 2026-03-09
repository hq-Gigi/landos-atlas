import { prisma } from '../../../../../lib/prisma';
import { requireProjectAccess } from '../../../../../lib/apiGuard';

export default async function handler(req, res) {
  const access = await requireProjectAccess(req, res, req.query.projectId);
  if (!access) return;
  if (req.method !== 'GET') return res.status(405).end();
  const records = await prisma.export.findMany({ where: { projectId: req.query.projectId }, orderBy: { createdAt: 'desc' } });
  return res.status(200).json(records);
}
