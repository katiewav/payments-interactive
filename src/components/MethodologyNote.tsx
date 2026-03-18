'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MethodologyNote() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="text-center mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[10px] text-muted/30 hover:text-muted/50 transition-colors cursor-pointer tracking-wide uppercase"
        aria-expanded={isOpen}
        aria-controls="methodology-content"
      >
        {isOpen ? 'Close' : 'Sources & methodology'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="methodology-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="text-[11px] text-muted/40 leading-relaxed max-w-xl mx-auto mt-4 px-4 text-left space-y-3">
              <p>
                <strong className="text-muted/50">Fee model.</strong>{' '}
                The default scenario uses blended pricing (2.9% + $0.30), where
                interchange and network fees are embedded within the processor
                rate — not added on top. This reflects how most merchants
                experience pricing from processors like Stripe or Square.
                Actual rates vary by processor agreement, card type, and merchant category.
              </p>
              <p>
                <strong className="text-muted/50">Scale statistics.</strong>{' '}
                Transaction volumes and system-scale figures are drawn from
                public industry sources including Nilson Report, Visa and
                Mastercard fiscal filings, and Juniper Research. Chargeback
                projections are from industry forecasts. Stablecoin volume
                estimates reflect approximate on-chain settlement activity.
              </p>
              <p>
                <strong className="text-muted/50">Timing.</strong>{' '}
                Settlement and payout windows are simplified estimates.
                Actual timing depends on processor, acquirer, network batch
                cycles, and merchant risk profile.
              </p>
              <p>
                This piece is educational, not a pricing tool or financial advice.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
