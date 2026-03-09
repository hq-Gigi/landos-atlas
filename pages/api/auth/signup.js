import { db } from '../../../lib/db';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const id = `u${db.users.length + 1}`;
  db.users.push({ id, email, password, name: name || email.split('@')[0] });
  return res.status(201).json({ id, email });
}
