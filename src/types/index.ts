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
  market: 'Pre-market';
  price: number;
  amount: string;
  collateral: number;
  collateralIcon: string;
  tierIcon: 'whale' | 'shark' | 'dolphin' | 'fish' | 'shrimp';
}

export type MarketTab = 'live' | 'upcoming' | 'ended';

// Upcoming market types
export interface InvestorAvatar {
  image: string; // path to avatar image
}

export interface UpcomingMarket {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenIcon: string;
  chain: 'solana' | 'ethereum' | 'sui';
  status: 'upcoming';
  settlementStatus?: 'new-market';
  watchers: number;
  investors: InvestorAvatar[];
  investorExtra: number; // +N count shown after avatars, 0 = none
  narratives: string[]; // e.g. ['GAMEFI', 'NFT']
  moniScore: number; // 0-50000 range
}

export interface EndedMarket {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  chain: 'solana' | 'ethereum' | 'sui';
  status: 'ended';
  lastPrice: number;
  totalVolume: number;
  settleStartTime: string; // ISO date (UTC)
  settleEndTime: string;   // ISO date (UTC)
}

export type SortField = 'lastPrice' | 'volume24h' | 'totalVolume' | 'impliedFdv';
export type UpcomingSortField = 'watchers' | 'moniScore';
export type EndedSortField = 'lastPrice' | 'totalVolume';
export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  field: SortField | UpcomingSortField | EndedSortField | null;
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
  totalVolumeChange: number;
  impliedFdv: string;
  settleTime: string | null;
  settlementStatus?: 'in-progress' | 'upcoming' | 'new-market';
  category: 'Pre-market' | 'Points';
  chartData: number[];
}

export interface OrderBookEntry {
  id: string;
  price: number;
  amount: number;
  amountFormatted: string;
  collateral: number;
  collateralIcon: string;
  collateralToken: 'SOL' | 'USDC' | 'USDT' | 'ETH' | 'SUI';
  isOwner?: boolean;
  fillPercent: number; // 0-100 how much of order is filled
  filledAmount: number; // filled amount in token units
  totalAmount: number; // total amount in token units
  fillType?: 'FULL' | 'PARTIAL'; // optional fill type label
  isResell?: boolean; // resell order from buy side
  originalPrice?: number; // for resell: the original position price
  originalCollateral?: number; // for resell: the original collateral amount
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

// Dashboard types
export interface DashboardOpenOrder {
  id: string;
  pair: string;
  tokenColor: string;
  hasBadge?: 'FULL' | 'RS';
  createdTime: string;
  side: 'Buy' | 'Sell' | 'Resell';
  price: number;
  amount: string;
  deposited: string;
  depositedType: 'sol' | 'usdc' | 'token';
  toBeReceived: string;
  toBeReceivedType: 'sol' | 'usdc' | 'token';
  progress: number;
}

export interface DashboardEndedOrder {
  id: string;
  pair: string;
  tokenColor: string;
  hasBadge?: 'RS';
  time: string;
  side: 'Buy' | 'Sell' | 'Resell';
  price: number;
  amount: string;
  deposited: string;
  depositedType: 'sol' | 'usdc' | 'token';
  received: string;
  receivedType: 'sol' | 'usdc' | 'token';
  status: 'settled' | 'claimed' | 'closed' | 'resold' | 'exited';
}

export type DashboardOrdersTab = 'open' | 'filled';

export interface LinkedWallet {
  address: string;
  chain: string;
  chainColor: string;
}
