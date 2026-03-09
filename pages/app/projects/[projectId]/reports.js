import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../../../components/NavBar';

export default function Page(){
 const {query}=useRouter();
 const [reports,setReports]=useState([]);
 const [type,setType]=useState('PDF');
 async function load(){ const token=localStorage.getItem('atlas_token'); const r=await fetch(`/api/projects/${query.projectId}/reports`,{headers:{Authorization:`Bearer ${token}`}}); setReports(await r.json()); }
 useEffect(()=>{ if(query.projectId) load(); },[query.projectId]);
 async function create(){ const token=localStorage.getItem('atlas_token'); await fetch('/api/exports/generate',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({projectId:query.projectId,type})}); load(); }
 return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold capitalize">Reports & Exports</h1><div className="mt-3 flex gap-2"><select className="rounded bg-slate-900 px-3 py-2" value={type} onChange={(e)=>setType(e.target.value)}><option>PDF</option><option>SCR</option><option>PNG</option></select><button className="rounded bg-cyan-500 px-3 py-2" onClick={create}>Generate export (requires paid project)</button></div><div className="mt-4 space-y-3">{reports.map((r)=><div key={r.id} className="rounded border border-white/10 p-3">{r.type} · {r.status} · <a className="text-cyan-300" href={r.url} target="_blank">{r.url}</a></div>)}</div></section></main>
}
