import { useState, useEffect, useRef, useCallback } from 'react';
import { detailRecentTrades } from '../mock-data/tokenDetail';
import TokenIcon from './TokenIcon';
import TierIcon from './TierIcon';

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
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="#f9f9fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Map collateral icon paths to token symbols for TokenIcon
function getCollateralSymbol(icon: string): string {
  if (icon.includes('usdc')) return 'USDC';
  if (icon.includes('usdt')) return 'USDT';
  if (icon.includes('sol')) return 'SOL';
  if (icon.includes('eth')) return 'ETH';
  return 'USDC';
}

interface DetailTrade {
  id: string;
  time: string;
  side: 'Buy' | 'Sell';
  pair: string;
  price: number;
  amount: string;
  collateral: number;
  collateralIcon: string;
  tierIcon: 'whale' | 'shark' | 'dolphin' | 'fish' | 'shrimp';
  hasBadge?: string;
  createdAt?: number;
  isNew?: boolean;
}

// Pool of sample trades for the new-trade animation
const SAMPLE_NEW_TRADES: Omit<DetailTrade, 'id' | 'time'>[] = [
  { side: 'Buy', pair: 'SKATE/USDC', price: 0.0052, amount: '20.00K', collateral: 75.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'shrimp' },
  { side: 'Sell', pair: 'SKATE/USDC', price: 0.0048, amount: '45.00K', collateral: 500.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'fish' },
  { side: 'Buy', hasBadge: 'RS', pair: 'SKATE/USDC', price: 0.0051, amount: '2.50K', collateral: 302.5, collateralIcon: '/tokens/usdc.svg', tierIcon: 'dolphin' },
  { side: 'Sell', pair: 'SKATE/USDC', price: 0.005, amount: '7.04K', collateral: 250.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'fish' },
  { side: 'Buy', pair: 'SKATE/USDC', price: 0.0053, amount: '150.00K', collateral: 50000.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'whale' },
];

const MAX_VISIBLE = 15;
const NEW_TRADE_INTERVAL = 45_000; // 45 seconds

interface DetailRecentTradesProps {
  tokenSymbol?: string;
}

