import Head from 'next/head';
import NavBar from '../components/NavBar';

const sections = [
  'HeroPlanetarySection',
  'ParcelDiscoverySection',
  'IntelligenceRevealSection',
  'ScenarioDeconstructionSection',
  'OptimizationOrbitSection',
  'FinancialCoreSection',
  'CollaborationNetworkSection',
  'PlanetaryClosingSection'
];

export default function Experience() {
  return (
    <>
      <Head><title>LandOS Atlas Experience</title></Head>
      <main className="min-h-screen bg-black text-white">
        <NavBar />
        {sections.map((section, idx) => (
          <section key={section} className="relative flex min-h-screen items-center border-b border-white/10 px-8">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-400/10" />
            <div className="relative mx-auto max-w-5xl">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Pinned scene {idx + 1}</p>
              <h2 className="mt-3 text-4xl font-bold">{section}</h2>
              <p className="mt-4 max-w-2xl text-slate-300">Scroll-driven cinematic section scaffolded for GSAP + ScrollTrigger timelines, parallax layers, and performance-safe mobile fallback states.</p>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
