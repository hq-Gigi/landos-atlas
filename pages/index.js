import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import PageShell from '../components/design/PageShell';
import { MotionCard, Reveal, StaggerGrid } from '../components/design/MotionSystem';
import { audiences, productName, tagline } from '../lib/brand';

const storyMoments = [
  ['Signal Ingestion', 'Streaming geospatial, policy, infrastructure, and market vectors in real-time.'],
  ['Autonomous Synthesis', 'Modeling thousands of parcel futures with explainable decision narratives.'],
  ['Capital Alignment', 'Turning intelligence into board-grade action with synchronized stakeholder confidence.']
];

export default function Home() {
  return (
    <>
      <Head>
        <title>{productName}</title>
        <meta name="description" content={tagline} />
      </Head>
      <PageShell>
        <Hero />
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <Reveal className="story-ribbon overflow-hidden rounded-2xl p-6 sm:p-8">
            <p className="eyebrow">Cinematic Intelligence Narrative</p>
            <h2 className="mt-4 text-2xl font-semibold sm:text-4xl">From raw land complexity to decisive global execution.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {storyMoments.map(([title, copy]) => (
                <div key={title} className="story-node">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-[#bdd6ea]">{copy}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <Reveal>
            <h2 className="text-3xl font-semibold">Designed for every decision-maker in the land development graph</h2>
          </Reveal>
          <StaggerGrid className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {audiences.map((a) => (
              <MotionCard key={a.href} className="p-5">
                <h3 className="font-semibold">{a.title}</h3>
                <p className="mt-3 text-sm text-[#b5cde6]">{a.copy}</p>
                <Link href={a.href} className="mt-4 inline-block text-sm text-cyan-200">Open intelligence view →</Link>
              </MotionCard>
            ))}
          </StaggerGrid>
        </section>
      </PageShell>
    </>
  );
}
