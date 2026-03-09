import projectHandler from '../../[projectId]';
export default async function handler(req, res) {
  req.query.projectId = req.query.projectId;
  if (req.method === 'GET') return projectHandler({ ...req, method: 'GET' }, res);
  if (req.method === 'POST') {
    req.method = 'PATCH';
    req.body = { boundary: req.body?.boundary };
    return projectHandler(req, res);
  }
  return res.status(405).end();
}
