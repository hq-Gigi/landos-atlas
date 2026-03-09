import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../../../components/NavBar';

export default function ActivityPage(){
  const { query } = useRouter();
  const [activity, setActivity] = useState([]);
  useEffect(() => {
    if (!query.projectId) return;
    const token = localStorage.getItem('atlas_token');
    fetch(`/api/projects/${query.projectId}/collaboration`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((x) => setActivity(x.activity || []));
  }, [query.projectId]);

  return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold">Activity</h1><div className="mt-4 space-y-2">{activity.map((a)=><div key={a.id} className="rounded border border-white/10 p-3">{new Date(a.createdAt).toLocaleString()} · {a.action}</div>)}</div></section></main>;
}
