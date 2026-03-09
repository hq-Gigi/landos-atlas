import { prisma } from './prisma';

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function buildListingCreateData(input, organizationId) {
  return {
    organizationId,
    projectId: input.projectId || null,
    title: String(input.title || '').trim(),
    summary: String(input.summary || '').trim(),
    location: input.location ? String(input.location).trim() : null,
    geometry: input.geometry || null,
    askPrice: toNumberOrNull(input.askPrice),
    listingType: String(input.listingType || 'DIRECT_SALE').trim(),
    status: String(input.status || 'OPEN').trim(),
    areaSqm: toNumberOrNull(input.areaSqm),
    frontageM: toNumberOrNull(input.frontageM),
    payload: input.payload || {}
  };
}

export function buildOpportunityCreateData(input, organizationId) {
  return {
    organizationId,
    projectId: input.projectId || null,
    scenarioId: input.scenarioId || null,
    title: String(input.title || '').trim(),
    summary: String(input.summary || '').trim(),
    type: String(input.type || 'JV').trim(),
    status: String(input.status || 'OPEN').trim(),
    feasibilityHighlight: input.feasibilityHighlight ? String(input.feasibilityHighlight).trim() : null,
    investmentSignals: input.investmentSignals || null,
    payload: input.payload || {}
  };
}

export function validateMarketplacePayload(payload) {
  if (!String(payload.title || '').trim()) return 'title is required';
  if (!String(payload.summary || '').trim()) return 'summary is required';
  return null;
}

export async function getProjectIntel(projectId) {
  if (!projectId) return null;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      boundaries: { orderBy: { createdAt: 'desc' }, take: 1 },
      layoutOptions: true,
      feasibilityReports: { orderBy: { id: 'desc' }, take: 3 },
      recommendations: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });
  if (!project) return null;

  const boundary = project.boundaries[0] || null;
  const latestFeasibility = project.feasibilityReports[0] || null;

  return {
    id: project.id,
    name: project.name,
    objective: project.objective,
    goal: project.goal,
    boundary,
    scenarioCount: project.layoutOptions.length,
    feasibilitySummary: latestFeasibility?.summary || null,
    aiSummary: project.recommendations[0]?.payload?.projectInsights || null
  };
}

export function withSearchFilter(items, search) {
  const q = String(search || '').trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => `${item.title} ${item.summary || ''} ${item.location || ''}`.toLowerCase().includes(q));
}
