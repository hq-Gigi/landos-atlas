import collaborationHandler from '../../[projectId]/collaboration';
export default async function handler(req, res) {
  req.query.projectId = req.query.projectId;
  if (req.method === 'GET') return collaborationHandler(req, res);
  if (req.method === 'POST') {
    req.body = { ...(req.body || {}), type: 'comment' };
    return collaborationHandler(req, res);
  }
  return res.status(405).end();
}
