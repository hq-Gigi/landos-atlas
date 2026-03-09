import { requirePageAuth } from '../../lib/ssrAuth';
import { useEffect, useState } from 'react';
import PageShell from '../../components/design/PageShell';
import { fetchWithAuth } from '../../lib/clientAuth';

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
        body: JSON.stringify({ title: listingTitle.trim(), payload: {} })
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
        body: JSON.stringify({ kind: 'opportunity', title: opportunityTitle.trim(), type: 'JV', payload: {} })
      });
      setOpportunityTitle('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="mt-2 text-[#b5cde6]">Publish listings and opportunities for investment and delivery partners.</p>

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

        <h2 className="mt-6 font-semibold">Listings</h2>
        <ul className="mt-2 space-y-2">{data.listings.map((x) => <li key={x.id} className="glass-panel p-3">{x.title} · {x.status}</li>)}</ul>

        <h2 className="mt-6 font-semibold">Opportunities</h2>
        <ul className="mt-2 space-y-2">{data.opportunities.map((x) => <li key={x.id} className="glass-panel p-3">{x.title} · {x.type} · {x.status}</li>)}</ul>
      </section>
    </PageShell>
  );
}


export const getServerSideProps = requirePageAuth();
