import recommendHandler from '../../../ai/recommend';
export default async function handler(req, res) {
  req.body = { ...(req.body || {}), projectId: req.query.projectId };
  req.method = 'POST';
  return recommendHandler(req, res);
}
