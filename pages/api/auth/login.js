import { db } from '../../../lib/db';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body || {};
  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const token = `sess_${Date.now()}`;
  db.sessions[token] = user.id;
  return res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
