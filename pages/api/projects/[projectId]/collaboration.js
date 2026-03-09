import { prisma } from '../../../../lib/prisma';
import { requireProjectAccess } from '../../../../lib/apiGuard';
import { addComment, addTask, logActivity } from '../../../../lib/platformStore';

export default async function handler(req, res) {
  const { projectId } = req.query;
  const access = await requireProjectAccess(req, res, projectId);
  if (!access) return;

  if (req.method === 'POST') {
    const { type, body, title, dueDate } = req.body || {};
    if (type === 'comment') {
      const comment = await addComment(projectId, access.user.id, body || '', req.body?.scenarioId || null);
      await logActivity(projectId, access.user.id, 'COMMENT_ADDED', { commentId: comment.id });
      return res.status(201).json(comment);
    }
    if (type === 'task') {
      const task = await addTask(projectId, access.user.id, title || 'Untitled task', dueDate);
      await logActivity(projectId, access.user.id, 'TASK_CREATED', { taskId: task.id });
      return res.status(201).json(task);
    }
    return res.status(400).json({ error: 'unknown collaboration type' });
  }

  const [comments, tasks, activity] = await Promise.all([
    prisma.comment.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.task.findMany({ where: { projectId }, orderBy: { dueDate: 'asc' } }),
    prisma.activityLog.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, take: 200 })
  ]);
  return res.status(200).json({ comments, tasks, activity });
}
