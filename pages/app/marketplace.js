import { requirePageAuth } from '../../lib/ssrAuth';
import { useEffect, useState } from 'react';
import PageShell from '../../components/design/PageShell';
import { fetchWithAuth } from '../../lib/clientAuth';
import dynamic from 'next/dynamic';

const LandCommandMap = dynamic(() => import('../../components/design/LandCommandMap'), { ssr: false });

function ListingCard({ title, meta }) {
  return (
    <li className="glass-panel overflow-hidden">
      <div className="h-[170px] border-b border-white/10">
        <LandCommandMap className="h-full w-full" autoRotate={false} />
      </div>
      <div className="p-4">
        <p className="font-semibold">{title}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-cyan-100/90">
          <span className="rounded-full border border-cyan-300/30 px-2 py-1">{meta}</span>
          <span className="rounded-full border border-cyan-300/30 px-2 py-1">Satellite overlay</span>
          <span className="rounded-full border border-cyan-300/30 px-2 py-1">Parcel grid</span>
        </div>
      </div>
    </li>
  );
}

export default function MarketplacePage() {
  const [data, setData] = useState({ listings: [], opportunities: [] });
  const [listingTitle, setListingTitle] = useState('');
  const [opportunityTitle, setOpportunityTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setError('');
    try {
      const result = await fetchWithAuth('/api/marketplace');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addListing() {
    if (!listingTitle.trim()) return setError('Listing title is required.');
    setError('');
    try {
      await fetchWithAuth('/api/marketplace', {
        method: 'POST',
        body: JSON.stringify({ title: listingTitle.trim(), payload: { mapReady: true } })
      });
      setListingTitle('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addOpportunity() {
    if (!opportunityTitle.trim()) return setError('Opportunity title is required.');
    setError('');
    try {
      await fetchWithAuth('/api/marketplace', {
        method: 'POST',
        body: JSON.stringify({ kind: 'opportunity', title: opportunityTitle.trim(), type: 'JV', payload: { mapReady: true } })
      });
      setOpportunityTitle('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">Land Marketplace</h1>
        <p className="mt-2 text-[#b5cde6]">Publish development parcels with satellite previews, boundary overlays, and investment context.</p>

        {error && <p className="mt-3 text-red-300">{error}</p>}
        {loading && <p className="mt-3 text-cyan-200">Loading marketplace…</p>}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="glass-panel p-4">
            <h2 className="font-semibold">Create listing</h2>
            <input className="mt-2 w-full rounded bg-[#09111c] px-3 py-2" value={listingTitle} onChange={(e) => setListingTitle(e.target.value)} placeholder="Listing title" />
            <button className="btn-primary mt-2" onClick={addListing}>Publish listing</button>
          </div>
          <div className="glass-panel p-4">
            <h2 className="font-semibold">Create opportunity</h2>
            <input className="mt-2 w-full rounded bg-[#09111c] px-3 py-2" value={opportunityTitle} onChange={(e) => setOpportunityTitle(e.target.value)} placeholder="Opportunity title" />
            <button className="btn-secondary mt-2" onClick={addOpportunity}>Publish opportunity</button>
          </div>
        </div>

        <h2 className="mt-8 font-semibold">Listings</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">{data.listings.map((x) => <ListingCard key={x.id} title={x.title} meta={`Status: ${x.status}`} />)}</ul>

        <h2 className="mt-8 font-semibold">Opportunities</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">{data.opportunities.map((x) => <ListingCard key={x.id} title={x.title} meta={`${x.type} · ${x.status}`} />)}</ul>
      </section>
    </PageShell>
  );
}

export const getServerSideProps = requirePageAuth();
