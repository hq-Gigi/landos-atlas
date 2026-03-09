import exportHandler from '../../../../exports/generate';
export default async function handler(req, res) {
  req.method = 'POST';
  req.body = { projectId: req.query.projectId, type: 'PDF' };
  return exportHandler(req, res);
}
