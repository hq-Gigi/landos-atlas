import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../../../components/NavBar';

export default function Page(){
 const {query}=useRouter();
 const [data,setData]=useState(null);
 useEffect(()=>{ if(!query.projectId) return; const token=localStorage.getItem('atlas_token'); fetch(`/api/projects/${query.projectId}/feasibility`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(setData); },[query.projectId]);
 return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold capitalize">Feasibility</h1><p className="mt-3 text-slate-300">Top: {data?.selectedScenario?.name} ({data?.selectedScenario?.feasibility})</p><ul className="mt-4 space-y-2">{data?.comparison?.map((s)=><li key={s.id} className="rounded border border-white/10 p-2">{s.name} · score {s.score} · margin {s.margin}</li>)}</ul></section></main>
}