export default function DetailRecentTrades({ tokenSymbol: _tokenSymbol }: DetailRecentTradesProps) {
  const now = Date.now();
  const [trades, setTrades] = useState<DetailTrade[]>(() =>
    detailRecentTrades.map((t) => ({
      ...t,
      createdAt: now - parseTimeToSeconds(t.time) * 1000,
    }))
  );
  const [isHovering, setIsHovering] = useState(false);
  const nextIdRef = useRef(detailRecentTrades.length + 1);
  const sampleIndexRef = useRef(0);

  // Add new trade periodically
  const addNewTrade = useCallback(() => {
    const sample = SAMPLE_NEW_TRADES[sampleIndexRef.current % SAMPLE_NEW_TRADES.length];
    sampleIndexRef.current += 1;

    const newTrade: DetailTrade = {
      ...sample,
      id: `dt-new-${nextIdRef.current}`,
      time: 'Just now',
      createdAt: Date.now(),
      isNew: true,
    };
    nextIdRef.current += 1;

    setTrades((prev) => [newTrade, ...prev.slice(0, MAX_VISIBLE - 1)]);

    // Remove isNew flag after animation
    setTimeout(() => {
      setTrades((prev) =>
        prev.map((t) => (t.id === newTrade.id ? { ...t, isNew: false } : t))
      );
    }, 600);
  }, []);

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
          time: t.createdAt ? formatElapsed(Math.floor((Date.now() - t.createdAt) / 1000)) : t.time,
        }))
      );
    }, 10_000);
    return () => clearInterval(timer);
  }, []);

  // Only show first 15 trades
  const visibleTrades = trades.slice(0, MAX_VISIBLE);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1b1b1c] h-[52px]">
        <h2 className="text-xl font-medium leading-7 text-[#f9f9fa]">Recent Trades</h2>
        <button className="text-xs font-medium text-[#5bd197] transition-colors hover:text-[#7ae8b5]">
          Show All
        </button>
      </div>

      {/* Table header */}
      <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2">
        <div className="w-[100px] shrink-0 text-left">
          <span className="text-xs font-normal text-[#7a7a83]">Time <SortIcon /></span>
        </div>
        <div className="w-[80px] shrink-0 text-left">
          <span className="text-xs font-normal text-[#7a7a83]">Side</span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <span className="text-xs font-normal text-[#7a7a83]">Pair</span>
        </div>
        <div className="w-[120px] shrink-0 text-right">
          <span className="text-xs font-normal text-[#7a7a83]">Price ($) <SortIcon /></span>
        </div>
        <div className="w-[120px] shrink-0 text-right">
          <span className="text-xs font-normal text-[#7a7a83]">Amount <SortIcon /></span>
        </div>
        <div className="w-[140px] shrink-0 text-right">
          <span className="text-xs font-normal text-[#7a7a83]">Collateral <SortIcon /></span>
        </div>
        <div className="w-[80px] shrink-0 text-right">
          <span className="text-xs font-normal text-[#7a7a83]">Tx.ID <SortIcon /></span>
        </div>
      </div>

      {/* Scrollable rows — scroll only visible on hover */}
      <div
        className={`max-h-[720px] transition-all ${isHovering ? 'overflow-y-auto' : 'overflow-hidden'}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          scrollbarWidth: isHovering ? 'thin' : 'none',
          scrollbarColor: '#252527 transparent',
        }}
      >
        {visibleTrades.map(trade => (
          <div
            key={trade.id}
            className={`flex items-center border-b border-[#1b1b1c] h-[48px] px-2 transition-all hover:bg-[rgba(255,255,255,0.02)] ${
              trade.isNew ? 'bg-[rgba(91,209,151,0.05)]' : ''
            }`}
            style={trade.isNew ? { animation: 'detailSlideIn 0.4s ease-out' } : undefined}
          >
            <div className="w-[100px] shrink-0 text-left">
              <span className={`text-sm font-normal ${trade.isNew ? 'text-[#5bd197]' : 'text-[#7a7a83]'}`}>
                {trade.time}
              </span>
            </div>
            <div className="w-[80px] shrink-0 text-left">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${trade.side === 'Buy' ? 'text-[#5bd197]' : 'text-[#fd5e67]'}`}>
                  {trade.side}
                </span>
                {trade.hasBadge && (
                  <span className="inline-flex items-center justify-center rounded-full bg-[#eab308] px-2 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#0a0a0b]">
                    {trade.hasBadge}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-sm font-medium text-[#f9f9fa]">{trade.pair}</span>
            </div>
            <div className="w-[120px] shrink-0 text-right">
              <span className={`text-sm font-medium tabular-nums ${
                trade.hasBadge ? (trade.side === 'Buy' ? 'text-[#5bd197]' : 'text-[#fd5e67]') : 'text-[#f9f9fa]'
              }`}>
                {trade.price.toFixed(4)}
              </span>
            </div>
            <div className="w-[120px] shrink-0 text-right">
              <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{trade.amount}</span>
            </div>
            <div className="w-[140px] shrink-0">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">
                  {trade.collateral >= 1000
                    ? `${(trade.collateral / 1000).toFixed(2)}K`
                    : trade.collateral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <TokenIcon symbol={getCollateralSymbol(trade.collateralIcon)} size="sm" showChain={false} />
                <TierIcon tier={trade.tierIcon} />
              </div>
            </div>
            <div className="w-[80px] shrink-0 flex justify-end">
              <button className="inline-flex items-center justify-center w-[44px] h-7 rounded-md border border-[#252527] transition-colors hover:border-[#3a3a3d] hover:bg-[rgba(255,255,255,0.03)]">
                <ArrowRightUpIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes detailSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-100%);
            max-height: 0;
          }
          50% {
            opacity: 0.5;
            max-height: 48px;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            max-height: 48px;
          }
        }
      `}</style>
    </div>
  );
}

// Utility functions
function parseTimeToSeconds(time: string): number {
  const hMatch = time.match(/(\d+)h/);
  const mMatch = time.match(/(\d+)m/);
  let secs = 0;
  if (hMatch) secs += parseInt(hMatch[1]) * 3600;
  if (mMatch) secs += parseInt(mMatch[1]) * 60;
  return secs || 60;
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return 'Just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  if (remainMins === 0) return `${hours}h ago`;
  return `${hours}h ${remainMins}m ago`;
}
