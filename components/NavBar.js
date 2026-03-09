import Link from 'next/link';

const links = [
  ['Experience', '/experience'],
  ['Platform', '/platform'],
  ['Developers', '/for-developers'],
  ['Investors', '/for-investors'],
  ['Governments', '/for-governments'],
  ['Enterprises', '/for-enterprises'],
  ['App', '/app'],
  ['Docs', '/docs/resources']
];

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-sm text-slate-100">
        <Link href="/" className="font-semibold tracking-wide">LandOS Atlas</Link>
        <div className="hidden gap-4 md:flex">
          {links.map(([label, href]) => (
            <Link className="transition hover:text-cyan-300" key={href} href={href}>{label}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
