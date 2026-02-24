import { useState, useEffect, useRef, useCallback } from 'react';
import type { Market } from '../types';

export type FlashDirection = 'up' | 'down' | null;

export interface LiveMarket extends Market {
  flash: FlashDirection;
}

// Random number in range [min, max]
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Pick N random unique indices from [0, length)
function pickRandom(length: number, count: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  const result: number[] = [];
  for (let i = 0; i < Math.min(count, length); i++) {
    const idx = Math.floor(Math.random() * indices.length);
    result.push(indices[idx]);
    indices.splice(idx, 1);
  }
  return result;
}

/**
 * Hook that simulates live market price updates.
 * Every 5–30s, randomly updates 1–4 markets with small price changes.
 * Returns LiveMarket[] with a `flash` field for animation ('up' | 'down' | null).
 */
export function useMarketLiveUpdates(initialMarkets: Market[]): LiveMarket[] {
  // Store original prices for % change calculation
  const originalPricesRef = useRef<Record<string, number>>({});

  const [markets, setMarkets] = useState<LiveMarket[]>(() => {
    const priceMap: Record<string, number> = {};
    const result = initialMarkets.map((m) => {
      priceMap[m.id] = m.lastPrice;
      return { ...m, flash: null as FlashDirection };
    });
    originalPricesRef.current = priceMap;
    return result;
  });

  // Schedule next update with random interval
  const scheduleUpdate = useCallback(() => {
    return rand(5000, 30000); // 5s to 30s
  }, []);

  useEffect(() => {
    // Only update live markets with actual prices
    const liveIndices = markets
      .map((m, i) => (m.status === 'live' && m.lastPrice > 0 ? i : -1))
      .filter((i) => i >= 0);

    if (liveIndices.length === 0) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const doUpdate = () => {
      // Pick 1-4 random live markets to update (some might not change)
      const count = Math.floor(rand(1, Math.min(4, liveIndices.length) + 1));
      const selected = pickRandom(liveIndices.length, count).map((i) => liveIndices[i]);

      setMarkets((prev) => {
        const next = [...prev];

        for (const idx of selected) {
          const market = { ...next[idx] };
          const oldPrice = market.lastPrice;

          // Random price change: ±0.5% to ±5%
          const changePct = rand(-5, 5) / 100;
          const newPrice = Math.max(0.0001, oldPrice * (1 + changePct));

          // Determine direction
          const direction: FlashDirection = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : null;

          // Update price
          market.lastPrice = parseFloat(newPrice.toFixed(6));

          // Recalculate 24h % change from original price
          const origPrice = originalPricesRef.current[market.id];
          if (origPrice > 0) {
            market.priceChange24h = parseFloat(
              (((market.lastPrice - origPrice) / origPrice) * 100).toFixed(2)
            );
          }

          // Slightly adjust volumes (±0.1% to ±2%)
          const volChange = rand(-2, 2) / 100;
          market.volume24h = parseFloat(
            (market.volume24h * (1 + volChange)).toFixed(2)
          );
          market.volumeChange24h = parseFloat(
            (market.volumeChange24h + rand(-1, 1)).toFixed(2)
          );

          // Update chart data: shift left, add new proportional point
          const chartData = [...market.chartData];
          if (chartData.length > 0) {
            chartData.shift();
            const lastVal = chartData[chartData.length - 1];
            const chartChange = changePct * 50; // Scale for visual effect
            chartData.push(Math.max(1, lastVal + chartChange));
          }
          market.chartData = chartData;

          // Chart color: based on whether last few points trend up or down
          if (chartData.length >= 2) {
            market.chartColor = chartData[chartData.length - 1] >= chartData[chartData.length - 2] ? 'green' : 'red';
          }

          // Set flash direction
          market.flash = direction;

          next[idx] = market;
        }

        return next;
      });

      // Clear flash after 1.2s
      const selectedSet = new Set(selected);
      setTimeout(() => {
        setMarkets((prev) =>
          prev.map((m, i) =>
            selectedSet.has(i) ? { ...m, flash: null } : m
          )
        );
      }, 1200);

      // Schedule next update
      timeoutId = setTimeout(doUpdate, scheduleUpdate());
    };

    // Start first update after initial delay
    timeoutId = setTimeout(doUpdate, scheduleUpdate());

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return markets;
}
