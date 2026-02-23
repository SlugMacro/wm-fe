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

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const strokeColor = color === 'green' ? '#5bd197' : '#fd5e67';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <polyline
        points={points.join(' ')}
        stroke={strokeColor}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
