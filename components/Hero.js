import Link from 'next/link';
import { motion } from 'framer-motion';
import { tagline } from '../lib/brand';

const stats = [
  ['2.1M+', 'Parcel signals processed'],
  ['92%', 'Scenario confidence alignment'],
  ['6x', 'Faster board-ready feasibility cycles']
];

const heroVariants = {
  a: {
    label: 'GIGI LABS FLAGSHIP',
    title: 'The Planetary Operating System for Land Development Intelligence',
    cta: 'Launch live workspace'
  },
  b: {
    label: 'LIVE DECISION PLATFORM',
    title: 'Plan land projects faster, align teams sooner, and deliver with less risk',
    cta: 'Start with the live platform'
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
      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85 }}>
          <p className="eyebrow">{selected.label}</p>
          <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">{selected.title}</h1>
          <p className="mt-5 max-w-2xl text-base text-[#b5cde6] sm:mt-6 sm:text-lg">{tagline}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/app" className="btn-primary w-full sm:w-auto" onClick={onPrimaryCta}>{selected.cta}</Link>
            <Link href="/experience" className="btn-secondary w-full sm:w-auto">See product walkthrough</Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map(([value, label]) => (
              <motion.div
                key={value}
                className="glass-panel p-4 sm:p-5"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 180, damping: 16 }}
              >
                <p className="text-2xl font-semibold text-cyan-200">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-[#93b6d7]">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div className="space-y-4" initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.1 }}>
          {[
            ['Deterministic scenario intelligence', 'Designs roads, plot logic, and reserves while preserving auditable traceability.'],
            ['Financial feasibility core', 'Instantly projects capex, revenue curves, margin, and timeline risk vectors.'],
            ['Stakeholder graph command layer', 'Coordinates planners, investors, and regulators with shared project context.']
          ].map(([title, copy]) => (
            <motion.div
              key={title}
              className="glass-panel glow-border p-5 sm:p-6"
              whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
              transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            >
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-[#b5cde6]">{copy}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
