import { useEffect } from 'react';
import Lenis from 'lenis';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true });
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <Component {...pageProps} />;
}
