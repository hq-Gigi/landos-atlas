import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../../components/NavBar';

const pillars = [
  ['Parcel Intelligence', 'Boundary analytics, geometry metrics, and land profile persistence.'],
  ['Scenario Engine', 'Deterministic development options with auditable scoring logic.'],
  ['Feasibility Core', 'Cost, revenue, margin, and timeline models per scenario.'],
  ['Boardroom AI', 'OpenAI-assisted recommendation narratives for stakeholder decisions.'],
  ['Billing & Unlocks', 'Paystack-verified payment gates for premium exports.'],
  ['Collaboration Fabric', 'Comments, tasks, and activity records per project workspace.']
];

export default function PlatformPage(){
  return (
    <>
      <Head><title>LandOS Atlas Platform</title></Head>
      <main className="min-h-screen bg-slate-950 text-white">
        <NavBar />
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h1 className="text-4xl font-bold">Platform Architecture</h1>
          <p className="mt-4 max-w-3xl text-slate-300">LandOS Atlas combines geospatial intelligence, deterministic optimization, financial feasibility, and collaboration into one production operating system for land development.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {pillars.map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <Link href="/experience" className="rounded bg-cyan-500 px-4 py-2 font-semibold text-slate-950">Watch cinematic experience</Link>
            <Link href="/app" className="rounded border border-cyan-300 px-4 py-2">Open application workspace</Link>
          </div>
        </section>
      </main>
    </>
  );
}
