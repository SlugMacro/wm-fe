import { recentTrades } from '../mock-data/recentTrades';

function SortIcon() {
  return (
    <span className="ml-1 inline-flex flex-col gap-[1px]">
      <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
        <path d="M3 0L6 4H0L3 0Z" fill="#3a3a3d" />
      </svg>
      <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
        <path d="M3 4L0 0H6L3 4Z" fill="#3a3a3d" />
      </svg>
    </span>
  );
}

function ArrowRightUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
        stroke="#f9f9fa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TierIcon({ tier }: { tier: 'whale' | 'shark' | 'shrimp' }) {
  const labels: Record<string, string> = { whale: '🐋', shark: '🦈', shrimp: '🦐' };
  return (
    <div className="flex size-4 items-center justify-center rounded-full bg-[#1b1b1c] text-[8px]">
      {labels[tier]}
    </div>
  );
}

function CollateralIcon({ icon }: { icon: string }) {
  const symbol = icon.includes('usdc') ? 'U' : icon.includes('usdt') ? 'T' : icon.includes('sol') ? '◎' : '?';
  const bgColor = icon.includes('usdc') ? '#2775ca' : icon.includes('usdt') ? '#26a17b' : icon.includes('sol') ? '#9945ff' : '#252527';
  return (
    <div
      className="flex size-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
      style={{ backgroundColor: bgColor }}
    >
      {symbol}
    </div>
  );
}

export default function RecentTradesTable() {
  return (
    <div>
      {/* Section title */}
      <div className="flex items-center border-b border-[#1b1b1c] h-[52px]">
        <h2 className="text-xl font-medium leading-7 text-[#f9f9fa]">Recent Trades</h2>
      </div>

      {/* Table */}
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2">
          <div className="w-[128px] shrink-0 text-left">
            <span className="text-xs font-normal text-[#7a7a83]">
              Time <SortIcon />
            </span>
          </div>
          <div className="w-[128px] shrink-0 text-left">
            <span className="text-xs font-normal text-[#7a7a83]">Side</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <span className="text-xs font-normal text-[#7a7a83]">Pair</span>
          </div>
          <div className="w-[180px] shrink-0 text-right">
            <span className="text-xs font-normal text-[#7a7a83]">Market</span>
          </div>
          <div className="w-[180px] shrink-0 text-right">
            <span className="text-xs font-normal text-[#7a7a83]">
              Price ($) <SortIcon />
            </span>
          </div>
          <div className="w-[180px] shrink-0 text-right">
            <span className="text-xs font-normal text-[#7a7a83]">
              Amount <SortIcon />
            </span>
          </div>
          <div className="w-[180px] shrink-0 text-right">
            <span className="text-xs font-normal text-[#7a7a83]">
              Collateral <SortIcon />
            </span>
          </div>
          <div className="w-[180px] shrink-0 text-right">
            <span className="text-xs font-normal text-[#7a7a83]">
              Tx.ID <SortIcon />
            </span>
          </div>
        </div>

        {/* Rows */}
        {recentTrades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center border-b border-[#1b1b1c] h-[60px] px-2 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
          >
            {/* Time */}
            <div className="w-[128px] shrink-0 text-left">
              <span className="text-sm font-normal text-[#7a7a83]">{trade.time}</span>
            </div>

            {/* Side */}
            <div className="w-[128px] shrink-0 text-left">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    trade.side === 'Buy' ? 'text-[#5bd197]' : 'text-[#fd5e67]'
                  }`}
                >
                  {trade.side}
                </span>
                {trade.hasBadge && (
                  <span className="inline-flex items-center justify-center rounded-full bg-[#eab308] px-2 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#0a0a0b]">
                    {trade.hasBadge}
                  </span>
                )}
              </div>
            </div>

            {/* Pair */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <div className="flex size-4 items-center justify-center rounded-full bg-[#252527] text-[7px] font-bold text-[#f9f9fa] shrink-0">
                  {trade.pair.charAt(0)}
                </div>
                <span className="text-sm font-medium text-[#f9f9fa]">{trade.pair}</span>
              </div>
            </div>

            {/* Market */}
            <div className="w-[180px] shrink-0 text-right">
              <span className="text-sm font-normal text-[#7a7a83]">{trade.market}</span>
            </div>

            {/* Price */}
            <div className="w-[180px] shrink-0 text-right">
              <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">
                {trade.price.toFixed(4)}
              </span>
            </div>

            {/* Amount */}
            <div className="w-[180px] shrink-0 text-right">
              <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{trade.amount}</span>
            </div>

            {/* Collateral */}
            <div className="w-[180px] shrink-0">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">
                  {trade.collateral < 1
                    ? trade.collateral.toFixed(2)
                    : trade.collateral >= 1000
                      ? `${(trade.collateral / 1000).toFixed(2)}K`
                      : trade.collateral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <CollateralIcon icon={trade.collateralIcon} />
                <TierIcon tier={trade.tierIcon} />
              </div>
            </div>

            {/* Tx.ID - Arrow button */}
            <div className="w-[180px] shrink-0 flex justify-end">
              <button className="inline-flex items-center justify-center w-[52px] h-7 rounded-md border border-[#252527] transition-colors hover:border-[#3a3a3d] hover:bg-[rgba(255,255,255,0.03)]">
                <ArrowRightUpIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
