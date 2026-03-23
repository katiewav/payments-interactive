/**
 * Chapter definitions for the narrative experience.
 * Each chapter controls what the persistent diagram shows.
 */

export type ChapterId =
  | 'hero'
  | 'illusion'
  | 'stack'
  | 'auth-vs-settlement'
  | 'fees'
  | 'failure'
  | 'infrastructure'
  | 'takeaway';

export interface ChapterDef {
  id: ChapterId;
  number: number | null;
  eyebrow: string;
  title: string;
  /** Which diagram nodes are visible */
  visibleNodes: string[];
  /** Which edges are visible */
  visibleEdges: string[];
  /** Whether to show fee extraction labels */
  showFees: boolean;
  /** Whether to show the timeline */
  showTimeline: boolean;
  /** Whether to show failure state */
  failureMode: 'none' | 'decline' | 'fraud' | 'chargeback';
  /** Whether to show the full bundled/unbundled comparison */
  showCompare: boolean;
}

export const CHAPTERS: ChapterDef[] = [
  {
    id: 'hero',
    number: null,
    eyebrow: '',
    title: '',
    visibleNodes: [],
    visibleEdges: [],
    showFees: false,
    showTimeline: false,
    failureMode: 'none',
    showCompare: false,
  },
  {
    id: 'illusion',
    number: 1,
    eyebrow: 'Chapter 1',
    title: 'The illusion of simplicity',
    visibleNodes: ['customer', 'merchant'],
    visibleEdges: ['customer-merchant'],
    showFees: false,
    showTimeline: false,
    failureMode: 'none',
    showCompare: false,
  },
  {
    id: 'stack',
    number: 2,
    eyebrow: 'Chapter 2',
    title: 'The hidden stack',
    visibleNodes: ['customer', 'gateway', 'processor', 'network', 'issuer', 'acquirer', 'merchant'],
    visibleEdges: ['customer-gateway', 'gateway-processor', 'processor-network', 'network-issuer', 'processor-acquirer', 'acquirer-merchant'],
    showFees: false,
    showTimeline: false,
    failureMode: 'none',
    showCompare: false,
  },
  {
    id: 'auth-vs-settlement',
    number: 3,
    eyebrow: 'Chapter 3',
    title: 'Authorization is not settlement',
    visibleNodes: ['customer', 'gateway', 'processor', 'network', 'issuer', 'acquirer', 'merchant'],
    visibleEdges: ['customer-gateway', 'gateway-processor', 'processor-network', 'network-issuer', 'processor-acquirer', 'acquirer-merchant'],
    showFees: false,
    showTimeline: true,
    failureMode: 'none',
    showCompare: false,
  },
  {
    id: 'fees',
    number: 4,
    eyebrow: 'Chapter 4',
    title: 'Where the money goes',
    visibleNodes: ['customer', 'gateway', 'processor', 'network', 'issuer', 'acquirer', 'merchant'],
    visibleEdges: ['customer-gateway', 'gateway-processor', 'processor-network', 'network-issuer', 'processor-acquirer', 'acquirer-merchant'],
    showFees: true,
    showTimeline: false,
    failureMode: 'none',
    showCompare: false,
  },
  {
    id: 'failure',
    number: 5,
    eyebrow: 'Chapter 5',
    title: 'When things break',
    visibleNodes: ['customer', 'gateway', 'processor', 'network', 'issuer', 'acquirer', 'merchant'],
    visibleEdges: ['customer-gateway', 'gateway-processor', 'processor-network', 'network-issuer', 'processor-acquirer', 'acquirer-merchant'],
    showFees: false,
    showTimeline: false,
    failureMode: 'decline',
    showCompare: false,
  },
  {
    id: 'infrastructure',
    number: 6,
    eyebrow: 'Chapter 6',
    title: 'Why infrastructure companies exist',
    visibleNodes: ['customer', 'gateway', 'processor', 'network', 'issuer', 'acquirer', 'merchant'],
    visibleEdges: ['customer-gateway', 'gateway-processor', 'processor-network', 'network-issuer', 'processor-acquirer', 'acquirer-merchant'],
    showFees: false,
    showTimeline: false,
    failureMode: 'none',
    showCompare: true,
  },
  {
    id: 'takeaway',
    number: null,
    eyebrow: '',
    title: '',
    visibleNodes: ['customer', 'gateway', 'processor', 'network', 'issuer', 'acquirer', 'merchant'],
    visibleEdges: ['customer-gateway', 'gateway-processor', 'processor-network', 'network-issuer', 'processor-acquirer', 'acquirer-merchant'],
    showFees: false,
    showTimeline: false,
    failureMode: 'none',
    showCompare: false,
  },
];

export function getChapter(id: ChapterId): ChapterDef {
  return CHAPTERS.find(c => c.id === id) ?? CHAPTERS[0];
}
