import Link from 'next/link';
import { tagline } from '../lib/brand';

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0ea5e933,transparent_40%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-cyan-200/20 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">GIGI LABS flagship platform</p>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">The command center for land intelligence, scenario strategy, and execution.</h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">{tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/app/projects/new" className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Analyze land</Link>
            <Link href="/experience" className="rounded-xl border border-slate-300/30 px-5 py-3 font-semibold text-slate-100">Explore experience</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Live intelligence layers</p>
          <ul className="mt-4 space-y-4 text-slate-200">
            <li>Deterministic parcel scenario engine</li>
            <li>AI recommendation and board memo generation</li>
            <li>Paystack-governed premium unlock workflow</li>
            <li>Collaboration graph and export controls</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
