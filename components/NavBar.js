import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => setMobileMenuOpen(false);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#060B13]/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm text-slate-100 sm:px-6">
        <Link href="/" className="font-semibold tracking-[0.14em] text-cyan-100 sm:tracking-[0.18em]">LandOS Atlas</Link>
        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-white/20 px-3 py-2 text-xs tracking-[0.15em] text-cyan-100 md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-links"
        >
          {mobileMenuOpen ? 'CLOSE' : 'MENU'}
        </button>
        <div className="hidden gap-2 md:flex md:flex-wrap md:justify-end">
          {links.map(([label, href]) => {
            const active = router.pathname === href || router.pathname.startsWith(`${href}/`);
            return (
              <Link className={`nav-link ${active ? 'nav-link-active' : ''}`} key={href} href={href}>{label}</Link>
            );
          })}
        </div>
      </div>
      <div id="mobile-nav-links" className={`${mobileMenuOpen ? 'block' : 'hidden'} border-t border-white/10 px-4 pb-4 pt-2 md:hidden`}>
        <div className="grid gap-2">
          {links.map(([label, href]) => {
            const active = router.pathname === href || router.pathname.startsWith(`${href}/`);
            return (
              <Link
                className={`nav-link block w-full px-3 py-2.5 text-base ${active ? 'nav-link-active' : ''}`}
                key={href}
                href={href}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
