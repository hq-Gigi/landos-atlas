import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function usePinnedSceneTimeline(sectionRef, buildTimeline, end = '+=1200') {
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end,
          scrub: true,
          pin: true,
          anticipatePin: 1
        }
      });
      buildTimeline(tl);
    }, sectionRef);
    return () => ctx.revert();
  }, [sectionRef, buildTimeline, end]);
}
