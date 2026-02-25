import type { DashboardOpenOrder, DashboardEndedOrder, LinkedWallet } from '../types';
import { liveMarkets, endedMarkets } from './markets';
import { generateMyFilledOrders, generateMyOpenOrders } from './tokenDetail';

// ── helpers ──────────────────────────────────────────────────────────

function getNativeSymbol(chain: string): 'SOL' | 'ETH' | 'SUI' {
  switch (chain) {
    case 'ethereum': return 'ETH';
    case 'sui': return 'SUI';
    default: return 'SOL';
  }
}

// Assign a distinct color per token for the dashboard badge dot
const TOKEN_COLORS: Record<string, string> = {
  ZBT: '#8b5cf6',
  SKATE: '#eab308',
  ERA: '#3b82f6',
  GRASS: '#22c55e',
  LOUD: '#f97316',
  MMT: '#06b6d4',
  XPL: '#9333ea',
  NEXO: '#627eea',
  // ended tokens
  EIGEN: '#627eea',
  RENDER: '#e44dda',
  ARB: '#3b82f6',
  OP: '#ff0420',
  STRK: '#ec4899',
  TIA: '#9333ea',
  JTO: '#16c284',
  APT: '#06b6d4',
  JUP: '#5bd197',
  ETHFI: '#627eea',
  BLUR: '#ff6800',
  MANTA: '#06b6d4',
  SEI: '#9945ff',
  TNSR: '#eab308',
  PYTH: '#e44dda',
  DYM: '#ff4500',
  AEVO: '#3b82f6',
  PORTAL: '#fb923c',
  W: '#7c3aed',
  PIXEL: '#22c55e',
  ALT: '#f97316',
  WEN: '#ff6800',
  KMNO: '#16c284',
  BONK: '#f59e0b',
};

function getTokenColor(symbol: string): string {
  return TOKEN_COLORS[symbol] ?? '#7a7a83';
}

function depositedTypeFromChain(_chain: string): 'sol' | 'usdc' | 'token' {
  // simplification — most deposits are in native token
  return 'sol';
}

// ── Profile data ──────────────────────────────────────────────────────

export const profileData = {
  walletAddress: 'GQ98iA5YmBxKgeDS3pqFCY6oi7Z9wxEfviKQN7k6iA5Y',
  walletShort: 'GQ98...iA5Y',
  totalTradingVol: '$18.72K',
  discountTier: '-0% Fee',
  xWhalesHolding: 0.00,
  linkedWallets: [
    { address: '0x6...4cd', chain: 'ethereum', chainColor: '#627eea' },
    { address: 'GQ9...A5Y', chain: 'solana', chainColor: '#9945ff' },
    { address: 'sei...2m6', chain: 'sei', chainColor: '#9945ff' },
  ] as LinkedWallet[],
};

// ── Parse helpers ─────────────────────────────────────────────────────

/** Parse "1.5 SOL" → { amount: "1.5", symbol: "SOL", type: 'sol' } */
function parseCollateral(colStr: string): { amount: string; symbol: string; type: 'sol' | 'usdc' | 'token' } {
  const spaceIdx = colStr.indexOf(' ');
  if (spaceIdx === -1) return { amount: colStr, symbol: 'SOL', type: 'sol' };
  const amount = colStr.slice(0, spaceIdx);
  const sym = colStr.slice(spaceIdx + 1).toUpperCase();
  if (['SOL', 'ETH', 'SUI'].includes(sym)) return { amount, symbol: sym, type: 'sol' };
  if (['USDC', 'USDT'].includes(sym)) return { amount, symbol: sym, type: 'usdc' };
  return { amount, symbol: sym, type: 'token' };
}

/** Strip token symbol from amount: "1.00K ZBT" → "1.00K" */
function parseAmount(amtStr: string): string {
  return amtStr.split(' ')[0];
}

