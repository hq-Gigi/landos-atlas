import { prisma } from '../../lib/prisma';

export default async function handler(_req, res) {
  let database = 'down';
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'up';
  } catch {
    database = 'down';
  }

  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const paystackConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY);

  const status = database === 'up' ? 'ok' : 'degraded';
  res.status(status === 'ok' ? 200 : 503).json({
    status,
    service: 'landos-atlas',
    timestamp: new Date().toISOString(),
    dependencies: {
      database,
      openAiConfigured,
      paystackConfigured
    }
  });
}
