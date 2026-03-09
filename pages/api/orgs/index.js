import { db } from '../../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') return res.status(200).json(db.organizations);
  if (req.method === 'POST') {
    const id = `org${db.organizations.length + 1}`;
    const org = { id, name: req.body?.name || `Organization ${id}`, createdAt: new Date().toISOString() };
    db.organizations.push(org);
    return res.status(201).json(org);
  }
  return res.status(405).end();
}
