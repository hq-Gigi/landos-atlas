import { db } from '../../../lib/db';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const reference = `pay_${Date.now()}`;
  const payment = { reference, projectId: req.body?.projectId, amount: req.body?.amount || 50000, status: 'PENDING', createdAt: new Date().toISOString() };
  db.payments.push(payment);
  return res.status(200).json({ reference, authorizationUrl: `https://paystack.mock/authorize/${reference}` });
}
