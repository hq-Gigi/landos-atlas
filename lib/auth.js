import crypto from 'crypto';
import { prisma } from './prisma';

const SESSION_TTL_DAYS = 14;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, digest) {
  const [salt, expected] = (digest || '').split(':');
  if (!salt || !expected) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
}

export async function createSession(userId) {
  const token = `sess_${crypto.randomUUID()}_${crypto.randomBytes(8).toString('hex')}`;
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  return token;
}

export async function deleteSession(token) {
  if (!token) return;
  await prisma.session.deleteMany({ where: { token } });
}

export async function resolveUserFromRequest(req) {
  const header = req.headers.authorization?.replace('Bearer ', '');
  const cookieToken = req.headers.cookie?.split(';').map((item) => item.trim()).find((x) => x.startsWith('atlas_session='))?.replace('atlas_session=', '');
  const token = header || cookieToken;
  if (!token) return null;

  const session = await prisma.session.findFirst({
    where: { token, expiresAt: { gt: new Date() } },
    include: {
      user: {
        include: {
          organizationMembers: true
        }
      }
    }
  });

  if (!session) return null;
  return session.user;
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `atlas_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_DAYS * 24 * 60 * 60}`);
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'atlas_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
}
