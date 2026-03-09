import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>LandOS Atlas</title>
        <meta name="description" content="Planetary operating system for land intelligence" />
      </Head>
      <main className="min-h-screen bg-[#05070B] text-white">
        <nav className="p-6 flex justify-between items-center border-b border-gray-700">
          <h1 className="text-xl font-bold">LandOS Atlas</h1>
          <div className="space-x-4">
            <Link href="/experience">Experience</Link>
            <Link href="/platform">Platform</Link>
            <Link href="/for-developers">Developers</Link>
            <Link href="/for-investors">Investors</Link>
            <Link href="/for-governments">Governments</Link>
            <Link href="/for-enterprises">Enterprises</Link>
          </div>
        </nav>
        <section className="p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to LandOS Atlas</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-300">
            LandOS Atlas is a planetary intelligence and execution operating system that turns land anywhere on
            Earth into structured data, optimized planning scenarios, financial intelligence and collaborative
            workflows.
          </p>
        </section>
      </main>
    </>
  );
}
