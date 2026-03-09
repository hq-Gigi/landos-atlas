import Link from 'next/link';
import { requirePageAuth } from '../../lib/ssrAuth';
import { useEffect, useMemo, useState } from 'react';
import PageShell from '../../components/design/PageShell';
import { fetchWithAuth } from '../../lib/clientAuth';
import dynamic from 'next/dynamic';

const LandCommandMap = dynamic(() => import('../../components/design/LandCommandMap'), { ssr: false });

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'listings', label: 'Land Listings' },
  { key: 'opportunities', label: 'Development Opportunities' },
  { key: 'investor', label: 'Investor-ready Deals' },
  { key: 'strategic', label: 'Strategic Parcels' }
];

function MarketplaceCard({ item, kind }) {
  const href = kind === 'listing' ? `/app/marketplace/listings/${item.id}` : `/app/marketplace/opportunities/${item.id}`;
  return (
    <Link href={href} className="glass-panel block overflow-hidden transition hover:scale-[1.01] hover:border-cyan-300/40">
      <div className="h-[180px] border-b border-white/10">
        <LandCommandMap className="h-full w-full" autoRotate={false} />
      </div>
      <div className="p-4">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">{kind === 'listing' ? 'Listing' : 'Opportunity'}</p>
        <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
        <p className="mt-2 text-sm text-[#b5cde6]">{item.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-cyan-100/90">
          <span className="rounded-full border border-cyan-300/30 px-2 py-1">{item.status}</span>
          {item.location && <span className="rounded-full border border-cyan-300/30 px-2 py-1">{item.location}</span>}
          {item.askPrice && <span className="rounded-full border border-amber-300/40 px-2 py-1">${Number(item.askPrice).toLocaleString()}</span>}
          {item.type && <span className="rounded-full border border-cyan-300/30 px-2 py-1">{item.type}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const [data, setData] = useState({ listings: [], opportunities: [] });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [activeTab, setActiveTab] = useState('all');
  const [mapMode, setMapMode] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [listingDraft, setListingDraft] = useState({ title: '', summary: '', location: '', askPrice: '', listingType: 'DIRECT_SALE' });
  const [opportunityDraft, setOpportunityDraft] = useState({ title: '', summary: '', type: 'JV', feasibilityHighlight: '' });

  async function load() {
    setError('');
    setLoading(true);
    try {
      const result = await fetchWithAuth(`/api/marketplace?q=${encodeURIComponent(search)}&status=${status}`);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status]);

  const visible = useMemo(() => {
    const listings = data.listings || [];
    const opportunities = data.opportunities || [];
    if (activeTab === 'listings') return { listings, opportunities: [] };
    if (activeTab === 'opportunities') return { listings: [], opportunities };
    if (activeTab === 'investor') return { listings: listings.filter((x) => x.status === 'OPEN'), opportunities: opportunities.filter((x) => x.status === 'OPEN') };
    if (activeTab === 'strategic') return { listings: listings.filter((x) => !!x.projectId), opportunities: opportunities.filter((x) => !!x.projectId) };
    return { listings, opportunities };
  }, [activeTab, data]);

  async function createListing() {
    await fetchWithAuth('/api/listings', { method: 'POST', body: JSON.stringify({ ...listingDraft, askPrice: Number(listingDraft.askPrice || 0) }) });
    setListingDraft({ title: '', summary: '', location: '', askPrice: '', listingType: 'DIRECT_SALE' });
    await load();
  }

  async function createOpportunity() {
    await fetchWithAuth('/api/opportunities', { method: 'POST', body: JSON.stringify(opportunityDraft) });
    setOpportunityDraft({ title: '', summary: '', type: 'JV', feasibilityHighlight: '' });
    await load();
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold">LandOS Marketplace Intelligence</h1>
        <p className="mt-2 text-[#b5cde6]">Source strategic parcels and development programs with linked scenario and feasibility context.</p>

        <div className="mt-4 grid gap-3 lg:grid-cols-[2fr_1fr_1fr_auto]">
          <input className="rounded-xl border border-cyan-400/20 bg-[#08101a] px-3 py-2" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search listings, locations, opportunities" />
          <select className="rounded-xl border border-cyan-400/20 bg-[#08101a] px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All statuses</option><option value="OPEN">Open</option><option value="UNDER_REVIEW">Under Review</option><option value="CLOSED">Closed</option>
          </select>
          <button className="btn-secondary" onClick={() => setMapMode((v) => !v)}>{mapMode ? 'List mode' : 'Map mode'}</button>
          <button className="btn-primary" onClick={load}>Search</button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`rounded-full px-3 py-1 text-sm ${activeTab === tab.key ? 'bg-cyan-400/20 text-cyan-100' : 'border border-white/20 text-[#9fc0dc]'}`}>{tab.label}</button>)}
        </div>

        {error && <p className="mt-3 text-red-300">{error}</p>}
        {loading && <p className="mt-3 text-cyan-200">Loading marketplace…</p>}

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="glass-panel p-4">
            <h2 className="font-semibold">Create listing</h2>
            <input className="mt-2 w-full rounded bg-[#09111c] px-3 py-2" value={listingDraft.title} onChange={(e) => setListingDraft((x) => ({ ...x, title: e.target.value }))} placeholder="Title" />
            <textarea className="mt-2 w-full rounded bg-[#09111c] px-3 py-2" value={listingDraft.summary} onChange={(e) => setListingDraft((x) => ({ ...x, summary: e.target.value }))} placeholder="Summary" />
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <input className="rounded bg-[#09111c] px-3 py-2" value={listingDraft.location} onChange={(e) => setListingDraft((x) => ({ ...x, location: e.target.value }))} placeholder="Location" />
              <input className="rounded bg-[#09111c] px-3 py-2" value={listingDraft.askPrice} onChange={(e) => setListingDraft((x) => ({ ...x, askPrice: e.target.value }))} placeholder="Ask price" />
            </div>
            <button className="btn-primary mt-2" onClick={createListing}>Publish listing</button>
          </div>
          <div className="glass-panel p-4">
            <h2 className="font-semibold">Create opportunity</h2>
            <input className="mt-2 w-full rounded bg-[#09111c] px-3 py-2" value={opportunityDraft.title} onChange={(e) => setOpportunityDraft((x) => ({ ...x, title: e.target.value }))} placeholder="Title" />
            <textarea className="mt-2 w-full rounded bg-[#09111c] px-3 py-2" value={opportunityDraft.summary} onChange={(e) => setOpportunityDraft((x) => ({ ...x, summary: e.target.value }))} placeholder="Summary" />
            <input className="mt-2 w-full rounded bg-[#09111c] px-3 py-2" value={opportunityDraft.feasibilityHighlight} onChange={(e) => setOpportunityDraft((x) => ({ ...x, feasibilityHighlight: e.target.value }))} placeholder="Feasibility highlight" />
            <button className="btn-secondary mt-2" onClick={createOpportunity}>Publish opportunity</button>
          </div>
        </div>

        {mapMode && <div className="mt-8 h-[260px] overflow-hidden rounded-2xl border border-cyan-400/20"><LandCommandMap className="h-full w-full" autoRotate={false} /></div>}

        <h2 className="mt-8 text-xl font-semibold">Featured listings</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.listings.map((x) => <MarketplaceCard key={x.id} item={x} kind="listing" />)}</div>

        <h2 className="mt-8 text-xl font-semibold">Featured opportunities</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.opportunities.map((x) => <MarketplaceCard key={x.id} item={x} kind="opportunity" />)}</div>
      </section>
    </PageShell>
  );
}

export const getServerSideProps = requirePageAuth();
