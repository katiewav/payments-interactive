'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import ScrollNarrative from '@/components/ScrollNarrative';
import PaymentFlowDiagram from '@/components/PaymentFlowDiagram';
import ControlPanel from '@/components/ControlPanel';
import FeeBreakdown from '@/components/FeeBreakdown';
import ScenarioSwitcher from '@/components/ScenarioSwitcher';
import FinalTakeaway from '@/components/FinalTakeaway';
import ThemeToggle from '@/components/ThemeToggle';
import ZoomOut from '@/components/ZoomOut';
import { DEFAULT_SCENARIO, calculateFees } from '@/lib/paymentModel';
import type { PaymentScenario, ScenarioPreset } from '@/lib/types';
import { useInView } from '@/lib/hooks';

export default function Home() {
  const [scenario, setScenario] = useState<PaymentScenario>(DEFAULT_SCENARIO);
  const [activePreset, setActivePreset] = useState<ScenarioPreset | null>('baseline');
  const narrativeRef = useRef<HTMLDivElement>(null);

  const fees = useMemo(() => calculateFees(scenario), [scenario]);

  const scrollToNarrative = useCallback(() => {
    narrativeRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScenarioChange = useCallback((newScenario: PaymentScenario) => {
    setScenario(newScenario);
    setActivePreset(null);
  }, []);

  const handlePresetSelect = useCallback((newScenario: PaymentScenario, preset: ScenarioPreset) => {
    setScenario(newScenario);
    setActivePreset(preset);
  }, []);

  const { ref: interactiveSectionRef, isInView: interactiveInView } = useInView(0.05);

  return (
    <main className="relative">
      {/* Theme toggle */}
      <ThemeToggle />

      {/* Hero */}
      <Hero onCtaClick={scrollToNarrative} />

      {/* Scroll Narrative */}
      <div ref={narrativeRef}>
        <ScrollNarrative />
      </div>

      {/* Zoom Out moment */}
      <ZoomOut />

      {/* Transition into interactive */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-muted mb-6">
              Interactive Explorer
            </p>
            <h2
              className="text-3xl md:text-5xl font-light leading-tight mb-6"
              style={{ fontFamily: 'var(--font-editorial)' }}
            >
              Now, trace your own payment.
            </h2>
            <p className="text-muted text-lg leading-relaxed max-w-xl mx-auto">
              Adjust the inputs below and watch how the flow, fees, and timing change
              across different payment scenarios.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Scenario Switcher */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <ScenarioSwitcher
            activePreset={activePreset}
            onSelect={handlePresetSelect}
          />
        </div>
      </section>

      {/* Interactive Section */}
      <section className="px-6 pb-12">
        <div ref={interactiveSectionRef} className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={interactiveInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            {/* Flow Diagram */}
            <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-6">
              <h3 className="text-xs tracking-[0.25em] uppercase text-muted mb-6">
                {activePreset === 'chargeback' ? 'Chargeback Flow' : 'Payment Flow'}
              </h3>
              <PaymentFlowDiagram
                scenario={scenario}
                fees={fees}
                showRetryPath={scenario.retryEnabled}
                activePreset={activePreset}
              />
            </div>

            {/* Controls + Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ControlPanel scenario={scenario} onChange={handleScenarioChange} />
              <FeeBreakdown fees={fees} />
            </div>

            {/* Narrative summary */}
            <motion.div
              key={`${JSON.stringify(scenario)}-${activePreset}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-6 bg-surface border border-border rounded-2xl p-6 md:p-8"
            >
              <h3 className="text-xs tracking-[0.25em] uppercase text-muted mb-4">
                Summary
              </h3>
              <p className="text-muted leading-relaxed text-sm">
                {getSummary(scenario, fees, activePreset)}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final Takeaway */}
      <FinalTakeaway />
    </main>
  );
}

function getSummary(
  scenario: PaymentScenario,
  fees: ReturnType<typeof calculateFees>,
  activePreset: ScenarioPreset | null
): string {
  if (activePreset === 'chargeback') {
    return `A $${scenario.amount.toFixed(2)} payment is disputed by the cardholder. The full $${scenario.amount.toFixed(2)} reverses through the chain — from the issuing bank, through the network, to the acquiring bank, and back to the processor. The merchant loses the original payment plus a ~$15 chargeback fee, totaling $${(scenario.amount + 15).toFixed(2)}. The dispute process typically takes 60–120 days to resolve.`;
  }

  const parts: string[] = [];

  parts.push(
    `A $${scenario.amount.toFixed(2)} ${scenario.isDomestic ? 'domestic' : 'cross-border'} ${
      scenario.isCardPresent ? 'card-present' : 'online'
    } payment`
  );

  if (scenario.isSubscription) parts.push('processed as a recurring subscription');
  if (scenario.isPremiumCard) parts.push('on a premium card');

  parts.push(
    `incurs $${fees.totalFees.toFixed(2)} in fees (${(
      (fees.totalFees / fees.grossAmount) * 100
    ).toFixed(1)}%)`
  );

  parts.push(`leaving $${fees.netToMerchant.toFixed(2)} net to the merchant.`);

  parts.push(
    `Settlement takes ${fees.settlementDays[0]}–${fees.settlementDays[1]} business days, with payout in ${fees.payoutDays[0]}–${fees.payoutDays[1]} days.`
  );

  if (scenario.retryEnabled) {
    parts.push('Smart retry is enabled to recover soft declines.');
  }

  if (scenario.platformTakeRate) {
    parts.push(
      `The platform takes a ${(scenario.platformTakeRate * 100).toFixed(0)}% fee ($${fees.platformFee.toFixed(2)}).`
    );
  }

  return parts.join(' ');
}
