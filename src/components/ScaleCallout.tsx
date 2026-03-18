'use client';

import { motion } from 'framer-motion';
import { useInView } from '@/lib/hooks';

interface Props {
  stat?: string;
  text: string;
  className?: string;
}

/**
 * A quiet editorial marginalia element — a stat or contextual line
 * that fades in as the user scrolls past. Feels like a footnote
 * in the margin of a long-form article.
 */
export default function ScaleCallout({ stat, text, className = '' }: Props) {
  const { ref, isInView } = useInView(0.5);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className={`py-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-px bg-accent/40 mt-[10px] shrink-0" />
        <div>
          {stat && (
            <span className="block text-xs font-mono text-accent mb-1">
              {stat}
            </span>
          )}
          <p className="text-sm text-muted/70 leading-relaxed italic">
            {text}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
