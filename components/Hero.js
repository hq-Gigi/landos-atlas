import Link from 'next/link';
import { tagline } from '../lib/brand';

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,#06b6d455,transparent_35%),radial-gradient(circle_at_80%_20%,#a21caf44,transparent_30%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-cyan-200/20 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">GIGI LABS flagship platform</p>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">LandOS Atlas turns raw land into development intelligence you can execute.</h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">{tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/app" className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Launch workspace</Link>
            <Link href="/experience" className="rounded-xl border border-slate-300/30 px-5 py-3 font-semibold text-slate-100">Explore cinematic experience</Link>
          </div>
        </div>
        <div className="grid gap-3">
          {[
            ['Deterministic scenario engine', 'Generate and compare development options from parcel boundaries.'],
            ['Financial feasibility core', 'Evaluate capex, revenue, margin, and timeline assumptions.'],
            ['AI boardroom briefs', 'Produce investor summaries and board memos from scored outcomes.']
          ].map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-300">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
