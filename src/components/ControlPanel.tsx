'use client';

import { motion } from 'framer-motion';
import type { PaymentScenario } from '@/lib/types';

interface Props {
  scenario: PaymentScenario;
  onChange: (scenario: PaymentScenario) => void;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 relative w-9 h-5 rounded-full transition-colors shrink-0 cursor-pointer ${
          checked ? 'bg-accent' : 'bg-border'
        }`}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-background"
          animate={{ left: checked ? 18 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      <div>
        <span className="text-sm text-foreground group-hover:text-accent transition-colors">
          {label}
        </span>
        {description && (
          <span className="block text-xs text-muted mt-0.5">{description}</span>
        )}
      </div>
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-muted block mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none cursor-pointer hover:border-accent/30 transition-colors focus:outline-none focus:border-accent/50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ControlPanel({ scenario, onChange }: Props) {
  const update = (partial: Partial<PaymentScenario>) => {
    onChange({ ...scenario, ...partial });
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
      <h3 className="text-xs tracking-[0.25em] uppercase text-muted mb-6">
        Configure Scenario
      </h3>

      <div className="space-y-8">
        {/* Amount */}
        <div>
          <label className="text-xs text-muted block mb-2">Payment Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent text-lg font-mono">$</span>
            <input
              type="number"
              value={scenario.amount}
              onChange={(e) => update({ amount: Math.max(1, Number(e.target.value)) })}
              min={1}
              max={10000}
              className="w-full bg-background border border-border rounded-lg pl-8 pr-4 py-3 text-lg font-mono text-foreground focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        </div>

        {/* Country selects */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Merchant Country"
            value={scenario.merchantCountry}
            options={[
              { value: 'US', label: 'United States' },
              { value: 'UK', label: 'United Kingdom' },
              { value: 'DE', label: 'Germany' },
              { value: 'JP', label: 'Japan' },
              { value: 'SG', label: 'Singapore' },
            ]}
            onChange={(v) => update({
              merchantCountry: v,
              isDomestic: v === scenario.customerCountry,
            })}
          />
          <Select
            label="Customer Country"
            value={scenario.customerCountry}
            options={[
              { value: 'US', label: 'United States' },
              { value: 'UK', label: 'United Kingdom' },
              { value: 'DE', label: 'Germany' },
              { value: 'JP', label: 'Japan' },
              { value: 'BR', label: 'Brazil' },
            ]}
            onChange={(v) => update({
              customerCountry: v,
              isDomestic: v === scenario.merchantCountry,
            })}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <Toggle
            label="Card-present"
            description="In-person tap or swipe vs. online"
            checked={scenario.isCardPresent}
            onChange={(v) => update({ isCardPresent: v })}
          />
          <Toggle
            label="Subscription"
            description="Recurring payment with optimized interchange"
            checked={scenario.isSubscription}
            onChange={(v) => update({ isSubscription: v })}
          />
          <Toggle
            label="Premium card"
            description="Rewards or premium card tier"
            checked={scenario.isPremiumCard}
            onChange={(v) => update({ isPremiumCard: v })}
          />
          <Toggle
            label="Faster payout"
            description="Instant payout for additional fee"
            checked={scenario.isFasterPayout}
            onChange={(v) => update({ isFasterPayout: v })}
          />
          <Toggle
            label="Smart retry"
            description="Automatic retry on soft declines"
            checked={scenario.retryEnabled}
            onChange={(v) => update({ retryEnabled: v })}
          />
        </div>

        {/* Platform take rate */}
        <div>
          <Toggle
            label="Platform / marketplace fee"
            description="Add a platform take rate"
            checked={scenario.platformTakeRate !== null}
            onChange={(v) => update({ platformTakeRate: v ? 0.10 : null })}
          />
          {scenario.platformTakeRate !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 ml-12"
            >
              <label className="text-xs text-muted block mb-1">
                Take rate: {(scenario.platformTakeRate * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min={1}
                max={30}
                value={scenario.platformTakeRate * 100}
                onChange={(e) => update({ platformTakeRate: Number(e.target.value) / 100 })}
                className="w-full accent-accent"
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
