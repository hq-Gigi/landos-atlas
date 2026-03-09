import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

const IntelligenceVisualSystem = dynamic(() => import('./IntelligenceVisualSystem'), { ssr: false });
const LandCommandMap = dynamic(() => import('./LandCommandMap'), { ssr: false });

const tabs = ['scenarios', 'feasibility', 'reports', 'collaboration'];

export default function ProjectWorkspace({ projectId, section }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}/state`, { credentials: 'same-origin' })
      .then((r) => r.json())
      .then(setState)
      .catch(() => setState(null));
  }, [projectId]);

  const topScenario = useMemo(() => {
    const scenarios = state?.scenarios || [];
    return [...scenarios].sort((a, b) => b.optimizationScore - a.optimizationScore)[0];
  }, [state]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <p className="eyebrow">Land development command center</p>
      <h1 className="mt-4 text-3xl font-semibold lg:text-5xl">{state?.project?.name || `Project ${projectId}`} · Map intelligence workspace</h1>
      <p className="mt-3 max-w-4xl text-[#b5cde6]">Satellite analysis, parcel boundaries, development layout generation, and investment feasibility in one map-first workflow.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link className={`glass-panel px-3 py-2 ${section === 'overview' ? 'ring-1 ring-cyan-300/50' : ''}`} href={`/app/projects/${projectId}`}>overview</Link>
        {tabs.map((t) => <Link key={t} className={`glass-panel px-3 py-2 ${section === t ? 'ring-1 ring-cyan-300/50' : ''}`} href={`/app/projects/${projectId}/${t}`}>{t}</Link>)}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100/80">
            <span>Live satellite + parcel canvas</span>
            <span>draw · zone · optimize</span>
          </div>
          <LandCommandMap className="h-[360px] w-full lg:h-[460px]" />
        </div>
        <div className="space-y-3">
          <div className="glass-panel p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/75">Boundary tools</p>
            <p className="mt-2 text-sm text-[#b5cde6]">Parcel edit mode, zoning overlays, terrain shading, and road corridor tracing are active in this project map view.</p>
          </div>
          {topScenario && (
            <div className="rounded-2xl border border-cyan-200/20 bg-cyan-400/5 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Top development layout</p>
              <p className="mt-2 text-xl font-semibold">{topScenario.name}</p>
              <p className="mt-1 text-sm text-[#cce3f9]">Optimization {topScenario.optimizationScore} · Margin {topScenario.metrics.margin} · Feasibility {topScenario.feasibility}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-panel p-4"><p className="text-xs text-[#93b6d7]">Active parcels</p><p className="mt-1 text-2xl font-semibold text-cyan-100">{state?.landProfile?.parcelCount || 0}</p></div>
            <div className="glass-panel p-4"><p className="text-xs text-[#93b6d7]">Scenarios</p><p className="mt-1 text-2xl font-semibold text-cyan-100">{state?.scenarios?.length || 0}</p></div>
          </div>
        </div>
      </div>

      {(section === 'scenarios' || section === 'feasibility') && (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="glass-panel p-4">
            <h3 className="font-semibold">Scenario layout A</h3>
            <p className="mt-2 text-sm text-[#b5cde6]">Balanced road grid with medium-density plots and high frontage efficiency.</p>
          </div>
          <div className="glass-panel p-4">
            <h3 className="font-semibold">Scenario layout B</h3>
            <p className="mt-2 text-sm text-[#b5cde6]">Aggressive plot count with compact circulation and stronger gross revenue potential.</p>
          </div>
          <div className="glass-panel p-4">
            <h3 className="font-semibold">Feasibility metrics</h3>
            <p className="mt-2 text-sm text-[#b5cde6]">Revenue, cost, and margin layers are reflected in the financial visualization engine below.</p>
          </div>
        </div>
      )}

      <IntelligenceVisualSystem />
    </section>
  );
}
