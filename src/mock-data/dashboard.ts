import type { DashboardOpenOrder, DashboardEndedOrder, LinkedWallet } from '../types';
import { liveMarkets, endedMarkets } from './markets';

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

// ── Open Orders — only from live markets (skip LOUD which has no orders) ──

const openOrderTemplates: {
  side: 'Buy' | 'Sell' | 'Resell';
  badge?: 'FULL' | 'RS';
  priceFactor: number;
  amount: string;
  collateral: number;
  progress: number;
  timeLabel: string;
}[] = [
  { side: 'Buy', priceFactor: 1.0, amount: '1.00K', collateral: 1.5, progress: 76.9, timeLabel: '1 min ago' },
  { side: 'Sell', badge: 'FULL', priceFactor: 1.0, amount: '1.00K', collateral: 1.5, progress: 0, timeLabel: '2 days ago' },
  { side: 'Sell', priceFactor: 0.98, amount: '2.50K', collateral: 4.2, progress: 0, timeLabel: '2 days ago' },
  { side: 'Resell', badge: 'RS', priceFactor: 1.05, amount: '1.00K', collateral: 1.0, progress: 0, timeLabel: '1 week ago' },
  { side: 'Buy', priceFactor: 0.97, amount: '1.20K', collateral: 1.8, progress: 25, timeLabel: '3 days ago' },
  { side: 'Buy', priceFactor: 1.03, amount: '0.85K', collateral: 1.2, progress: 0, timeLabel: '4 days ago' },
];

const liveTokensWithOrders = liveMarkets.filter(m => m.tokenSymbol !== 'LOUD');

export const openOrders: DashboardOpenOrder[] = liveTokensWithOrders.flatMap((market, mIdx) => {
  const native = getNativeSymbol(market.chain);
  const pair = `${market.tokenSymbol}/${native}`;
  const color = getTokenColor(market.tokenSymbol);

  return openOrderTemplates.map((tpl, tIdx) => {
    const price = Math.round(market.lastPrice * tpl.priceFactor * 10000) / 10000;
    return {
      id: `oo-${mIdx}-${tIdx}`,
      pair,
      tokenColor: color,
      hasBadge: tpl.badge,
      createdTime: tpl.timeLabel,
      side: tpl.side,
      price,
      amount: tpl.amount,
      deposited: tpl.collateral.toFixed(2),
      depositedType: depositedTypeFromChain(market.chain),
      toBeReceived: tpl.side === 'Buy' ? tpl.amount : tpl.collateral.toFixed(2),
      toBeReceivedType: tpl.side === 'Buy' ? 'token' as const : 'sol' as const,
      progress: tpl.progress,
    };
  });
});

// ── Filled Orders — only from live markets (skip LOUD) ──

const filledTemplates: {
  side: 'Buy' | 'Sell' | 'Resell';
  badge?: 'RS';
  priceFactor: number;
  amount: string;
  collateral: number;
  progress: number;
  timeLabel: string;
}[] = [
  { side: 'Buy', priceFactor: 1.0, amount: '1.00K', collateral: 1.5, progress: 100, timeLabel: '1 day ago' },
  { side: 'Buy', badge: 'RS', priceFactor: 0.96, amount: '1.00K', collateral: 1.3, progress: 76.9, timeLabel: '2 days ago' },
  { side: 'Buy', priceFactor: 1.02, amount: '2.50K', collateral: 4.2, progress: 100, timeLabel: '3 days ago' },
  { side: 'Sell', priceFactor: 0.98, amount: '0.50K', collateral: 0.8, progress: 50, timeLabel: '4 days ago' },
  { side: 'Sell', priceFactor: 1.01, amount: '1.00K', collateral: 1.5, progress: 100, timeLabel: '5 days ago' },
];

export const filledOrders: DashboardOpenOrder[] = liveTokensWithOrders.flatMap((market, mIdx) => {
  const native = getNativeSymbol(market.chain);
  const pair = `${market.tokenSymbol}/${native}`;
  const color = getTokenColor(market.tokenSymbol);

  return filledTemplates.map((tpl, tIdx) => {
    const price = Math.round(market.lastPrice * tpl.priceFactor * 10000) / 10000;
    return {
      id: `fo-${mIdx}-${tIdx}`,
      pair,
      tokenColor: color,
      hasBadge: tpl.badge,
      createdTime: tpl.timeLabel,
      side: tpl.side,
      price,
      amount: tpl.amount,
      deposited: tpl.collateral.toFixed(2),
      depositedType: depositedTypeFromChain(market.chain),
      toBeReceived: tpl.side === 'Buy' ? tpl.amount : tpl.collateral.toFixed(2),
      toBeReceivedType: tpl.side === 'Buy' ? 'token' as const : 'sol' as const,
      progress: tpl.progress,
    };
  });
});

// ── Ended Orders — only from ended markets ──

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
