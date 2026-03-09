import { db } from '../../../lib/db';

export default function handler(req, res) {
  const reference = req.query.reference;
  const payment = db.payments.find((p) => p.reference === reference);
  if (!payment) return res.status(404).json({ error: 'payment not found' });
  return res.status(200).json(payment);
}
