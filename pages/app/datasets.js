import { useState } from 'react';
import NavBar from '../../components/NavBar';

export default function DatasetsPage() {
  const [data, setData] = useState(null);

  async function load(method='GET') {
    const token = localStorage.getItem('atlas_token');
    const res = await fetch('/api/datasets/land-intelligence', { method, headers: { Authorization: `Bearer ${token}` } });
    setData(await res.json());
  }

  return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold">Global Land Dataset</h1><p className="mt-2 text-slate-300">Anonymized aggregate intelligence snapshots for enterprise customers.</p><div className="mt-4 flex gap-2"><button className="rounded bg-cyan-500 px-3 py-2" onClick={()=>load('GET')}>Load latest snapshot</button><button className="rounded border border-cyan-300 px-3 py-2" onClick={()=>load('POST')}>Refresh snapshot</button></div>{data && <pre className="mt-4 rounded bg-slate-900 p-3 text-xs">{JSON.stringify(data,null,2)}</pre>}</section></main>;
}
