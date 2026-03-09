import { useState } from 'react';
import NavBar from '../../components/NavBar';

export default function InvestmentPage() {
  const [projectId, setProjectId] = useState('');
  const [summary, setSummary] = useState(null);

  async function load() {
    const token = localStorage.getItem('atlas_token');
    const res = await fetch(`/api/projects/${projectId}/investor-summary`, { headers: { Authorization: `Bearer ${token}` } });
    setSummary(await res.json());
  }

  return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold">Investment Discovery</h1><p className="mt-2 text-slate-300">Review land intelligence, scenario outcomes, and financial projections for capital decisioning.</p><div className="mt-4 flex gap-2"><input className="flex-1 rounded bg-slate-900 px-3 py-2" placeholder="projectId" value={projectId} onChange={(e)=>setProjectId(e.target.value)} /><button className="rounded bg-cyan-500 px-3 py-2" onClick={load}>Load investor brief</button></div>{summary && <pre className="mt-4 overflow-auto rounded bg-slate-900 p-3 text-xs">{JSON.stringify(summary,null,2)}</pre>}</section></main>;
}
