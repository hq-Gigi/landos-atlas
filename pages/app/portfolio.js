import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '../../components/design/PageShell';

export default function Portfolio() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('atlas_token');
    const orgId = localStorage.getItem('atlas_org');
    if (!token || !orgId) return;
    fetch(`/api/projects?orgId=${orgId}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then(setProjects);
  }, []);

  return <PageShell><section className="mx-auto max-w-6xl px-6 py-12"><h1 className="text-4xl font-semibold">Portfolio</h1><ul className="mt-6 grid gap-3 md:grid-cols-2">{projects.map((p)=><li key={p.id}><Link className="glass-panel inline-block w-full p-4 transition hover:-translate-y-1" href={`/app/projects/${p.id}`}>{p.name}</Link></li>)}</ul></section></PageShell>;
}
