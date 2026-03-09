import { db, getProjectState } from '../../../lib/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(db.projects.map((p) => ({ ...p, scenarios: getProjectState(p.id)?.scenarios || [] })));
  }
  if (req.method === 'POST') {
    const id = `p${db.projects.length + 1}`;
    const project = { id, orgId: req.body?.orgId || 'org1', name: req.body?.name || `Project ${id}`, objective: req.body?.objective || 'BALANCED', goal: req.body?.goal || 'BALANCED_PRACTICAL', createdAt: new Date().toISOString() };
    db.projects.push(project);
    db.boundaries[id] = req.body?.boundary || [];
    return res.status(201).json(project);
  }
  return res.status(405).end();
}
