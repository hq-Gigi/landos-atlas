import Head from 'next/head';
import NavBar from '../../components/NavBar';

export default function Page(){
  return (
    <>
      <Head><title>LandOS Atlas for Enterprises</title></Head>
      <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-20"><h1 className="text-4xl font-bold">For Enterprises</h1><p className="mt-4 text-slate-300">Standardize land intelligence operations across regions with organization controls, portfolio visibility, and repeatable analysis workflows.</p></section></main>
    </>
  );
}
