'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChapterId } from '@/lib/chapters';

/* ─── Types & Props ──────────────────────────────────── */

interface Props {
  activeChapter: string;
  failureMode: 'none' | 'decline' | 'fraud' | 'chargeback';
  amount: number;
  activeLayer?: 'all' | 'data' | 'money' | 'risk' | 'time';
  simulationStep?: number; // -1 = idle, 0-6 = step
}

interface NodeDef {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  detail?: {
    role: string;
    touches: string[];
    when: string;
    insight: string;
  };
}

interface EdgeDef {
  id: string;
  from: string;
  to: string;
  dashed?: boolean;
  label?: string;
  layers: ('data' | 'money' | 'risk')[];
}

/* ─── Data ───────────────────────────────────────────── */

const NODES: NodeDef[] = [
  {
    id: 'customer', label: 'Customer', x: 70, y: 200,
    detail: {
      role: 'Initiates payment by presenting card credentials',
      touches: ['Card data', 'Authentication (3DS)'],
      when: 'Authorization',
      insight: 'The customer sees "approved" in ~2 seconds. The system is just getting started.',
    },
  },
  {
    id: 'gateway', label: 'Gateway', x: 200, y: 200,
    detail: {
      role: 'Captures, encrypts, and tokenizes card data for PCI compliance',
      touches: ['Card data', 'Encryption', 'Tokenization'],
      when: 'Authorization',
      insight: 'The gateway touches card data so the merchant doesn\'t have to. This is how PCI scope is reduced.',
    },
  },
  {
    id: 'processor', label: 'Processor', x: 330, y: 200,
    detail: {
      role: 'Routes transactions, coordinates retries, manages fraud screening',
      touches: ['Data routing', 'Risk scoring', 'Retry logic'],
      when: 'Auth + Settlement',
      insight: 'Many "payment companies" are really orchestration layers that bundle this role with others.',
    },
  },
  {
    id: 'network', label: 'Network', sublabel: 'Visa / MC', x: 460, y: 120,
    detail: {
      role: 'Message rail between issuer and acquirer. Sets interchange rates and dispute rules.',
      touches: ['Auth messages', 'Assessment fees', 'Dispute protocols'],
      when: 'Auth + Settlement',
      insight: 'Card networks don\'t hold funds. They route messages and set the rules everyone follows.',
    },
  },
  {
    id: 'issuer', label: 'Issuer', sublabel: "Customer's Bank", x: 600, y: 120,
    detail: {
      role: 'Approves or declines. Fronts the money. Bears fraud liability.',
      touches: ['Balance check', 'Fraud signals', 'Interchange revenue'],
      when: 'Auth (decides) + Settlement (funds)',
      insight: 'The issuer earns interchange on every approved transaction. Premium cards = higher interchange = better rewards.',
    },
  },
  {
    id: 'acquirer', label: 'Acquirer', sublabel: "Merchant's Bank", x: 460, y: 300,
    detail: {
      role: 'Receives settlement funds from the network. Deposits to merchant.',
      touches: ['Settlement funds', 'Merchant risk underwriting'],
      when: 'Settlement + Payout',
      insight: 'Acquirers can freeze payouts if fraud patterns emerge. They underwrite the merchant\'s risk.',
    },
  },
  {
    id: 'merchant', label: 'Merchant', x: 660, y: 300,
    detail: {
      role: 'Receives net payment after all fees are extracted',
      touches: ['Net revenue', 'Dispute liability', 'Reconciliation'],
      when: 'Payout (T+2 typical)',
      insight: '"Payment complete" on the merchant\'s dashboard doesn\'t mean the money has arrived.',
    },
  },
];

const EDGES: EdgeDef[] = [
  { id: 'customer-gateway', from: 'customer', to: 'gateway', layers: ['data'] },
  { id: 'gateway-processor', from: 'gateway', to: 'processor', layers: ['data', 'risk'] },
  { id: 'processor-network', from: 'processor', to: 'network', layers: ['data'] },
  { id: 'network-issuer', from: 'network', to: 'issuer', layers: ['data', 'risk'] },
  { id: 'processor-acquirer', from: 'processor', to: 'acquirer', layers: ['money'] },
  { id: 'acquirer-merchant', from: 'acquirer', to: 'merchant', dashed: true, layers: ['money'] },
  { id: 'issuer-network-acquirer', from: 'issuer', to: 'acquirer', dashed: true, layers: ['money'] },
];

const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

const FEE_LABELS: { edgeFrom: string; edgeTo: string; text: string; dx: number; dy: number }[] = [
  { edgeFrom: 'network', edgeTo: 'issuer', text: '+$1.80 interchange', dx: 0, dy: -14 },
  { edgeFrom: 'processor', edgeTo: 'network', text: '+$0.13 assessment', dx: 0, dy: -14 },
  { edgeFrom: 'gateway', edgeTo: 'processor', text: '+$1.27 margin', dx: 0, dy: -14 },
];

