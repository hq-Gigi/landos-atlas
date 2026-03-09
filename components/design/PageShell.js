import { motion } from 'framer-motion';
import NavBar from '../NavBar';

export default function PageShell({ children }) {
  return (
    <main className="atlas-bg min-h-screen text-[#EAF6FF]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <div className="aurora aurora-three" />
        <div className="scanlines" />
        <div className="vignette" />
      </div>
      <NavBar />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.div>
    </main>
  );
}
