import Head from 'next/head';
import PageShell from '../components/design/PageShell';
import CinematicSection from '../components/cinematic/sections/CinematicSection';

const sections = [
  { sceneKey: 'HeroPlanetarySection', title: 'Global command layer comes online', copy: 'LandOS Atlas establishes planetary context and initiates cinematic entry into the intelligence grid.', accent: 'from-[#1397FF]/20 to-[#4FD1FF]/10' },
  { sceneKey: 'ParcelDiscoverySection', title: 'Parcel discovery in motion', copy: 'Zoom from territory to tract, identify boundaries, and surface geospatial signals with guided depth.', accent: 'from-[#0E1C2F]/70 to-[#1397FF]/15' },
  { sceneKey: 'IntelligenceRevealSection', title: 'Intelligence reveal layer', copy: 'Constraints, access paths, shape complexity, and suitability confidence animate as decisions sharpen.', accent: 'from-[#091422]/80 to-[#4FD1FF]/15' },
  { sceneKey: 'ScenarioGenerationSection', title: 'Scenario generation engine', copy: 'Create deterministic roads, plots, and reserve structures with visual confidence and auditable logic.', accent: 'from-[#10243b]/80 to-[#4FD1FF]/20' },
  { sceneKey: 'OptimizationEngineSection', title: 'Optimization engine sequencing', copy: 'Yield, frontage, circulation efficiency, and margin weighted scoring orchestrate high-value outcomes.', accent: 'from-[#161530]/80 to-[#1397FF]/20' },
  { sceneKey: 'FinancialFeasibilitySection', title: 'Financial feasibility command center', copy: 'Translate geometric scenarios into capex, revenue, margin, and timeline projections with live emphasis.', accent: 'from-[#261d12]/80 to-[#F4C542]/15' },
  { sceneKey: 'CollaborationGraphSection', title: 'Collaboration graph sync', copy: 'Align developers, investors, planners, and reviewers through one evolving project intelligence fabric.', accent: 'from-[#10211f]/80 to-[#4FD1FF]/18' },
  { sceneKey: 'PlanetaryClosingSection', title: 'Planetary closing sequence', copy: 'Complete the journey from single parcel to strategic portfolio command.', accent: 'from-[#0E1C2F]/70 to-[#1397FF]/25' }
];

export default function Experience() {
  return (
    <>
      <Head><title>LandOS Atlas Experience</title></Head>
      <PageShell>
        {sections.map((section) => (
          <CinematicSection key={section.sceneKey} {...section} />
        ))}
      </PageShell>
    </>
  );
}
