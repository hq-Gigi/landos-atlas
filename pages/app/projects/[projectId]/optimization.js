import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NavBar from '../../../../components/NavBar';

export default function OptimizationPage(){
  const { query } = useRouter();
  const [scenarios, setScenarios] = useState([]);
  useEffect(() => {
    if (!query.projectId) return;
    const token = localStorage.getItem('atlas_token');
    fetch(`/api/projects/${query.projectId}/scenarios`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((x) => setScenarios([...x].sort((a,b)=>b.optimizationScore-a.optimizationScore)));
  }, [query.projectId]);

  return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold">Optimization Scores</h1><div className="mt-4 space-y-2">{scenarios.map((s, idx)=><div key={s.id} className="rounded border border-white/10 p-3">#{idx+1} {s.name} · score {s.optimizationScore} · road {s.layout?.roadNetwork?.efficiency} · frontage {s.layout?.frontageEfficiency}</div>)}</div></section></main>;
}
