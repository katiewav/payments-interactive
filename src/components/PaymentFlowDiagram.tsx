'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PaymentScenario, FeeBreakdown, ScenarioPreset } from '@/lib/types';
import { formatCurrency } from '@/lib/paymentModel';
import { annotations } from '@/lib/annotationData';

interface Props {
  scenario: PaymentScenario;
  fees: FeeBreakdown;
  showRetryPath: boolean;
  activePreset: ScenarioPreset | null;
}

interface NodeConfig {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  annotationId?: string;
}

const getAnnotation = (id: string) => annotations.find((a) => a.id === id);

function DiagramAnnotation({
  annotation,
  x,
  y,
}: {
  annotation: { title: string; body: string };
  x: number;
  y: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 w-[280px] pointer-events-none"
      style={{ left: x - 140, top: y - 130 }}
    >
      <div className="bg-surface-elevated border border-border rounded-xl p-4 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
          <h4 className="text-xs font-medium text-foreground leading-snug">
            {annotation.title}
          </h4>
        </div>
        <p className="text-xs text-muted leading-relaxed pl-[14px]">
          {annotation.body}
        </p>
      </div>
    </motion.div>
  );
}

export default function PaymentFlowDiagram({ scenario, fees, showRetryPath, activePreset }: Props) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const showChargeback = activePreset === 'chargeback';

  const nodes: NodeConfig[] = useMemo(() => [
    { id: 'customer', label: 'Cardholder', x: 100, y: 200 },
    { id: 'processor', label: 'Processor', x: 280, y: 200, annotationId: 'processor' },
    { id: 'acquirer', label: 'Acquirer', sublabel: "Merchant's Bank", x: 460, y: 130, annotationId: 'acquirer' },
    { id: 'network', label: 'Network', sublabel: 'Visa / MC', x: 640, y: 200, annotationId: 'network' },
    { id: 'issuer', label: 'Issuer', sublabel: "Cardholder's Bank", x: 820, y: 200, annotationId: 'issuer' },
    { id: 'merchant', label: 'Merchant', x: 460, y: 330 },
  ], []);

  const isCrossBorder = !scenario.isDomestic;
  const hasPlatformFee = !!scenario.platformTakeRate;
  const isRetry = scenario.retryEnabled;

  const edges = useMemo(() => [
    { from: 'customer', to: 'processor', label: formatCurrency(scenario.amount) },
    { from: 'processor', to: 'acquirer', label: '' },
    { from: 'acquirer', to: 'network', label: isCrossBorder ? 'Cross-border' : '' },
    { from: 'network', to: 'issuer', label: 'Auth request' },
    { from: 'processor', to: 'merchant', label: formatCurrency(fees.netToMerchant) },
  ], [scenario.amount, fees.netToMerchant, isCrossBorder]);

  const getNode = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <div className="w-full overflow-x-auto relative">
      {/* Annotation popups rendered outside SVG */}
      <AnimatePresence>
        {hoveredNode && (() => {
          const node = getNode(hoveredNode);
          const ann = node.annotationId ? getAnnotation(node.annotationId) : null;
          if (!ann) return null;
          return (
            <DiagramAnnotation
              key={hoveredNode}
              annotation={ann}
              x={node.x}
              y={node.y}
            />
          );
        })()}
      </AnimatePresence>

      <svg viewBox="0 0 920 460" className="w-full h-auto min-w-[600px]">
        <defs>
          <filter id="diagramGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--color-accent)" opacity="0.6" />
          </marker>
          <marker id="arrowheadChargeback" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="var(--color-chargeback)" opacity="0.7" />
          </marker>
        </defs>

        {/* Edges — transaction flow */}
        {edges.map((edge, i) => {
          const from = getNode(edge.from);
          const to = getNode(edge.to);
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / dist;
          const ny = dy / dist;
          const startX = from.x + nx * 36;
          const startY = from.y + ny * 36;
          const endX = to.x - nx * 36;
          const endY = to.y - ny * 36;

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <motion.line
                x1={startX} y1={startY} x2={endX} y2={endY}
                stroke={
                  isCrossBorder && (edge.from === 'acquirer' || edge.from === 'network')
                    ? 'var(--color-warning)'
                    : hasPlatformFee && edge.from === 'processor' && edge.to === 'merchant'
                    ? 'var(--color-fee-platform)'
                    : 'var(--color-accent)'
                }
                strokeWidth={
                  isCrossBorder && (edge.from === 'acquirer' || edge.from === 'network') ? 2
                    : hasPlatformFee && edge.from === 'processor' && edge.to === 'merchant' ? 2
                    : 1
                }
                strokeOpacity={showChargeback ? 0.15 : 0.5}
                strokeDasharray={isCrossBorder && edge.from === 'acquirer' ? '6 3' : undefined}
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              />
              {edge.label && (
                <motion.text
                  x={(startX + endX) / 2}
                  y={(startY + endY) / 2 - 10}
                  textAnchor="middle"
                  fill="var(--color-accent)"
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  opacity={showChargeback ? 0.3 : 0.8}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showChargeback ? 0.3 : 0.8 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                >
                  {edge.label}
                </motion.text>
              )}
            </g>
          );
        })}

        {/* Return path (issuer → acquirer via network) */}
        <motion.line
          x1={790} y1={188} x2={496} y2={138}
          stroke="var(--color-muted)"
          strokeWidth={1}
          strokeOpacity={showChargeback ? 0.1 : 0.2}
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        />
        <motion.text
          x={640} y={148}
          textAnchor="middle"
          fill="var(--color-muted)"
          fontSize={9}
          fontFamily="var(--font-mono)"
          initial={{ opacity: 0 }}
          animate={{ opacity: showChargeback ? 0.2 : 0.5 }}
          transition={{ delay: 1.2 }}
        >
          Approved
        </motion.text>

        {/* Retry path */}
        {showRetryPath && !showChargeback && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            <path
              d="M 820 232 Q 820 400 640 400 Q 520 400 460 365"
              fill="none"
              stroke="var(--color-danger)"
              strokeWidth={1}
              strokeDasharray="6 4"
              opacity={0.35}
            />
            <text x={680} y={392} fill="var(--color-danger)" fontSize={9} fontFamily="var(--font-mono)" opacity={0.6}>
              Decline → Retry
            </text>
          </motion.g>
        )}

        {/* CHARGEBACK PATH — reverse flow */}
        {showChargeback && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
            {/* Step labels */}
            <text x={460} y={30} textAnchor="middle" fill="var(--color-chargeback)" fontSize={11} fontFamily="var(--font-sans)" fontWeight={500}>
              Chargeback — funds reverse
            </text>

            {/* Issuer → Network (dispute initiated) */}
            <line x1={790} y1={215} x2={672} y2={215}
              stroke="var(--color-chargeback)" strokeWidth={1.5} strokeDasharray="6 3"
              markerEnd="url(#arrowheadChargeback)"
            />
            <text x={730} y={238} textAnchor="middle" fill="var(--color-chargeback)" fontSize={8} fontFamily="var(--font-mono)" opacity={0.8}>
              ① Dispute filed
            </text>

            {/* Network → Acquirer */}
            <line x1={608} y1={196} x2={495} y2={162}
              stroke="var(--color-chargeback)" strokeWidth={1.5} strokeDasharray="6 3"
              markerEnd="url(#arrowheadChargeback)"
            />
            <text x={560} y={170} textAnchor="middle" fill="var(--color-chargeback)" fontSize={8} fontFamily="var(--font-mono)" opacity={0.8}>
              ② Routed
            </text>

            {/* Acquirer → Processor */}
            <line x1={428} y1={140} x2={312} y2={182}
              stroke="var(--color-chargeback)" strokeWidth={1.5} strokeDasharray="6 3"
              markerEnd="url(#arrowheadChargeback)"
            />

            {/* Processor → Merchant (debit) */}
            <line x1={280} y1={232} x2={430} y2={318}
              stroke="var(--color-chargeback)" strokeWidth={1.5} strokeDasharray="6 3"
              markerEnd="url(#arrowheadChargeback)"
            />
            <text x={340} y={290} textAnchor="middle" fill="var(--color-chargeback)" fontSize={8} fontFamily="var(--font-mono)" opacity={0.8}>
              ③ Merchant debited
            </text>

            {/* Chargeback fee label on merchant */}
            <text x={460} y={390} textAnchor="middle" fill="var(--color-chargeback)" fontSize={10} fontFamily="var(--font-mono)" fontWeight={500}>
              −{formatCurrency(fees.grossAmount)} + ~$15–$25 fee
            </text>

            {/* Return to cardholder */}
            <path
              d="M 820 185 Q 820 55 460 55 Q 100 55 100 168"
              fill="none"
              stroke="var(--color-chargeback)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              markerEnd="url(#arrowheadChargeback)"
            />
            <text x={460} y={48} textAnchor="middle" fill="var(--color-chargeback)" fontSize={8} fontFamily="var(--font-mono)" opacity={0.8}>
              ④ Funds returned to cardholder
            </text>
          </motion.g>
        )}

        {/* Fee extraction labels */}
        {!showChargeback && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            <text x={820} y={155} textAnchor="middle" fill="var(--color-fee-interchange)" fontSize={9} fontFamily="var(--font-mono)">
              +{formatCurrency(fees.interchangeFee)}
            </text>
            <text x={640} y={155} textAnchor="middle" fill="var(--color-fee-network)" fontSize={9} fontFamily="var(--font-mono)">
              +{formatCurrency(fees.networkFee)}
            </text>
            <text x={280} y={155} textAnchor="middle" fill="var(--color-fee-processor)" fontSize={9} fontFamily="var(--font-mono)">
              +{formatCurrency(fees.processorFee)}
            </text>
          </motion.g>
        )}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const isMerchant = node.id === 'merchant';
          const isCustomer = node.id === 'customer';
          const hasAnnotation = !!node.annotationId;
          const chargebackHighlight = showChargeback && (node.id === 'issuer' || node.id === 'merchant' || node.id === 'customer');

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              onMouseEnter={() => hasAnnotation && setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: hasAnnotation ? 'pointer' : 'default' }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={32}
                fill="var(--color-surface)"
                stroke={
                  chargebackHighlight
                    ? 'var(--color-chargeback)'
                    : hoveredNode === node.id
                    ? 'var(--color-accent)'
                    : isMerchant
                    ? 'var(--color-success)'
                    : isCustomer
                    ? 'var(--color-accent)'
                    : 'var(--color-border)'
                }
                strokeWidth={chargebackHighlight || isMerchant || isCustomer || hoveredNode === node.id ? 1.5 : 1}
              />
              {/* Primary label */}
              <text
                x={node.x}
                y={node.sublabel ? node.y - 3 : node.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--color-foreground)"
                fontSize={11}
                fontFamily="var(--font-sans)"
              >
                {node.label}
              </text>
              {/* Sublabel (bank role) */}
              {node.sublabel && (
                <text
                  x={node.x}
                  y={node.y + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--color-muted)"
                  fontSize={7}
                  fontFamily="var(--font-sans)"
                >
                  {node.sublabel}
                </text>
              )}

              {/* Info indicator */}
              {hasAnnotation && (
                <text
                  x={node.x + 24}
                  y={node.y - 24}
                  textAnchor="middle"
                  fill="var(--color-accent)"
                  fontSize={10}
                  opacity={0.6}
                >
                  ⓘ
                </text>
              )}

              {/* Amount labels */}
              {isCustomer && (
                <text x={node.x} y={node.y - 48} textAnchor="middle" fill={showChargeback ? 'var(--color-chargeback)' : 'var(--color-accent)'} fontSize={14} fontWeight={500} fontFamily="var(--font-mono)">
                  {showChargeback ? `+${formatCurrency(scenario.amount)}` : formatCurrency(scenario.amount)}
                </text>
              )}
              {isMerchant && (
                <text x={node.x} y={node.y + 55} textAnchor="middle" fill={showChargeback ? 'var(--color-chargeback)' : 'var(--color-success)'} fontSize={14} fontWeight={500} fontFamily="var(--font-mono)">
                  {showChargeback ? `−${formatCurrency(scenario.amount + 15)}` : formatCurrency(fees.netToMerchant)}
                </text>
              )}
            </motion.g>
          );
        })}

        {/* Animated particles (only in non-chargeback mode) */}
        {!showChargeback && [0, 1, 2].map((idx) => (
          <motion.circle
            key={idx}
            r={3}
            fill="var(--color-accent)"
            filter="url(#diagramGlow)"
            initial={{ cx: 100, cy: 200, opacity: 0 }}
            animate={{
              cx: [100, 280, 460, 640, 820, 640, 460],
              cy: [200, 200, 130, 200, 200, 200, 330],
              opacity: [0, 1, 1, 1, 0.5, 0.5, 0],
            }}
            transition={{
              duration: 5,
              delay: idx * 1.8,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Scenario mode badge */}
        {isCrossBorder && !showChargeback && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <rect x={540} y={250} width={180} height={28} rx={14} fill="var(--color-warning)" opacity={0.12} />
            <text x={630} y={268} textAnchor="middle" fill="var(--color-warning)" fontSize={10} fontFamily="var(--font-mono)" fontWeight={500}>
              Cross-border + FX fees
            </text>
          </motion.g>
        )}
        {hasPlatformFee && !showChargeback && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <rect x={310} y={270} width={160} height={28} rx={14} fill="var(--color-fee-platform)" opacity={0.15} />
            <text x={390} y={288} textAnchor="middle" fill="var(--color-fee-platform)" fontSize={10} fontFamily="var(--font-mono)" fontWeight={500}>
              Platform takes {scenario.platformTakeRate ? `${(scenario.platformTakeRate * 100).toFixed(0)}%` : ''}
            </text>
          </motion.g>
        )}
        {isRetry && !showChargeback && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <rect x={680} y={365} width={160} height={28} rx={14} fill="var(--color-danger)" opacity={0.1} />
            <text x={760} y={383} textAnchor="middle" fill="var(--color-danger)" fontSize={10} fontFamily="var(--font-mono)" fontWeight={500}>
              Smart retry enabled
            </text>
          </motion.g>
        )}

        {/* Legend */}
        <g transform="translate(30, 430)">
          <line x1={0} y1={0} x2={20} y2={0} stroke="var(--color-accent)" strokeWidth={1} />
          <text x={25} y={4} fill="var(--color-muted)" fontSize={8} fontFamily="var(--font-sans)">Transaction flow</text>
          <line x1={120} y1={0} x2={140} y2={0} stroke="var(--color-muted)" strokeWidth={1} strokeDasharray="4 3" />
          <text x={145} y={4} fill="var(--color-muted)" fontSize={8} fontFamily="var(--font-sans)">Settlement / response</text>
          {showChargeback && (
            <>
              <line x1={290} y1={0} x2={310} y2={0} stroke="var(--color-chargeback)" strokeWidth={1.5} strokeDasharray="6 3" />
              <text x={315} y={4} fill="var(--color-chargeback)" fontSize={8} fontFamily="var(--font-sans)">Chargeback reversal</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
