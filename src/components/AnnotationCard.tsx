'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => { setIsOpen(false); setShowDetail(false); }, []);
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
    setShowDetail(false);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  return (
    <div ref={containerRef} className={`relative ${block ? 'block' : 'inline-block'}`}>
      <button
        onClick={toggle}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={(e) => {
          // Only close if focus leaves the entire container
          if (!containerRef.current?.contains(e.relatedTarget)) close();
        }}
        className={`cursor-pointer ${block ? 'w-full text-left' : ''}`}
        aria-label={`Learn about: ${annotation.title}`}
        aria-expanded={isOpen}
      >
        {children}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, y: position === 'bottom' ? -8 : 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === 'bottom' ? -8 : 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`absolute z-50 ${positionClasses[position]} w-[320px] pointer-events-auto`}
            onMouseEnter={open}
            onMouseLeave={close}
          >
            <div className="bg-surface-elevated border border-border rounded-xl p-5 shadow-2xl shadow-black/40">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" aria-hidden="true" />
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
                    aria-expanded={showDetail}
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
