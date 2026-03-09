import { db } from '../../../../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(db.exports.filter((e) => e.projectId === req.query.projectId));
  }
  return res.status(405).end();
}
