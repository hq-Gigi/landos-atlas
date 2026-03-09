import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const tabs = ['scenarios', 'feasibility', 'reports', 'collaboration'];

function stat(label, value) {
  return { label, value: value ?? '—' };
}

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

  const stats = [
    stat('Scenarios', state?.scenarios?.length),
    stat('Comments', state?.project?.comments?.length),
    stat('Tasks', state?.project?.tasks?.length),
    stat('Exports', state?.project?.exports?.length),
    stat('Best score', topScenario?.optimizationScore)
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold">{state?.project?.name || `Project ${projectId}`}</h1>
      <p className="text-[#b5cde6]">Organization workspace for analysis, delivery, and reporting.</p>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {stats.map((item) => (
          <article key={item.label} className="glass-panel p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-cyan-200/70">{item.label}</p>
            <p className="mt-1 text-xl font-semibold">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link className={`glass-panel px-3 py-2 ${section === 'overview' ? 'ring-1 ring-cyan-300/50' : ''}`} href={`/app/projects/${projectId}`}>overview</Link>
        {tabs.map((t) => <Link key={t} className={`glass-panel px-3 py-2 ${section === t ? 'ring-1 ring-cyan-300/50' : ''}`} href={`/app/projects/${projectId}/${t}`}>{t}</Link>)}
      </div>

      <div className="glass-panel mt-6 p-4">
        <h2 className="text-xl font-medium capitalize">{section}</h2>
        {topScenario ? (
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#081220] p-3">
              <p className="text-sm text-cyan-100/80">Top scenario</p>
              <p className="text-lg font-semibold">{topScenario.name}</p>
              <p className="text-sm text-cyan-100/80">Score {topScenario.optimizationScore} · Margin {topScenario.metrics.margin}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#081220] p-3">
              <p className="text-sm text-cyan-100/80">Explainability</p>
              <p className="text-sm">{topScenario.explainability || 'Deterministic weighted model used.'}</p>
            </div>
          </div>
        ) : <p className="mt-3 text-sm text-cyan-100/70">Loading scenario intelligence…</p>}
      </div>
    </section>
  );
}
