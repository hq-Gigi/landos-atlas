import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import NavBar from '../../../../components/NavBar';

const tabs = ['scenarios', 'optimization', 'feasibility', 'reports', 'collaboration', 'activity', 'billing'];
const defaultBoundary = [
  { lat: 6.437, lng: 3.562 },
  { lat: 6.438, lng: 3.566 },
  { lat: 6.434, lng: 3.568 },
  { lat: 6.432, lng: 3.563 }
];

export default function ProjectWorkspace() {
  const { query } = useRouter();
  const [state, setState] = useState(null);
  const [boundaryText, setBoundaryText] = useState('');
  const [zoning, setZoning] = useState('Mixed Use');
  const [cost, setCost] = useState('55000');
  const [recommendation, setRecommendation] = useState(null);
  const [billing, setBilling] = useState(null);

  async function load() {
    if (!query.projectId) return;
    const token = localStorage.getItem('atlas_token');
    const response = await fetch(`/api/projects/${query.projectId}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    setState(data);
    setBoundaryText(JSON.stringify((data.boundary?.length ? data.boundary : defaultBoundary), null, 2));
    setZoning(data.project?.landProfile?.zoning || 'Mixed Use');
  }

  useEffect(() => { load(); }, [query.projectId]);

  const topScenario = useMemo(() => {
    const list = state?.scenarios || [];
    return [...list].sort((a, b) => b.optimizationScore - a.optimizationScore)[0];
  }, [state]);

  async function saveBoundaryAndProfile() {
    const token = localStorage.getItem('atlas_token');
    await fetch(`/api/projects/${query.projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        boundary: JSON.parse(boundaryText),
        landProfile: {
          zoning,
          assumptions: { constructionCostPerUnit: Number(cost), salePricePerUnit: 90000, timelineBaseMonths: 14 }
        }
      })
    });
    await fetch(`/api/projects/${query.projectId}/scenarios`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    load();
  }

  async function runAI() {
    const token = localStorage.getItem('atlas_token');
    const r = await fetch('/api/ai/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ projectId: query.projectId, audience: 'board' }) });
    const data = await r.json();
    setRecommendation(data.recommendation);
    load();
  }

  async function initializePayment() {
    const token = localStorage.getItem('atlas_token');
    const r = await fetch('/api/billing/initialize', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ projectId: query.projectId, amount: 50000 }) });
    setBilling(await r.json());
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <NavBar />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">{state?.project?.name || `Project ${query.projectId}`}</h1>
        <p className="mt-2 text-slate-300">Overview · Map & Boundary (editable) · Land Profile · Scenario Options · Optimization Scores · Feasibility · Reports & Exports · Collaboration · Activity · Billing</p>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded border border-white/10 p-3">Top Score: {topScenario?.optimizationScore || '-'}</div>
          <div className="rounded border border-white/10 p-3">Boundary points: {state?.boundary?.length || 0}</div>
          <div className="rounded border border-white/10 p-3">Comments: {state?.project?.comments?.length || 0}</div>
          <div className="rounded border border-white/10 p-3">Paid unlocks: {(state?.project?.payments || []).filter((p) => p.status === 'SUCCESS').length}</div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 p-4">
            <h2 className="font-semibold">Map & Boundary (editable)</h2>
            <textarea className="mt-3 h-48 w-full rounded bg-slate-900 p-2 text-xs" value={boundaryText} onChange={(e) => setBoundaryText(e.target.value)} />
            <button className="mt-3 rounded bg-cyan-500 px-3 py-2" onClick={saveBoundaryAndProfile}>Save boundary + recompute scenarios</button>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <h2 className="font-semibold">Land Profile + AI</h2>
            <input className="mt-3 w-full rounded bg-slate-900 px-3 py-2" value={zoning} onChange={(e) => setZoning(e.target.value)} placeholder="Zoning" />
            <input className="mt-2 w-full rounded bg-slate-900 px-3 py-2" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Construction cost per unit" />
            <button className="mt-3 rounded border border-cyan-300 px-3 py-2" onClick={runAI}>Generate board recommendation</button>
            {recommendation && <p className="mt-3 text-sm text-slate-300">{recommendation.payload?.boardMemo || recommendation.payload?.summary}</p>}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-white/10 p-4">
          <h2 className="font-semibold">Billing / Unlocks</h2>
          <button className="mt-3 rounded bg-fuchsia-500 px-3 py-2" onClick={initializePayment}>Initialize export unlock payment</button>
          {billing && <pre className="mt-3 overflow-auto rounded bg-slate-900 p-3 text-xs">{JSON.stringify(billing, null, 2)}</pre>}
        </div>

        <div className="mt-6 flex gap-3">{tabs.map((t)=><Link key={t} className="rounded border border-white/10 px-3 py-2" href={`/app/projects/${query.projectId}/${t}`}>{t}</Link>)}</div>
      </section>
    </main>
  );
}
