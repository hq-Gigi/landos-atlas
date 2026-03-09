import dynamic from 'next/dynamic';
import PageShell from '../../../../components/design/PageShell';
import { fetchWithAuth } from '../../../../lib/clientAuth';
import { requirePageAuth } from '../../../../lib/ssrAuth';
import { useEffect, useState } from 'react';

const LandCommandMap = dynamic(() => import('../../../../components/design/LandCommandMap'), { ssr: false });

export default function ListingDetailPage({ id }) {
  const [item, setItem] = useState(null);
  useEffect(() => { fetchWithAuth(`/api/listings/${id}`).then(setItem).catch(() => setItem(null)); }, [id]);
  if (!item) return <PageShell><section className="mx-auto max-w-5xl px-6 py-12">Loading listing intelligence…</section></PageShell>;

  return <PageShell><section className="mx-auto max-w-5xl px-6 py-12">
    <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Land Listing</p>
    <h1 className="mt-2 text-3xl font-bold">{item.title}</h1>
    <p className="mt-3 text-[#b5cde6]">{item.summary}</p>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <div className="glass-panel p-3">Ask Price<br /><strong>{item.askPrice ? `$${Number(item.askPrice).toLocaleString()}` : 'Undisclosed'}</strong></div>
      <div className="glass-panel p-3">Area<br /><strong>{item.areaSqm || item.projectIntel?.boundary?.area || 0} sqm</strong></div>
      <div className="glass-panel p-3">Frontage<br /><strong>{item.frontageM || item.projectIntel?.boundary?.frontage || 0} m</strong></div>
    </div>
    <div className="mt-4 h-[260px] overflow-hidden rounded-2xl border border-cyan-400/20"><LandCommandMap className="h-full w-full" autoRotate={false} /></div>
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <div className="glass-panel p-4"><h2 className="font-semibold">Organization</h2><p className="mt-2 text-[#b5cde6]">{item.organization?.name}</p></div>
      <div className="glass-panel p-4"><h2 className="font-semibold">Project intelligence</h2><p className="mt-2 text-[#b5cde6]">{item.projectIntel?.name || 'No linked project'}</p><p className="text-sm text-cyan-200/80">Scenarios: {item.projectIntel?.scenarioCount || 0}</p><p className="text-sm text-cyan-200/80">Feasibility: {item.projectIntel?.feasibilitySummary || 'n/a'}</p></div>
    </div>
    <button className="btn-primary mt-4">Express interest</button>
  </section></PageShell>;
}

export async function getServerSideProps(ctx) {
  const auth = await requirePageAuth()(ctx);
  if (auth.redirect) return auth;
  return { props: { id: ctx.params.id } };
}
