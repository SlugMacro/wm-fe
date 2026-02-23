import { useState, useEffect } from 'react';

function SparklineChart() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 28 L8 22 L14 24 L20 18 L26 20 L32 14 L38 16 L44 10 L50 12 L56 6 L62 4"
        stroke="#5bd197"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FearGreedGauge({ value }: { value: number }) {
  const angle = (value / 100) * 180 - 90;
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
          cx={72 + 56 * Math.cos((angle * Math.PI) / 180)}
          cy={72 + 56 * Math.sin((angle * Math.PI) / 180)}
          r="5"
          fill="#f9f9fa"
          stroke="#0a0a0b"
          strokeWidth="2"
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-[28px] font-medium leading-9 text-[#f9f9fa]" style={{ fontFeatureSettings: "'lnum', 'tnum'" }}>
          {value}
        </span>
        <span className="text-xs font-normal text-[#7a7a83]">Neutral</span>
      </div>
    </div>
  );
}

function AltcoinSeasonBar({ value }: { value: number }) {
  const position = (value / 100) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#7a7a83]">Bitcoin</span>
        <span className="text-xs font-medium text-[#7a7a83]">Altcoin</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(to right, #f9f9fa 1.4%, #16c284 100%)',
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-[#0a0a0b] bg-[#16c284]"
          style={{ left: `${position}%`, transform: `translate(-50%, -50%)` }}
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
    <div className="flex items-center gap-2">
      {blocks.map((block) => (
        <div
          key={block.label}
          className="flex items-center justify-center rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-1.5"
        >
          <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{block.value}</span>
          <span className="text-xs font-medium text-[#7a7a83] ml-0.5">{block.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function TopMetrics() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Pre-market 24h vol */}
      <div className="flex flex-col gap-2 rounded-[10px] bg-[rgba(255,255,255,0.03)] px-5 py-4">
        <span className="text-xs font-normal text-[#7a7a83]">Pre-market 24 vol.</span>
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-medium text-[#f9f9fa]" style={{ fontFeatureSettings: "'lnum', 'tnum'" }}>
              $4.2M
            </span>
            <span className="text-sm font-normal text-[#5bd197]">+12.5%</span>
          </div>
          <div className="ml-auto">
            <SparklineChart />
          </div>
        </div>
      </div>

      {/* Fear & Greed */}
      <div className="flex flex-col items-center gap-1 rounded-[10px] bg-[rgba(255,255,255,0.03)] px-5 pt-4 pb-5">
        <span className="text-xs font-normal text-[#7a7a83] self-start">Fear & Greed</span>
        <FearGreedGauge value={43} />
      </div>

      {/* Altcoin Season */}
      <div className="flex flex-col gap-2 rounded-[10px] bg-[rgba(255,255,255,0.03)] px-5 py-4">
        <span className="text-xs font-normal text-[#7a7a83]">Altcoin season</span>
        <span className="text-2xl font-medium text-[#f9f9fa]" style={{ fontFeatureSettings: "'lnum', 'tnum'" }}>
          70<span className="text-sm font-normal text-[#7a7a83]">/100</span>
        </span>
        <AltcoinSeasonBar value={70} />
      </div>

      {/* Next Settlement */}
      <div className="flex flex-col gap-3 rounded-[10px] bg-[rgba(255,255,255,0.03)] px-5 py-4">
        <span className="text-xs font-normal text-[#7a7a83]">Next settlement</span>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#252527]">
            <span className="text-xs font-medium text-[#f9f9fa]">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#f9f9fa]">SKATE</span>
            <span className="text-xs font-normal text-[#7a7a83]">09/06/2025 14:00 (UTC)</span>
          </div>
        </div>
        <CountdownTimer />
      </div>
    </div>
  );
}
