import { motion } from 'framer-motion';

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
  }
};

export const staggerParent = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

export function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y: 26 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({ children, className = '' }) {
  return (
    <motion.div className={className} variants={staggerParent} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }}>
      {children}
    </motion.div>
  );
}

export function MotionCard({ children, className = '' }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -7, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
      className={`glass-panel ${className}`}
    >
      {children}
    </motion.div>
  );
}
