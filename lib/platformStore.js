import { prisma } from './prisma';
import { hashPassword, verifyPassword } from './auth';
import { boundaryMetrics, generateScenarios } from './scenarioEngine';

export async function createUser({ email, password, name }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return null;
  return prisma.user.create({
    data: { email, passwordHash: hashPassword(password), name: name || email.split('@')[0] },
    select: { id: true, email: true, name: true }
  });
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return { id: user.id, email: user.email, name: user.name };
}

export async function listOrganizationsForUser(userId) {
  return prisma.organization.findMany({
    where: { members: { some: { userId } } },
    include: { members: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createOrganizationForUser(userId, name) {
  return prisma.organization.create({
    data: { name, members: { create: { userId, role: 'OWNER' } } },
    include: { members: true }
  });
}

export async function listProjects(orgId) {
  return prisma.project.findMany({ where: { organizationId: orgId }, include: { boundaries: true }, orderBy: { createdAt: 'desc' } });
}

export async function createProject(orgId, payload) {
  const boundary = Array.isArray(payload.boundary) ? payload.boundary : [];
  const metrics = boundaryMetrics(boundary);
  return prisma.project.create({
    data: {
      organizationId: orgId,
      name: payload.name || 'Untitled Project',
      objective: payload.objective || 'BALANCED',
      goal: payload.goal || 'BALANCED_PRACTICAL',
      boundaries: boundary.length ? { create: { geometry: boundary, ...metrics } } : undefined,
      landProfile: { create: { zoning: payload.zoning || null, constraints: payload.constraints || {}, assumptions: payload.assumptions || {} } }
    }
  });
}

export async function updateBoundary(projectId, boundary) {
  const metrics = boundaryMetrics(boundary);
  await prisma.projectBoundary.deleteMany({ where: { projectId } });
  return prisma.projectBoundary.create({ data: { projectId, geometry: boundary, ...metrics } });
}

export async function saveLandProfile(projectId, payload) {
  return prisma.landProfile.upsert({
    where: { projectId },
    update: { zoning: payload.zoning || null, constraints: payload.constraints || {}, assumptions: payload.assumptions || {} },
    create: { projectId, zoning: payload.zoning || null, constraints: payload.constraints || {}, assumptions: payload.assumptions || {} }
  });
}

export async function saveProjectStrategy(projectId, payload = {}) {
  const objective = payload.objective || 'BALANCED';
  const goal = payload.goal || objective;
  return prisma.project.update({ where: { id: projectId }, data: { objective, goal } });
}

export async function generateAndPersistScenarios(projectId) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { boundaries: true, landProfile: true } });
  if (!project) return [];
  const boundary = project?.boundaries?.[0]?.geometry || [];
  const scenarios = generateScenarios({ projectId, boundary, objective: project.objective, goal: project.goal, assumptions: project.landProfile?.assumptions || {} });

  await prisma.$transaction(async (tx) => {
    await tx.optimizationScore.deleteMany({ where: { projectId } });
    await tx.feasibilityReport.deleteMany({ where: { projectId } });
    await tx.layoutOption.deleteMany({ where: { projectId } });

    for (const scenario of scenarios) {
      const option = await tx.layoutOption.create({
        data: { projectId, scenarioType: scenario.name, fingerprint: `${projectId}:${scenario.id}:${scenario.optimizationScore}`, payload: scenario }
      });
      await tx.optimizationScore.create({
        data: {
          projectId,
          layoutOptionId: option.id,
          score: scenario.optimizationScore,
          breakdown: {
            yieldUnits: scenario.metrics.yieldUnits,
            revenue: scenario.metrics.revenue,
            margin: scenario.metrics.margin,
            deliveryMonths: scenario.metrics.deliveryMonths,
            roadEfficiency: scenario.layout.roadNetwork.efficiency,
            frontageEfficiency: scenario.layout.frontageEfficiency
          }
        }
      });
      await tx.feasibilityReport.create({
        data: {
          projectId,
          layoutOptionId: option.id,
          summary: `${scenario.name} delivers ${scenario.metrics.yieldUnits} units at ${scenario.feasibility} confidence`,
          payload: {
            scenarioId: scenario.id,
            confidence: scenario.feasibility,
            assumptions: project.landProfile?.assumptions || {},
            model: {
              constructionCost: scenario.metrics.cost,
              projectedRevenue: scenario.metrics.revenue,
              grossMargin: scenario.metrics.margin,
              timelineMonths: scenario.metrics.deliveryMonths
            }
          }
        }
      });
    }
  });

  return scenarios;
}

export async function getProjectState(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      boundaries: { orderBy: { createdAt: 'desc' } },
      landProfile: true,
      layoutOptions: { orderBy: { createdAt: 'desc' } },
      optimizationScores: true,
      feasibilityReports: true,
      recommendations: { orderBy: { createdAt: 'desc' } },
      comments: { orderBy: { createdAt: 'desc' } },
      activityLogs: { orderBy: { createdAt: 'desc' } },
      tasks: true,
      exports: { orderBy: { createdAt: 'desc' } },
      payments: { orderBy: { createdAt: 'desc' } }
    }
  });
  if (!project) return null;
  const boundary = project.boundaries[0]?.geometry || [];
  let scenarios = project.layoutOptions.map((option) => option.payload);
  if (!scenarios.length) scenarios = await generateAndPersistScenarios(projectId);
  return { project, boundary, scenarios };
}

export async function addComment(projectId, userId, body, scenarioId) {
  return prisma.comment.create({ data: { projectId, userId, body, scenarioId } });
}

export async function addTask(projectId, userId, title, dueDate) {
  return prisma.task.create({ data: { projectId, userId, title, status: 'OPEN', dueDate: dueDate ? new Date(dueDate) : null } });
}

export async function logActivity(projectId, userId, action, payload) {
  return prisma.activityLog.create({ data: { projectId, userId, action, payload: payload || {} } });
}
