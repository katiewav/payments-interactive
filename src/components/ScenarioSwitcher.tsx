'use client';

import { motion } from 'framer-motion';
import type { ScenarioPreset, PaymentScenario } from '@/lib/types';
import { SCENARIO_PRESETS } from '@/lib/scenarios';

interface Props {
  activePreset: ScenarioPreset | null;
  onSelect: (scenario: PaymentScenario, preset: ScenarioPreset) => void;
}

export default function ScenarioSwitcher({ activePreset, onSelect }: Props) {
  return (
    <div>
      <h3 className="text-xs tracking-[0.25em] uppercase text-muted mb-4">
        Compare Scenarios
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SCENARIO_PRESETS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <motion.button
              key={preset.id}
              onClick={() => onSelect(preset.scenario, preset.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-accent/10 border-accent/30'
                  : 'bg-surface border-border hover:border-accent/20'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeScenario"
                  className="absolute inset-0 rounded-xl border-2 border-accent/40"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`text-sm font-medium block mb-1 ${
                  isActive ? 'text-accent' : 'text-foreground'
                }`}
              >
                {preset.label}
              </span>
              <span className="text-xs text-muted leading-relaxed">
                {preset.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
