import { prisma } from '../../../lib/prisma';
import { unlockProjectPremiumExports } from '../../../lib/paymentUnlock';

export default async function handler(req, res) {
  const reference = req.query.reference;
  if (!reference) return res.status(400).json({ error: 'reference required' });
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) return res.status(404).json({ error: 'payment not found' });

  if (!process.env.PAYSTACK_SECRET_KEY) {
    if (payment.status === 'PENDING') {
      const updated = await prisma.payment.update({ where: { reference }, data: { status: 'SUCCESS', metadata: { ...(payment.metadata || {}), verifiedBy: 'dev-fallback' } } });
      await unlockProjectPremiumExports(updated.projectId, reference);
      return res.status(200).json(updated);
    }
    return res.status(200).json(payment);
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
  });
  if (!response.ok) return res.status(502).json({ error: 'paystack_verify_failed' });
  const result = await response.json();
  const success = result?.data?.status === 'success';

  const updated = await prisma.payment.update({
    where: { reference },
    data: { status: success ? 'SUCCESS' : 'FAILED', metadata: { ...(payment.metadata || {}), verification: result?.data || {} } }
  });

  if (success) await unlockProjectPremiumExports(updated.projectId, reference);

  return res.status(200).json(updated);
}
