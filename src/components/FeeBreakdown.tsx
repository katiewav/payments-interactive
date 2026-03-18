'use client';

import { motion } from 'framer-motion';
import type { FeeBreakdown as FeeBreakdownType } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/paymentModel';

interface Props {
  fees: FeeBreakdownType;
}

function FeeBar({
  label,
  amount,
  percent,
  color,
  delay,
  total,
}: {
  label: string;
  amount: number;
  percent: string;
  color: string;
  delay: number;
  total: number;
}) {
  if (amount === 0) return null;

  const width = Math.max((amount / total) * 100, 2);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-muted group-hover:text-foreground transition-colors">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted/60 font-mono">{percent}</span>
          <span className="text-sm font-mono text-foreground">{formatCurrency(amount)}</span>
        </div>
      </div>
      <div className="h-2 bg-background rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}

export default function FeeBreakdown({ fees }: Props) {
  const feeItems = [
    { label: 'Processor fee', amount: fees.processorFee, color: 'var(--color-fee-processor)' },
    { label: 'Interchange (→ issuer)', amount: fees.interchangeFee, color: 'var(--color-fee-interchange)' },
    { label: 'Network assessment', amount: fees.networkFee, color: 'var(--color-fee-network)' },
    { label: 'Cross-border / FX', amount: fees.crossBorderFee, color: 'var(--color-fee-crossborder)' },
    { label: 'Platform fee', amount: fees.platformFee, color: 'var(--color-fee-platform)' },
  ].filter((f) => f.amount > 0);

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
      <h3 className="text-xs tracking-[0.25em] uppercase text-muted mb-6">
        Fee Breakdown
      </h3>

      {/* Gross */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted">Gross payment</span>
        <span className="text-lg font-mono text-foreground">{formatCurrency(fees.grossAmount)}</span>
      </div>
      <div className="h-3 bg-accent/15 rounded-full mb-6 relative overflow-hidden">
        <div className="h-full bg-accent/25 rounded-full w-full" />
      </div>

      {/* Fee items */}
      <div className="space-y-4 mb-8">
        {feeItems.map((item, i) => (
          <FeeBar
            key={item.label}
            label={item.label}
            amount={item.amount}
            percent={formatPercent(item.amount, fees.grossAmount)}
            color={item.color}
            delay={i * 0.1}
            total={fees.grossAmount}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-border my-6" />

      {/* Totals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Total fees</span>
          <span className="text-sm font-mono text-danger">
            −{formatCurrency(fees.totalFees)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Net to merchant</span>
          <span className="text-xl font-mono text-success font-medium">
            {formatCurrency(fees.netToMerchant)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Effective fee rate</span>
          <span className="text-xs font-mono text-muted">
            {formatPercent(fees.totalFees, fees.grossAmount)}
          </span>
        </div>
      </div>

      {/* Timing */}
      <div className="mt-8 pt-6 border-t border-border">
        <h4 className="text-xs tracking-[0.2em] uppercase text-muted mb-4">Timing</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-lg p-3">
            <span className="text-xs text-muted block mb-1">Settlement</span>
            <span className="text-sm font-mono text-warning">
              {fees.settlementDays[0]}–{fees.settlementDays[1]} days
            </span>
          </div>
          <div className="bg-background rounded-lg p-3">
            <span className="text-xs text-muted block mb-1">Payout</span>
            <span className="text-sm font-mono text-[var(--color-fee-processor)]">
              {fees.payoutDays[0]}–{fees.payoutDays[1]} days
            </span>
          </div>
        </div>
        <p className="text-xs text-muted/60 mt-3">{fees.retryImpact}</p>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted/40 mt-6 leading-relaxed">
        Fees shown are illustrative and based on simplified models. Actual rates
        vary by card type, merchant category, processor agreement, and region.
      </p>
    </div>
  );
}
