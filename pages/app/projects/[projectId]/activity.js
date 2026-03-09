import { useEffect, useState } from 'react';
import PageShell from '../../../../components/design/PageShell';
import { fetchWithAuth } from '../../../../lib/clientAuth';
import { requirePageAuth } from '../../../../lib/ssrAuth';

export default function ActivityPage({ projectId }) {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (!projectId) return;
    fetchWithAuth(`/api/projects/${projectId}/collaboration`).then((x) => setActivity(x.activity || [])).catch(() => setActivity([]));
  }, [projectId]);

  return <PageShell><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold">Activity</h1><div className="mt-4 space-y-2">{activity.map((a) => <div key={a.id} className="glass-panel p-3">{new Date(a.createdAt).toLocaleString()} · {a.action}</div>)}</div></section></PageShell>;
}

export const getServerSideProps = requirePageAuth(({ params }) => ({ projectId: params.projectId }));
