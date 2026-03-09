import { db } from '../../../lib/db';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const reference = req.body?.reference;
  const payment = db.payments.find((p) => p.reference === reference);
  if (!payment) return res.status(404).json({ error: 'payment not found' });
  payment.status = 'SUCCESS';
  return res.status(200).json({ ok: true, reference, status: 'SUCCESS' });
}
