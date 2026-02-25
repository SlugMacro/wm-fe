import { useState, useEffect, useRef, useCallback } from 'react';
import { recentTrades as initialTrades } from '../mock-data/recentTrades';
import type { RecentTrade } from '../types';
import TokenIcon from './TokenIcon';
import TierIcon from './TierIcon';

function ArrowRightUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Map collateral icon paths to token symbols for TokenIcon
function getCollateralSymbol(icon: string): string {
  if (icon.includes('usdc')) return 'USDC';
  if (icon.includes('usdt')) return 'USDT';
  if (icon.includes('sol')) return 'SOL';
  return 'USDC';
}

// Format elapsed seconds into human-readable time
function formatElapsed(seconds: number): string {
  if (seconds < 60) return 'Just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  if (remainMins === 0) return `${hours}h ago`;
  return `${hours}h ${remainMins}m ago`;
}

// Parse initial "Xm ago" / "Xh ago" strings into seconds
function parseTimeToSeconds(time: string): number {
  const hMatch = time.match(/(\d+)h/);
  const mMatch = time.match(/(\d+)m/);
  let secs = 0;
  if (hMatch) secs += parseInt(hMatch[1]) * 3600;
  if (mMatch) secs += parseInt(mMatch[1]) * 60;
  return secs || 60; // default 1 min if unparseable
}

// Internal trade type with createdAt timestamp for time tracking
interface TradeWithTimestamp extends RecentTrade {
  createdAt: number; // timestamp ms
  isNew?: boolean;
}

// Pool of sample trades to cycle through for the animation
const SAMPLE_NEW_TRADES: Omit<RecentTrade, 'id' | 'time'>[] = [
  { side: 'Buy', pair: 'SKATE/USDC', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.0052, amount: '20.00K', collateral: 75.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'shrimp' },
  { side: 'Sell', pair: 'PENGU/SOL', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.0051, amount: '45.00K', collateral: 500.0, collateralIcon: '/tokens/sol.svg', tierIcon: 'fish' },
  { side: 'Buy', hasBadge: 'RS' as const, pair: 'IKA/USDT', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.121, amount: '2.50K', collateral: 302.5, collateralIcon: '/tokens/usdt.svg', tierIcon: 'fish' },
  { side: 'Buy', pair: 'GRASS/USDC', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.071, amount: '7.04K', collateral: 5000.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'dolphin' },
  { side: 'Sell', pair: 'ZBT/USDC', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.054, amount: '9.26K', collateral: 25000.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'shark' },
  { side: 'Buy', pair: 'LOUD/USDT', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.958, amount: '1.04K', collateral: 1500.0, collateralIcon: '/tokens/usdt.svg', tierIcon: 'dolphin' },
  { side: 'Buy', pair: 'PENGU/USDC', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.0049, amount: '102.00K', collateral: 200000.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'whale' },
  { side: 'Sell', pair: 'SKATE/SOL', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.0048, amount: '15.00K', collateral: 50000.0, collateralIcon: '/tokens/sol.svg', tierIcon: 'shark' },
];

const MAX_VISIBLE = 15;
const NEW_TRADE_INTERVAL = 60_000; // 1 minute
const TIME_UPDATE_INTERVAL = 10_000; // update displayed times every 10s

