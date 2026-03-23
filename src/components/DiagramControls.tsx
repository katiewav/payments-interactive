'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  activeLayer: 'all' | 'data' | 'money' | 'risk' | 'time';
  onLayerChange: (layer: 'all' | 'data' | 'money' | 'risk' | 'time') => void;
  simulationStep: number;
  onSimulationStep: (step: number) => void;
  activeChapter: string;
}

const LAYERS = [
  { id: 'all' as const, label: 'All', color: 'var(--color-accent)' },
  { id: 'data' as const, label: 'Data', color: 'var(--color-accent)' },
  { id: 'money' as const, label: 'Money', color: 'var(--color-success)' },
  { id: 'risk' as const, label: 'Risk', color: 'var(--color-warning)' },
];

const SIM_OUTCOMES = [
  { id: 'success', label: '✓ Approved', color: 'text-success' },
  { id: 'decline', label: '✕ Declined', color: 'text-danger' },
  { id: 'review', label: '⚠ Under review', color: 'text-warning' },
];

export default function DiagramControls({
  activeLayer, onLayerChange, simulationStep, onSimulationStep, activeChapter,
}: Props) {
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [simOutcome, setSimOutcome] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSim = !['hero', 'takeaway'].includes(activeChapter);
  const showLayers = !['hero', 'illusion', 'takeaway'].includes(activeChapter);

  // Clean up on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, []);

  const runSimulation = useCallback(() => {
    if (isSimRunning) return;
    setIsSimRunning(true);
    setSimOutcome(null);
    onSimulationStep(0);

    let step = 0;
    const advance = () => {
      step++;
      if (step <= 6) {
        onSimulationStep(step);
        intervalRef.current = setTimeout(advance, 700);
      } else {
        // Random outcome
        const outcomes = ['success', 'success', 'success', 'decline', 'review'];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        setSimOutcome(outcome);
        setIsSimRunning(false);
        // Auto-clear after 3s
        intervalRef.current = setTimeout(() => {
          onSimulationStep(-1);
          setSimOutcome(null);
        }, 4000);
      }
    };
    intervalRef.current = setTimeout(advance, 700);
  }, [isSimRunning, onSimulationStep]);

  const resetSim = useCallback(() => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
    setIsSimRunning(false);
    setSimOutcome(null);
    onSimulationStep(-1);
  }, [onSimulationStep]);

  if (!showSim && !showLayers) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-3">
      {/* Run transaction button */}
      {showSim && (
        <div className="flex items-center gap-2">
          <motion.button
            onClick={isSimRunning ? resetSim : runSimulation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`text-xs px-4 py-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2 ${
              isSimRunning
                ? 'border-danger/40 text-danger bg-danger/10'
                : 'border-accent/40 text-accent bg-accent/10 hover:bg-accent/15'
            }`}
          >
            {isSimRunning ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>◌</motion.span>
                Stop
              </>
            ) : (
              <>
                <span>▶</span>
                Run a payment
              </>
            )}
          </motion.button>

          {/* Outcome badge */}
          <AnimatePresence>
            {simOutcome && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  simOutcome === 'success' ? 'border-success/30 bg-success/10 text-success'
                    : simOutcome === 'decline' ? 'border-danger/30 bg-danger/10 text-danger'
                    : 'border-warning/30 bg-warning/10 text-warning'
                }`}
              >
                {SIM_OUTCOMES.find(o => o.id === simOutcome)?.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Layer toggle */}
      {showLayers && (
        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5 ml-auto">
          {LAYERS.map(layer => (
            <button
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              className={`text-[10px] px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeLayer === layer.id
                  ? 'bg-accent/15 text-accent'
                  : 'text-muted/50 hover:text-muted'
              }`}
            >
              {activeLayer === layer.id && (
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: layer.color }} />
              )}
              {layer.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
