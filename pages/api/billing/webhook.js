import crypto from 'crypto';
import { prisma } from '../../../lib/prisma';
import { unlockProjectPremiumExports } from '../../../lib/paymentUnlock';

export const config = {
  api: { bodyParser: false }
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const bodyBuffer = await readRawBody(req);
  const signature = req.headers['x-paystack-signature'];
  if (process.env.PAYSTACK_SECRET_KEY) {
    if (!signature) return res.status(401).json({ error: 'missing_signature' });
    const expected = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(bodyBuffer).digest('hex');
    if (expected !== signature) return res.status(401).json({ error: 'invalid_signature' });
  }

  const payload = JSON.parse(bodyBuffer.toString('utf8'));
  const reference = payload?.data?.reference;
  const event = payload?.event;
  if (!reference) return res.status(400).json({ error: 'missing_reference' });
  if (!['charge.success', 'charge.failed'].includes(event)) return res.status(200).json({ ok: true, ignored: true });

  const status = event === 'charge.success' ? 'SUCCESS' : 'FAILED';
  await prisma.payment.updateMany({
    where: { reference },
    data: { status, metadata: { webhook: payload } }
  });

  if (status === 'SUCCESS') {
    const payment = await prisma.payment.findUnique({ where: { reference }, select: { projectId: true } });
    if (payment?.projectId) await unlockProjectPremiumExports(payment.projectId, reference);
  }

  return res.status(200).json({ ok: true });
}
