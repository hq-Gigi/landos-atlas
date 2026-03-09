import Link from 'next/link';
import { requirePageAuth } from '../../lib/ssrAuth';
import { useEffect, useMemo, useState } from 'react';
import PageShell from '../../components/design/PageShell';
import { fetchWithAuth, getClientOrgId } from '../../lib/clientAuth';
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

const scenarioByScore = (score) => {
  if (score >= 82) return 'MAX_YIELD';
  if (score >= 68) return 'MIXED_USE_BALANCED';
  return 'PHASED_LOW_RISE';
};

const clamp = (value) => Math.max(0, Math.min(100, value));

function buildDiscoveryParcels(scanPayload) {
  const baseLng = scanPayload?.center?.lng ?? 3.3792;
  const baseLat = scanPayload?.center?.lat ?? 6.5244;
  const parcels = Array.from({ length: 8 }).map((_, index) => {
    const seed = index + 1;
    const size = 1800 + (seed * 420);
    const shapeEfficiency = clamp(54 + (seed * 5));
    const roadProximity = clamp(48 + (seed * 6));
    const developmentYield = clamp(45 + (seed * 6.5));
    const feasibilityMargin = clamp(38 + (seed * 7));
    const frontage = 24 + (seed * 4.2);
    const areaScore = clamp((size / 5500) * 100);
    const opportunityScore = clamp(
      (areaScore * 0.23) +
      (shapeEfficiency * 0.17) +
      (roadProximity * 0.2) +
      (developmentYield * 0.24) +
      (feasibilityMargin * 0.16)
    );
    const lngOffset = 0.008 + (index % 4) * 0.0045;
    const latOffset = 0.006 + Math.floor(index / 4) * 0.005;

    return {
      id: `scan-${seed}`,
      title: `Opportunity Parcel ${seed}`,
      area: Math.round(size),
      frontage: Number(frontage.toFixed(1)),
      estimatedDevelopmentYield: `${Math.round((size / 1000) * (2.4 + (developmentYield / 120)))} units`,
      scenarioRecommendation: scenarioByScore(opportunityScore),
      shapeEfficiency,
      roadProximity,
      developmentYield,
      feasibilityMargin,
      opportunityScore: Math.round(opportunityScore),
      boundary: [
        { lng: baseLng + lngOffset, lat: baseLat + latOffset },
        { lng: baseLng + lngOffset + 0.0023, lat: baseLat + latOffset + 0.0001 },
        { lng: baseLng + lngOffset + 0.0024, lat: baseLat + latOffset + 0.0017 },
        { lng: baseLng + lngOffset + 0.0001, lat: baseLat + latOffset + 0.0016 }
      ]
    };
  });

  return parcels.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

export default function MarketplacePage() {
  const [data, setData] = useState({ listings: [], opportunities: [] });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [activeTab, setActiveTab] = useState('all');
  const [mapMode, setMapMode] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [discoveryParcels, setDiscoveryParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [discoveryContext, setDiscoveryContext] = useState('Search a city or region and click Scan opportunities.');
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

  async function createProjectFromOpportunity(parcel) {
    const orgId = getClientOrgId();
    if (!orgId) {
      setError('Select an organization before creating projects from discovery parcels.');
      return;
    }
    const project = await fetchWithAuth(`/api/projects?orgId=${orgId}`, {
      method: 'POST',
      body: JSON.stringify({
        orgId,
        name: `${parcel.title} Project`,
        goal: `Develop ${parcel.scenarioRecommendation} scenario from opportunity score ${parcel.opportunityScore}`,
        boundary: parcel.boundary
      })
    });
    setDiscoveryContext(`Project created: ${project.name}. Continue in project workspace.`);
  }

  async function listOpportunityOnMarketplace(parcel) {
    await fetchWithAuth('/api/opportunities', {
      method: 'POST',
      body: JSON.stringify({
        title: parcel.title,
        summary: `${parcel.area.toLocaleString()} sqm parcel with ${parcel.frontage}m frontage. Recommended scenario: ${parcel.scenarioRecommendation}.`,
        type: 'JV',
        feasibilityHighlight: `Opportunity score ${parcel.opportunityScore} · Yield ${parcel.estimatedDevelopmentYield}`
      })
    });
    setDiscoveryContext(`${parcel.title} has been listed as a marketplace opportunity.`);
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

        {mapMode && (
          <div className="mt-8 grid gap-4 xl:grid-cols-[2fr_1fr]">
            <div className="h-[520px] overflow-hidden rounded-2xl border border-cyan-400/20">
              <LandCommandMap
                className="h-full w-full"
                autoRotate={false}
                discoveryMode
                discoveryParcels={discoveryParcels}
                onDiscoveryScan={(scanPayload) => {
                  const scanned = buildDiscoveryParcels(scanPayload);
                  setDiscoveryParcels(scanned);
                  setSelectedParcel(scanned[0] || null);
                  setDiscoveryContext(`Scanned ${scanPayload.query || 'selected area'} and ranked ${scanned.length} parcels for development opportunity.`);
                }}
                onDiscoveryParcelClick={(parcelProps) => {
                  const parcel = discoveryParcels.find((candidate) => candidate.id === parcelProps.id);
                  if (!parcel) return;
                  setSelectedParcel(parcel);
                  setDiscoveryContext(`Parcel intelligence opened for ${parcel.title}.`);
                }}
              />
            </div>
            <div className="glass-panel p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Land Discovery Intelligence</p>
              <p className="mt-2 text-sm text-[#b5cde6]">{discoveryContext}</p>
              {!selectedParcel ? <p className="mt-4 text-sm text-cyan-100/70">No parcel selected. Run a scan and click a highlighted opportunity parcel.</p> : (
                <>
                  <h3 className="mt-4 text-lg font-semibold">{selectedParcel.title}</h3>
                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <div className="rounded border border-white/10 p-2">Area<br /><strong>{selectedParcel.area.toLocaleString()} sqm</strong></div>
                    <div className="rounded border border-white/10 p-2">Frontage<br /><strong>{selectedParcel.frontage} m</strong></div>
                    <div className="rounded border border-white/10 p-2">Dev Yield<br /><strong>{selectedParcel.estimatedDevelopmentYield}</strong></div>
                    <div className="rounded border border-white/10 p-2">Scenario<br /><strong>{selectedParcel.scenarioRecommendation}</strong></div>
                    <div className="rounded border border-amber-300/40 bg-amber-300/10 p-2 md:col-span-2">Opportunity Score<br /><strong>{selectedParcel.opportunityScore}/100</strong></div>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-cyan-100/90">
                    <p>Parcel size weight: {Math.round((selectedParcel.area / 5500) * 100)}%</p>
                    <p>Shape efficiency: {selectedParcel.shapeEfficiency}%</p>
                    <p>Road proximity: {selectedParcel.roadProximity}%</p>
                    <p>Development yield: {selectedParcel.developmentYield}%</p>
                    <p>Feasibility margin: {selectedParcel.feasibilityMargin}%</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="btn-secondary" onClick={() => setDiscoveryContext(`Parcel intelligence opened for ${selectedParcel.title}.`)}>Open parcel intelligence</button>
                    <button className="btn-secondary" onClick={() => setDiscoveryContext(`Scenario generation queued for ${selectedParcel.scenarioRecommendation}.`)}>Generate scenarios</button>
                    <button className="btn-primary" onClick={() => createProjectFromOpportunity(selectedParcel)}>Create project</button>
                    <button className="btn-secondary" onClick={() => listOpportunityOnMarketplace(selectedParcel)}>List on marketplace</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

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

        <h2 className="mt-8 text-xl font-semibold">Featured listings</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.listings.map((x) => <MarketplaceCard key={x.id} item={x} kind="listing" />)}</div>

        <h2 className="mt-8 text-xl font-semibold">Featured opportunities</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.opportunities.map((x) => <MarketplaceCard key={x.id} item={x} kind="opportunity" />)}</div>
      </section>
    </PageShell>
  );
}

export const getServerSideProps = requirePageAuth();
