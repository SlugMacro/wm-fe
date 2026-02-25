import type { TokenDetail, OrderBookEntry, MyOrder, PriceDataPoint } from '../types';
import { liveMarkets } from './markets';

// Derive tokenDetails from liveMarkets — single source of truth
export const tokenDetails: Record<string, TokenDetail> = Object.fromEntries(
  liveMarkets.map((m) => [
    m.id,
    {
      id: m.id,
      tokenSymbol: m.tokenSymbol,
      tokenName: m.tokenName,
      tokenIcon: m.tokenIcon,
      chain: m.chain,
      subtitle: 'Pre-market Token',
      price: m.lastPrice,
      priceChange: m.priceChange24h,
      volume24h: m.volume24h,
      volumeChange24h: m.volumeChange24h,
      totalVolume: m.totalVolume,
      totalVolumeChange: m.totalVolumeChange,
      impliedFdv: `$${m.impliedFdv}`,
      settleTime: m.settleTime,
      settlementStatus: m.settlementStatus,
      category: 'Pre-market' as const,
      chartData: m.chartData,
    },
  ])
);

export const defaultTokenId = 'zbt';

function getNativeToken(chain: string): { symbol: 'SOL' | 'ETH' | 'SUI'; icon: string } {
  switch (chain) {
    case 'ethereum': return { symbol: 'ETH', icon: '/tokens/eth.svg' };
    case 'sui': return { symbol: 'SUI', icon: '/tokens/sui.svg' };
    default: return { symbol: 'SOL', icon: '/tokens/sol.svg' };
  }
}

export function generateBuyOrders(basePrice: number, chain = 'solana'): OrderBookEntry[] {
  // Generate buy prices just below market price (96.5%–99.7% of basePrice)
  const spreadPercents = [
    0.967, 0.964, 0.962, 0.960, 0.957, 0.954, 0.950, 0.946,
    0.941, 0.937, 0.933, 0.933, 0.928, 0.924, 0.919, 0.914,
    0.966, 0.958, 0.952, 0.949, 0.947, 0.943, 0.940, 0.938,
    0.935, 0.931, 0.926, 0.921, 0.916, 0.912,
  ];
  const prices = spreadPercents.map(pct => Math.round(basePrice * pct * 10000) / 10000);
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
  // Mark some buy orders as resell
  const resellIndices = new Set([2, 5, 9, 13, 18, 22, 26]);

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
      isResell: resellIndices.has(i),
    };
  });
}

export function generateSellOrders(basePrice: number, chain = 'solana'): OrderBookEntry[] {
  // Generate sell prices just above market price (100.3%–108.8% of basePrice)
  const spreadPercents = [
    1.003, 1.003, 1.005, 1.005, 1.007, 1.010, 1.013, 1.017,
    1.022, 1.028, 1.035, 1.045, 1.058, 1.070, 1.088,
    1.004, 1.006, 1.011, 1.015, 1.024, 1.032, 1.040, 1.052,
    1.062, 1.080,
  ];
  const prices = spreadPercents.map(pct => Math.round(basePrice * pct * 10000) / 10000);
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
    pair: 'ZBT/SOL',
    date: '23/02/2024 15:33:15',
    price: 0.055,
    amount: '1.00K',
    collateral: '1.5 SOL',
    canResell: true,
  },
  {
    id: 'fo-2',
    side: 'Buy',
    pair: 'ZBT/SOL',
    hasBadge: 'RS',
    date: '23/02/2024 15:33:15',
    price: 0.055,
    entryPrice: 0.042,
    originalPrice: 0.055,
    amount: '1.00K',
    collateral: '1.3 SOL',
    canResell: true,
  },
  {
    id: 'fo-3',
    side: 'Buy',
    pair: 'ZBT/SOL',
    date: '23/02/2024 15:33:15',
    price: 0.055,
    amount: '1.00K',
    collateral: '1.8 SOL',
    canResell: true,
  },
  {
    id: 'fo-4',
    side: 'Sell',
    pair: 'ZBT/SOL',
    date: '23/02/2024 15:33:15',
    price: 0.055,
    amount: '1.00K',
    collateral: '1.5 SOL',
  },
  {
    id: 'fo-5',
    side: 'Sell',
    pair: 'ZBT/SOL',
    date: '23/02/2024 15:33:15',
    price: 0.055,
    amount: '1.00K',
    collateral: '1.5 SOL',
  },
];

