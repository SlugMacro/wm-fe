import type { TokenDetail, OrderBookEntry, MyOrder, PriceDataPoint } from '../types';

export const tokenDetails: Record<string, TokenDetail> = {
  karak: {
    id: 'karak',
    tokenSymbol: 'Karak',
    tokenName: 'Restaking XPs',
    tokenIcon: '/tokens/karak.svg',
    chain: 'solana',
    subtitle: 'Restaking XPs',
    price: 0.0045,
    priceChange: 0.13,
    volume24h: 16389.76,
    volumeChange24h: 1159.36,
    totalVolume: 38581.28,
    impliedFdv: '$835.31M',
    settleTime: '2025-08-20T20:00:00Z',
    category: 'Pre-market',
  },
  skate: {
    id: 'skate',
    tokenSymbol: 'SKATE',
    tokenName: 'Skate Chain',
    tokenIcon: '/tokens/skate.svg',
    chain: 'solana',
    subtitle: 'Pre-market Token',
    price: 0.005,
    priceChange: 63.8,
    volume24h: 445.86,
    volumeChange24h: 1159.36,
    totalVolume: 21904.26,
    impliedFdv: '$48.3K',
    settleTime: null,
    category: 'Pre-market',
  },
  zbt: {
    id: 'zbt',
    tokenSymbol: 'ZBT',
    tokenName: 'ZeroBase',
    tokenIcon: '/tokens/zbt.svg',
    chain: 'solana',
    subtitle: 'Pre-market Token',
    price: 0.055,
    priceChange: 162.18,
    volume24h: 7375.62,
    volumeChange24h: -16.18,
    totalVolume: 25197.18,
    impliedFdv: '$38.1M',
    settleTime: '2025-09-15T12:00:00Z',
    category: 'Pre-market',
  },
  era: {
    id: 'era',
    tokenSymbol: 'ERA',
    tokenName: 'Caldera',
    tokenIcon: '/tokens/era.svg',
    chain: 'ethereum',
    subtitle: 'Pre-market Token',
    price: 0.0464,
    priceChange: 98.31,
    volume24h: 418326.12,
    volumeChange24h: -32.16,
    totalVolume: 7483875.48,
    impliedFdv: '$22.2M',
    settleTime: '2026-05-30T13:00:00Z',
    category: 'Pre-market',
  },
  grass: {
    id: 'grass',
    tokenSymbol: 'GRASS',
    tokenName: 'Grass',
    tokenIcon: '/tokens/grass.svg',
    chain: 'solana',
    subtitle: 'Pre-market Token',
    price: 0.11,
    priceChange: 124.52,
    volume24h: 10418.71,
    volumeChange24h: 228.25,
    totalVolume: 64110.29,
    impliedFdv: '$36.1M',
    settleTime: null,
    category: 'Pre-market',
  },
  loud: {
    id: 'loud',
    tokenSymbol: 'LOUD',
    tokenName: 'Loud',
    tokenIcon: '/tokens/loud.svg',
    chain: 'solana',
    subtitle: 'Pre-market Token',
    price: 0.9638,
    priceChange: -22.6,
    volume24h: 18312.61,
    volumeChange24h: 49.13,
    totalVolume: 628875.43,
    impliedFdv: '$8.3M',
    settleTime: null,
    category: 'Pre-market',
  },
  mmt: {
    id: 'mmt',
    tokenSymbol: 'MMT',
    tokenName: 'Momentum',
    tokenIcon: '/tokens/mmt.svg',
    chain: 'sui',
    subtitle: 'Pre-market Token',
    price: 0.65,
    priceChange: 48.32,
    volume24h: 0,
    volumeChange24h: -100,
    totalVolume: 7244.16,
    impliedFdv: '$9.1M',
    settleTime: null,
    category: 'Pre-market',
  },
};

export const defaultTokenId = 'karak';

export function generateBuyOrders(_basePrice: number): OrderBookEntry[] {
  const prices = [0.0018, 0.0020, 0.0021, 0.0022, 0.0024, 0.0025, 0.0028, 0.0030, 0.0035, 0.0036, 0.0038, 0.0038, 0.0040, 0.0042, 0.0044, 0.0045];
  const amounts = [38.76, 34.88, 99.67, 6.34, 46.51, 195.36, 99.67, 23.26, 139.54, 111.11, 125.00, 55.08, 125.00, 476.19, 190.28, 155.04];
  const collaterals = [0.50, 0.50, 1.50, 0.10, 0.80, 3.50, 2.00, 0.50, 3.50, 400.00, 500.00, 1.50, 500.00, 2.00, 6.00, 5.00];

  return prices.map((price, i) => ({
    id: `buy-${i}`,
    price,
    amount: amounts[i] * 1000,
    amountFormatted: `${amounts[i].toFixed(2)}K`,
    collateral: collaterals[i],
    collateralIcon: '/tokens/sol.svg',
    isOwner: i === 0,
  }));
}

