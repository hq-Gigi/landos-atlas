import Head from 'next/head';
import NavBar from '../../components/NavBar';

export default function Page(){
  return (
    <>
      <Head><title>LandOS Atlas for Governments</title></Head>
      <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-20"><h1 className="text-4xl font-bold">For Governments</h1><p className="mt-4 text-slate-300">Assess parcel development strategies with auditable tradeoffs across density, delivery, frontage, and financial sustainability.</p></section></main>
    </>
  );
}
