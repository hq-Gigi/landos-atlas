import crypto from 'crypto';
import { prisma } from './prisma';
import { db as memoryDb } from './db';
import { generateScenarios } from './scenarioEngine';

const hasDatabase = Boolean(process.env.DATABASE_URL);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function createSessionToken() {
  return `sess_${crypto.randomUUID()}`;
}

async function createUser({ email, password, name }) {
  if (hasDatabase) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return null;
    return prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        name: name || email.split('@')[0]
      },
      select: { id: true, email: true, name: true }
    });
  }

  if (memoryDb.users.some((u) => u.email === email)) return null;
  const id = `u${memoryDb.users.length + 1}`;
  const user = { id, email, password: hashPassword(password), name: name || email.split('@')[0] };
  memoryDb.users.push(user);
  return { id, email, name: user.name };
}

async function loginUser({ email, password }) {
  if (hasDatabase) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) return null;
    return { id: user.id, email: user.email, name: user.name };
  }

  const user = memoryDb.users.find((u) => u.email === email && verifyPassword(password, u.password));
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name };
}

function createSession(userId) {
  const token = createSessionToken();
  memoryDb.sessions[token] = userId;
  return token;
}

function removeSession(token) {
  if (token) delete memoryDb.sessions[token];
}

async function listOrganizations() {
  if (hasDatabase) {
    return prisma.organization.findMany({ orderBy: { createdAt: 'desc' } });
  }

  return memoryDb.organizations;
}

async function createOrganization(name) {
  if (hasDatabase) {
    return prisma.organization.create({ data: { name } });
  }

  const id = `org${memoryDb.organizations.length + 1}`;
  const org = { id, name, createdAt: new Date().toISOString() };
  memoryDb.organizations.push(org);
  return org;
}

async function listProjects() {
  if (hasDatabase) {
    const projects = await prisma.project.findMany({
      include: { boundaries: true },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map((project) => {
      const boundary = project.boundaries[0]?.geometry || [];
      const scenarios = generateScenarios({
        projectId: project.id,
        boundary,
        objective: project.objective,
        goal: project.goal
      });
      return {
        id: project.id,
        orgId: project.organizationId,
        name: project.name,
        objective: project.objective,
        goal: project.goal,
        createdAt: project.createdAt,
        scenarios
      };
    });
  }

  return memoryDb.projects.map((project) => {
    const boundary = memoryDb.boundaries[project.id] || [];
    return {
      ...project,
      scenarios: generateScenarios({
        projectId: project.id,
        boundary,
        objective: project.objective,
        goal: project.goal
      })
    };
  });
}

async function createProject(payload) {
  const projectInput = {
    orgId: payload?.orgId || 'org1',
    name: payload?.name || 'Untitled Project',
    objective: payload?.objective || 'BALANCED',
    goal: payload?.goal || 'BALANCED_PRACTICAL',
    boundary: payload?.boundary || []
  };

  if (hasDatabase) {
    const project = await prisma.project.create({
      data: {
        organizationId: projectInput.orgId,
        name: projectInput.name,
        objective: projectInput.objective,
        goal: projectInput.goal,
        boundaries: {
          create: {
            geometry: projectInput.boundary
          }
        }
      }
    });

    return {
      id: project.id,
      orgId: project.organizationId,
      name: project.name,
      objective: project.objective,
      goal: project.goal,
      createdAt: project.createdAt
    };
  }

  const id = `p${memoryDb.projects.length + 1}`;
  const project = {
    id,
    orgId: projectInput.orgId,
    name: projectInput.name,
    objective: projectInput.objective,
    goal: projectInput.goal,
    createdAt: new Date().toISOString()
  };
  memoryDb.projects.push(project);
  memoryDb.boundaries[id] = projectInput.boundary;
  return project;
}

async function getProjectState(projectId) {
  if (hasDatabase) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        boundaries: true,
        layoutOptions: true,
        optimizationScores: true,
        feasibilityReports: true
      }
    });
    if (!project) return null;

    const boundary = project.boundaries[0]?.geometry || [];
    const scenarios =
      project.layoutOptions.length > 0
        ? project.layoutOptions.map((option) => ({
            id: option.id,
            name: option.scenarioType,
            units: option.payload?.units ?? null,
            avgUnitSize: option.payload?.avgUnitSize ?? null,
            estRevenue: option.payload?.estRevenue ?? null,
            score: project.optimizationScores.find((score) => score.layoutOptionId === option.id)?.score ?? null,
            feasibility: project.feasibilityReports.find((report) => report.payload?.layoutOptionId === option.id)?.payload ?? null
          }))
        : generateScenarios({
            projectId,
            boundary,
            objective: project.objective,
            goal: project.goal
          });

    return {
      project: {
        id: project.id,
        orgId: project.organizationId,
        name: project.name,
        objective: project.objective,
        goal: project.goal,
        createdAt: project.createdAt
      },
      boundary,
      scenarios
    };
  }

  const project = memoryDb.projects.find((p) => p.id === projectId);
  if (!project) return null;
  const boundary = memoryDb.boundaries[projectId] || [];
  const scenarios = generateScenarios({ projectId, boundary, objective: project.objective, goal: project.goal });
  return { project, boundary, scenarios };
}

export const platformStore = {
  hasDatabase,
  createUser,
  loginUser,
  createSession,
  removeSession,
  listOrganizations,
  createOrganization,
  listProjects,
  createProject,
  getProjectState
};