export function generateSellOrders(_basePrice: number): OrderBookEntry[] {
  const prices = [0.0015, 0.0015, 0.0015, 0.0015, 0.0015, 0.0014, 0.0013, 0.0012, 0.0011, 0.0010, 0.0008, 0.0005, 0.0003, 0.0002, 0.0001];
  const amounts = [279.08, 139.54, 186.05, 93.03, 186.05, 199.34, 53.67, 12.50, 2.73, 100.00, 174.43, 100.00, 500.00, 500.00, 100.00];
  const collaterals = [3.00, 1.50, 2.00, 1.00, 2.00, 2.00, 0.50, 15.00, 3.00, 100.00, 1.00, 50.00, 150.00, 100.00, 10.00];

  return prices.map((price, i) => ({
    id: `sell-${i}`,
    price,
    amount: amounts[i] * 1000,
    amountFormatted: `${amounts[i].toFixed(2)}K`,
    collateral: collaterals[i],
    collateralIcon: '/tokens/sol.svg',
    isOwner: i === 2,
  }));
}

export const myFilledOrders: MyOrder[] = [
  {
    id: 'fo-1',
    side: 'Buy',
    pair: 'Karak/SOL',
    date: '23/02/2024 15:33:15',
    price: 0.005,
    amount: '1.00K',
    collateral: '1.5 SOL',
    canResell: true,
  },
  {
    id: 'fo-2',
    side: 'Buy',
    pair: 'Karak/SOL',
    hasBadge: 'RS',
    date: '23/02/2024 15:33:15',
    price: 0.005,
    entryPrice: 0.004,
    originalPrice: 0.005,
    amount: '1.00K',
    collateral: '1.3 SOL',
    canResell: true,
  },
  {
    id: 'fo-3',
    side: 'Buy',
    pair: 'Karak/SOL',
    date: '23/02/2024 15:33:15',
    price: 0.005,
    amount: '1.00K',
    collateral: '1.8 SOL',
    canResell: true,
  },
  {
    id: 'fo-4',
    side: 'Sell',
    pair: 'Karak/SOL',
    date: '23/02/2024 15:33:15',
    price: 0.005,
    amount: '1.00K',
    collateral: '1.5 SOL',
  },
  {
    id: 'fo-5',
    side: 'Sell',
    pair: 'Karak/SOL',
    date: '23/02/2024 15:33:15',
    price: 0.005,
    amount: '1.00K',
    collateral: '1.5 SOL',
  },
];

export const myOpenOrders: MyOrder[] = Array.from({ length: 12 }, (_, i) => ({
  id: `oo-${i}`,
  side: (i % 2 === 0 ? 'Buy' : 'Sell') as 'Buy' | 'Sell',
  pair: 'Karak/SOL',
  date: '23/02/2024 15:33:15',
  price: 0.005,
  amount: `${(Math.random() * 5 + 0.5).toFixed(2)}K`,
  collateral: `${(Math.random() * 3 + 0.5).toFixed(1)} SOL`,
}));

export function generatePriceData(): PriceDataPoint[] {
  const points: PriceDataPoint[] = [];
  const now = Date.now();
  const dayMs = 86400000;
  const startTime = now - 7 * dayMs;

  let price = 0.003;
  for (let i = 0; i < 168; i++) {
    const time = new Date(startTime + i * (dayMs / 24)).toISOString();
    const change = (Math.random() - 0.45) * 0.0003;
    price = Math.max(0.001, price + change);
    const volume = Math.random() * 200000 + 10000;
    points.push({ time, price, volume });
  }
  // Ensure last point matches token price
  points[points.length - 1].price = 0.0045;
  return points;
}

export const detailRecentTrades = [
  { id: 'dt-1', time: '1m ago', side: 'Sell' as const, pair: 'SKATE/USDC', price: 0.005, amount: '36.40K', collateral: 182.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'fish' as const },
  { id: 'dt-2', time: '2m ago', side: 'Sell' as const, pair: 'SKATE/USDC', price: 0.005, amount: '181.80K', collateral: 909.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'fish' as const },
  { id: 'dt-3', time: '5m ago', side: 'Buy' as const, pair: 'SKATE/USDC', price: 0.005, amount: '1.00M', collateral: 5000.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'dolphin' as const, hasBadge: 'RS' },
  { id: 'dt-4', time: '6m ago', side: 'Buy' as const, pair: 'SKATE/USDC', price: 0.005, amount: '400.00K', collateral: 2000.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'dolphin' as const, hasBadge: 'RS' },
  { id: 'dt-5', time: '7m ago', side: 'Buy' as const, pair: 'SKATE/USDC', price: 0.005, amount: '36.20K', collateral: 181.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'fish' as const },
  { id: 'dt-6', time: '10m ago', side: 'Buy' as const, pair: 'SKATE/USDC', price: 0.005, amount: '1.00M', collateral: 150000.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'whale' as const },
  { id: 'dt-7', time: '12m ago', side: 'Buy' as const, pair: 'SKATE/USDC', price: 0.005, amount: '18.20K', collateral: 91.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'shrimp' as const },
];
