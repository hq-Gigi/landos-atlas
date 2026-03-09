import { useEffect, useState } from 'react';
import PageShell from '../../../../components/design/PageShell';
import { fetchWithAuth } from '../../../../lib/clientAuth';
import { requirePageAuth } from '../../../../lib/ssrAuth';

export default function OptimizationPage({ projectId }) {
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    if (!projectId) return;
    fetchWithAuth(`/api/projects/${projectId}/scenarios`).then((x) => setScenarios([...x].sort((a, b) => b.optimizationScore - a.optimizationScore))).catch(() => setScenarios([]));
  }, [projectId]);

  return <PageShell><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold">Optimization scores</h1><div className="mt-4 space-y-2">{scenarios.map((s, idx) => <div key={s.id} className="glass-panel p-3">#{idx + 1} {s.name} · score {s.optimizationScore}</div>)}</div></section></PageShell>;
}

export const getServerSideProps = requirePageAuth(({ params }) => ({ projectId: params.projectId }));
