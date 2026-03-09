import Link from 'next/link';
import { useRouter } from 'next/router';

const links = [
  ['Experience', '/experience'],
  ['Platform', '/platform'],
  ['Developers', '/for-developers'],
  ['Investors', '/for-investors'],
  ['Governments', '/for-governments'],
  ['Enterprises', '/for-enterprises'],
  ['App', '/app'],
  ['Pricing', '/pricing'],
  ['Security', '/security'],
  ['Contact', '/contact']
];

export default function NavBar() {
  const router = useRouter();
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#060B13]/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-sm text-slate-100">
        <Link href="/" className="font-semibold tracking-[0.18em] text-cyan-100">LandOS Atlas</Link>
        <div className="hidden gap-2 md:flex md:flex-wrap md:justify-end">
          {links.map(([label, href]) => {
            const active = router.pathname === href || router.pathname.startsWith(`${href}/`);
            return (
              <Link className={`nav-link ${active ? 'nav-link-active' : ''}`} key={href} href={href}>{label}</Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
