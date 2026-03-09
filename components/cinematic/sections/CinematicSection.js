import { useCallback, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
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
    tl.fromTo('.scene-eyebrow', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8 })
      .fromTo('.scene-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, 0.1)
      .fromTo('.scene-copy', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9 }, 0.2)
      .fromTo('.kpi', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.8 }, 0.25)
      .to('.scene-card', { yPercent: -8, duration: 1.2 }, 0.2)
      .to({}, { duration: 1, onUpdate: () => setProgress(tl.progress()) });
  }, []);

  usePinnedSceneTimeline(ref, buildTimeline, reduced ? '+=450' : '+=1300');
  const show3D = useMemo(() => !reduced && tier !== 'low', [reduced, tier]);

  return (
    <section ref={ref} className="relative scene min-h-screen border-b border-white/10">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,#4FD1FF22,transparent_35%),radial-gradient(circle_at_70%_70%,#F4C5421a,transparent_35%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-8 py-16 lg:grid-cols-2">
        <div>
          <p className="scene-eyebrow text-xs uppercase tracking-[0.22em] text-cyan-200">{sceneKey}</p>
          <h2 className="scene-title mt-4 text-4xl font-semibold md:text-5xl">{title}</h2>
          <p className="scene-copy mt-4 max-w-xl text-[#c3dbf2]">{copy}</p>
          <motion.div className="kpi mt-6 glass-panel max-w-xs p-4 text-sm text-[#c3dbf2]" animate={{ boxShadow: ['0 0 0 rgba(79,209,255,0.1)', '0 0 35px rgba(79,209,255,0.25)', '0 0 0 rgba(79,209,255,0.1)'] }} transition={{ duration: 2.6, repeat: Infinity }}>
            Sequence progress: {(progress * 100).toFixed(0)}%
          </motion.div>
        </div>
        <div className="scene-card h-[400px] overflow-hidden rounded-3xl border border-white/15 bg-black/35 shadow-2xl">
          {show3D ? <Scene3D progress={progress} /> : <div className="flex h-full items-center justify-center text-sm text-slate-300">Cinematic fallback mode active ({tier})</div>}
        </div>
      </div>
    </section>
  );
}
