import TopMetrics from '../components/TopMetrics';
import LiveMarketTable from '../components/LiveMarketTable';
import RecentTradesTable from '../components/RecentTradesTable';
import BottomStats from '../components/BottomStats';

export default function MarketsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-12 py-4">
      {/* Top Metrics */}
      <div className="mb-8">
        <TopMetrics />
      </div>

      {/* Live Market Table */}
      <div className="mb-8">
        <LiveMarketTable />
      </div>

      {/* Recent Trades */}
      <div className="mb-4">
        <RecentTradesTable />
      </div>

      {/* Spacer for fixed BottomStats */}
      <div className="h-12" />

      {/* Bottom Stats — fixed to viewport bottom */}
      <BottomStats />
    </div>
  );
}
