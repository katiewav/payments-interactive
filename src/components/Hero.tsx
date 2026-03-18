'use client';

import { motion } from 'framer-motion';

interface Props {
  onCtaClick: () => void;
}

const NODES = [
  { id: 'customer', label: 'Customer', x: 80, y: 200 },
  { id: 'stripe', label: '?', x: 300, y: 120, hidden: true },
  { id: 'network', label: '?', x: 520, y: 200, hidden: true },
  { id: 'merchant', label: 'Merchant', x: 740, y: 200 },
];

function PulsingParticle({ path, delay, duration }: { path: string; delay: number; duration: number }) {
  return (
    <motion.circle
      r={4}
      fill="var(--color-accent)"
      filter="url(#glow)"
      initial={{ offsetDistance: '0%', opacity: 0 }}
      animate={{
        offsetDistance: ['0%', '100%'],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 1,
        ease: 'easeInOut',
      }}
      style={{
        offsetPath: `path('${path}')`,
      }}
    />
  );
}

export default function Hero({ onCtaClick }: Props) {
  const mainPath = 'M 80 200 C 200 200, 200 120, 300 120 C 400 120, 400 200, 520 200 C 620 200, 620 200, 740 200';
  const directPath = 'M 80 200 Q 410 160 740 200';

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs tracking-[0.3em] uppercase text-muted mb-8"
        >
          An Interactive Explainer
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] mb-6"
          style={{ fontFamily: 'var(--font-editorial)' }}
        >
          Where Does
          <br />
          <span className="text-accent">$100</span> Go?
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-12"
        >
          A card payment feels instant. It isn&apos;t. Follow the money through the
          hidden layers of the payments system.
        </motion.p>

        {/* Flow diagram */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-full max-w-3xl mx-auto mb-12"
        >
          <svg viewBox="0 0 820 320" className="w-full h-auto">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.6" />
                <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Direct path (the "simple" version) */}
            <motion.path
              d={directPath}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="6 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1 }}
            />

            {/* Real path */}
            <motion.path
              d={mainPath}
              fill="none"
              stroke="url(#pathGrad)"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1.5 }}
            />

            {/* Particles */}
            <PulsingParticle path={mainPath} delay={2.5} duration={3} />
            <PulsingParticle path={mainPath} delay={3.5} duration={3} />
            <PulsingParticle path={mainPath} delay={4.5} duration={3} />

            {/* Nodes */}
            {NODES.map((node, i) => (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + i * 0.2 }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.hidden ? 20 : 28}
                  fill={node.hidden ? 'var(--color-surface)' : 'var(--color-surface-elevated)'}
                  stroke={node.hidden ? 'var(--color-border)' : 'var(--color-accent)'}
                  strokeWidth={node.hidden ? 1 : 1.5}
                  strokeDasharray={node.hidden ? '4 4' : 'none'}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={node.hidden ? 'var(--color-muted)' : 'var(--color-foreground)'}
                  fontSize={node.hidden ? 16 : 10}
                  fontFamily="var(--font-sans)"
                >
                  {node.label}
                </text>
                {!node.hidden && (
                  <text
                    x={node.x}
                    y={node.y + 48}
                    textAnchor="middle"
                    fill="var(--color-muted)"
                    fontSize={11}
                    fontFamily="var(--font-sans)"
                  >
                    {node.label}
                  </text>
                )}
              </motion.g>
            ))}

            {/* $100 label at start */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <text
                x={80}
                y={145}
                textAnchor="middle"
                fill="var(--color-accent)"
                fontSize={18}
                fontWeight={500}
                fontFamily="var(--font-mono)"
              >
                $100
              </text>
            </motion.g>

            {/* Net label at end */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
            >
              <text
                x={740}
                y={145}
                textAnchor="middle"
                fill="var(--color-muted)"
                fontSize={14}
                fontFamily="var(--font-mono)"
              >
                $95.21?
              </text>
            </motion.g>
          </svg>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          onClick={onCtaClick}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-accent text-background font-medium text-sm rounded-full hover:bg-accent-dim transition-colors cursor-pointer"
        >
          Trace the payment
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ↓
          </motion.span>
        </motion.button>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 border border-muted/40 rounded-full flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-1.5 bg-muted/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
