import { db } from '../../../../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ comments: db.comments.filter((c) => c.projectId === req.query.projectId), activity: db.activities.filter((a) => a.projectId === req.query.projectId) });
  }
  if (req.method === 'POST') {
    const comment = { id: `c${db.comments.length + 1}`, projectId: req.query.projectId, body: req.body?.body, author: req.body?.author || 'Unknown', scenarioId: req.body?.scenarioId, createdAt: new Date().toISOString() };
    db.comments.push(comment);
    return res.status(201).json(comment);
  }
  return res.status(405).end();
}