export const myOpenOrders: MyOrder[] = Array.from({ length: 12 }, (_, i) => ({
  id: `oo-${i}`,
  side: (i % 2 === 0 ? 'Buy' : 'Sell') as 'Buy' | 'Sell',
  pair: 'ZBT/SOL',
  date: '23/02/2024 15:33:15',
  price: 0.055,
  amount: `${(Math.random() * 5 + 0.5).toFixed(2)}K`,
  collateral: `${(Math.random() * 3 + 0.5).toFixed(1)} SOL`,
}));

export function generatePriceData(basePrice = 0.055, chartData?: number[]): PriceDataPoint[] {
  const points: PriceDataPoint[] = [];
  const now = Date.now();
  const dayMs = 86400000;
  const totalPoints = 168;
  const startTime = now - 7 * dayMs;

  if (chartData && chartData.length >= 2) {
    // Use chartData as shape template — interpolate 12 anchor points into 168 detailed points
    const chartMin = Math.min(...chartData);
    const chartMax = Math.max(...chartData);
    const chartRange = chartMax - chartMin || 1;

    // Normalize chartData to 0..1
    const normalized = chartData.map((v) => (v - chartMin) / chartRange);

    // Map normalized values to actual price range
    // The last chartData point should map to basePrice
    // Scale so the range is ~30% of basePrice
    const priceRange = basePrice * 0.35;
    const lastNorm = normalized[normalized.length - 1];
    // offset so that normalized=lastNorm maps to basePrice
    const priceOffset = basePrice - lastNorm * priceRange;

    for (let i = 0; i < totalPoints; i++) {
      const time = new Date(startTime + i * (dayMs / 24)).toISOString();

      // Find position in chartData (0..chartData.length-1)
      const chartPos = (i / (totalPoints - 1)) * (chartData.length - 1);
      const idx = Math.floor(chartPos);
      const frac = chartPos - idx;
      const nextIdx = Math.min(idx + 1, chartData.length - 1);

      // Linear interpolation between chart anchor points
      const interpolated = normalized[idx] + (normalized[nextIdx] - normalized[idx]) * frac;

      // Map to price + small noise for realism
      const noise = (Math.random() - 0.5) * basePrice * 0.01;
      const price = Math.max(basePrice * 0.05, priceOffset + interpolated * priceRange + noise);

      // Volume
      let volume = 0;
      const roll = Math.random();
      if (roll > 0.4) {
        volume = roll > 0.92
          ? Math.random() * 80000 + 30000
          : Math.random() * 15000 + 500;
      }

      points.push({ time, price, volume });
    }
    // Ensure last point matches token price exactly
    points[points.length - 1].price = basePrice;
  } else {
    // Fallback: random walk toward basePrice
    let price = basePrice * (0.6 + Math.random() * 0.2);
    const step = (basePrice - price) / totalPoints;
    for (let i = 0; i < totalPoints; i++) {
      const time = new Date(startTime + i * (dayMs / 24)).toISOString();
      const noise = (Math.random() - 0.5) * basePrice * 0.04;
      price = Math.max(basePrice * 0.1, price + step + noise);

      let volume = 0;
      const roll = Math.random();
      if (roll > 0.4) {
        volume = roll > 0.92
          ? Math.random() * 80000 + 30000
          : Math.random() * 15000 + 500;
      }

      points.push({ time, price, volume });
    }
    points[points.length - 1].price = basePrice;
  }

  return points;
}

/** Generate recent trades dynamically based on token symbol and chain */
export function generateDetailRecentTrades(tokenSymbol: string, chain = 'solana', basePrice = 0.055) {
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
      price: basePrice + (priceOffsets[i] || 0),
      amount,
      collateral,
      collateralIcon: isNative ? native.icon : '/tokens/usdc.svg',
      tierIcon,
      ...(hasBadge ? { hasBadge } : {}),
    };
  });
}
