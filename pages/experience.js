import Head from 'next/head';
import NavBar from '../components/NavBar';
import CinematicSection from '../components/cinematic/sections/CinematicSection';

const sections = [
  { sceneKey: 'HeroPlanetarySection', title: 'Enter the Planetary Operating System', copy: 'LandOS Atlas introduces a global command layer for land development intelligence and execution.', accent: 'from-cyan-500/20 to-fuchsia-500/20' },
  { sceneKey: 'ParcelDiscoverySection', title: 'Zoom into Land Intelligence', copy: 'Search any region, trace boundaries, and convert raw parcels into structured intelligence.', accent: 'from-blue-500/20 to-cyan-500/20' },
  { sceneKey: 'IntelligenceRevealSection', title: 'Reveal Parcel Intelligence', copy: 'Surface constraints, access, shape metrics, and development potential signals.', accent: 'from-indigo-500/20 to-cyan-500/20' },
  { sceneKey: 'ScenarioDeconstructionSection', title: 'Deconstruct Scenarios', copy: 'Split parcels into roads, plots, and reserves through deterministic scenario logic.', accent: 'from-cyan-500/20 to-emerald-500/20' },
  { sceneKey: 'OptimizationOrbitSection', title: 'Optimization Orbit', copy: 'Rank scenario options through yield, road efficiency, frontage, and margin-aware scoring.', accent: 'from-fuchsia-500/20 to-cyan-500/20' },
  { sceneKey: 'FinancialCoreSection', title: 'Financial Core Reveal', copy: 'Translate geometry into cost, revenue, margin, and timeline intelligence for decision-makers.', accent: 'from-amber-500/20 to-cyan-500/20' },
  { sceneKey: 'CollaborationNetworkSection', title: 'Collaboration Network', copy: 'Coordinate planners, developers, investors, and reviewers across one project intelligence graph.', accent: 'from-teal-500/20 to-blue-500/20' },
  { sceneKey: 'PlanetaryClosingSection', title: 'Planetary Closing Sequence', copy: 'Scale from parcel to portfolio and from project to planetary-level development intelligence.', accent: 'from-cyan-500/20 to-blue-500/30' }
];

export default function Experience() {
  return (
    <>
      <Head><title>LandOS Atlas Experience</title></Head>
      <main className="min-h-screen bg-black text-white">
        <NavBar />
        {sections.map((section) => (
          <CinematicSection key={section.sceneKey} {...section} />
        ))}
      </main>
    </>
  );
}
