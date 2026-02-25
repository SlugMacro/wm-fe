import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useMarketLiveUpdates, type LiveMarket } from './useMarketLiveUpdates';
import { liveMarkets as initialLiveMarkets } from '../mock-data/markets';

/* ───── Volume History for sparkline ───── */

const HISTORY_SIZE = 30; // number of data points for sparkline

interface VolumeSnapshot {
  totalVol: number;
  vol24h: number;
}

interface LiveMarketContextValue {
  markets: LiveMarket[];
  totalVol: number;
  vol24h: number;
  vol24hChange: number;
  volHistory: number[]; // rolling sparkline data (HISTORY_SIZE points)
}

const LiveMarketContext = createContext<LiveMarketContextValue | null>(null);

export function LiveMarketProvider({ children }: { children: React.ReactNode }) {
  const markets = useMarketLiveUpdates(initialLiveMarkets);

  // Aggregate volumes from live markets
  const aggregate = useCallback((data: LiveMarket[]): VolumeSnapshot => {
    let totalVol = 0;
    let vol24h = 0;
    for (const m of data) {
      totalVol += m.totalVolume;
      vol24h += m.volume24h;
    }
    return { totalVol, vol24h };
  }, []);

  const initialSnap = aggregate(markets);
  const [totalVol, setTotalVol] = useState(initialSnap.totalVol);
  const [vol24h, setVol24h] = useState(initialSnap.vol24h);
  const baselineRef = useRef(initialSnap.vol24h);

  // Sparkline history — seed with gentle upward trend (vol is cumulative)
  const [volHistory, setVolHistory] = useState<number[]>(() => {
    const base = initialSnap.vol24h;
    return Array.from({ length: HISTORY_SIZE }, (_, i) => {
      const progress = i / (HISTORY_SIZE - 1);
      const trend = base * 0.95 + base * 0.05 * progress;
      const noise = (Math.random() - 0.5) * base * 0.008;
      return trend + noise;
    });
  });

  // Update aggregates whenever markets change
  useEffect(() => {
    const snap = aggregate(markets);
    setTotalVol(snap.totalVol);
    setVol24h(snap.vol24h);
  }, [markets, aggregate]);

  // Push new history point every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const snap = aggregate(markets);
      setVolHistory((prev) => {
        const next = [...prev.slice(1), snap.vol24h];
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [markets, aggregate]);

  // Calculate % change from baseline
  const vol24hChange = baselineRef.current > 0
    ? ((vol24h - baselineRef.current) / baselineRef.current) * 100
    : 0;

  return (
    <LiveMarketContext.Provider value={{ markets, totalVol, vol24h, vol24hChange, volHistory }}>
      {children}
    </LiveMarketContext.Provider>
  );
}

export function useLiveMarkets(): LiveMarketContextValue {
  const ctx = useContext(LiveMarketContext);
  if (!ctx) throw new Error('useLiveMarkets must be used within <LiveMarketProvider>');
  return ctx;
}
