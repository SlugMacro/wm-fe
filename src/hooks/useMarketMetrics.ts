import { useState, useEffect } from 'react';

interface FearGreedData {
  value: number;
  label: string;
}

interface AltcoinSeasonData {
  value: number;
}

function getFearGreedLabel(value: number): string {
  if (value <= 24) return 'Extreme Fear';
  if (value <= 44) return 'Fear';
  if (value <= 55) return 'Neutral';
  if (value <= 74) return 'Greed';
  return 'Extreme Greed';
}

export function useFearGreedIndex(): FearGreedData {
  const [data, setData] = useState<FearGreedData>({ value: 43, label: 'Fear' });

  useEffect(() => {
    const controller = new AbortController();

    fetch('https://api.alternative.me/fng/', { signal: controller.signal })
      .then((res) => res.json())
      .then((json: { data: Array<{ value: string; value_classification: string }> }) => {
        const item = json.data[0];
        const value = parseInt(item.value, 10);
        setData({
          value,
          label: item.value_classification || getFearGreedLabel(value),
        });
      })
      .catch(() => {
        // Keep default fallback
      });

    return () => controller.abort();
  }, []);

  return data;
}

export function useAltcoinSeasonIndex(): AltcoinSeasonData {
  const [data, setData] = useState<AltcoinSeasonData>({ value: 70 });

  useEffect(() => {
    const controller = new AbortController();

    fetch('https://api.coingecko.com/api/v3/global', { signal: controller.signal })
      .then((res) => res.json())
      .then((json: { data: { market_cap_percentage: { btc: number } } }) => {
        const btcDominance = json.data.market_cap_percentage.btc;
        // Altcoin season score: lower BTC dominance = higher altcoin season
        // Scale: 40% BTC dom → 100 score, 70% BTC dom → 0 score
        const raw = ((70 - btcDominance) / 30) * 100;
        const value = Math.round(Math.max(0, Math.min(100, raw)));
        setData({ value });
      })
      .catch(() => {
        // Keep default fallback
      });

    return () => controller.abort();
  }, []);

  return data;
}
