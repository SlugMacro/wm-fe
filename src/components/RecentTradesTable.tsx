import { useState, useEffect, useRef, useCallback } from 'react';
import { recentTrades as initialTrades } from '../mock-data/recentTrades';
import type { RecentTrade } from '../types';
import TokenIcon from './TokenIcon';

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

// Map collateral icon paths to token symbols for TokenIcon
function getCollateralSymbol(icon: string): string {
  if (icon.includes('usdc')) return 'USDC';
  if (icon.includes('usdt')) return 'USDT';
  if (icon.includes('sol')) return 'SOL';
  return 'USDC';
}

// Pool of sample trades to cycle through for the animation
const SAMPLE_NEW_TRADES: Omit<RecentTrade, 'id' | 'time'>[] = [
  { side: 'Buy', pair: 'SKATE/USDC', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.0052, amount: '20.00K', collateral: 100.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'shark' },
  { side: 'Sell', pair: 'PENGU/SOL', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.0051, amount: '45.00K', collateral: 1.8, collateralIcon: '/tokens/sol.svg', tierIcon: 'shark' },
  { side: 'Buy', hasBadge: 'RS' as const, pair: 'IKA/USDT', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.121, amount: '2.50K', collateral: 302.5, collateralIcon: '/tokens/usdt.svg', tierIcon: 'shrimp' },
  { side: 'Buy', pair: 'GRASS/USDC', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.071, amount: '7.04K', collateral: 500.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'whale' },
  { side: 'Sell', pair: 'ZBT/USDC', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.054, amount: '9.26K', collateral: 500.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'shark' },
  { side: 'Buy', pair: 'LOUD/USDT', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.958, amount: '1.04K', collateral: 1000.0, collateralIcon: '/tokens/usdt.svg', tierIcon: 'whale' },
  { side: 'Buy', pair: 'PENGU/USDC', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.0049, amount: '102.00K', collateral: 500.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'whale' },
  { side: 'Sell', pair: 'SKATE/SOL', pairIcon: '', pairChain: 'solana', market: 'Pre-market', price: 0.0048, amount: '15.00K', collateral: 0.6, collateralIcon: '/tokens/sol.svg', tierIcon: 'shrimp' },
];

const MAX_VISIBLE = 10;

export default function RecentTradesTable() {
  const [trades, setTrades] = useState<(RecentTrade & { isNew?: boolean })[]>(
    initialTrades.slice(0, MAX_VISIBLE)
  );
  const nextIdRef = useRef(initialTrades.length + 1);
  const sampleIndexRef = useRef(0);
  const tableBodyRef = useRef<HTMLDivElement>(null);

  const addNewTrade = useCallback(() => {
    const sample = SAMPLE_NEW_TRADES[sampleIndexRef.current % SAMPLE_NEW_TRADES.length];
    sampleIndexRef.current += 1;

    const newTrade: RecentTrade & { isNew?: boolean } = {
      ...sample,
      id: String(nextIdRef.current),
      time: 'Just now',
      isNew: true,
    };
    nextIdRef.current += 1;

    setTrades((prev) => {
      const updated = [newTrade, ...prev.slice(0, MAX_VISIBLE - 1)];
      return updated;
    });

    // Remove the "isNew" flag after animation completes
    setTimeout(() => {
      setTrades((prev) =>
        prev.map((t) => (t.id === newTrade.id ? { ...t, isNew: false } : t))
      );
    }, 600);
  }, []);

  useEffect(() => {
    // Add a new trade every 5-8 seconds
    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 3000;
      return setTimeout(() => {
        addNewTrade();
        timerRef.current = scheduleNext();
      }, delay);
    };

    const timerRef: { current: ReturnType<typeof setTimeout> | null } = { current: null };
    timerRef.current = scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [addNewTrade]);

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

        {/* Rows — scrollable on small screens, scroll appears on hover */}
        <div
          ref={tableBodyRef}
          className="overflow-y-hidden hover:overflow-y-auto transition-all"
          style={{ maxHeight: '600px', scrollbarGutter: 'stable' }}
        >
          {trades.map((trade) => (
            <div
              key={trade.id}
              className={`flex items-center border-b border-[#1b1b1c] h-[60px] px-2 transition-all hover:bg-[rgba(255,255,255,0.02)] ${
                trade.isNew
                  ? 'animate-slide-in bg-[rgba(91,209,151,0.05)]'
                  : ''
              }`}
              style={trade.isNew ? {
                animation: 'slideIn 0.4s ease-out',
              } : undefined}
            >
              {/* Time */}
              <div className="w-[128px] shrink-0 text-left">
                <span className={`text-sm font-normal ${trade.isNew ? 'text-[#5bd197]' : 'text-[#7a7a83]'}`}>
                  {trade.time}
                </span>
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
                  <TokenIcon symbol={trade.pair.split('/')[0]} chain="solana" size="sm" showChain={false} />
                  <span className="text-sm font-medium text-[#f9f9fa]">{trade.pair}</span>
                </div>
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
                  <TokenIcon symbol={getCollateralSymbol(trade.collateralIcon)} size="sm" showChain={false} />
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
