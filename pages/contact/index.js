import Head from 'next/head';
import NavBar from '../../components/NavBar';

export default function ContactPage() {
  return <><Head><title>LandOS Atlas Contact</title></Head><main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-4xl px-6 py-20"><h1 className="text-4xl font-bold">Contact / Demo</h1><p className="mt-3 text-slate-300">For enterprise, government, and institutional onboarding, email hello@gigilabs.io with your region, use case, and desired deployment timeline.</p></section></main></>;
}