/* ─── Simulation step definitions ─── */
const SIM_STEPS = [
  { label: 'Card presented', activeEdges: ['customer-gateway'], activeNodes: ['customer', 'gateway'] },
  { label: 'Data encrypted & routed', activeEdges: ['customer-gateway', 'gateway-processor'], activeNodes: ['customer', 'gateway', 'processor'] },
  { label: 'Auth request sent', activeEdges: ['customer-gateway', 'gateway-processor', 'processor-network', 'network-issuer'], activeNodes: ['customer', 'gateway', 'processor', 'network', 'issuer'] },
  { label: 'Issuer approves', activeEdges: ['customer-gateway', 'gateway-processor', 'processor-network', 'network-issuer'], activeNodes: ['customer', 'gateway', 'processor', 'network', 'issuer'] },
  { label: 'Clearing & settlement begins', activeEdges: ['customer-gateway', 'gateway-processor', 'processor-network', 'network-issuer', 'issuer-network-acquirer', 'processor-acquirer'], activeNodes: NODES.map(n => n.id) },
  { label: 'Funds arrive at acquirer', activeEdges: EDGES.map(e => e.id), activeNodes: NODES.map(n => n.id) },
  { label: 'Merchant paid', activeEdges: EDGES.map(e => e.id), activeNodes: NODES.map(n => n.id) },
];

/* ─── Layer colors ─── */
const LAYER_COLORS: Record<string, string> = {
  data: 'var(--color-accent)',
  money: 'var(--color-success)',
  risk: 'var(--color-warning)',
};

/* ─── Helpers ────────────────────────────────────────── */

function edgePath(from: NodeDef, to: NodeDef): string {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

function midpoint(a: NodeDef, b: NodeDef) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/* ─── Node Detail Card ───────────────────────────────── */

function NodeDetailCard({ node, onClose }: { node: NodeDef; onClose: () => void }) {
  if (!node.detail) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="absolute z-50 w-[300px] pointer-events-auto"
      style={{
        left: Math.min(Math.max(node.x - 150, 10), 480),
        top: node.y > 200 ? node.y - 200 : node.y + 50,
      }}
    >
      <div
        className="bg-surface-elevated border border-accent/20 rounded-xl p-4 shadow-2xl shadow-black/30 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-foreground">{node.label}</h4>
          <button
            onClick={onClose}
            className="text-muted/40 hover:text-foreground text-xs transition-colors cursor-pointer"
            aria-label="Close"
          >✕</button>
        </div>
        <p className="text-xs text-muted leading-relaxed mb-3">{node.detail.role}</p>

        <div className="space-y-2 mb-3">
          <div>
            <span className="text-[9px] tracking-wider uppercase text-muted/50 block mb-1">Touches</span>
            <div className="flex flex-wrap gap-1">
              {node.detail.touches.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[9px] tracking-wider uppercase text-muted/50 block mb-1">Active during</span>
            <span className="text-xs text-muted">{node.detail.when}</span>
          </div>
        </div>

        <div className="border-t border-border pt-2">
          <p className="text-[11px] text-accent/80 leading-relaxed italic">
            💡 {node.detail.insight}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Sub-components ─────────────────────────────────── */

function DiagramNode({
  node, muted, failure, isSimActive, isSelected, onClick, activeLayer,
}: {
  node: NodeDef; muted?: boolean; failure?: 'red' | 'orange';
  isSimActive?: boolean; isSelected?: boolean;
  onClick?: () => void; activeLayer?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const fillColor = failure === 'red' ? 'var(--color-danger)' : failure === 'orange' ? 'var(--color-warning)' : 'var(--color-surface)';
  const strokeColor = isSelected ? 'var(--color-accent)' : failure ? fillColor : 'var(--color-border)';
  const isClickable = !!node.detail;

  return (
    <motion.g
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{
        scale: isSimActive ? 1.08 : 1,
        opacity: muted ? 0.35 : 1,
      }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); if (onClick) onClick(); }}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      {/* Pulse ring on sim active */}
      {isSimActive && (
        <motion.circle
          cx={node.x} cy={node.y} r={32}
          fill="none" stroke="var(--color-accent)" strokeWidth={1}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.9, 1.15, 1.2] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {/* Selection ring */}
      {isSelected && (
        <motion.circle
          cx={node.x} cy={node.y} r={34}
          fill="none" stroke="var(--color-accent)" strokeWidth={2}
          strokeDasharray="4 3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6, rotate: 360 }}
          transition={{ opacity: { duration: 0.2 }, rotate: { duration: 8, repeat: Infinity, ease: 'linear' } }}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
        />
      )}

      {/* Main circle */}
      <circle
        cx={node.x} cy={node.y} r={28}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isSelected || hovered ? 2 : 1.5}
        opacity={muted ? 0.5 : 1}
      />

      {/* Hover highlight */}
      {hovered && isClickable && !isSelected && (
        <circle cx={node.x} cy={node.y} r={30} fill="none" stroke="var(--color-accent)" strokeWidth={1} opacity={0.3} />
      )}

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
      {node.sublabel && (
        <text x={node.x} y={node.y + 55} textAnchor="middle" fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">
          {node.sublabel}
        </text>
      )}

      {/* Click affordance */}
      {isClickable && hovered && !isSelected && (
        <motion.text
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          x={node.x} y={node.y - 36}
          textAnchor="middle" fontSize={8}
          fill="var(--color-accent)"
          fontFamily="var(--font-sans)"
        >
          Click to explore
        </motion.text>
      )}
    </motion.g>
  );
}

function DiagramEdge({ from, to, dashed, color, speed, muted, thick }: {
  from: NodeDef; to: NodeDef; dashed?: boolean; color?: string; speed?: number; muted?: boolean; thick?: boolean;
}) {
  const stroke = color ?? 'var(--color-accent)';
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: muted ? 0.15 : 1 }} exit={{ opacity: 0 }}>
      <motion.path
        d={edgePath(from, to)}
        fill="none"
        stroke={stroke}
        strokeWidth={thick ? 2.5 : 1}
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