/** Convert ms offset to human-readable relative time */
function formatRelativeTime(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

// ── Aggregate open/filled orders from ALL token detail generators ─────

const liveTokensWithOrders = liveMarkets.filter(m => m.tokenSymbol !== 'LOUD');
const tokenCount = liveTokensWithOrders.length;

// Progress presets — deterministic based on order index
const openProgressValues = [0, 76.9, 0, 25, 0, 0, 15, 33, 0, 50, 10, 0, 40, 0, 20, 0, 60, 0, 5, 0];
const filledProgressValues = [100, 76.9, 100, 50, 100, 85, 100, 60, 100, 75, 90, 100, 65, 100, 80, 55, 100, 70, 100, 45];

interface SortableOrder {
  order: DashboardOpenOrder;
  sortOffset: number; // ms from "now" — lower = more recent
}

const openMeta: SortableOrder[] = [];
const filledMeta: SortableOrder[] = [];

liveTokensWithOrders.forEach((market, mIdx) => {
  const myOpen = generateMyOpenOrders(market.tokenSymbol, market.chain, market.lastPrice);
  const myFilled = generateMyFilledOrders(market.tokenSymbol, market.chain, market.lastPrice);
  const color = getTokenColor(market.tokenSymbol);

  // Open orders — interleave tokens across time
  myOpen.forEach((order, oIdx) => {
    const col = parseCollateral(order.collateral);
    const isResell = order.hasBadge === 'RS';
    const side: 'Buy' | 'Sell' | 'Resell' = isResell ? 'Resell' : order.side;
    const amount = parseAmount(order.amount);
    // Stagger: Nth order of each token is spread 4h apart, tokens offset by 35min
    const offset = (oIdx * tokenCount + mIdx) * 4 * 3600000 + mIdx * 2100000;

    // RS orders always 0% progress; others get deterministic values
    const progress = isResell ? 0 : openProgressValues[(mIdx * 4 + oIdx) % openProgressValues.length];

    // toBeReceived logic:
    // Buy: receive tokens
    // Sell: receive collateral minus small fee (~2%)
    // Resell: receive tokens (reselling a buy position)
    let toBeReceived: string;
    let toBeReceivedType: 'sol' | 'usdc' | 'token';
    if (side === 'Sell') {
      const colNum = parseFloat(col.amount);
      toBeReceived = (colNum * 0.98).toFixed(2); // collateral minus ~2% fee
      toBeReceivedType = col.type;
    } else {
      // Buy or Resell — receive tokens
      toBeReceived = amount;
      toBeReceivedType = 'token';
    }

    // Parse amount to number: "1.00K" → 1000, "0.85K" → 850
    const amountNum = parseFloat(amount) * (amount.includes('K') ? 1000 : 1);
    const colNum = parseFloat(col.amount);
    const filledNum = amountNum * progress / 100;

    openMeta.push({
      sortOffset: offset,
      order: {
        id: `oo-${market.tokenSymbol.toLowerCase()}-${oIdx}`,
        pair: order.pair,
        tokenSymbol: market.tokenSymbol,
        chain: market.chain,
        tokenColor: color,
        hasBadge: isResell ? 'RS' : undefined,
        createdTime: '',
        side,
        price: order.price,
        amount,
        deposited: col.amount,
        depositedType: col.type,
        toBeReceived,
        toBeReceivedType,
        progress,
        collateralToken: col.symbol,
        totalAmount: amountNum,
        filledAmount: filledNum,
        collateralAmount: colNum,
        isResell: isResell || undefined,
        originalPrice: isResell ? order.originalPrice : undefined,
      },
    });
  });

  // Filled orders — interleave tokens across time (wider gaps)
  myFilled.forEach((order, oIdx) => {
    const col = parseCollateral(order.collateral);
    const isResell = order.hasBadge === 'RS';
    const side: 'Buy' | 'Sell' | 'Resell' = isResell ? 'Resell' : order.side;
    const amount = parseAmount(order.amount);
    // Stagger: 6h apart, tokens offset by 50min
    const offset = (oIdx * tokenCount + mIdx) * 6 * 3600000 + mIdx * 3000000;
    const pIdx = (mIdx * 5 + oIdx) % filledProgressValues.length;

    // toBeReceived: same logic as open orders
    let toBeReceived: string;
    let toBeReceivedType: 'sol' | 'usdc' | 'token';
    if (side === 'Sell') {
      const colNum = parseFloat(col.amount);
      toBeReceived = (colNum * 0.98).toFixed(2);
      toBeReceivedType = col.type;
    } else {
      toBeReceived = amount;
      toBeReceivedType = 'token';
    }

    const amountNum = parseFloat(amount) * (amount.includes('K') ? 1000 : 1);
    const colNum = parseFloat(col.amount);
    const progressVal = filledProgressValues[pIdx];
    const filledNum = amountNum * progressVal / 100;

    filledMeta.push({
      sortOffset: offset,
      order: {
        id: `fo-${market.tokenSymbol.toLowerCase()}-${oIdx}`,
        pair: order.pair,
        tokenSymbol: market.tokenSymbol,
        chain: market.chain,
        tokenColor: color,
        hasBadge: isResell ? 'RS' : undefined,
        createdTime: '',
        side,
        price: order.price,
        amount,
        deposited: col.amount,
        depositedType: col.type,
        toBeReceived,
        toBeReceivedType,
        progress: progressVal,
        collateralToken: col.symbol,
        totalAmount: amountNum,
        filledAmount: filledNum,
        collateralAmount: colNum,
        isResell: isResell || undefined,
        originalPrice: isResell ? order.originalPrice : undefined,
      },
    });
  });
});

// Sort by offset ascending (smallest offset = most recent)
openMeta.sort((a, b) => a.sortOffset - b.sortOffset);
filledMeta.sort((a, b) => a.sortOffset - b.sortOffset);

// Assign relative time labels and export
export const openOrders: DashboardOpenOrder[] = openMeta.map(m => ({
  ...m.order,
  createdTime: formatRelativeTime(m.sortOffset),
}));

export const filledOrders: DashboardOpenOrder[] = filledMeta.map(m => ({
  ...m.order,
  createdTime: formatRelativeTime(m.sortOffset),
}));

// ── Ended Orders — only from ended markets (unchanged) ───────────────

const endedTemplates: {
  side: 'Buy' | 'Sell' | 'Resell';
  badge?: 'RS';
  priceFactor: number;
  amount: string;
  collateral: number;
  received: string;
  status: 'settled' | 'claimed' | 'closed' | 'resold' | 'exited';
  timeLabel: string;
}[] = [
  { side: 'Buy', priceFactor: 1.0, amount: '1.00K', collateral: 1.5, received: '1.00K', status: 'settled', timeLabel: '2 weeks ago' },
  { side: 'Buy', priceFactor: 0.98, amount: '1.00K', collateral: 1.5, received: '3.00', status: 'claimed', timeLabel: '3 months ago' },
  { side: 'Buy', priceFactor: 1.02, amount: '1.00K', collateral: 1.5, received: '0.50', status: 'closed', timeLabel: '3 months ago' },
  { side: 'Resell', badge: 'RS', priceFactor: 1.05, amount: '1.00K', collateral: 1.5, received: '2.00', status: 'resold', timeLabel: '6 months ago' },
  { side: 'Sell', priceFactor: 0.95, amount: '1.00K', collateral: 1.5, received: '3.00', status: 'settled', timeLabel: '1 year ago' },
  { side: 'Sell', priceFactor: 1.0, amount: '1.00K', collateral: 1.5, received: '0.00', status: 'claimed', timeLabel: '1 year ago' },
];

// Pick first 12 ended markets for variety
const endedMarketsForOrders = endedMarkets.slice(0, 12);

export const endedOrders: DashboardEndedOrder[] = endedMarketsForOrders.flatMap((market, mIdx) => {
  const native = getNativeSymbol(market.chain);
  const pair = `${market.tokenSymbol}/${native}`;
  const color = getTokenColor(market.tokenSymbol);

  return endedTemplates.map((tpl, tIdx) => {
    const price = Math.round(market.lastPrice * tpl.priceFactor * 10000) / 10000;
    return {
      id: `eo-${mIdx}-${tIdx}`,
      pair,
      tokenColor: color,
      hasBadge: tpl.badge,
      time: tpl.timeLabel,
      side: tpl.side,
      price,
      amount: tpl.amount,
      deposited: tpl.collateral.toFixed(2),
      depositedType: depositedTypeFromChain(market.chain),
      received: tpl.side === 'Buy' ? tpl.received : tpl.collateral.toFixed(2),
      receivedType: tpl.side === 'Buy' ? 'token' as const : 'sol' as const,
      status: tpl.status,
    };
  });
});
