import { prisma } from '../../../../../lib/prisma';
import { requireProjectAccess } from '../../../../../lib/apiGuard';
import { addComment, addTask, logActivity } from '../../../../../lib/platformStore';

export default async function handler(req, res) {
  const access = await requireProjectAccess(req, res, req.query.projectId);
  if (!access) return;

  if (req.method === 'GET') {
    const [comments, activity, tasks] = await Promise.all([
      prisma.comment.findMany({ where: { projectId: req.query.projectId }, orderBy: { createdAt: 'desc' } }),
      prisma.activityLog.findMany({ where: { projectId: req.query.projectId }, orderBy: { createdAt: 'desc' } }),
      prisma.task.findMany({ where: { projectId: req.query.projectId }, orderBy: { id: 'desc' } })
    ]);
    return res.status(200).json({ comments, activity, tasks });
  }

  if (req.method === 'POST') {
    if (req.body?.type === 'task') {
      const task = await addTask(req.query.projectId, access.user.id, req.body.title, req.body.dueDate);
      await logActivity(req.query.projectId, access.user.id, 'TASK_CREATED', { taskId: task.id });
      return res.status(201).json(task);
    }
    const comment = await addComment(req.query.projectId, access.user.id, req.body?.body, req.body?.scenarioId || null);
    await logActivity(req.query.projectId, access.user.id, 'COMMENT_ADDED', { commentId: comment.id, scenarioId: comment.scenarioId });
    return res.status(201).json(comment);
  }

  return res.status(405).end();
}
