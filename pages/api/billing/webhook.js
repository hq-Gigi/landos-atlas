import crypto from 'crypto';
import { prisma } from '../../../lib/prisma';

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
  if (process.env.PAYSTACK_SECRET_KEY && signature) {
    const expected = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(bodyBuffer).digest('hex');
    if (expected !== signature) return res.status(401).json({ error: 'invalid_signature' });
  }

  const payload = JSON.parse(bodyBuffer.toString('utf8'));
  const reference = payload?.data?.reference;
  const success = payload?.event === 'charge.success';
  if (!reference) return res.status(400).json({ error: 'missing_reference' });

  await prisma.payment.updateMany({
    where: { reference },
    data: { status: success ? 'SUCCESS' : 'FAILED', metadata: { webhook: payload } }
  });

  return res.status(200).json({ ok: true });
}
