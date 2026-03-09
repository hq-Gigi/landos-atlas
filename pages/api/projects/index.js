import { platformStore } from '../../../lib/platformStore';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const projects = await platformStore.listProjects();
    return res.status(200).json(projects);
  }

  if (req.method === 'POST') {
    const project = await platformStore.createProject(req.body);
    return res.status(201).json(project);
  }

  return res.status(405).end();
}
