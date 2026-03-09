// Deprecated: in-memory demo store removed.
// LandOS Atlas now uses Prisma/PostgreSQL persistence exclusively.
export const db = null;

export function getProjectState() {
  throw new Error('In-memory store removed. Use lib/platformStore with Prisma.');
}
