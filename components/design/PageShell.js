import { motion } from 'framer-motion';
import NavBar from '../NavBar';

export default function PageShell({ children }) {
  return (
    <main className="atlas-bg min-h-screen text-[#EAF6FF]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
      </div>
      <NavBar />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        {children}
      </motion.div>
    </main>
  );
}
