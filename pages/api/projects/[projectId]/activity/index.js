import collaborationHandler from '../../[projectId]/collaboration';
export default async function handler(req, res) {
  req.query.projectId = req.query.projectId;
  req.method = 'GET';
  return collaborationHandler(req, res);
}
