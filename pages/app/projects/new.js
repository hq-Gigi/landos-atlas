import { useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../../components/NavBar';

const seedBoundary = [
  { lat: 6.437, lng: 3.562 },
  { lat: 6.438, lng: 3.566 },
  { lat: 6.434, lng: 3.568 },
  { lat: 6.432, lng: 3.563 }
];

export default function NewProject() {
  const [name, setName] = useState('Lekki Corridor Parcel');
  const [objective, setObjective] = useState('BALANCED');
  const [goal, setGoal] = useState('MAXIMIZE_MARGIN');
  const [query, setQuery] = useState('Lekki, Lagos');
  const [locations, setLocations] = useState([]);
  const [boundaryText, setBoundaryText] = useState(JSON.stringify(seedBoundary, null, 2));
  const [constructionCostPerUnit, setConstructionCostPerUnit] = useState('55000');
  const [salePricePerUnit, setSalePricePerUnit] = useState('90000');
  const [timelineBaseMonths, setTimelineBaseMonths] = useState('14');
  const router = useRouter();

  async function searchLocation() {
    const res = await fetch(`/api/geo/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setLocations(Array.isArray(data) ? data : []);
  }

  async function createProject() {
    const token = localStorage.getItem('atlas_token');
    const orgId = localStorage.getItem('atlas_org');
    const boundary = JSON.parse(boundaryText);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        orgId,
        name,
        objective,
        goal,
        boundary,
        assumptions: {
          constructionCostPerUnit: Number(constructionCostPerUnit),
          salePricePerUnit: Number(salePricePerUnit),
          timelineBaseMonths: Number(timelineBaseMonths)
        }
      })
    });
    const data = await res.json();
    if (res.ok) router.push(`/app/projects/${data.id}`);
  }

  return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold">Create Project</h1><p className="mt-2 text-slate-300">Search location, define boundary polygon, set objective + assumptions, and launch workspace.</p><input className="mt-4 w-full rounded bg-slate-900 px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Project name" /><div className="mt-3 grid gap-3 md:grid-cols-2"><select className="rounded bg-slate-900 px-3 py-2" value={objective} onChange={(e)=>setObjective(e.target.value)}><option>BALANCED</option><option>MAX_YIELD</option><option>PREMIUM</option><option>MAX_SIMPLICITY</option></select><input className="rounded bg-slate-900 px-3 py-2" value={goal} onChange={(e)=>setGoal(e.target.value)} /></div><div className="mt-3 flex gap-2"><input className="flex-1 rounded bg-slate-900 px-3 py-2" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search location" /><button className="rounded border border-cyan-300 px-3" onClick={searchLocation}>Search</button></div><ul className="mt-2 space-y-1 text-sm text-slate-300">{locations.map((loc, idx)=><li key={`${loc.lat}-${idx}`}>{loc.label}</li>)}</ul><textarea className="mt-3 h-44 w-full rounded bg-slate-900 p-2 text-xs" value={boundaryText} onChange={(e)=>setBoundaryText(e.target.value)} /><div className="mt-3 grid gap-3 md:grid-cols-3"><input className="rounded bg-slate-900 px-3 py-2" value={constructionCostPerUnit} onChange={(e)=>setConstructionCostPerUnit(e.target.value)} placeholder="construction cost" /><input className="rounded bg-slate-900 px-3 py-2" value={salePricePerUnit} onChange={(e)=>setSalePricePerUnit(e.target.value)} placeholder="sale price" /><input className="rounded bg-slate-900 px-3 py-2" value={timelineBaseMonths} onChange={(e)=>setTimelineBaseMonths(e.target.value)} placeholder="timeline months" /></div><button className="mt-4 rounded bg-cyan-500 px-4 py-2" onClick={createProject}>Create and open workspace</button></section></main>;
}
