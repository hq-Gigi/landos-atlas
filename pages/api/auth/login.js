import { createSession, setSessionCookie } from '../../../lib/auth';
import { listOrganizationsForUser, loginUser } from '../../../lib/platformStore';
import { validateAuthPayload } from '../../../lib/validation';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  const error = validateAuthPayload({ email, password });
  if (error) return res.status(400).json({ error });

  const user = await loginUser({ email, password });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const token = await createSession(user.id);
  setSessionCookie(res, token);

  const organizations = await listOrganizationsForUser(user.id);
  return res.status(200).json({
    user,
    organizationId: organizations[0]?.id || null
  });
}
