'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnnotationCard from './AnnotationCard';
import { annotations } from '@/lib/annotationData';

const getAnnotation = (id: string) => annotations.find((a) => a.id === id)!;

const STAKEHOLDERS = [
  { id: 'issuer', label: 'Issuer', sub: "Cardholder's Bank" },
  { id: 'network', label: 'Network', sub: 'Visa / MC' },
  { id: 'acquirer', label: 'Acquirer', sub: "Merchant's Bank" },
  { id: 'processor', label: 'Processor', sub: 'Orchestration layer' },
];

export default function StakeholderReference() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-muted/60 hover:text-accent transition-colors cursor-pointer group"
        aria-expanded={isOpen}
        aria-controls="stakeholder-ref"
      >
        <span className="tracking-[0.15em] uppercase">
          {isOpen ? 'Hide' : 'Show'} key players
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[10px]"
          aria-hidden="true"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="stakeholder-ref"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1">
              {/* Compact flow chain */}
              <div className="flex items-center gap-0 flex-wrap justify-center mb-3" role="list" aria-label="Payment chain">
                {[
                  { name: 'Cardholder' },
                  { name: 'Issuer' },
                  { name: 'Network' },
                  { name: 'Acquirer' },
                  { name: 'Processor' },
                  { name: 'Merchant' },
                ].map((node, i, arr) => (
                  <div key={node.name} className="flex items-center" role="listitem">
                    <span className="text-xs px-2 py-1 rounded bg-surface border border-border text-muted">
                      {node.name}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="mx-0.5 text-muted/30 text-[10px]" aria-hidden="true">→</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Stakeholder definition cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="list" aria-label="Stakeholder definitions">
                {STAKEHOLDERS.map(({ id, label, sub }) => (
                  <AnnotationCard key={id} annotation={getAnnotation(id)} position="bottom">
                    <div className="p-2.5 bg-surface rounded-lg border border-border hover:border-accent/30 transition-colors text-center cursor-pointer w-full" role="listitem">
                      <span className="text-[10px] text-accent block mb-0.5" aria-hidden="true">ⓘ</span>
                      <span className="text-xs font-medium text-foreground block">{label}</span>
                      <span className="text-[10px] text-muted/50">{sub}</span>
                    </div>
                  </AnnotationCard>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
