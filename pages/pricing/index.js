import Head from 'next/head';
import NavBar from '../../components/NavBar';

export default function PricingPage() {
  const plans = [
    { name: 'Explorer', price: 'Free', features: ['Limited projects', 'Preview scenarios', 'No premium exports'] },
    { name: 'Pro', price: '$49/mo', features: ['Premium reports', 'AI summaries', 'Workspace collaboration'] },
    { name: 'Studio', price: '$149/mo', features: ['Advanced exports', 'Portfolio tracking', 'Priority support'] },
    { name: 'Enterprise', price: 'Custom', features: ['Org controls', 'Scale analytics', 'Institutional workflows'] }
  ];
  return <><Head><title>LandOS Atlas Pricing</title></Head><main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-6xl px-6 py-20"><h1 className="text-4xl font-bold">Pricing</h1><div className="mt-8 grid gap-4 md:grid-cols-2">{plans.map((p)=><div key={p.name} className="rounded-2xl border border-white/10 bg-white/5 p-5"><h2 className="text-xl font-semibold">{p.name}</h2><p className="mt-1 text-cyan-300">{p.price}</p><ul className="mt-3 space-y-1 text-sm text-slate-300">{p.features.map((f)=><li key={f}>• {f}</li>)}</ul></div>)}</div></section></main></>;
}
