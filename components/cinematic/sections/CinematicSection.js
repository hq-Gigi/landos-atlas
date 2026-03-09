import { useCallback, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePinnedSceneTimeline } from '../hooks/usePinnedSceneTimeline';
import { useReducedMotionMode } from '../hooks/useReducedMotionMode';
import { useDevicePerformanceTier } from '../hooks/useDevicePerformanceTier';

const Scene3D = dynamic(() => import('../r3f/AtlasExperienceScene'), { ssr: false });

export default function CinematicSection({ title, copy, sceneKey, accent = 'from-cyan-500/20 to-fuchsia-500/20' }) {
  const ref = useRef(null);
  const reduced = useReducedMotionMode();
  const tier = useDevicePerformanceTier();
  const [progress, setProgress] = useState(0);

  const buildTimeline = useCallback((tl) => {
    tl.fromTo('.overlay', { opacity: 0.2, y: 36 }, { opacity: 1, y: 0, duration: 1 })
      .fromTo('.kpi', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.8 }, 0.2)
      .to({}, {
        duration: 1,
        onUpdate: () => setProgress(tl.progress())
      });
  }, []);

  usePinnedSceneTimeline(ref, buildTimeline, reduced ? '+=500' : '+=1200');

  const show3D = useMemo(() => !reduced && tier !== 'low', [reduced, tier]);

  return (
    <section ref={ref} className="relative scene min-h-screen border-b border-white/10">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-6 px-8 py-16 lg:grid-cols-2">
        <div className="overlay">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{sceneKey}</p>
          <h2 className="mt-3 text-4xl font-bold">{title}</h2>
          <p className="mt-4 max-w-xl text-slate-200">{copy}</p>
          <div className="kpi mt-6 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-slate-200">Scroll progress: {(progress * 100).toFixed(0)}%</div>
        </div>
        <div className="h-[360px] overflow-hidden rounded-2xl border border-white/15 bg-black/30">
          {show3D ? <Scene3D progress={progress} /> : <div className="flex h-full items-center justify-center text-sm text-slate-300">Cinematic fallback mode active for device tier: {tier}</div>}
        </div>
      </div>
    </section>
  );
}
