'use client';

import { motion } from 'framer-motion';
import { useInView } from '@/lib/hooks';
import MethodologyNote from './MethodologyNote';

export default function FinalTakeaway() {
  const { ref, isInView } = useInView(0.3);

  return (
    <section ref={ref} className="relative py-40 px-6 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface to-background" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 max-w-2xl mx-auto text-center"
      >
        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="w-16 h-px bg-accent mx-auto mb-12"
        />

        <h2
          className="text-3xl md:text-5xl font-light leading-tight mb-6"
          style={{ fontFamily: 'var(--font-editorial)' }}
        >
          A payment is not
          <br />
          a straight line.
        </h2>

        <p className="text-lg md:text-xl text-muted leading-relaxed mb-4">
          It is the hidden architecture of commerce — routed, verified,
          priced, and delayed — repeated billions of times a day.
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-muted/40 text-sm mt-12"
          style={{ fontFamily: 'var(--font-editorial)' }}
        >
          What looks like a tap is really a network.
        </motion.p>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="relative z-10 max-w-2xl mx-auto text-center mt-24"
      >
        <div className="h-px bg-border mb-8" />
        <p className="text-xs text-muted/40 leading-relaxed">
          Built as an independent interactive explainer of how digital payments actually work.
          <br />
          Fees shown are illustrative. Actual rates vary.
          <br />
          <span className="mt-3 inline-block">
            Made by{' '}
            <a
              href="https://twitter.com/katiewav"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted/60 hover:text-accent transition-colors"
            >
              @katiewav
            </a>
          </span>
        </p>
        <MethodologyNote />
      </motion.footer>
    </section>
  );
}
