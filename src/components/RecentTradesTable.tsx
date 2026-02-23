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

function WhaleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#1b1b1c" stroke="#252527" strokeWidth="1" />
      <text x="8" y="11" textAnchor="middle" fontSize="8" fill="#7a7a83">W</text>
    </svg>
  );
}

function SharkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#1b1b1c" stroke="#252527" strokeWidth="1" />
      <text x="8" y="11" textAnchor="middle" fontSize="8" fill="#7a7a83">S</text>
    </svg>
  );
}

function ShrimpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#1b1b1c" stroke="#252527" strokeWidth="1" />
      <text x="8" y="11" textAnchor="middle" fontSize="8" fill="#7a7a83">s</text>
    </svg>
  );
}

function TierIcon({ tier }: { tier: 'whale' | 'shark' | 'shrimp' }) {
  switch (tier) {
    case 'whale': return <WhaleIcon />;
    case 'shark': return <SharkIcon />;
    case 'shrimp': return <ShrimpIcon />;
  }
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
  const columns = [
    { label: 'Time', width: 'w-[100px]', sortable: true, align: 'text-left' as const },
    { label: 'Side', width: 'w-[100px]', sortable: false, align: 'text-left' as const },
    { label: 'Pair', width: 'w-[172px]', sortable: false, align: 'text-left' as const },
    { label: 'Market', width: 'w-[120px]', sortable: false, align: 'text-left' as const },
    { label: 'Price ($)', width: 'w-[140px]', sortable: true, align: 'text-right' as const },
    { label: 'Amount', width: 'w-[140px]', sortable: true, align: 'text-right' as const },
    { label: 'Collateral', width: 'w-[140px]', sortable: true, align: 'text-right' as const },
    { label: 'TxID', width: 'w-[100px]', sortable: true, align: 'text-right' as const },
  ];

  return (
    <div>
      {/* Section title */}
      <h2 className="text-xl font-medium text-[#f9f9fa] mb-4">Recent Trades</h2>

      {/* Table */}
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2">
          {columns.map((col) => (
            <div key={col.label} className={`${col.width} shrink-0 ${col.align}`}>
              <span className="text-xs font-normal text-[#7a7a83]">
                {col.label}
                {col.sortable && <SortIcon />}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {recentTrades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center border-b border-[#1b1b1c] h-[60px] px-2 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
          >
            {/* Time */}
            <div className="w-[100px] shrink-0 text-left">
              <span className="text-sm font-normal text-[#7a7a83]">{trade.time}</span>
            </div>

            {/* Side */}
            <div className="w-[100px] shrink-0 text-left">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-sm font-medium ${
                    trade.side === 'Buy' ? 'text-[#5bd197]' : 'text-[#fd5e67]'
                  }`}
                >
                  {trade.side}
                </span>
                {trade.hasBadge && (
                  <span className="inline-flex items-center justify-center rounded bg-[#252527] px-1 py-0.5 text-[10px] font-medium leading-3 text-[#7a7a83]">
                    {trade.hasBadge}
                  </span>
                )}
              </div>
            </div>

            {/* Pair */}
            <div className="w-[172px] shrink-0 text-left">
              <div className="flex items-center gap-2">
                <div className="flex size-5 items-center justify-center rounded-full bg-[#252527] text-[8px] font-bold text-[#f9f9fa]">
                  {trade.pair.charAt(0)}
                </div>
                <span className="text-sm font-medium text-[#f9f9fa]">{trade.pair}</span>
              </div>
            </div>

            {/* Market */}
            <div className="w-[120px] shrink-0 text-left">
              <span className="text-sm font-normal text-[#7a7a83]">{trade.market}</span>
            </div>

            {/* Price */}
            <div className="w-[140px] shrink-0 text-right">
              <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">
                {trade.price.toFixed(4)}
              </span>
            </div>

            {/* Amount */}
            <div className="w-[140px] shrink-0 text-right">
              <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">{trade.amount}</span>
            </div>

            {/* Collateral */}
            <div className="w-[140px] shrink-0 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">
                  {trade.collateral < 1 ? trade.collateral.toFixed(2) : trade.collateral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <CollateralIcon icon={trade.collateralIcon} />
                <TierIcon tier={trade.tierIcon} />
              </div>
            </div>

            {/* TxID / Trade button */}
            <div className="w-[100px] shrink-0 text-right">
              <button className="inline-flex items-center justify-center rounded-lg border border-[#252527] px-3 py-1 text-xs font-medium text-[#f9f9fa] transition-colors hover:border-[#3a3a3d] hover:bg-[rgba(255,255,255,0.03)]">
                &gt;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
