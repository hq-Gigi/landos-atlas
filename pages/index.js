import Head from 'next/head';
import { useEffect } from 'react';
import Link from 'next/link';
import Hero from '../components/Hero';
import PageShell from '../components/design/PageShell';
import { MotionCard, Reveal, StaggerGrid } from '../components/design/MotionSystem';
import { audiences, productName, tagline } from '../lib/brand';

const storyMoments = [
  ['See everything in one place', 'Pull land, infrastructure, policy, and market signals into one clear workspace.'],
  ['Test options quickly', 'Compare multiple development plans in minutes and see the trade-offs clearly.'],
  ['Move from idea to action', 'Share a clear direction with investors, planners, and delivery teams right away.']
];

const reasonCards = [
  ['1. Faster project decisions', 'Run scenario options instantly instead of waiting days for disconnected reports.'],
  ['2. Better team alignment', 'Everyone works from one source of truth with shared comments, tasks, and timelines.'],
  ['3. Clear financial picture', 'Get cost, revenue, and margin projections for each option before committing capital.'],
  ['4. Risk visibility', 'Spot policy, infrastructure, and delivery risks early while changes are still low cost.'],
  ['5. Investor-ready outputs', 'Generate summaries and exports you can use directly in funding conversations.'],
  ['6. Built for live operations', 'Use it from early land analysis through execution, not just as a static planning tool.'],
  ['7. Scales across markets', 'Apply one repeatable operating system across regions, project sizes, and team structures.']
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
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <Reveal className="story-ribbon overflow-hidden rounded-2xl p-6 sm:p-8">
            <p className="eyebrow">How the platform helps</p>
            <h2 className="mt-4 text-2xl font-semibold sm:text-4xl">From land complexity to a plan your team can execute.</h2>
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
            <h2 className="text-3xl font-semibold">7 reasons teams choose LandOS Atlas</h2>
          </Reveal>
          <StaggerGrid className="reason-grid mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reasonCards.map(([title, copy], index) => (
              <MotionCard key={title} className="reason-card p-5" style={{ '--reason-delay': `${index * 0.22}s` }}>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-3 text-sm text-[#b5cde6]">{copy}</p>
              </MotionCard>
            ))}
          </StaggerGrid>
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
