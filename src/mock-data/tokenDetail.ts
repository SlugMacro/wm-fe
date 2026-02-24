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

function getNativeToken(chain: string): { symbol: 'SOL' | 'ETH' | 'SUI'; icon: string } {
  switch (chain) {
    case 'ethereum': return { symbol: 'ETH', icon: '/tokens/eth.svg' };
    case 'sui': return { symbol: 'SUI', icon: '/tokens/sui.svg' };
    default: return { symbol: 'SOL', icon: '/tokens/sol.svg' };
  }
}

export function generateBuyOrders(_basePrice: number, chain = 'solana'): OrderBookEntry[] {
  const prices = [
    0.0018, 0.0020, 0.0021, 0.0022, 0.0024, 0.0025, 0.0028, 0.0030,
    0.0035, 0.0036, 0.0038, 0.0038, 0.0040, 0.0042, 0.0044, 0.0045,
    0.0019, 0.0023, 0.0026, 0.0027, 0.0029, 0.0032, 0.0033, 0.0034,
    0.0037, 0.0039, 0.0041, 0.0043, 0.0046, 0.0047,
  ];
  const amounts = [
    38.76, 34.88, 99.67, 6.34, 46.51, 195.36, 99.67, 23.26,
    139.54, 111.11, 125.00, 55.08, 125.00, 476.19, 190.28, 155.04,
    72.50, 18.33, 210.00, 45.60, 88.14, 63.25, 150.00, 92.78,
    33.10, 280.50, 57.42, 14.88, 320.00, 105.55,
  ];
  // native coin collateral (SOL ~$180, ETH ~$2800, SUI ~$3)
  const nativeCollaterals = [
    0.50, 0, 1.50, 0.10, 0, 3.50, 0, 0.50,
    3.50, 0, 4.80, 0, 2.80, 1.20, 0, 5.00,
    0, 0.30, 4.20, 0, 1.80, 0, 3.80, 2.40,
    0, 8.50, 0, 0.45, 12.00, 0,
  ];
  // stablecoin collateral (USDC)
  const stableCollaterals = [
    0, 85.00, 0, 0, 150.00, 0, 350.00, 0,
    0, 2400.00, 0, 280.00, 0, 0, 1200.00, 0,
    180.00, 0, 0, 120.00, 0, 250.00, 0, 0,
    95.00, 0, 320.00, 0, 0, 650.00,
  ];
  const fillPercents = [
    15, 0, 75, 0, 0, 10, 0, 0,
    5, 90, 60, 0, 40, 0, 100, 0,
    20, 0, 35, 0, 55, 0, 80, 10,
    0, 45, 0, 0, 25, 0,
  ];
  const fillTypes: (undefined | 'FULL' | 'PARTIAL')[] = [
    undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, undefined, 'FULL', undefined,
    undefined, undefined, 'PARTIAL', undefined, undefined, undefined, 'FULL', undefined,
    undefined, undefined, undefined, undefined, undefined, undefined,
  ];

  // true = native coin, false = USDC
  const isNative = [
    true, false, true, true, false, true, false, true,
    true, false, true, false, true, true, false, true,
    false, true, true, false, true, false, true, true,
    false, true, false, true, true, false,
  ];
  const native = getNativeToken(chain);

  return prices.map((price, i) => {
    const totalAmount = amounts[i] * 1000;
    const filledAmount = totalAmount * fillPercents[i] / 100;
    const useNative = isNative[i];
    const collateral = useNative ? nativeCollaterals[i] : stableCollaterals[i];
    return {
      id: `buy-${i}`,
      price,
      amount: totalAmount,
      amountFormatted: `${amounts[i].toFixed(2)}K`,
      collateral,
      collateralIcon: useNative ? native.icon : '/tokens/usdc.svg',
      collateralToken: useNative ? native.symbol : 'USDC' as const,
      isOwner: i === 0,
      fillPercent: fillPercents[i],
      filledAmount,
      totalAmount,
      fillType: fillTypes[i],
    };
  });
}

