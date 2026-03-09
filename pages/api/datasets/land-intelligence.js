import { prisma } from '../../../lib/prisma';
import { requireUser } from '../../../lib/apiGuard';

async function createSnapshot() {
  const [projects, orgs, listings] = await Promise.all([
    prisma.project.findMany({ include: { boundaries: true, optimizationScores: true } }),
    prisma.organization.count(),
    prisma.listing.count()
  ]);

  const boundaries = projects.flatMap((p) => p.boundaries || []);
  const scores = projects.flatMap((p) => p.optimizationScores || []);
  const avgBoundaryArea = boundaries.length ? boundaries.reduce((a, b) => a + (b.area || 0), 0) / boundaries.length : 0;
  const avgScenarioScore = scores.length ? scores.reduce((a, b) => a + (b.score || 0), 0) / scores.length : 0;

  return prisma.landAnalyticsSnapshot.create({
    data: {
      totalProjects: projects.length,
      avgBoundaryArea,
      avgScenarioScore,
      totalOrganizations: orgs,
      totalListings: listings
    }
  });
}

export default async function handler(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === 'POST') {
    const snap = await createSnapshot();
    return res.status(201).json(snap);
  }

  const latest = await prisma.landAnalyticsSnapshot.findFirst({ orderBy: { generatedAt: 'desc' } });
  if (!latest) {
    const snap = await createSnapshot();
    return res.status(200).json(snap);
  }
  return res.status(200).json(latest);
}
