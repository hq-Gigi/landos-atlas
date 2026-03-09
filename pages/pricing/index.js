import Head from 'next/head';
import { motion } from 'framer-motion';
import PageShell from '../../components/design/PageShell';
import { MotionCard, Reveal, StaggerGrid } from '../../components/design/MotionSystem';

export default function PricingPage() {
  const plans = [
    { name: 'Explorer', price: 'Free', cta: 'Start free', featured: false, features: ['2 active projects', 'Parcel discovery previews', 'Community support'] },
    { name: 'Pro', price: '$49/mo', cta: 'Start Pro', featured: false, features: ['Unlimited scenarios', 'AI recommendations', 'Core export pack'] },
    { name: 'Studio', price: '$149/mo', cta: 'Upgrade to Studio', featured: true, features: ['Portfolio optimization', 'Boardroom brief generator', 'Priority support + workflow templates'] },
    { name: 'Enterprise', price: 'Custom', cta: 'Talk to sales', featured: false, features: ['Org controls + SSO', 'Governance workflows', 'Custom integrations + SLA'] }
  ];

  return (
    <>
      <Head><title>LandOS Atlas Pricing</title></Head>
      <PageShell>
        <section className="mx-auto max-w-7xl px-6 py-20">
          <Reveal>
            <p className="eyebrow">PRICING INTELLIGENCE TIERS</p>
            <h1 className="mt-4 text-5xl font-semibold">Choose the command layer for your growth stage</h1>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-6 lg:grid-cols-4">
            {plans.map((p) => (
              <MotionCard key={p.name} className={`relative p-6 ${p.featured ? 'ring-1 ring-[#4FD1FF]/80 shadow-[0_0_40px_rgba(79,209,255,0.35)]' : ''}`}>
                {p.featured && <span className="absolute -top-3 left-6 rounded-full bg-[#F4C542] px-3 py-1 text-xs font-semibold text-[#0A0F17]">Recommended</span>}
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <p className="mt-2 text-3xl font-semibold text-cyan-200">{p.price}</p>
                <ul className="mt-5 space-y-2 text-sm text-[#b5cde6]">
                  {p.features.map((f) => <li key={f}>✦ {f}</li>)}
                </ul>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className={`mt-6 w-full rounded-xl px-4 py-3 font-semibold ${p.featured ? 'bg-cyan-300 text-[#051320]' : 'border border-white/20 bg-white/5 text-[#EAF6FF]'}`}>
                  {p.cta}
                </motion.button>
              </MotionCard>
            ))}
          </StaggerGrid>
        </section>
      </PageShell>
    </>
  );
}
