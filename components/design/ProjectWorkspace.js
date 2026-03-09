import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

const IntelligenceVisualSystem = dynamic(() => import('./IntelligenceVisualSystem'), { ssr: false });

const tabs = ['scenarios', 'feasibility', 'reports', 'collaboration'];

export default function ProjectWorkspace({ projectId, section }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}/state`, { headers: { Authorization: `Bearer ${localStorage.getItem('atlas_token') || ''}` } })
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
      <p className="eyebrow">Atlas command surface</p>
      <h1 className="mt-4 text-3xl font-semibold lg:text-5xl">{state?.project?.name || `Project ${projectId}`} · Intelligence Theater</h1>
      <p className="mt-3 max-w-4xl text-[#b5cde6]">A premium enterprise command interface engineered to communicate scale, authority, intelligence, and inevitability across land strategy decisions.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link className={`glass-panel px-3 py-2 ${section === 'overview' ? 'ring-1 ring-cyan-300/50' : ''}`} href={`/app/projects/${projectId}`}>overview</Link>
        {tabs.map((t) => <Link key={t} className={`glass-panel px-3 py-2 ${section === t ? 'ring-1 ring-cyan-300/50' : ''}`} href={`/app/projects/${projectId}/${t}`}>{t}</Link>)}
      </div>

      {topScenario && (
        <div className="mt-6 rounded-2xl border border-cyan-200/20 bg-cyan-400/5 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Active strategic scenario</p>
          <p className="mt-2 text-xl font-semibold">{topScenario.name}</p>
          <p className="mt-1 text-sm text-[#cce3f9]">Optimization score {topScenario.optimizationScore} · Margin {topScenario.metrics.margin} · Feasibility {topScenario.feasibility}</p>
        </div>
      )}

      <IntelligenceVisualSystem />
    </section>
  );
}
