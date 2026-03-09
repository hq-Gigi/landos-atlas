import Link from 'next/link';
import NavBar from '../../components/NavBar';

export default function AppHome() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <NavBar />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">Application Workspace</h1>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {['portfolio', 'projects/new', 'marketplace', 'billing', 'team', 'settings'].map((route) => (
            <Link key={route} className="rounded-lg border border-white/10 p-4" href={`/app/${route}`}>/app/{route}</Link>
          ))}
        </div>
      </section>
    </main>
  );
}
