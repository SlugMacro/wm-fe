import { useState, useEffect, useMemo } from 'react';
import { useFearGreedIndex, useAltcoinSeasonIndex } from '../hooks/useMarketMetrics';
import { useLiveMarkets } from '../hooks/useLiveMarketContext';
import TokenIcon from './TokenIcon';

/* ───── Live Sparkline Chart ───── */

function LiveSparklineChart({ data }: { data: number[] }) {
  const { linePath, areaPath } = useMemo(() => {
    if (data.length < 2) return { linePath: '', areaPath: '' };

    const width = 280;
    const height = 48;
    const padding = 2;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return { x, y };
    });

    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const area = `${line} L${width} ${height} L0 ${height} Z`;

    return { linePath: line, areaPath: area };
  }, [data]);

  // Determine trend color: compare last value to first
  const isUp = data.length >= 2 && data[data.length - 1] >= data[0];
  const strokeColor = isUp ? '#5bd197' : '#fd5e67';
  const gradientColor = isUp ? '#16c284' : '#fd5e67';
  const gradientId = isUp ? 'sparkGradUp' : 'sparkGradDown';

  return (
    <svg
      className="w-full"
      height="48"
      viewBox="0 0 280 48"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={gradientColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`}>
        <animate attributeName="d" dur="0.5s" fill="freeze" />
      </path>
      <path
        d={linePath}
        stroke={strokeColor}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ───── Format volume value ───── */

function formatVol(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

/* ───── Sub-components ───── */

function FearGreedGauge({ value, label }: { value: number; label: string }) {
  // Arc goes left(0%) → top(50%) → right(100%), parametric angle from π to 0
  const theta = Math.PI * (1 - value / 100);
  return (
    <div className="relative flex flex-col items-center">
      <svg width="144" height="80" viewBox="0 0 144 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fd5e67" />
            <stop offset="25%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="75%" stopColor="#5bd197" />
            <stop offset="100%" stopColor="#16c284" />
          </linearGradient>
        </defs>
        <path
          d="M16 72 A56 56 0 0 1 128 72"
          stroke="url(#gaugeGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <circle
          cx={72 + 56 * Math.cos(theta)}
          cy={72 - 56 * Math.sin(theta)}
          r="6"
          fill="#f9f9fa"
          stroke="#0a0a0b"
          strokeWidth="2"
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-[28px] font-medium leading-9 text-[#f9f9fa]" style={{ fontFeatureSettings: "'lnum', 'tnum'" }}>
          {value}
        </span>
        <span className="text-xs font-normal text-[#7a7a83]">{label}</span>
      </div>
    </div>
  );
}

function AltcoinSeasonBar({ value }: { value: number }) {
  const position = (value / 100) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#f9f9fa]">Bitcoin</span>
        <span className="text-xs font-medium text-[#f9f9fa]">Altcoin</span>
      </div>
      <div className="relative h-4 w-full">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 w-full overflow-hidden rounded-full"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(to right, #f9f9fa 1.4%, #16c284 100%)',
            }}
          />
        </div>
        <div
          className="absolute top-1/2 size-4 rounded-full border-2 border-[#0a0a0b] bg-[#f9f9fa]"
          style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 2, minutes: 33, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const blocks = [
    { value: timeLeft.days, label: 'd' },
    { value: timeLeft.hours, label: 'h' },
    { value: timeLeft.minutes, label: 'm' },
    { value: timeLeft.seconds, label: 's' },
  ];

  return (
    <div className="flex w-full items-center gap-2">
      {blocks.map((block) => (
        <div
          key={block.label}
          className="flex flex-1 items-baseline justify-center gap-0.5 rounded-lg bg-[rgba(255,255,255,0.03)] px-2 py-1"
        >
          <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{block.value}</span>
          <span className="text-xs font-medium text-[#7a7a83]">{block.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ───── Main Component ───── */

export default function TopMetrics() {
  const fearGreed = useFearGreedIndex();
  const altcoinSeason = useAltcoinSeasonIndex();
  const { vol24h, vol24hChange, volHistory } = useLiveMarkets();

  const changeColor = vol24hChange >= 0 ? 'text-[#5bd197]' : 'text-[#fd5e67]';
  const changeText = `${vol24hChange >= 0 ? '+' : ''}${vol24hChange.toFixed(2)}%`;

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Pre-market 24h vol — LIVE from market data */}
      <div className="relative flex flex-col rounded-[10px] bg-[rgba(255,255,255,0.03)] overflow-hidden">
        <div className="flex flex-col gap-2 px-5 pt-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-normal text-[#7a7a83]">Pre-market 24h vol.</span>
            <div className="size-1.5 rounded-full bg-[#16c284] animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-medium text-[#f9f9fa]" style={{ fontFeatureSettings: "'lnum', 'tnum'" }}>
              {formatVol(vol24h)}
            </span>
            <span className={`text-xs font-normal ${changeColor}`}>{changeText}</span>
          </div>
        </div>
        <div className="mt-auto">
          <LiveSparklineChart data={volHistory} />
        </div>
      </div>

      {/* Fear & Greed */}
      <div className="flex flex-col items-center gap-1 rounded-[10px] bg-[rgba(255,255,255,0.03)] px-5 pt-4 pb-5">
        <span className="text-xs font-normal text-[#7a7a83] self-start">Fear & Greed</span>
        <FearGreedGauge value={fearGreed.value} label={fearGreed.label} />
      </div>

      {/* Altcoin Season */}
      <div className="flex flex-col gap-2 rounded-[10px] bg-[rgba(255,255,255,0.03)] px-5 pt-4 pb-5">
        <span className="text-xs font-medium text-[#7a7a83]">Altcoin season</span>
        <div className="flex flex-col gap-4">
          <div className="flex items-center text-2xl font-medium leading-8" style={{ fontFeatureSettings: "'lnum', 'tnum'" }}>
            <span className="text-[#f9f9fa]">{altcoinSeason.value}</span>
            <span className="text-[#7a7a83]">/100</span>
          </div>
          <AltcoinSeasonBar value={altcoinSeason.value} />
        </div>
      </div>

      {/* Next Settlement */}
      <div className="flex flex-col gap-2 rounded-[10px] bg-[rgba(255,255,255,0.03)] px-5 pt-4 pb-5">
        <span className="text-xs font-medium text-[#7a7a83]">Next settlement</span>
        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full items-center gap-2">
            <TokenIcon symbol="SKATE" chain="solana" size="md" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-[#f9f9fa]">SKATE</span>
              <span className="text-xs font-normal text-[#7a7a83]">09/06/2025 14:00 (UTC)</span>
            </div>
          </div>
          <CountdownTimer />
        </div>
      </div>
    </div>
  );
}
