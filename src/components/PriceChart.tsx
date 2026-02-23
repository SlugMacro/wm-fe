import { useState, useMemo } from 'react';
import type { PriceDataPoint } from '../types';

type TimeRange = '1d' | '7d' | '30d';
type ChartType = 'price' | 'fdv';

export default function PriceChart({ data, currentPrice, priceChange }: { data: PriceDataPoint[]; currentPrice: number; priceChange: number }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [chartType, setChartType] = useState<ChartType>('price');

  const filteredData = useMemo(() => {
    const now = Date.now();
    const ranges: Record<TimeRange, number> = {
      '1d': 86400000,
      '7d': 7 * 86400000,
      '30d': 30 * 86400000,
    };
    const cutoff = now - ranges[timeRange];
    return data.filter(d => new Date(d.time).getTime() >= cutoff);
  }, [data, timeRange]);

  const lastPoint = filteredData[filteredData.length - 1];
  const lastTime = lastPoint ? new Date(lastPoint.time) : new Date();

  // Chart dimensions
  const priceChartH = 200;
  const volumeChartH = 80;
  const rightAxisW = 60;

  // Price bounds
  const prices = filteredData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;
  const priceRange = maxPrice - minPrice || 0.001;

  // Volume bounds
  const volumes = filteredData.map(d => d.volume);
  const maxVolume = Math.max(...volumes);

  // Y-axis price scale
  const priceLabels = Array.from({ length: 5 }, (_, i) => {
    const val = maxPrice - (i / 4) * priceRange;
    return { pct: i / 4, label: val.toFixed(4) };
  });

  const currentPricePct = 1 - (currentPrice - minPrice) / priceRange;

  const isPositive = priceChange >= 0;
  const lineColor = isPositive ? '#5bd197' : '#fd5e67';

  // X-axis labels
  const dateLabels = useMemo(() => {
    const labels: string[] = [];
    const step = Math.max(1, Math.floor(filteredData.length / 7));
    for (let i = 0; i < filteredData.length; i += step) {
      const d = new Date(filteredData[i].time);
      labels.push(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return labels;
  }, [filteredData]);

  const formatTime = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

  // Generate polyline points for price chart
  const pricePoints = filteredData.map((d, i) => {
    const x = (i / Math.max(filteredData.length - 1, 1)) * 100;
    const y = (1 - (d.price - minPrice) / priceRange) * 100;
    return `${x},${y}`;
  }).join(' ');

  // Area polygon (add bottom-right and bottom-left)
  const areaPoints = pricePoints + ` 100,100 0,100`;

  return (
    <div className="rounded-lg border border-[#1b1b1c] overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1b1b1c]">
        <div className="flex items-center gap-1">
          {(['1d', '7d', '30d'] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                timeRange === range ? 'bg-[#1b1b1c] text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'
              }`}
            >
              {range}
            </button>
          ))}
          <div className="mx-2 h-4 w-px bg-[#252527]" />
          {(['price', 'fdv'] as ChartType[]).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                chartType === type ? 'bg-[#1b1b1c] text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'
              }`}
            >
              {type === 'price' ? 'Price' : 'FDV'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7a7a83]">Time</span>
          <span className="text-xs text-[#f9f9fa] tabular-nums">{formatTime(lastTime)}</span>
        </div>
      </div>

      {/* Price chart section */}
      <div className="relative px-4 pt-6">
        {/* Price info overlay */}
        <div className="absolute left-6 top-3 z-10 flex items-center gap-2">
          <span className="text-xs text-[#7a7a83]">Price</span>
          <span className="text-xs font-medium text-[#f9f9fa] tabular-nums">${currentPrice.toFixed(4)}</span>
          <span className={`text-xs tabular-nums ${isPositive ? 'text-[#5bd197]' : 'text-[#fd5e67]'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>

        {/* Watermark */}
        <div className="absolute right-20 top-3 z-10 opacity-30">
          <span className="text-[10px] font-medium tracking-wider text-[#7a7a83] uppercase">WHALES MARKET</span>
        </div>

        <div className="flex">
          {/* Main price chart area */}
          <div className="flex-1 min-w-0" style={{ height: priceChartH }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? 'rgba(22,194,132,0.25)' : 'rgba(253,94,103,0.25)'} />
                  <stop offset="100%" stopColor="rgba(10,10,11,0)" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {priceLabels.map((l, i) => (
                <line key={i} x1="0" y1={l.pct * 100} x2="100" y2={l.pct * 100} stroke="#1b1b1c" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
              ))}
              {/* Area */}
              <polygon points={areaPoints} fill="url(#priceGrad)" />
              {/* Line */}
              <polyline points={pricePoints} fill="none" stroke={lineColor} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              {/* Current price dashed line */}
              <line x1="0" y1={currentPricePct * 100} x2="100" y2={currentPricePct * 100} stroke={lineColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>

          {/* Right Y-axis */}
          <div className="shrink-0 flex flex-col justify-between relative" style={{ width: rightAxisW, height: priceChartH }}>
            {priceLabels.map((l, i) => (
              <span key={i} className="text-[10px] text-[#7a7a83] tabular-nums text-right pr-1" style={{ position: 'absolute', top: `${l.pct * 100}%`, right: 0, transform: 'translateY(-50%)' }}>
                {l.label}
              </span>
            ))}
            {/* Current price badge */}
            <div
              className="absolute right-0 rounded bg-[#16c284] px-1.5 py-0.5 text-[10px] font-medium text-[#0a0a0b] tabular-nums"
              style={{ top: `${currentPricePct * 100}%`, transform: 'translateY(-50%)' }}
            >
              {currentPrice.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Volume chart section */}
      <div className="px-4 pb-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-[#7a7a83]">Total Vol.</span>
          <span className="text-xs font-medium text-[#f9f9fa] tabular-nums">
            ${filteredData.reduce((sum, d) => sum + d.volume, 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </span>
        </div>

        <div className="flex">
          <div className="flex-1 min-w-0" style={{ height: volumeChartH }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${filteredData.length} ${maxVolume}`} preserveAspectRatio="none">
              {filteredData.map((d, i) => {
                const prevPrice = i > 0 ? filteredData[i - 1].price : d.price;
                const isUp = d.price >= prevPrice;
                return (
                  <rect
                    key={i}
                    x={i}
                    y={maxVolume - d.volume}
                    width={0.8}
                    height={d.volume}
                    fill={isUp ? 'rgba(22,194,132,0.3)' : 'rgba(255,59,70,0.3)'}
                  />
                );
              })}
            </svg>
          </div>
          <div className="shrink-0 flex flex-col justify-between" style={{ width: rightAxisW, height: volumeChartH }}>
            <span className="text-[10px] text-[#7a7a83] tabular-nums text-right pr-1">
              {maxVolume >= 1000 ? `${(maxVolume / 1000).toFixed(0)}K` : maxVolume.toFixed(0)}
            </span>
            <span className="text-[10px] text-[#7a7a83] tabular-nums text-right pr-1">
              {maxVolume >= 2000 ? `${(maxVolume / 2000).toFixed(0)}K` : (maxVolume / 2).toFixed(0)}
            </span>
          </div>
        </div>

        {/* X-axis date labels */}
        <div className="flex justify-between pr-16 pt-1 pb-2">
          {dateLabels.map((label, i) => (
            <span key={i} className="text-[10px] text-[#7a7a83] tabular-nums">{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
