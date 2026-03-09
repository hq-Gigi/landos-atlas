import Head from 'next/head';
import { useEffect } from 'react';
import Link from 'next/link';
import Hero from '../components/Hero';
import PageShell from '../components/design/PageShell';
import { MotionCard, Reveal, StaggerGrid } from '../components/design/MotionSystem';
import { audiences, productName, tagline } from '../lib/brand';

const operatingFlow = [
  ['1 · Discover Land', 'Search territory, evaluate proximity to roads and utilities, and shortlist parcels by strategic intent.'],
  ['2 · Draw Boundary', 'Capture parcel geometry, validate shape quality, then persist area, perimeter, and frontage metrics.'],
  ['3 · Generate Scenarios', 'Create deterministic road-and-plot options for MAX_YIELD, BALANCED, PREMIUM, or FAST_DELIVERY objectives.'],
  ['4 · Decide with Confidence', 'Rank options, run feasibility, align stakeholders, and export investor-ready intelligence.']
];

const commandPanels = [
  ['Parcel Geometry', 'Area 84,200 sqm · Perimeter 1,426 m · Frontage 362 m'],
  ['Scenario Leaderboard', 'MAX_YIELD score 91.4 · BALANCED score 88.2 · PREMIUM score 84.9'],
  ['Financial Feasibility', 'Projected revenue $42.6M · Cost $28.3M · Margin 33.6%'],
  ['Collaboration Pulse', '12 comments · 6 active tasks · 18 activity events this week']
];

export default function Home({ variant }) {
  useEffect(() => {
    fetch('/api/analytics/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ experiment: 'home_hero_v1', variant, eventType: 'impression' })
    }).catch(() => null);
  }, [variant]);

  const trackPrimaryCta = () => {
    fetch('/api/analytics/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ experiment: 'home_hero_v1', variant, eventType: 'cta_open_app' })
    }).catch(() => null);
  };

  return (
    <>
      <Head>
        <title>{productName}</title>
        <meta name="description" content={tagline} />
      </Head>
      <PageShell>
        <Hero variant={variant} onPrimaryCta={trackPrimaryCta} />

        <section className="mx-auto max-w-7xl px-6 pb-16">
          <Reveal className="rounded-2xl border border-cyan-300/20 bg-[#081524]/80 p-6 sm:p-8">
            <p className="eyebrow">Real operating surface, not brochure copy</p>
            <h2 className="mt-4 text-2xl font-semibold sm:text-4xl">The 60-second development decision pipeline</h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-4">
              {operatingFlow.map(([title, copy]) => (
                <div key={title} className="rounded-xl border border-cyan-100/10 bg-[#0A192A]/80 p-4">
                  <h3 className="text-sm font-semibold text-cyan-100">{title}</h3>
                  <p className="mt-2 text-sm text-[#b5cde6]">{copy}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <Reveal>
            <p className="eyebrow">Development command center preview</p>
            <h2 className="mt-4 text-3xl font-semibold">Parcel intelligence, scenarios, feasibility, and collaboration in one workspace</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-2xl border border-cyan-300/20 bg-[#071624]/90 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/75">Parcel + road overlay</p>
              <svg viewBox="0 0 680 360" className="mt-4 w-full rounded-xl border border-cyan-100/10 bg-[#04101a] p-2">
                <defs>
                  <pattern id="atlas-grid" width="18" height="18" patternUnits="userSpaceOnUse">
                    <path d="M 18 0 L 0 0 0 18" fill="none" stroke="rgba(79,209,255,0.12)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="680" height="360" fill="url(#atlas-grid)" />
                <polyline points="80,290 155,90 365,65 555,145 525,300 245,315 80,290" fill="rgba(79,209,255,0.15)" stroke="#4FD1FF" strokeWidth="3" />
                <line x1="95" y1="275" x2="520" y2="155" stroke="#F4C542" strokeWidth="4" />
                <line x1="168" y1="100" x2="250" y2="312" stroke="#F4C542" strokeWidth="2.5" strokeDasharray="8 8" />
                <line x1="370" y1="70" x2="370" y2="312" stroke="#4FD1FF" strokeWidth="2" strokeDasharray="6 6" />
                <line x1="260" y1="120" x2="500" y2="265" stroke="#4FD1FF" strokeWidth="2" strokeDasharray="6 6" />
                <circle cx="155" cy="90" r="6" fill="#F4C542" />
                <circle cx="365" cy="65" r="6" fill="#F4C542" />
                <circle cx="555" cy="145" r="6" fill="#F4C542" />
                <circle cx="525" cy="300" r="6" fill="#F4C542" />
                <circle cx="245" cy="315" r="6" fill="#F4C542" />
                <circle cx="80" cy="290" r="6" fill="#F4C542" />
              </svg>
              <p className="mt-3 text-sm text-[#b5cde6]">Live map layer language: parcel boundaries, road corridors, frontage edges, and zoning-ready subdivision routes.</p>
            </div>
            <div className="grid gap-3">
              {commandPanels.map(([title, copy]) => (
                <MotionCard key={title} className="p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">{title}</p>
                  <p className="mt-2 text-sm text-[#d8eaf9]">{copy}</p>
                </MotionCard>
              ))}
            </div>
          </div>
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

export async function getServerSideProps({ req, res }) {
  const cookies = Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [key, ...parts] = item.split('=');
        return [key, decodeURIComponent(parts.join('='))];
      })
  );

  let variant = cookies.atlas_home_variant;
  if (!['a', 'b'].includes(variant)) {
    variant = Math.random() > 0.5 ? 'b' : 'a';
    res.setHeader('Set-Cookie', `atlas_home_variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`);
  }

  return { props: { variant } };
}
