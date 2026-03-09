import { platformStore } from '../../../lib/platformStore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = await platformStore.loginUser({ email, password });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });

  const token = platformStore.createSession(user.id);
  return res.status(200).json({ token, user });
}
