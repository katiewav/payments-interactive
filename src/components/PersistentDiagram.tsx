'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChapterId } from '@/lib/chapters';

/* ─── Types & Props ──────────────────────────────────── */

interface Props {
  activeChapter: string;
  failureMode: 'none' | 'decline' | 'fraud' | 'chargeback';
  amount: number;
}

interface NodeDef {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
}

interface EdgeDef {
  id: string;
  from: string;
  to: string;
  dashed?: boolean;
  label?: string;
}

/* ─── Data ───────────────────────────────────────────── */

const NODES: NodeDef[] = [
  { id: 'customer', label: 'Customer', x: 70, y: 200 },
  { id: 'gateway', label: 'Gateway', x: 200, y: 200 },
  { id: 'processor', label: 'Processor', x: 330, y: 200 },
  { id: 'network', label: 'Network', sublabel: 'Visa / MC', x: 460, y: 120 },
  { id: 'issuer', label: 'Issuer', sublabel: "Customer's Bank", x: 600, y: 120 },
  { id: 'acquirer', label: 'Acquirer', sublabel: "Merchant's Bank", x: 460, y: 300 },
  { id: 'merchant', label: 'Merchant', x: 660, y: 300 },
];

const EDGES: EdgeDef[] = [
  { id: 'customer-gateway', from: 'customer', to: 'gateway' },
  { id: 'gateway-processor', from: 'gateway', to: 'processor' },
  { id: 'processor-network', from: 'processor', to: 'network' },
  { id: 'network-issuer', from: 'network', to: 'issuer' },
  { id: 'processor-acquirer', from: 'processor', to: 'acquirer' },
  { id: 'acquirer-merchant', from: 'acquirer', to: 'merchant' },
  { id: 'issuer-network-acquirer', from: 'issuer', to: 'acquirer', dashed: true },
];

const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

const FEE_LABELS: { edgeFrom: string; edgeTo: string; text: string; dx: number; dy: number }[] = [
  { edgeFrom: 'network', edgeTo: 'issuer', text: '+$1.80 interchange', dx: 0, dy: -14 },
  { edgeFrom: 'processor', edgeTo: 'network', text: '+$0.13 assessment', dx: 0, dy: -14 },
  { edgeFrom: 'gateway', edgeTo: 'processor', text: '+$1.27 margin', dx: 0, dy: -14 },
];

/* ─── Helpers ────────────────────────────────────────── */

function edgePath(from: NodeDef, to: NodeDef): string {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

function midpoint(a: NodeDef, b: NodeDef) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/* ─── Sub-components ─────────────────────────────────── */

function DiagramNode({ node, muted, failure }: { node: NodeDef; muted?: boolean; failure?: 'red' | 'orange' }) {
  const [hovered, setHovered] = useState(false);
  const fillColor = failure === 'red' ? 'var(--color-danger)' : failure === 'orange' ? 'var(--color-warning)' : 'var(--color-surface)';
  const strokeColor = failure ? fillColor : 'var(--color-border)';

  return (
    <motion.g
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: muted ? 0.35 : 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'default' }}
    >
      {/* circle */}
      <circle cx={node.x} cy={node.y} r={28} fill={fillColor} stroke={strokeColor} strokeWidth={1.5} opacity={muted ? 0.5 : 1} />
      {/* person icon for customer */}
      {node.id === 'customer' && (
        <g transform={`translate(${node.x - 8}, ${node.y - 10})`} fill="var(--color-foreground)" opacity={0.7}>
          <circle cx={8} cy={4} r={4} />
          <path d="M0 18 Q0 10 8 10 Q16 10 16 18" />
        </g>
      )}
      {/* label */}
      <text x={node.x} y={node.y + (node.id === 'customer' ? 46 : 44)} textAnchor="middle" fontSize={11} fill="var(--color-foreground)" fontFamily="var(--font-sans)">
        {node.label}
      </text>
      {/* sublabel */}
      {node.sublabel && (
        <text x={node.x} y={node.y + 55} textAnchor="middle" fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">
          {node.sublabel}
        </text>
      )}
      {/* hover role expansion */}
      <AnimatePresence>
        {hovered && (
          <motion.text
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            x={node.x}
            y={node.y - 36}
            textAnchor="middle"
            fontSize={9}
            fill="var(--color-accent)"
            fontFamily="var(--font-sans)"
          >
            {node.sublabel ?? node.label}
          </motion.text>
        )}
      </AnimatePresence>
    </motion.g>
  );
}

function DiagramEdge({ from, to, dashed, color, speed, muted }: {
  from: NodeDef; to: NodeDef; dashed?: boolean; color?: string; speed?: number; muted?: boolean;
}) {
  const stroke = color ?? 'var(--color-accent)';
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: muted ? 0.2 : 1 }} exit={{ opacity: 0 }}>
      <motion.path
        d={edgePath(from, to)}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        strokeDasharray={dashed ? '5 4' : undefined}
        markerEnd="url(#arrowhead)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: speed ?? 0.6, ease: 'easeInOut' }}
      />
    </motion.g>
  );
}

