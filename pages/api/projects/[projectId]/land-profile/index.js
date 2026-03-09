import projectHandler from '../../[projectId]';
export default async function handler(req, res) {
  req.query.projectId = req.query.projectId;
  if (req.method !== 'POST') return res.status(405).end();
  req.method = 'PATCH';
  req.body = { landProfile: req.body || {} };
  return projectHandler(req, res);
}
