import { createSession, setSessionCookie } from '../../../lib/auth';
import { createUser, createOrganizationForUser } from '../../../lib/platformStore';
import { validateAuthPayload } from '../../../lib/validation';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, name, organizationName } = req.body || {};
  const error = validateAuthPayload({ email, password });
  if (error) return res.status(400).json({ error });

  const user = await createUser({ email, password, name });
  if (!user) return res.status(409).json({ error: 'email already exists' });
  const org = await createOrganizationForUser(user.id, organizationName || `${user.name} Organization`);
  const token = await createSession(user.id);
  setSessionCookie(res, token);

  return res.status(201).json({ user, organizationId: org.id, token });
}
