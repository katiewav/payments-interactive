'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnnotationCard as AnnotationCardType } from '@/lib/types';

interface Props {
  annotation: AnnotationCardType;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  block?: boolean;
}

export default function AnnotationCard({ annotation, children, position = 'top', block = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  return (
    <div className={`relative ${block ? 'block' : 'inline-block'}`}>
      <button
        onClick={() => { setIsOpen(!isOpen); setShowDetail(false); }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => { setIsOpen(false); setShowDetail(false); }}
        className={`cursor-pointer ${block ? 'w-full text-left' : ''}`}
        aria-label={`Learn about: ${annotation.title}`}
      >
        {children}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: position === 'bottom' ? -8 : 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === 'bottom' ? -8 : 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`absolute z-50 ${positionClasses[position]} w-[320px] pointer-events-auto`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => { setIsOpen(false); setShowDetail(false); }}
          >
            <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-2xl shadow-black/40">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <h4 className="text-sm font-medium text-foreground leading-snug">
                  {annotation.title}
                </h4>
              </div>
              <p className="text-sm text-muted leading-relaxed pl-[18px]">
                {annotation.body}
              </p>

              {annotation.detail && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetail(!showDetail);
                    }}
                    className="mt-3 pl-[18px] text-xs text-accent hover:text-accent-dim transition-colors cursor-pointer"
                  >
                    {showDetail ? 'Less' : 'More detail'}
                  </button>

                  <AnimatePresence>
                    {showDetail && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-muted/80 leading-relaxed pl-[18px] mt-2 overflow-hidden"
                      >
                        {annotation.detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
