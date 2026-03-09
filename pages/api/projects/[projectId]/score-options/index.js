import scenariosHandler from '../../[projectId]/scenarios';
export default async function handler(req, res) {
  req.query.projectId = req.query.projectId;
  req.method = 'POST';
  return scenariosHandler(req, res);
}
