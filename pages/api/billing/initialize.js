import { prisma } from '../../../lib/prisma';
import { requireProjectAccess } from '../../../lib/apiGuard';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  req.query.projectId = req.body?.projectId;
  const access = await requireProjectAccess(req, res, req.body?.projectId);
  if (!access) return;

  const reference = `pay_${Date.now()}_${Math.round(Math.random() * 1000)}`;
  const amount = Number(req.body?.amount || 50000);

  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  let authorizationUrl = `/app/billing?dev_ref=${reference}`;
  let mode = 'dev-fallback';

  if (paystackKey) {
    const callbackUrl = req.body?.callbackUrl || `${req.headers.origin || ''}/app/billing`;
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: access.user.email, amount: amount * 100, reference, metadata: { projectId: req.body.projectId }, callback_url: callbackUrl })
    });

    if (!response.ok) return res.status(502).json({ error: 'paystack_initialize_failed' });
    const result = await response.json();
    authorizationUrl = result.data?.authorization_url;
    mode = 'paystack';
  }

  const payment = await prisma.payment.create({
    data: {
      reference,
      projectId: req.body.projectId,
      provider: 'paystack',
      status: 'PENDING',
      amount,
      metadata: { email: access.user.email, mode }
    }
  });

  return res.status(200).json({ reference, authorizationUrl, mode, payment });
}
