import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../../../components/NavBar';

export default function Page(){
 const {query}=useRouter();
 const [scenarios,setScenarios]=useState([]);
 useEffect(()=>{ if(!query.projectId) return; const token=localStorage.getItem('atlas_token'); fetch(`/api/projects/${query.projectId}/scenarios`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(setScenarios); },[query.projectId]);
 async function regenerate(){ const token=localStorage.getItem('atlas_token'); const r=await fetch(`/api/projects/${query.projectId}/scenarios`,{method:'POST',headers:{Authorization:`Bearer ${token}`}}); setScenarios(await r.json()); }
 return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold capitalize">Scenarios</h1><button className="mt-3 rounded bg-cyan-500 px-3 py-2" onClick={regenerate}>Regenerate deterministic scenarios</button><div className="mt-4 space-y-3">{scenarios.map((s)=><div key={s.id} className="rounded border border-white/10 p-3"><p className="font-semibold">{s.name}</p><p className="text-sm text-slate-300">Units {s.metrics?.yieldUnits} · Score {s.optimizationScore} · Feasibility {s.feasibility}</p></div>)}</div></section></main>
}
