const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const email = 'demo@gigilabs.com';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, name: 'Atlas Demo Owner', passwordHash: hashPassword('Demo@12345') } });
  }

  const org = await prisma.organization.upsert({
    where: { id: 'demo-org' },
    update: { name: 'GIGI Atlas Demo Org' },
    create: { id: 'demo-org', name: 'GIGI Atlas Demo Org' }
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    update: { role: 'OWNER' },
    create: { organizationId: org.id, userId: user.id, role: 'OWNER' }
  });

  const project = await prisma.project.create({ data: { organizationId: org.id, name: 'Lekki Corridor Parcel', objective: 'BALANCED', goal: 'MAXIMIZE_MARGIN' } });
  await prisma.projectBoundary.create({ data: { projectId: project.id, geometry: [{ lat: 6.437, lng: 3.562 }, { lat: 6.438, lng: 3.566 }, { lat: 6.434, lng: 3.568 }, { lat: 6.432, lng: 3.563 }], area: 0.000014, perimeter: 0.0157, frontage: 0.0051 } });

  console.log('Seed completed', { user: user.email, org: org.id, project: project.id });
}

main().finally(async () => prisma.$disconnect());
