import { clearSessionCookie, deleteSession } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const token = req.headers.authorization?.replace('Bearer ', '') || req.headers.cookie?.split(';').map((item) => item.trim()).find((x) => x.startsWith('atlas_session='))?.replace('atlas_session=', '');
  await deleteSession(token);
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
