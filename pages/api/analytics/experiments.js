import { prisma } from '../../../lib/prisma';
import { resolveUserFromRequest } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { experiment, variant, eventType, metadata } = req.body || {};
    if (!experiment || !variant || !eventType) {
      return res.status(400).json({ error: 'experiment, variant, and eventType are required' });
    }

    const user = await resolveUserFromRequest(req);
    const event = await prisma.experimentEvent.create({
      data: {
        experiment,
        variant,
        eventType,
        userId: user?.id || null,
        metadata: metadata || {}
      }
    });
    return res.status(201).json(event);
  }

  if (req.method === 'GET') {
    const experiment = String(req.query.experiment || 'home_hero_v1');
    const rows = await prisma.experimentEvent.groupBy({
      by: ['variant', 'eventType'],
      where: { experiment },
      _count: { _all: true }
    });
    return res.status(200).json({ experiment, rows });
  }

  return res.status(405).end();
}
