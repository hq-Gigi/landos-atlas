import { useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../../../components/NavBar';

export default function ProjectBillingPage(){
  const { query } = useRouter();
  const [response, setResponse] = useState(null);
  async function init(){
    const token = localStorage.getItem('atlas_token');
    const r = await fetch('/api/billing/initialize', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ projectId: query.projectId, amount: 50000, callbackUrl: window.location.href }) });
    setResponse(await r.json());
  }
  return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-4xl px-6 py-12"><h1 className="text-3xl font-bold">Project Billing</h1><button className="mt-4 rounded bg-cyan-500 px-3 py-2" onClick={init}>Initialize payment</button>{response && <pre className="mt-4 rounded bg-slate-900 p-3 text-xs">{JSON.stringify(response,null,2)}</pre>}</section></main>;
}
