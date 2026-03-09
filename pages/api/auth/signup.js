import { platformStore } from '../../../lib/platformStore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = await platformStore.createUser({ email, password, name });
  if (!user) return res.status(409).json({ error: 'email already exists' });

  return res.status(201).json(user);
}
