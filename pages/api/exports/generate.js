import { db } from '../../../lib/db';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const payment = db.payments.find((p) => p.projectId === req.body?.projectId && p.status === 'SUCCESS');
  if (!payment) return res.status(403).json({ error: 'project exports locked until payment is verified' });
  const record = { id: `e${db.exports.length + 1}`, projectId: req.body.projectId, type: req.body.type || 'PDF', url: `/exports/${req.body.projectId}-${Date.now()}.${req.body.type === 'PNG' ? 'png' : req.body.type === 'SCR' ? 'scr' : 'pdf'}`, createdAt: new Date().toISOString() };
  db.exports.push(record);
  return res.status(201).json(record);
}
