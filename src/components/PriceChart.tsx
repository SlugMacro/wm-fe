import { useState, useMemo, useRef, useCallback } from 'react';
import type { PriceDataPoint } from '../types';
import mascotSvg from '../assets/images/mascot.svg';
import logoTopSvg from '../assets/images/logo-top.svg';
import logoBottomSvg from '../assets/images/logo-bottom.svg';

type TimeRange = '1d' | '7d' | '30d';
type ChartType = 'price' | 'fdv';

interface PriceChartProps {
  data: PriceDataPoint[];
  currentPrice: number;
  priceChange: number;
}

export default function PriceChart({ data, currentPrice, priceChange }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [chartType, setChartType] = useState<ChartType>('price');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chartAreaRef = useRef<HTMLDivElement>(null);

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
  const priceChartH = 220;
  const volumeChartH = 100;
  const rightAxisW = 72;
  const leftLabelW = 32;

  // Price bounds
  const prices = filteredData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;
  const priceRange = maxPrice - minPrice || 0.001;

  // Volume bounds
  const volumes = filteredData.map(d => d.volume);
  const maxVolume = Math.max(...volumes);

  // Y-axis price scale (6 labels for better readability)
  const priceLabels = Array.from({ length: 6 }, (_, i) => {
    const val = maxPrice - (i / 5) * priceRange;
    return { pct: i / 5, label: val.toFixed(4) };
  });

  const currentPricePct = Math.max(0, Math.min(1, 1 - (currentPrice - minPrice) / priceRange));

  const isPositive = priceChange >= 0;
  const lineColor = isPositive ? '#5bd197' : '#fd5e67';

  // X-axis labels
  const dateLabels = useMemo(() => {
    const labels: { text: string; pct: number }[] = [];
    const step = Math.max(1, Math.floor(filteredData.length / 7));
    for (let i = 0; i < filteredData.length; i += step) {
      const d = new Date(filteredData[i].time);
      const pct = i / Math.max(filteredData.length - 1, 1);
      labels.push({
        text: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        pct,
      });
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
  const areaPoints = pricePoints + ' 100,100 0,100';

  // Last point position for the green dot — always at chart endpoint (giá khớp lệnh)
  const lastPointX = 100;
  const lastDataPointPrice = filteredData.length > 0 ? filteredData[filteredData.length - 1].price : currentPrice;
  const lastPointY = (1 - (lastDataPointPrice - minPrice) / priceRange) * 100;

  // Hover handler — calculate data index from mouse X position
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = chartAreaRef.current;
    if (!el || filteredData.length === 0) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.round(ratio * (filteredData.length - 1));
    setHoverIndex(index);
  }, [filteredData.length]);

  const handleMouseLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  // Hover computed values
  const hoverPoint = hoverIndex !== null ? filteredData[hoverIndex] : null;
  const hoverX = hoverIndex !== null ? (hoverIndex / Math.max(filteredData.length - 1, 1)) * 100 : 0;
  const hoverPriceY = hoverPoint ? (1 - (hoverPoint.price - minPrice) / priceRange) * 100 : 0;

  // Volume Y-axis labels
  const formatVol = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toFixed(0);

  // Tooltip position (pixel-based for accurate placement)
  const getTooltipStyle = (): React.CSSProperties => {
    if (!chartAreaRef.current || hoverIndex === null) return { display: 'none' };
    const rect = chartAreaRef.current.getBoundingClientRect();
    const pixelX = (hoverX / 100) * rect.width;
    const flipLeft = hoverX > 65;
    return {
      left: flipLeft ? `calc(${leftLabelW}px + ${pixelX}px - 170px)` : `calc(${leftLabelW}px + ${pixelX}px + 16px)`,
      top: '48px',
    };
  };

  return (
    <div className="rounded-lg border border-[#1b1b1c] overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-2 py-2 border-b border-[#1b1b1c]">
        <div className="flex items-center gap-1">
          {(['1d', '7d', '30d'] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                timeRange === range ? 'bg-[#1b1b1c] text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'
              }`}
            >
              {range}
            </button>
          ))}
          <div className="mx-2 h-3 w-px bg-[#252527]" />
          {(['price', 'fdv'] as ChartType[]).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                chartType === type ? 'bg-[#1b1b1c] text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'
              }`}
            >
              {type === 'price' ? 'Price' : 'FDV'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#7a7a83]">Time</span>
          <span className="text-[10px] text-[#f9f9fa] tabular-nums">
            {hoverPoint ? formatTime(new Date(hoverPoint.time)) : formatTime(lastTime)}
          </span>
        </div>
      </div>

      {/* Chart body */}
      <div className="relative">
        {/* Hover tooltip */}
        {hoverPoint && hoverIndex !== null && (
          <div
            className="absolute z-30 pointer-events-none rounded-md border border-[#252527] bg-[#141415] px-3 py-2 shadow-lg"
            style={getTooltipStyle()}
          >
            <div className="text-[10px] text-[#7a7a83] mb-1.5">
              {formatTime(new Date(hoverPoint.time))}
            </div>
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className="text-[10px] text-[#7a7a83]">Price</span>
              <span className="text-xs font-medium text-[#f9f9fa] tabular-nums">
                ${hoverPoint.price.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] text-[#7a7a83]">Volume</span>
              <span className="text-xs font-medium text-[#f9f9fa] tabular-nums">
                ${hoverPoint.volume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        )}

        {/* === PRICE CHART SECTION === */}
        <div className="flex">
          {/* Left "Price" label */}
          <div
            className="shrink-0 flex items-center justify-center border-r border-[#252527]"
            style={{ width: leftLabelW, height: priceChartH }}
          >
            <span
              className="text-[10px] text-[#7a7a83] tracking-wider uppercase"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Price
            </span>
          </div>

          {/* Price chart area */}
          <div
            className="flex-1 min-w-0 relative"
            style={{ height: priceChartH }}
          >
            {/* Price info overlay */}
            <div className="absolute left-2 top-1 z-10 flex items-center gap-2">
              <span className="text-xs text-[#7a7a83]">Price</span>
              <span className="text-xs font-medium text-[#f9f9fa] tabular-nums">
                ${hoverPoint ? hoverPoint.price.toFixed(4) : currentPrice.toFixed(4)}
              </span>
              <span className={`text-xs tabular-nums ${isPositive ? 'text-[#5bd197]' : 'text-[#fd5e67]'}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>

            {/* Grid lines + current price line — full width of flex-1 */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" viewBox="0 0 100 100" preserveAspectRatio="none">
              {priceLabels.map((l, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={l.pct * 100}
                  x2="100"
                  y2={l.pct * 100}
                  stroke="#252527"
                  strokeWidth="1"
                  opacity="0.2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {/* Current price dashed line — follows dot indicator (giá khớp) */}
              <line
                x1="0"
                y1={lastPointY}
                x2="100"
                y2={lastPointY}
                stroke={lineColor}
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Watermark — same logo as header, greyed out, half size */}
            <div className="absolute right-4 top-2 z-10 flex items-center gap-1 opacity-20 grayscale brightness-75">
              <img src={mascotSvg} alt="" className="w-4 h-4" />
              <div className="relative" style={{ width: '103px', height: '9px' }}>
                <img
                  src={logoTopSvg}
                  alt=""
                  className="absolute left-0 top-0"
                  style={{ width: '49.5px', height: '8.7px' }}
                />
                <img
                  src={logoBottomSvg}
                  alt=""
                  className="absolute"
                  style={{ width: '49.5px', height: '8.4px', left: '53.5px', top: '0.15px' }}
                />
              </div>
            </div>

            {/* SVG area with right padding */}
            <div
              ref={chartAreaRef}
              className="h-full relative cursor-crosshair"
              style={{ marginRight: 96 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? 'rgba(22,194,132,0.20)' : 'rgba(253,94,103,0.20)'} />
                  <stop offset="100%" stopColor="rgba(10,10,11,0)" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <polygon points={areaPoints} fill="url(#priceGrad)" />

              {/* Price line */}
              <polyline
                points={pricePoints}
                fill="none"
                stroke={lineColor}
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />

              {/* (current price line moved to full-width SVG layer) */}

              {/* Hover crosshair lines */}
              {hoverIndex !== null && (
                <>
                  {/* Vertical crosshair */}
                  <line
                    x1={hoverX}
                    y1="0"
                    x2={hoverX}
                    y2="100"
                    stroke="#555"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                    vectorEffect="non-scaling-stroke"
                    opacity="0.7"
                  />
                  {/* Horizontal crosshair at hover price */}
                  <line
                    x1="0"
                    y1={hoverPriceY}
                    x2="100"
                    y2={hoverPriceY}
                    stroke="#555"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                    vectorEffect="non-scaling-stroke"
                    opacity="0.7"
                  />
                </>
              )}
            </svg>

            {/* Live price dot at chart endpoint — giá khớp lệnh */}
            <div
              className="absolute pointer-events-none z-10"
              style={{
                left: `${lastPointX}%`,
                top: `${lastPointY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Pulsing ring animation */}
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: lineColor, opacity: 0.4 }}
              />
              {/* Solid dot */}
              <span
                className="relative block w-3 h-3 rounded-full"
                style={{ backgroundColor: lineColor, boxShadow: `0 0 8px ${lineColor}` }}
              />
            </div>

            {/* Hover dot on the price line */}
            {hoverPoint && hoverIndex !== null && (
              <div
                className="absolute w-2.5 h-2.5 rounded-full pointer-events-none z-10"
                style={{
                  left: `${hoverX}%`,
                  top: `${hoverPriceY}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#f9f9fa',
                  border: `2px solid ${lineColor}`,
                }}
              />
            )}
            </div>
          </div>

          {/* Right Y-axis for price */}
          <div
            className="shrink-0 relative border-l border-[#252527] py-4"
            style={{ width: rightAxisW, height: priceChartH }}
          >
            {priceLabels.map((l, i) => {
              // Hide first and last labels to avoid overlapping border lines
              if (i === 0 || i === priceLabels.length - 1) return null;
              return (
                <span
                  key={i}
                  className="absolute text-[10px] text-[#7a7a83] tabular-nums pl-2"
                  style={{ top: `${l.pct * 100}%`, left: 0, transform: 'translateY(-50%)' }}
                >
                  {l.label}
                </span>
              );
            })}
            {/* Current price badge */}
            <div
              className="absolute left-2 rounded px-1.5 py-0.5 text-[10px] font-medium text-[#0a0a0b] tabular-nums"
              style={{
                top: `${currentPricePct * 100}%`,
                transform: 'translateY(-50%)',
                backgroundColor: isPositive ? '#16c284' : '#fd5e67',
              }}
            >
              {currentPrice.toFixed(4)}
            </div>
            {/* Hover price label */}
            {hoverPoint && hoverIndex !== null && (
              <div
                className="absolute left-2 rounded px-1.5 py-0.5 text-[10px] font-medium text-[#f9f9fa] tabular-nums bg-[#333]"
                style={{
                  top: `${hoverPriceY}%`,
                  transform: 'translateY(-50%)',
                }}
              >
                {hoverPoint.price.toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {/* === SEPARATOR LINE === */}
        <div style={{ paddingLeft: leftLabelW }}>
          <div className="border-t border-[#252527]" />
        </div>

        {/* === VOLUME CHART SECTION === */}
        <div className="flex pb-1 border-b border-[#252527]">
          {/* Left "Volume" label */}
          <div
            className="shrink-0 flex items-center justify-center border-r border-[#252527]"
            style={{ width: leftLabelW, height: volumeChartH }}
          >
            <span
              className="text-[10px] text-[#7a7a83] tracking-wider uppercase"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Volume
            </span>
          </div>

          {/* Volume chart content */}
          <div className="flex-1 min-w-0 relative" style={{ height: volumeChartH }}>
            {/* Volume grid lines — full width */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="0" x2="100" y2="0" stroke="#252527" strokeWidth="1" opacity="0.2" vectorEffect="non-scaling-stroke" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#252527" strokeWidth="1" opacity="0.2" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* Total Vol info — overlaid on chart */}
            <div className="absolute left-2 top-1 z-10 flex items-center gap-2">
              <span className="text-xs text-[#7a7a83]">Total Vol.</span>
              <span className="text-xs font-medium text-[#f9f9fa] tabular-nums">
                ${filteredData.reduce((sum, d) => sum + d.volume, 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
            </div>

            {/* Volume bars chart */}
            <div
              className="relative cursor-crosshair"
              style={{ height: volumeChartH, marginRight: 96 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${filteredData.length} ${maxVolume}`}
                preserveAspectRatio="none"
              >
                {/* Volume bars */}
                {filteredData.map((d, i) => {
                  const prevPrice = i > 0 ? filteredData[i - 1].price : d.price;
                  const isUp = d.price >= prevPrice;
                  const isHovered = hoverIndex === i;
                  return (
                    <rect
                      key={i}
                      x={i}
                      y={maxVolume - d.volume}
                      width={0.8}
                      height={d.volume}
                      fill={
                        isHovered
                          ? (isUp ? 'rgba(22,194,132,0.7)' : 'rgba(255,59,70,0.7)')
                          : (isUp ? 'rgba(22,194,132,0.4)' : 'rgba(255,59,70,0.4)')
                      }
                    />
                  );
                })}

                {/* Hover vertical line in volume chart */}
                {hoverIndex !== null && (
                  <line
                    x1={hoverIndex + 0.4}
                    y1={0}
                    x2={hoverIndex + 0.4}
                    y2={maxVolume}
                    stroke="#555"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                    vectorEffect="non-scaling-stroke"
                    opacity="0.7"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Volume right Y-axis */}
          <div
            className="shrink-0 flex flex-col justify-between border-l border-[#252527] py-4"
            style={{ width: rightAxisW, height: volumeChartH }}
          >
            <span className="text-[10px] text-[#7a7a83] tabular-nums pl-2">
              {formatVol(maxVolume)}
            </span>
            <span className="text-[10px] text-[#7a7a83] tabular-nums pl-2">
              {formatVol(maxVolume / 2)}
            </span>
          </div>
        </div>

        {/* === X-AXIS DATE LABELS === */}
        <div className="flex py-2">
          <div style={{ width: leftLabelW }} className="shrink-0" />
          <div className="flex-1 flex justify-between">
            {dateLabels.map((label, i) => (
              <span key={i} className="text-[10px] text-[#7a7a83] tabular-nums">
                {label.text}
              </span>
            ))}
          </div>
          <div style={{ width: rightAxisW }} className="shrink-0" />
        </div>
      </div>
    </div>
  );
}
