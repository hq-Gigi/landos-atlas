import { useState } from 'react';
import NavBar from '../../components/NavBar';

export default function Billing(){
  const [projectId,setProjectId]=useState('');
  const [payment,setPayment]=useState(null);
  const [projectState,setProjectState]=useState(null);
  async function start(){ const token=localStorage.getItem('atlas_token'); const r=await fetch('/api/billing/initialize',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({projectId,amount:50000,callbackUrl:window.location.href})}); setPayment(await r.json()); }
  async function verify(){ if(!payment?.reference) return; const r=await fetch(`/api/billing/verify?reference=${payment.reference}`); setPayment(await r.json()); }
  async function loadProject(){ const token=localStorage.getItem('atlas_token'); const r=await fetch(`/api/projects/${projectId}`,{headers:{Authorization:`Bearer ${token}`}}); setProjectState(await r.json()); }
  return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-4xl px-6 py-12"><h1 className="text-3xl font-bold">Billing / Unlocks</h1><input className="mt-4 w-full rounded bg-slate-900 px-3 py-2" placeholder="projectId" value={projectId} onChange={(e)=>setProjectId(e.target.value)} /><div className="mt-3 flex gap-2"><button className="rounded bg-cyan-500 px-3 py-2" onClick={start}>Initialize Paystack Charge</button><button className="rounded border border-white/30 px-3 py-2" onClick={verify}>Verify</button><button className="rounded border border-cyan-500 px-3 py-2" onClick={loadProject}>Load billing history</button></div>{payment && <pre className="mt-4 rounded bg-slate-900 p-3 text-xs">{JSON.stringify(payment,null,2)}</pre>}{projectState?.project?.payments?.length>0 && <pre className="mt-4 rounded bg-slate-900 p-3 text-xs">{JSON.stringify(projectState.project.payments,null,2)}</pre>}</section></main>
}
