import PageShell from '../../../../components/design/PageShell';
import { fetchWithAuth } from '../../../../lib/clientAuth';
import { requirePageAuth } from '../../../../lib/ssrAuth';
import { useEffect, useState } from 'react';

export default function OpportunityDetailPage({ id }) {
  const [item, setItem] = useState(null);
  useEffect(() => { fetchWithAuth(`/api/opportunities/${id}`).then(setItem).catch(() => setItem(null)); }, [id]);
  if (!item) return <PageShell><section className="mx-auto max-w-5xl px-6 py-12">Loading opportunity intelligence…</section></PageShell>;

  return <PageShell><section className="mx-auto max-w-5xl px-6 py-12">
    <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Development Opportunity</p>
    <h1 className="mt-2 text-3xl font-bold">{item.title}</h1>
    <p className="mt-3 text-[#b5cde6]">{item.summary}</p>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <div className="glass-panel p-3">Status<br /><strong>{item.status}</strong></div>
      <div className="glass-panel p-3">Type<br /><strong>{item.type}</strong></div>
      <div className="glass-panel p-3">Scenario<br /><strong>{item.scenario?.scenarioType || 'Linked by project'}</strong></div>
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <div className="glass-panel p-4"><h2 className="font-semibold">Feasibility summary</h2><p className="mt-2 text-[#b5cde6]">{item.feasibilityHighlight || item.projectIntel?.feasibilitySummary || 'No feasibility report yet.'}</p></div>
      <div className="glass-panel p-4"><h2 className="font-semibold">AI recommendation excerpt</h2><p className="mt-2 text-[#b5cde6]">{item.projectIntel?.aiSummary || 'AI summary pending. Generate recommendations in project workspace.'}</p></div>
    </div>
    <div className="glass-panel mt-4 p-4"><h2 className="font-semibold">Linked project</h2><p className="mt-2 text-[#b5cde6]">{item.projectIntel?.name || 'No linked project'}</p><p className="text-sm text-cyan-200/80">Scenario count: {item.projectIntel?.scenarioCount || 0}</p></div>
    <button className="btn-secondary mt-4">Submit investment interest</button>
  </section></PageShell>;
}

export async function getServerSideProps(ctx) {
  const auth = await requirePageAuth()(ctx);
  if (auth.redirect) return auth;
  return { props: { id: ctx.params.id } };
}
