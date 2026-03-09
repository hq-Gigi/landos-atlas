import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const LandCommandMap = dynamic(() => import('./design/LandCommandMap'), { ssr: false });

const stats = [
  ['2.1M+', 'Parcel boundaries analyzed'],
  ['124', 'Development layouts generated this week'],
  ['$3.4B', 'Modeled project value in active pipelines']
];

const heroVariants = {
  a: {
    label: 'PLANETARY LAND INTELLIGENCE',
    title: 'Analyze land, generate layouts, and forecast investment outcomes from one cinematic command center.',
    cta: 'Launch land command center'
  },
  b: {
    label: 'MAP-FIRST DEVELOPMENT PLATFORM',
    title: 'Draw parcel boundaries, compare road-and-plot scenarios, and validate feasibility before you deploy capital.',
    cta: 'Open live development workspace'
  }
};

export default function Hero({ variant = 'a', onPrimaryCta }) {
  const selected = heroVariants[variant] || heroVariants.a;

  return (
    <section className="hero-stage relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
      <div className="hero-noise" />
      <div className="hero-orbit hero-orbit-a" />
      <div className="hero-orbit hero-orbit-b" />
      <div className="hero-beam hero-beam-a" />
      <div className="hero-beam hero-beam-b" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,#1397FF55,transparent_30%),radial-gradient(circle_at_80%_20%,#4FD1FF45,transparent_30%),radial-gradient(circle_at_50%_80%,#F4C54230,transparent_40%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85 }}>
          <p className="eyebrow">{selected.label}</p>
          <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl md:text-6xl">{selected.title}</h1>
          <p className="mt-5 max-w-2xl text-base text-[#b5cde6] sm:mt-6 sm:text-lg">Satellite imagery, parcel optimization, road network synthesis, and real estate feasibility intelligence in one operational UI.</p>
          <div className="mt-5 grid gap-2 text-xs uppercase tracking-[0.16em] text-cyan-100/75 sm:grid-cols-3">
            <span className="rounded-lg border border-cyan-200/20 bg-[#081524]/70 px-3 py-2">Search + shortlist parcels</span>
            <span className="rounded-lg border border-cyan-200/20 bg-[#081524]/70 px-3 py-2">Generate road/plot scenarios</span>
            <span className="rounded-lg border border-cyan-200/20 bg-[#081524]/70 px-3 py-2">Model feasibility + returns</span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/app" className="btn-primary w-full sm:w-auto" onClick={onPrimaryCta}>{selected.cta}</Link>
            <Link href="/experience" className="btn-secondary w-full sm:w-auto">See map intelligence walkthrough</Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map(([value, label]) => (
              <motion.div key={value} className="glass-panel p-4 sm:p-5" whileHover={{ y: -4, scale: 1.02 }} transition={{ type: 'spring', stiffness: 180, damping: 16 }}>
                <p className="text-2xl font-semibold text-cyan-200">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[#93b6d7]">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div className="space-y-4" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.1 }}>
          <div className="glow-border glass-panel h-[360px] overflow-hidden sm:h-[420px]">
            <LandCommandMap className="h-full w-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Parcel overlays', 'Boundary extraction + zoning layers'],
              ['Scenario engine', 'Plot-and-road alternatives in seconds'],
              ['Feasibility core', 'Revenue, cost, and margin projections']
            ].map(([title, copy]) => (
              <div key={title} className="glass-panel p-4">
                <p className="text-sm font-semibold text-cyan-100">{title}</p>
                <p className="mt-2 text-xs text-[#b5cde6]">{copy}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