export default function RecentTradesTable() {
  const now = Date.now();

  // Initialize trades with createdAt timestamps based on their initial "Xm ago" strings
  const [trades, setTrades] = useState<TradeWithTimestamp[]>(() =>
    initialTrades.slice(0, MAX_VISIBLE).map((t) => ({
      ...t,
      createdAt: now - parseTimeToSeconds(t.time) * 1000,
    }))
  );

  const nextIdRef = useRef(initialTrades.length + 1);
  const sampleIndexRef = useRef(0);
  const tableBodyRef = useRef<HTMLDivElement>(null);

  // Add a brand new trade
  const addNewTrade = useCallback(() => {
    const sample = SAMPLE_NEW_TRADES[sampleIndexRef.current % SAMPLE_NEW_TRADES.length];
    sampleIndexRef.current += 1;

    const newTrade: TradeWithTimestamp = {
      ...sample,
      id: String(nextIdRef.current),
      time: 'Just now',
      createdAt: Date.now(),
      isNew: true,
    };
    nextIdRef.current += 1;

    setTrades((prev) => [newTrade, ...prev.slice(0, MAX_VISIBLE - 1)]);

    // Remove the "isNew" flag after animation completes
    setTimeout(() => {
      setTrades((prev) =>
        prev.map((t) => (t.id === newTrade.id ? { ...t, isNew: false } : t))
      );
    }, 600);
  }, []);

  // New trade every 1 minute
  useEffect(() => {
    const timer = setInterval(addNewTrade, NEW_TRADE_INTERVAL);
    return () => clearInterval(timer);
  }, [addNewTrade]);

  // Update displayed times every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTrades((prev) =>
        prev.map((t) => ({
          ...t,
          time: formatElapsed(Math.floor((Date.now() - t.createdAt) / 1000)),
        }))
      );
    }, TIME_UPDATE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Section title */}
      <div className="flex items-center h-[44px]">
        <h2 className="text-xl font-medium leading-7 text-[#f9f9fa]">Recent Trades</h2>
      </div>

      {/* Table */}
      <div className="w-full">
        {/* Header — aligned with market table: Time+Side = Token area, Pair = Chart+LastPrice area */}
        <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2">
          <div className="flex-1 min-w-0 flex items-center">
            <div className="w-[128px] shrink-0">
              <span className="text-xs font-normal text-[#7a7a83]">Time</span>
            </div>
            <span className="text-xs font-normal text-[#7a7a83]">Side</span>
          </div>
          <div className="w-[292px] shrink-0 text-left">
            <span className="text-xs font-normal text-[#7a7a83]">Pair</span>
          </div>
          <div className="w-[180px] shrink-0 text-right">
            <span className="text-xs font-normal text-[#7a7a83]">Price ($)</span>
          </div>
          <div className="w-[180px] shrink-0 text-right">
            <span className="text-xs font-normal text-[#7a7a83]">Amount</span>
          </div>
          <div className="w-[180px] shrink-0 text-right">
            <span className="text-xs font-normal text-[#7a7a83]">Collateral</span>
          </div>
          <div className="w-[180px] shrink-0 text-right">
            <span className="text-xs font-normal text-[#7a7a83]">Tx.ID</span>
          </div>
        </div>

        {/* Rows */}
        <div ref={tableBodyRef}>
          {trades.map((trade) => (
            <div
              key={trade.id}
              className={`flex items-center border-b border-[#1b1b1c] last:border-b-0 h-[60px] px-2 transition-all hover:bg-[rgba(255,255,255,0.02)] ${
                trade.isNew ? 'bg-[rgba(91,209,151,0.05)]' : ''
              }`}
              style={trade.isNew ? { animation: 'slideIn 0.4s ease-out' } : undefined}
            >
              {/* Time + Side — aligned with Token name area */}
              <div className="flex-1 min-w-0 flex items-center">
                <div className="w-[128px] shrink-0">
                  <span className={`text-sm font-normal ${trade.isNew ? 'text-[#5bd197]' : 'text-[#7a7a83]'}`}>
                    {trade.time}
                  </span>
                </div>
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

              {/* Pair — aligned with Chart + Last Price area */}
              <div className="w-[292px] shrink-0 text-left">
                <div className="flex items-center gap-2">
                  <TokenIcon symbol={trade.pair.split('/')[0]} chain="solana" size="xs" showChain={false} />
                  <span className="text-sm font-medium text-[#f9f9fa]">{trade.pair}</span>
                </div>
              </div>

              {/* Price — yellow for RS (resell) orders */}
              <div className="w-[180px] shrink-0 text-right">
                <span className={`text-sm font-medium tabular-nums ${trade.hasBadge === 'RS' ? 'text-[#eab308]' : 'text-[#f9f9fa]'}`}>
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
                  <TokenIcon symbol={getCollateralSymbol(trade.collateralIcon)} size="xs" showChain={false} />
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

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-100%);
            max-height: 0;
          }
          50% {
            opacity: 0.5;
            max-height: 60px;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            max-height: 60px;
          }
        }
      `}</style>
    </div>
  );
}