export default function PersistentDiagram({
  activeChapter, failureMode, amount,
  activeLayer = 'all', simulationStep = -1,
}: Props) {
  const ch = activeChapter as ChapterId;
  const allVisible = !['hero', 'illusion'].includes(ch);
  const muted = ch === 'infrastructure';
  const isSimulating = simulationStep >= 0;

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Clear selection when chapter changes
  useEffect(() => {
    setSelectedNode(null);
  }, [activeChapter]);

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

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(prev => prev === nodeId ? null : nodeId);
  }, []);

  const simStep = isSimulating ? SIM_STEPS[Math.min(simulationStep, SIM_STEPS.length - 1)] : null;

  return (
    <div className="w-full overflow-visible relative">
      {/* Node detail cards (rendered outside SVG for proper HTML) */}
      <AnimatePresence>
        {selectedNode && (() => {
          const node = nodeMap[selectedNode];
          if (!node?.detail) return null;
          return (
            <NodeDetailCard
              key={selectedNode}
              node={node}
              onClose={() => setSelectedNode(null)}
            />
          );
        })()}
      </AnimatePresence>

      {/* Simulation step indicator */}
      <AnimatePresence>
        {isSimulating && simStep && (
          <motion.div
            key={simulationStep}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-30"
          >
            <div className="bg-accent/15 border border-accent/30 rounded-full px-4 py-1.5 flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-accent"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-xs text-accent font-mono">{simStep.label}</span>
              <span className="text-[10px] text-muted/50 ml-1">Step {simulationStep + 1}/7</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg viewBox="0 0 800 400" className="w-full h-auto" role="img" aria-label="Payment flow diagram"
        onClick={() => setSelectedNode(null)}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="var(--color-accent)" />
          </marker>
          <marker id="arrowhead-green" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="var(--color-success)" />
          </marker>
          <marker id="arrowhead-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="var(--color-danger)" />
          </marker>
          <marker id="arrowhead-yellow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="var(--color-warning)" />
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
            let edgeMuted = muted;
            let thick = false;

            // Layer filtering
            if (activeLayer !== 'all') {
              const matchesLayer = e.layers.includes(activeLayer as 'data' | 'money' | 'risk');
              if (!matchesLayer) {
                edgeMuted = true;
              } else {
                color = LAYER_COLORS[activeLayer] || color;
                thick = true;
              }
            }

            // Simulation step highlighting
            if (isSimulating && simStep) {
              const isActive = simStep.activeEdges.includes(e.id);
              if (!isActive) edgeMuted = true;
              else { color = 'var(--color-accent)'; thick = true; }
            }

            if (ch === 'auth-vs-settlement' && !isSimulating) {
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
                muted={edgeMuted}
                thick={thick}
              />
            );
          })}
        </AnimatePresence>

        {/* ─── Auth/Settlement particles ─── */}
        {ch === 'auth-vs-settlement' && !isSimulating && (
          <>
            <Particle from={nodeMap.customer} to={nodeMap.processor} duration={1} color="var(--color-success)" />
            <Particle from={nodeMap.processor} to={nodeMap.issuer} duration={0.8} color="var(--color-success)" />
            <Particle from={nodeMap.issuer} to={nodeMap.acquirer} duration={3} color="var(--color-warning)" />
            <Particle from={nodeMap.acquirer} to={nodeMap.merchant} duration={2.5} color="var(--color-warning)" />
          </>
        )}

        {/* ─── Simulation particles ─── */}
        {isSimulating && simulationStep >= 0 && simulationStep <= 3 && (
          <motion.circle
            r={4} fill="var(--color-accent)" filter="url(#glow)"
            initial={{ cx: nodeMap.customer.x, cy: nodeMap.customer.y }}
            animate={{
              cx: simulationStep === 0 ? nodeMap.gateway.x : simulationStep === 1 ? nodeMap.processor.x : simulationStep === 2 ? nodeMap.network.x : nodeMap.issuer.x,
              cy: simulationStep === 0 ? nodeMap.gateway.y : simulationStep === 1 ? nodeMap.processor.y : simulationStep === 2 ? nodeMap.network.y : nodeMap.issuer.y,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
        {isSimulating && simulationStep >= 4 && (
          <motion.circle
            r={4} fill="var(--color-success)" filter="url(#glow)"
            initial={{ cx: nodeMap.issuer.x, cy: nodeMap.issuer.y }}
            animate={{
              cx: simulationStep === 4 ? nodeMap.acquirer.x : nodeMap.merchant.x,
              cy: simulationStep === 4 ? nodeMap.acquirer.y : nodeMap.merchant.y,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
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
          {NODES.filter(n => visibleNodeIds.includes(n.id)).map((n) => {
            let failure: 'red' | 'orange' | undefined;
            if (ch === 'failure' && failureMode === 'decline' && n.id === 'issuer') failure = 'red';
            if (ch === 'failure' && failureMode === 'fraud' && n.id === 'processor') failure = 'orange';

            const isSimActive = isSimulating && simStep ? simStep.activeNodes.includes(n.id) : false;

            return (
              <DiagramNode
                key={n.id}
                node={n}
                muted={muted || (isSimulating && !isSimActive)}
                failure={failure}
                isSimActive={isSimActive}
                isSelected={selectedNode === n.id}
                onClick={() => { handleNodeClick(n.id); }}
                activeLayer={activeLayer}
              />
            );
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
            ⚠ Risk review — transaction paused
          </motion.text>
        )}

        {/* ─── Fee labels ─── */}
        <AnimatePresence>
          {ch === 'fees' && !isSimulating && FEE_LABELS.map(f => {
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
        {ch === 'fees' && !isSimulating && (
          <>
            <motion.text x={70} y={155} textAnchor="middle" fontSize={13} fontFamily="var(--font-mono)" fill="var(--color-success)" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              ${amount.toFixed(2)}
            </motion.text>
            <motion.text x={660} y={355} textAnchor="middle" fontSize={13} fontFamily="var(--font-mono)" fill="var(--color-warning)" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              ${(amount - (amount * 0.029 + 0.30)).toFixed(2)}
            </motion.text>
          </>
        )}

        {/* ─── Timeline bar (auth vs settlement) ─── */}
        {ch === 'auth-vs-settlement' && !isSimulating && (
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
            <rect x={50} y={10} width={160} height={55} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth={1} />
            <text x={130} y={28} textAnchor="middle" fontSize={9} fill="var(--color-foreground)" fontFamily="var(--font-sans)" fontWeight={600}>Without PSP</text>
            <text x={130} y={42} textAnchor="middle" fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">7 separate integrations</text>
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <rect key={i} x={62 + i * 20} y={48} width={14} height={10} rx={2} fill="var(--color-muted)" opacity={0.4} />
            ))}
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
            fill="none" stroke="var(--color-accent)" strokeWidth={0.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* ─── Layer legend ─── */}
        <g transform="translate(520, 380)">
          {activeLayer === 'all' ? (
            <>
              <line x1={0} y1={0} x2={20} y2={0} stroke="var(--color-accent)" strokeWidth={1} />
              <text x={24} y={3} fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">Data / auth flow</text>
              <line x1={120} y1={0} x2={140} y2={0} stroke="var(--color-accent)" strokeWidth={1} strokeDasharray="4 3" />
              <text x={144} y={3} fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">Fund settlement</text>
            </>
          ) : (
            <>
              <line x1={0} y1={0} x2={20} y2={0} stroke={LAYER_COLORS[activeLayer] || 'var(--color-accent)'} strokeWidth={2} />
              <text x={24} y={3} fontSize={8} fill="var(--color-muted)" fontFamily="var(--font-sans)">{activeLayer} flow (highlighted)</text>
            </>
          )}
        </g>
        {ch === 'failure' && failureMode === 'chargeback' && (
          <g transform="translate(520, 393)">
            <line x1={0} y1={0} x2={20} y2={0} stroke="var(--color-danger)" strokeWidth={1} strokeDasharray="4 3" />
            <text x={24} y={3} fontSize={8} fill="var(--color-danger)" fontFamily="var(--font-sans)">Dispute reversal</text>
          </g>
        )}
      </svg>
    </div>
  );
}
