export interface Market {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenIcon: string;
  chain: 'solana' | 'ethereum' | 'sui';
  lastPrice: number;
  priceChange24h: number;
  volume24h: number;
  volumeChange24h: number;
  totalVolume: number;
  totalVolumeChange: number;
  impliedFdv: string;
  settleTime: string | null; // ISO date string or null for TBA
  status: 'live' | 'upcoming' | 'ended';
  settlementStatus?: 'in-progress' | 'upcoming' | 'new-market';
  chartData: number[];
  chartColor: 'green' | 'red';
}

export interface RecentTrade {
  id: string;
  time: string;
  side: 'Buy' | 'Sell';
  hasBadge?: string;
  pair: string;
  pairIcon: string;
  pairChain: 'solana' | 'ethereum' | 'sui';
  market: 'Points' | 'Pre-market';
  price: number;
  amount: string;
  collateral: number;
  collateralIcon: string;
  tierIcon: 'whale' | 'shark' | 'shrimp';
}

export type MarketTab = 'live' | 'upcoming' | 'ended';

export type SortField = 'lastPrice' | 'volume24h' | 'totalVolume' | 'impliedFdv';
export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

// Token Detail types
export interface TokenDetail {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenIcon: string;
  chain: 'solana' | 'ethereum' | 'sui';
  subtitle: string;
  price: number;
  priceChange: number;
  volume24h: number;
  volumeChange24h: number;
  totalVolume: number;
  impliedFdv: string;
  settleTime: string | null;
  category: 'Pre-market' | 'Points';
}

export interface OrderBookEntry {
  id: string;
  price: number;
  amount: number;
  amountFormatted: string;
  collateral: number;
  collateralIcon: string;
  isOwner?: boolean;
}

export interface MyOrder {
  id: string;
  side: 'Buy' | 'Sell';
  pair: string;
  hasBadge?: string;
  date: string;
  price: number;
  entryPrice?: number;
  originalPrice?: number;
  amount: string;
  collateral: string;
  canResell?: boolean;
}

export interface PriceDataPoint {
  time: string;
  price: number;
  volume: number;
}

export type OrderBookTab = 'regular' | 'resell' | 'all';
export type MyOrdersTab = 'filled' | 'open';