function Particle({ from, to, duration, color }: { from: NodeDef; to: NodeDef; duration: number; color: string }) {
  return (
    <motion.circle
      r={3}
      fill={color}
      initial={{ cx: from.x, cy: from.y, opacity: 0.8 }}
      animate={{ cx: to.x, cy: to.y, opacity: [0.8, 1, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/* ─── Main Component ─────────────────────────────────── */

export default function PersistentDiagram({ activeChapter, failureMode, amount }: Props) {
  const ch = activeChapter as ChapterId;
  const allVisible = !['hero', 'illusion'].includes(ch);
  const muted = ch === 'infrastructure';

  const visibleNodeIds = useMemo(() => {
    if (ch === 'hero') return [] as string[];
    if (ch === 'illusion') return ['customer', 'merchant'];
    return NODES.map(n => n.id);
  }, [ch]);

  const visibleEdgeIds = useMemo(() => {
    if (ch === 'hero') return [] as string[];
    if (ch === 'illusion') return ['customer-merchant'];
    return EDGES.map(e => e.id);
  }, [ch]);

  return (
    <svg viewBox="0 0 800 400" className="w-full h-auto" role="img" aria-label="Payment flow diagram">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="var(--color-accent)" />
        </marker>
        <marker id="arrowhead-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6" fill="var(--color-danger)" />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ─── Illusion direct line ─── */}
      <AnimatePresence>
        {ch === 'illusion' && (
          <motion.line
            x1={70} y1={200} x2={660} y2={300}
            stroke="var(--color-accent)"
            strokeWidth={1}
            strokeDasharray="6 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0, strokeDasharray: '2 8' }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* ─── Stack: fracturing line ─── */}
      <AnimatePresence>
        {ch === 'stack' && (
          <motion.line
            x1={70} y1={200} x2={660} y2={300}
            stroke="var(--color-muted)"
            strokeWidth={1}
            strokeDasharray="2 8"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0, strokeDashoffset: 40 }}
            transition={{ duration: 1.2 }}
          />
        )}
      </AnimatePresence>

      {/* ─── Edges ─── */}
      <AnimatePresence>
        {allVisible && EDGES.filter(e => visibleEdgeIds.includes(e.id)).map(e => {
          const isAuth = ['customer-gateway', 'gateway-processor', 'processor-network', 'network-issuer'].includes(e.id);
          const isSettle = ['processor-acquirer', 'acquirer-merchant', 'issuer-network-acquirer'].includes(e.id);
          let color = 'var(--color-accent)';
          let speed = 0.6;

          if (ch === 'auth-vs-settlement') {
            color = isAuth ? 'var(--color-success)' : 'var(--color-warning)';
            speed = isAuth ? 0.3 : 1.2;
          }
          if (ch === 'failure' && failureMode === 'decline' && !isAuth) color = 'var(--color-muted)';
          if (ch === 'failure' && failureMode === 'decline' && e.id === 'network-issuer') color = 'var(--color-danger)';

          return (
            <DiagramEdge
              key={e.id}
              from={nodeMap[e.from]}
              to={nodeMap[e.to]}
              dashed={e.dashed}
              color={color}
              speed={speed}
              muted={muted}
            />
          );
        })}
      </AnimatePresence>

      {/* ─── Auth/Settlement particles ─── */}
      {ch === 'auth-vs-settlement' && (
        <>
          <Particle from={nodeMap.customer} to={nodeMap.processor} duration={1} color="var(--color-success)" />
          <Particle from={nodeMap.processor} to={nodeMap.issuer} duration={0.8} color="var(--color-success)" />
          <Particle from={nodeMap.issuer} to={nodeMap.acquirer} duration={3} color="var(--color-warning)" />
          <Particle from={nodeMap.acquirer} to={nodeMap.merchant} duration={2.5} color="var(--color-warning)" />
        </>
      )}

      {/* ─── Chargeback reversal ─── */}
      {ch === 'failure' && failureMode === 'chargeback' && (
        <>
          <motion.path
            d={edgePath(nodeMap.issuer, nodeMap.merchant)}
            fill="none"
            stroke="var(--color-danger)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            markerEnd="url(#arrowhead-red)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1, duration: 1, ease: 'easeInOut' }}
          />
          <motion.text
            x={560} y={230}
            fontSize={10}
            fill="var(--color-danger)"
            fontFamily="var(--font-mono)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            ${amount} + $15–$25 fee
          </motion.text>
        </>
      )}

      {/* ─── Nodes ─── */}
      <AnimatePresence>
        {NODES.filter(n => visibleNodeIds.includes(n.id)).map((n, i) => {
          let failure: 'red' | 'orange' | undefined;
          if (ch === 'failure' && failureMode === 'decline' && n.id === 'issuer') failure = 'red';
          if (ch === 'failure' && failureMode === 'fraud' && n.id === 'processor') failure = 'orange';
          return <DiagramNode key={n.id} node={n} muted={muted} failure={failure} />;
        })}
      </AnimatePresence>

      {/* ─── Decline X mark ─── */}
      {ch === 'failure' && failureMode === 'decline' && (
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
          <text x={600} y={80} textAnchor="middle" fontSize={24} fill="var(--color-danger)">✕</text>
          <text x={600} y={70} textAnchor="middle" fontSize={10} fill="var(--color-danger)" fontFamily="var(--font-sans)">Declined</text>
        </motion.g>
      )}

      {/* ─── Fraud review label ─── */}
      {ch === 'failure' && failureMode === 'fraud' && (
        <motion.text
          x={330} y={160}
          textAnchor="middle"
          fontSize={10}
          fill="var(--color-warning)"
          fontFamily="var(--font-sans)"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Risk review
        </motion.text>
      )}

      {/* ─── Fee labels ─── */}
      <AnimatePresence>
        {ch === 'fees' && FEE_LABELS.map(f => {
          const mid = midpoint(nodeMap[f.edgeFrom], nodeMap[f.edgeTo]);
          return (
            <motion.text
              key={f.text}
              x={mid.x + f.dx}
              y={mid.y + f.dy}
              textAnchor="middle"
              fontSize={9}
              fill="var(--color-warning)"
              fontFamily="var(--font-mono)"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {f.text}
            </motion.text>
          );
        })}
      </AnimatePresence>

      {/* ─── Amount labels (fees chapter) ─── */}
      {ch === 'fees' && (
        <>
          <motion.text x={70} y={155} textAnchor="middle" fontSize={13} fontFamily="var(--font-mono)" fill="var(--color-success)" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            ${amount.toFixed(2)}
          </motion.text>
          <motion.text x={660} y={355} textAnchor="middle" fontSize={13} fontFamily="var(--font-mono)" fill="var(--color-warning)" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            ${(amount - 3.20).toFixed(2)}
          </motion.text>
        </>
      )}

      {/* ─── Timeline bar (auth vs settlement) ─── */}
      {ch === 'auth-vs-settlement' && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <rect x={100} y={365} width={250} height={6} rx={3} fill="var(--color-success)" opacity={0.7} />
          <rect x={400} y={365} width={300} height={6} rx={3} fill="var(--color-warning)" opacity={0.5} />
          <text x={225} y={390} textAnchor="middle" fontSize={9} fill="var(--color-success)" fontFamily="var(--font-mono)">~2 seconds</text>
          <text x={550} y={390} textAnchor="middle" fontSize={9} fill="var(--color-warning)" fontFamily="var(--font-mono)">1–3 days</text>
          <text x={100} y={360} fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">Auth</text>
          <text x={400} y={360} fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">Settlement</text>
        </motion.g>
      )}

      {/* ─── Infrastructure comparison ─── */}
      {ch === 'infrastructure' && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          {/* Without PSP */}
          <rect x={50} y={10} width={160} height={55} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
          <text x={130} y={28} textAnchor="middle" fontSize={9} fill="var(--color-foreground)" fontFamily="var(--font-sans)" fontWeight={600}>Without PSP</text>
          <text x={130} y={42} textAnchor="middle" fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">7 separate integrations</text>
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <rect key={i} x={62 + i * 20} y={48} width={14} height={10} rx={2} fill="var(--color-muted)" opacity={0.4} />
          ))}
          {/* With PSP */}
          <rect x={240} y={10} width={160} height={55} rx={6} fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth={1} />
          <text x={320} y={28} textAnchor="middle" fontSize={9} fill="var(--color-foreground)" fontFamily="var(--font-sans)" fontWeight={600}>With PSP</text>
          <text x={320} y={42} textAnchor="middle" fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">1 integration, bundled</text>
          <rect x={280} y={48} width={80} height={10} rx={2} fill="var(--color-accent)" opacity={0.5} />
        </motion.g>
      )}

      {/* ─── Takeaway gentle pulse ─── */}
      {ch === 'takeaway' && (
        <motion.circle
          cx={400} cy={200} r={180}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={0.5}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* ─── Legend ─── */}
      <g transform="translate(520, 380)">
        <line x1={0} y1={0} x2={20} y2={0} stroke="var(--color-accent)" strokeWidth={1} />
        <text x={24} y={3} fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">Data / auth flow</text>
        <line x1={120} y1={0} x2={140} y2={0} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="4 3" />
        <text x={144} y={3} fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">Fund settlement</text>
      </g>
      {ch === 'failure' && failureMode === 'chargeback' && (
        <g transform="translate(520, 393)">
          <line x1={0} y1={0} x2={20} y2={0} stroke="var(--color-danger)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={24} y={3} fontSize={8} fill="var(--color-danger)" fontFamily="var(--font-sans)">Dispute reversal</text>
        </g>
      )}
    </svg>
  );
}
