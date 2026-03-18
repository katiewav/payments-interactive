'use client';

import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from '@/lib/hooks';

/**
 * The "zoom out" moment — the single $100 payment becomes one dot
 * among thousands, revealing the scale of the system.
 */
export default function ZoomOut() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: textRef, isInView } = useInView(0.4);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const dotsOpacity = useTransform(scrollYProgress, [0.2, 0.45], [0, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);

  // Generate random dot positions (stable across renders)
  const dots = useMemo(() => {
    const result: { x: number; y: number; delay: number; size: number }[] = [];
    // Seeded-ish random using index
    for (let i = 0; i < 200; i++) {
      const seed = i * 2654435761;
      const x = ((seed >>> 0) % 1000) / 10;
      const y = (((seed * 31) >>> 0) % 1000) / 10;
      const delay = (i % 40) * 0.04;
      const size = i === 100 ? 3 : 1 + ((seed % 3) * 0.3);
      result.push({ x, y, delay, size });
    }
    return result;
  }, []);

  return (
    <section ref={containerRef} className="relative py-16 px-6 overflow-hidden">
      {/* Dot field */}
      <motion.div
        style={{ opacity: dotsOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
        >
          {dots.map((dot, i) => (
            <motion.circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={dot.size * 0.15}
              fill={i === 100 ? 'var(--color-accent)' : 'var(--color-muted)'}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: i === 100 ? 1 : 0.15 + (i % 5) * 0.04 } : {}}
              transition={{ duration: 0.8, delay: dot.delay }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Text content */}
      <motion.div
        ref={textRef}
        style={{ opacity: heroOpacity }}
        className="relative z-10 max-w-2xl mx-auto text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-3xl md:text-5xl font-light leading-tight mb-8"
          style={{ fontFamily: 'var(--font-editorial)' }}
        >
          Your $100 is not a payment.
          <br />
          <span className="text-accent">It is a pattern.</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-muted text-lg leading-relaxed mb-4"
        >
          This flow repeats 25,091 times per second.
          <br />
          2.17 billion times per day. 791 billion times a year.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.4 }}
          className="text-muted/50 text-sm mt-8"
        >
          Each dot is a transaction. The highlighted one is yours.
        </motion.p>
      </motion.div>
    </section>
  );
}
