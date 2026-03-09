import { generateScenarios } from './scenarioEngine';

const now = new Date().toISOString();

export const db = {
  users: [{ id: 'u1', email: 'demo@gigilabs.com', password: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', name: 'Atlas Demo Owner' }],
  sessions: {},
  organizations: [{ id: 'org1', name: 'GIGI Atlas Demo Org', createdAt: now }],
  members: [{ orgId: 'org1', userId: 'u1', role: 'OWNER' }],
  projects: [{ id: 'p1', orgId: 'org1', name: 'Lekki Corridor Parcel', objective: 'BALANCED', goal: 'MAXIMIZE_MARGIN', createdAt: now }],
  boundaries: {
    p1: [{ lat: 6.437, lng: 3.562 }, { lat: 6.438, lng: 3.566 }, { lat: 6.434, lng: 3.568 }, { lat: 6.432, lng: 3.563 }]
  },
  comments: [{ id: 'c1', projectId: 'p1', body: 'Validate access roads before premium scenario approval.', author: 'Atlas Demo Owner', scenarioId: 'p1-scenario-2', createdAt: now }],
  activities: [{ id: 'a1', projectId: 'p1', action: 'PROJECT_CREATED', actor: 'Atlas Demo Owner', createdAt: now }],
  exports: [],
  payments: [],
  listings: [{ id: 'l1', title: 'Mixed-use parcel in Lekki', status: 'OPEN' }],
  opportunities: [{ id: 'o1', title: 'Transit-oriented estate strategy', type: 'JV' }]
};

export function getProjectState(projectId) {
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;
  const boundary = db.boundaries[projectId] || [];
  const scenarios = generateScenarios({ projectId, boundary, objective: project.objective, goal: project.goal });
  return { project, boundary, scenarios };
}
