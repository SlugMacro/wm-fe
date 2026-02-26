import { useState, useEffect } from 'react';
import TopMetrics from '../components/TopMetrics';
import LiveMarketTable from '../components/LiveMarketTable';
import RecentTradesTable from '../components/RecentTradesTable';
import BottomStats from '../components/BottomStats';

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-3 rounded-[10px] bg-[rgba(255,255,255,0.03)] px-5 pt-4 pb-5" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="h-3 w-24 rounded bg-[#1b1b1c]" />
          <div className="h-7 w-32 rounded bg-[#1b1b1c]" />
          <div className="h-12 w-full rounded bg-[#1b1b1c]" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Tab row */}
      <div className="flex items-center gap-6 mb-4">
        <div className="h-7 w-32 rounded bg-[#1b1b1c]" />
        <div className="h-5 w-24 rounded bg-[#1b1b1c]" />
        <div className="h-5 w-20 rounded bg-[#1b1b1c]" />
      </div>
      {/* Header row */}
      <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2 mb-1">
        <div className="flex-1 h-3 w-16 rounded bg-[#1b1b1c]" />
        <div className="w-32 h-3 rounded bg-[#1b1b1c]" />
        <div className="w-32 h-3 rounded bg-[#1b1b1c] ml-8" />
      </div>
      {/* Rows */}
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center border-b border-[#1b1b1c] h-[76px] px-2" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="flex items-center gap-3 flex-1">
            <div className="size-10 rounded-full bg-[#1b1b1c]" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-16 rounded bg-[#1b1b1c]" />
              <div className="h-2.5 w-20 rounded bg-[#1b1b1c]" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 w-32">
            <div className="h-3 w-16 rounded bg-[#1b1b1c]" />
            <div className="h-2.5 w-12 rounded bg-[#1b1b1c]" />
          </div>
          <div className="flex flex-col items-end gap-1.5 w-32 ml-8">
            <div className="h-3 w-20 rounded bg-[#1b1b1c]" />
            <div className="h-2.5 w-12 rounded bg-[#1b1b1c]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketsPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-12 py-4">
        <div className="mb-8"><MetricsSkeleton /></div>
        <div className="mb-8"><TableSkeleton /></div>
        <BottomStats />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-12 py-4">
      <div className="mb-8"><TopMetrics /></div>
      <div className="mb-8"><LiveMarketTable /></div>
      <div className="mb-4"><RecentTradesTable /></div>
      <div className="h-12" />
      <BottomStats />
    </div>
  );
}
