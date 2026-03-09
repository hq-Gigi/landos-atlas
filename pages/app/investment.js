import { requirePageAuth } from '../../lib/ssrAuth';
import { useState } from 'react';
import PageShell from '../../components/design/PageShell';
import { fetchWithAuth } from '../../lib/clientAuth';

export default function InvestmentPage() {
  const [projectId, setProjectId] = useState('');
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    setSummary(null);
    try {
      const data = await fetchWithAuth(`/api/projects/${projectId}/investor-summary`);
      setSummary(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">Investment briefing</h1>
        <p className="mt-2 text-[#b5cde6]">Generate decision-ready investor summaries with land profile, options, and feasibility.</p>
        <div className="mt-4 flex gap-2">
          <input className="flex-1 rounded bg-[#09111c] px-3 py-2" placeholder="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
          <button className="btn-primary" onClick={load}>Load summary</button>
        </div>
        {error && <p className="mt-3 text-red-300">{error}</p>}
        {summary && <pre className="glass-panel mt-4 overflow-auto p-3 text-xs">{JSON.stringify(summary, null, 2)}</pre>}
      </section>
    </PageShell>
  );
}


export const getServerSideProps = requirePageAuth();
