'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PaymentScenario, FeeBreakdown, ScenarioPreset } from '@/lib/types';
import { calculateFees, formatCurrency, DEFAULT_SCENARIO } from '@/lib/paymentModel';

interface Props {
  scenario: PaymentScenario;
  fees: FeeBreakdown;
  activePreset: ScenarioPreset | null;
}

interface Delta {
  label: string;
  value: string;
  direction: 'up' | 'down' | 'neutral' | 'warning';
  icon: string;
}

export default function ScenarioImpactBanner({ scenario, fees, activePreset }: Props) {
  const baselineFees = useMemo(() => calculateFees(DEFAULT_SCENARIO), []);

  const deltas = useMemo((): Delta[] => {
    if (!activePreset || activePreset === 'baseline') return [];

    if (activePreset === 'chargeback') {
      return [
        { label: 'Merchant loses', value: `${formatCurrency(scenario.amount + 15)}–${formatCurrency(scenario.amount + 25)}`, direction: 'warning', icon: '⊘' },
        { label: 'Chargeback fee', value: '~$15–$25', direction: 'warning', icon: '↩' },
        { label: 'Resolution time', value: '60–120 days', direction: 'neutral', icon: '◷' },
        { label: 'Net to merchant', value: formatCurrency(0), direction: 'down', icon: '→' },
      ];
    }

    const result: Delta[] = [];
    const feeDiff = fees.totalFees - baselineFees.totalFees;
    const netDiff = fees.netToMerchant - baselineFees.netToMerchant;

    // Net to merchant (always show)
    result.push({
      label: 'Net to merchant',
      value: formatCurrency(fees.netToMerchant),
      direction: netDiff < -0.01 ? 'down' : netDiff > 0.01 ? 'up' : 'neutral',
      icon: '→',
    });

    // Fee change
    if (Math.abs(feeDiff) > 0.01) {
      result.push({
        label: 'Total fees',
        value: `${formatCurrency(fees.totalFees)} (${feeDiff > 0 ? '+' : ''}${formatCurrency(feeDiff)})`,
        direction: feeDiff > 0 ? 'warning' : 'up',
        icon: feeDiff > 0 ? '↑' : '↓',
      });
    }

    // Cross-border
    if (fees.crossBorderFee > 0) {
      result.push({
        label: 'Cross-border / FX',
        value: `+${formatCurrency(fees.crossBorderFee)}`,
        direction: 'warning',
        icon: '⊕',
      });
    }

    // Platform fee
    if (fees.platformFee > 0) {
      result.push({
        label: 'Platform take',
        value: formatCurrency(fees.platformFee),
        direction: 'warning',
        icon: '%',
      });
    }

    // Settlement change
    if (fees.settlementDays[1] !== baselineFees.settlementDays[1]) {
      result.push({
        label: 'Settlement',
        value: `${fees.settlementDays[0]}–${fees.settlementDays[1]} days`,
        direction: fees.settlementDays[1] > baselineFees.settlementDays[1] ? 'warning' : 'up',
        icon: '◷',
      });
    }

    // Retry
    if (scenario.retryEnabled && !DEFAULT_SCENARIO.retryEnabled) {
      result.push({
        label: 'Retry recovery',
        value: '~15% soft declines',
        direction: 'up',
        icon: '↻',
      });
    }

    return result;
  }, [scenario, fees, activePreset, baselineFees]);

  if (deltas.length === 0) return null;

  const colorMap = {
    up: 'text-success',
    down: 'text-danger',
    warning: 'text-warning',
    neutral: 'text-muted',
  };
  const bgMap = {
    up: 'bg-success/8',
    down: 'bg-danger/8',
    warning: 'bg-warning/8',
    neutral: 'bg-surface',
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activePreset}
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="overflow-hidden"
      >
        <div className="bg-surface border border-border rounded-xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs tracking-[0.15em] uppercase text-muted">
              vs. baseline
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {deltas.map((delta, i) => (
              <motion.div
                key={delta.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className={`rounded-lg px-3 py-2.5 ${bgMap[delta.direction]}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-xs font-mono ${colorMap[delta.direction]}`} aria-hidden="true">
                    {delta.icon}
                  </span>
                  <span className="text-[10px] text-muted uppercase tracking-wide">
                    {delta.label}
                  </span>
                </div>
                <span className={`text-sm font-mono font-medium ${colorMap[delta.direction]}`}>
                  {delta.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