export function generateSellOrders(_basePrice: number, chain = 'solana'): OrderBookEntry[] {
  const prices = [
    0.0015, 0.0015, 0.0015, 0.0015, 0.0015, 0.0014, 0.0013, 0.0012,
    0.0011, 0.0010, 0.0008, 0.0005, 0.0003, 0.0002, 0.0001,
    0.0016, 0.0017, 0.0014, 0.0013, 0.0011, 0.0009, 0.0007, 0.0004,
    0.0006, 0.0002,
  ];
  const amounts = [
    279.08, 139.54, 186.05, 93.03, 186.05, 199.34, 53.67, 12.50,
    2.73, 100.00, 174.43, 100.00, 500.00, 500.00, 100.00,
    85.20, 42.10, 310.00, 67.80, 150.00, 225.50, 38.90, 180.00,
    95.60, 400.00,
  ];
  // native coin collateral
  const nativeCollaterals = [
    0, 1.50, 2.00, 0, 2.00, 0, 0.50, 15.00,
    0, 6.20, 0, 1.80, 5.50, 0, 10.00,
    1.20, 0, 3.50, 0, 1.20, 0, 0.20, 0,
    0.45, 0,
  ];
  // stablecoin collateral (USDC)
  const stableCollaterals = [
    520.00, 0, 0, 180.00, 0, 380.00, 0, 0,
    85.00, 0, 210.00, 0, 0, 1500.00, 0,
    0, 90.00, 0, 110.00, 0, 280.00, 0, 95.00,
    0, 650.00,
  ];
  const fillPercents = [
    0, 0, 30, 0, 50, 0, 0, 100,
    0, 20, 0, 0, 10, 0, 70,
    15, 0, 40, 0, 60, 0, 25, 0,
    85, 0,
  ];
  const fillTypes: (undefined | 'FULL' | 'PARTIAL')[] = [
    undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'FULL',
    undefined, undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, 'PARTIAL', undefined, undefined, undefined, undefined, undefined,
    'FULL', undefined,
  ];

  // true = native coin, false = USDC
  const isNative = [
    false, true, true, false, true, false, true, true,
    false, true, false, true, true, false, true,
    true, false, true, false, true, false, true, false,
    true, false,
  ];
  const native = getNativeToken(chain);

  return prices.map((price, i) => {
    const totalAmount = amounts[i] * 1000;
    const filledAmount = totalAmount * fillPercents[i] / 100;
    const useNative = isNative[i];
    const collateral = useNative ? nativeCollaterals[i] : stableCollaterals[i];
    return {
      id: `sell-${i}`,
      price,
      amount: totalAmount,
      amountFormatted: `${amounts[i].toFixed(2)}K`,
      collateral,
      collateralIcon: useNative ? native.icon : '/tokens/usdc.svg',
      collateralToken: useNative ? native.symbol : 'USDC' as const,
      isOwner: i === 2,
      fillPercent: fillPercents[i],
      filledAmount,
      totalAmount,
      fillType: fillTypes[i],
    };
  });
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

/** Generate recent trades dynamically based on token symbol and chain */
export function generateDetailRecentTrades(tokenSymbol: string, chain = 'solana') {
  const native = getNativeToken(chain);
  const sym = tokenSymbol.toUpperCase();

  // Template: [side, isNative, amount, collateral, tierIcon, hasBadge?, timeMins]
  const templates: [
    'Buy' | 'Sell', boolean, string, number, 'whale' | 'shark' | 'dolphin' | 'fish' | 'shrimp', string | undefined, number
  ][] = [
    ['Sell', false, '36.40K', 182.0, 'fish', undefined, 1],
    ['Sell', true, '181.80K', 4.95, 'fish', undefined, 2],
    ['Buy', false, '1.00M', 5000.0, 'dolphin', 'RS', 5],
    ['Buy', true, '400.00K', 10.9, 'dolphin', 'RS', 6],
    ['Buy', false, '36.20K', 181.0, 'fish', undefined, 7],
    ['Buy', true, '1.00M', 817.43, 'whale', undefined, 10],
    ['Buy', false, '18.20K', 91.0, 'shrimp', undefined, 12],
    ['Sell', true, '55.00K', 1.47, 'fish', undefined, 15],
    ['Buy', false, '120.00K', 612.0, 'dolphin', undefined, 18],
    ['Sell', false, '75.00K', 375.0, 'fish', undefined, 22],
    ['Buy', true, '500.00K', 14.18, 'shark', 'RS', 25],
    ['Buy', false, '10.00K', 50.0, 'shrimp', undefined, 30],
    ['Sell', true, '200.00K', 5.24, 'dolphin', undefined, 35],
    ['Buy', false, '2.00M', 300000.0, 'whale', undefined, 40],
    ['Sell', false, '88.50K', 433.65, 'fish', undefined, 45],
    ['Buy', true, '15.00K', 0.42, 'shrimp', undefined, 50],
    ['Sell', false, '60.00K', 300.0, 'fish', undefined, 55],
    ['Buy', true, '350.00K', 9.93, 'shark', undefined, 60],
    ['Sell', false, '42.00K', 210.0, 'fish', undefined, 65],
    ['Buy', true, '85.00K', 2.27, 'fish', undefined, 68],
    ['Buy', false, '250.00K', 1275.0, 'shark', 'RS', 72],
    ['Sell', true, '30.00K', 0.79, 'shrimp', undefined, 75],
    ['Buy', false, '500.00K', 2500.0, 'shark', undefined, 80],
    ['Sell', false, '65.00K', 318.5, 'fish', undefined, 85],
    ['Buy', true, '1.50M', 40.91, 'whale', undefined, 90],
    ['Sell', false, '22.00K', 105.6, 'shrimp', undefined, 95],
    ['Buy', true, '180.00K', 5.01, 'dolphin', undefined, 100],
    ['Sell', false, '95.00K', 475.0, 'fish', undefined, 108],
    ['Buy', true, '700.00K', 19.86, 'shark', undefined, 115],
    ['Buy', false, '50.00K', 245.0, 'fish', undefined, 120],
  ];

  // Price variations around a base
  const priceOffsets = [0, 0, 0, 0, 0, 0, 0, -0.0001, 0.0001, 0, 0.0002, 0, -0.0002, 0, -0.0001, 0.0001, 0, 0.0002, 0, -0.0001, 0.0001, -0.0002, 0, -0.0001, 0, -0.0002, 0.0001, 0, 0.0002, -0.0001];

  function formatTime(mins: number): string {
    if (mins < 60) return `${mins}m ago`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h}h ago` : `${h}h ${m}m ago`;
  }

  return templates.map(([side, isNative, amount, collateral, tierIcon, hasBadge, timeMins], i) => {
    const collateralToken = isNative ? native.symbol : 'USDC';
    const pair = `${sym}/${collateralToken}`;
    return {
      id: `dt-${i + 1}`,
      time: formatTime(timeMins),
      side,
      pair,
      price: 0.005 + (priceOffsets[i] || 0),
      amount,
      collateral,
      collateralIcon: isNative ? native.icon : '/tokens/usdc.svg',
      tierIcon,
      ...(hasBadge ? { hasBadge } : {}),
    };
  });
}
