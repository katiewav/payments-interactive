'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SOURCES_NOTE } from '@/lib/editorialStats';

export default function MethodologyNote() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="text-center mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[10px] text-muted/30 hover:text-muted/50 transition-colors cursor-pointer tracking-wide uppercase"
      >
        {isOpen ? 'Close' : 'Sources & methodology'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-[11px] text-muted/40 leading-relaxed max-w-xl mx-auto mt-4 px-4">
              {SOURCES_NOTE}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
