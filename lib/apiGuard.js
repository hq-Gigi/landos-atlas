import { prisma } from './prisma';
import { resolveUserFromRequest } from './auth';
import { createRateLimiter } from './rateLimit';


const defaultApiLimiter = createRateLimiter({ prefix: 'api-default', limit: 120, windowMs: 60_000 });

export function enforceRateLimit(req, res, options) {
  const limiter = options ? createRateLimiter(options) : defaultApiLimiter;
  return limiter(req, res);
}

export async function requireUser(req, res) {
  const user = await resolveUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'unauthorized' });
    return null;
  }
  return user;
}

export async function requireProjectAccess(req, res, projectId) {
  const user = await requireUser(req, res);
  if (!user) return null;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { organization: { include: { members: true } } }
  });
  if (!project) {
    res.status(404).json({ error: 'project not found' });
    return null;
  }
  const member = project.organization.members.find((m) => m.userId === user.id);
  if (!member) {
    res.status(403).json({ error: 'forbidden' });
    return null;
  }
  return { user, project, member };
}

export async function requireOrgMembership(req, res, organizationId, allowedRoles = ['OWNER', 'ADMIN', 'ANALYST']) {
  const user = await requireUser(req, res);
  if (!user) return null;
  const membership = user.organizationMembers.find((member) => member.organizationId === organizationId);
  if (!membership) {
    res.status(403).json({ error: 'forbidden' });
    return null;
  }
  if (!allowedRoles.includes(membership.role)) {
    res.status(403).json({ error: 'insufficient role' });
    return null;
  }
  return { user, membership };
}
