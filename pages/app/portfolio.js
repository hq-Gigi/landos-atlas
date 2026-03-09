import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import Link from 'next/link';

export default function Portfolio() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('atlas_token');
    const orgId = localStorage.getItem('atlas_org');
    if (!token || !orgId) return;
    fetch(`/api/projects?orgId=${orgId}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then(setProjects);
  }, []);

  return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-6xl px-6 py-12"><h1 className="text-3xl font-bold">Portfolio</h1><ul className="mt-6 space-y-3">{projects.map((p)=><li key={p.id}><Link className="rounded border border-white/10 p-3 inline-block" href={`/app/projects/${p.id}`}>{p.name}</Link></li>)}</ul></section></main>;
}
