interface MoniScoreBarProps {
  score: number;
  maxScore?: number;
}

export default function MoniScoreBar({ score, maxScore = 50000 }: MoniScoreBarProps) {
  const pct = Math.min(100, Math.max(0, (score / maxScore) * 100));

  return (
    <div className="flex items-center gap-2">
      {/* Bar container */}
      <div className="relative w-[120px] h-4 flex items-center">
        {/* Track */}
        <div className="w-full h-1 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(to right, #f9f9fa, #16c284)',
            }}
          />
        </div>
        {/* Score dot */}
        <div
          className="absolute w-2 h-2 rounded-full bg-[#16c284] border border-[#0a0a0b]"
          style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      {/* Score number */}
      <span className="text-xs font-medium text-[#f9f9fa] tabular-nums w-16 text-right">
        {score.toLocaleString('en-US')}
      </span>
    </div>
  );
}
