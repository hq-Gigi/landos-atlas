import marketplaceHandler from '../marketplace';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    req.body = { ...(req.body || {}), kind: 'listing' };
  }
  const result = await marketplaceHandler(req, res);
  return result;
}
