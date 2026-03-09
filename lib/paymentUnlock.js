import { prisma } from './prisma';

const PREMIUM_EXPORT_TYPES = ['PDF', 'PNG', 'SCR'];

export async function unlockProjectPremiumExports(projectId, paymentReference) {
  if (!projectId) return;

  const existing = await prisma.export.findMany({
    where: { projectId, type: { in: PREMIUM_EXPORT_TYPES } },
    select: { id: true, type: true, status: true, metadata: true }
  });

  const byType = new Map(existing.map((item) => [item.type, item]));

  await prisma.$transaction(async (tx) => {
    for (const type of PREMIUM_EXPORT_TYPES) {
      const current = byType.get(type);
      const metadata = {
        ...(current?.metadata || {}),
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        paymentReference
      };

      if (!current) {
        await tx.export.create({
          data: {
            projectId,
            type,
            status: 'READY',
            metadata
          }
        });
        continue;
      }

      if (current.status === 'LOCKED' || !current.metadata?.unlocked) {
        await tx.export.update({
          where: { id: current.id },
          data: {
            status: 'READY',
            metadata
          }
        });
      }
    }
  });
}
