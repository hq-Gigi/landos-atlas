import { requirePageAuth } from '../../../lib/ssrAuth';
import { useState } from 'react';
import { useRouter } from 'next/router';
import PageShell from '../../../components/design/PageShell';
import { fetchWithAuth, getClientOrgId } from '../../../lib/clientAuth';

export default function NewProject() {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('BALANCED');
  const [goal, setGoal] = useState('');
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [boundaryText, setBoundaryText] = useState('[]');
  const [constructionCostPerUnit, setConstructionCostPerUnit] = useState('');
  const [salePricePerUnit, setSalePricePerUnit] = useState('');
  const [timelineBaseMonths, setTimelineBaseMonths] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function searchLocation() {
    if (!query.trim()) return;
    const res = await fetch(`/api/geo/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setLocations(Array.isArray(data) ? data : []);
  }

  async function createProject() {
    try {
      setError('');
      const orgId = getClientOrgId();
      if (!orgId) throw new Error('Organization is missing. Sign in again.');
      if (!name.trim()) throw new Error('Project name is required.');
      if (!goal.trim()) throw new Error('Project goal is required.');
      const boundary = JSON.parse(boundaryText);
      if (!Array.isArray(boundary) || !boundary.length) throw new Error('Boundary must contain at least one coordinate.');

      const data = await fetchWithAuth('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          orgId,
          name: name.trim(),
          objective,
          goal: goal.trim(),
          boundary,
          assumptions: {
            constructionCostPerUnit: Number(constructionCostPerUnit || 0),
            salePricePerUnit: Number(salePricePerUnit || 0),
            timelineBaseMonths: Number(timelineBaseMonths || 0)
          }
        })
      });
      router.push(`/app/projects/${data.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">Create project</h1>
        <p className="mt-2 text-[#b5cde6]">Define location, boundary, assumptions, and launch the project workspace.</p>
        {error && <p className="mt-2 text-red-300">{error}</p>}

        <input className="glass-panel mt-4 w-full px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select className="glass-panel px-3 py-2" value={objective} onChange={(e) => setObjective(e.target.value)}><option>BALANCED</option><option>MAX_YIELD</option><option>PREMIUM</option><option>FAST_DELIVERY</option></select>
          <input className="glass-panel px-3 py-2" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Project goal" />
        </div>
        <div className="mt-3 flex gap-2">
          <input className="glass-panel flex-1 px-3 py-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search location" />
          <button className="btn-secondary" onClick={searchLocation}>Search</button>
        </div>
        <ul className="mt-2 space-y-1 text-sm text-[#b5cde6]">{locations.map((loc, idx) => <li key={`${loc.lat}-${idx}`}>{loc.label}</li>)}</ul>
        <textarea className="glass-panel mt-3 h-44 w-full p-2 text-xs" value={boundaryText} onChange={(e) => setBoundaryText(e.target.value)} />
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input className="glass-panel px-3 py-2" value={constructionCostPerUnit} onChange={(e) => setConstructionCostPerUnit(e.target.value)} placeholder="Construction cost per unit" />
          <input className="glass-panel px-3 py-2" value={salePricePerUnit} onChange={(e) => setSalePricePerUnit(e.target.value)} placeholder="Sale price per unit" />
          <input className="glass-panel px-3 py-2" value={timelineBaseMonths} onChange={(e) => setTimelineBaseMonths(e.target.value)} placeholder="Timeline (months)" />
        </div>
        <button className="btn-primary mt-4" onClick={createProject}>Create and open workspace</button>
      </section>
    </PageShell>
  );
}


export const getServerSideProps = requirePageAuth();
