import { useState, useEffect } from 'react';
import { useFearGreedIndex, useAltcoinSeasonIndex } from '../hooks/useMarketMetrics';

function SparklineChart() {
  const linePath = 'M0 40 L20 34 L40 36 L60 28 L80 30 L100 22 L120 24 L140 16 L160 18 L180 10 L200 12 L220 6 L240 3 L260 5 L280 2';
  const areaPath = `${linePath} L280 48 L0 48 Z`;
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
        <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16c284" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#16c284" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparklineGradient)" />
      <path
        d={linePath}
        stroke="#5bd197"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

export default function TopMetrics() {
  const fearGreed = useFearGreedIndex();
  const altcoinSeason = useAltcoinSeasonIndex();

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Pre-market 24h vol */}
      <div className="relative flex flex-col rounded-[10px] bg-[rgba(255,255,255,0.03)] overflow-hidden">
        <div className="flex flex-col gap-2 px-5 pt-4">
          <span className="text-xs font-normal text-[#7a7a83]">Pre-market 24 vol.</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-medium text-[#f9f9fa]" style={{ fontFeatureSettings: "'lnum', 'tnum'" }}>
              $4.2M
            </span>
            <span className="text-xs font-normal text-[#5bd197]">+12.5%</span>
          </div>
        </div>
        <div className="mt-auto">
          <SparklineChart />
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
            <div className="flex size-[44px] shrink-0 items-center justify-center">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#252527]">
                <span className="text-xs font-medium text-[#f9f9fa]">S</span>
              </div>
            </div>
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
