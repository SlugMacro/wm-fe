interface MiniChartProps {
  data: number[];
  color: 'green' | 'red';
}

export default function MiniChart({ data, color }: MiniChartProps) {
  if (data.length === 0) return <div className="h-[44px] w-[96px]" />;

  const width = 96;
  const height = 44;
  const padding = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const coords = data.map((val, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - (val - min) / range) * (height - padding * 2),
  }));

  const linePoints = coords.map((p) => `${p.x},${p.y}`).join(' ');

  // Create closed area path for gradient fill
  const areaPath =
    coords.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') +
    ` L${coords[coords.length - 1].x},${height} L${coords[0].x},${height} Z`;

  const strokeColor = color === 'green' ? '#5bd197' : '#fd5e67';
  const gradientId = `miniChartGrad-${color}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline
        points={linePoints}
        stroke={strokeColor}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
