import { platformStore } from '../../../lib/platformStore';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const token = req.headers.authorization?.replace('Bearer ', '');
  platformStore.removeSession(token);
  return res.status(200).json({ ok: true });
}
