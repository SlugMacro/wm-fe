import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { generateDetailRecentTrades } from '../mock-data/tokenDetail';
import TokenIcon from './TokenIcon';
import TierIcon from './TierIcon';

function ArrowRightUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

// Generate sample trades dynamically based on token
function buildSampleTrades(tokenSymbol: string, nativeSymbol: string, nativeIcon: string): Omit<DetailTrade, 'id' | 'time'>[] {
  const sym = tokenSymbol.toUpperCase();
  return [
    { side: 'Buy', pair: `${sym}/USDC`, price: 0.0052, amount: '20.00K', collateral: 75.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'shrimp' },
    { side: 'Sell', pair: `${sym}/${nativeSymbol}`, price: 0.0048, amount: '45.00K', collateral: 2.16, collateralIcon: nativeIcon, tierIcon: 'fish' },
    { side: 'Buy', hasBadge: 'RS', pair: `${sym}/USDC`, price: 0.0051, amount: '2.50K', collateral: 302.5, collateralIcon: '/tokens/usdc.svg', tierIcon: 'dolphin' },
    { side: 'Sell', pair: `${sym}/${nativeSymbol}`, price: 0.005, amount: '7.04K', collateral: 1.92, collateralIcon: nativeIcon, tierIcon: 'fish' },
    { side: 'Buy', pair: `${sym}/USDC`, price: 0.0053, amount: '150.00K', collateral: 50000.0, collateralIcon: '/tokens/usdc.svg', tierIcon: 'whale' },
  ];
}

// Map chain to native token info
function getChainNative(chain: string): { symbol: string; icon: string } {
  switch (chain) {
    case 'ethereum': return { symbol: 'ETH', icon: '/tokens/eth.svg' };
    case 'sui': return { symbol: 'SUI', icon: '/tokens/sui.svg' };
    default: return { symbol: 'SOL', icon: '/tokens/sol.svg' };
  }
}

const VISIBLE_ROWS = 15; // rows visible without scrolling
const MAX_TRADES = 30; // total trades kept in state (rest scrollable)
const NEW_TRADE_INTERVAL = 45_000; // 45 seconds
const ROW_HEIGHT = 48;
const SCROLLBAR_WIDTH = 4;

interface DetailRecentTradesProps {
  tokenSymbol?: string;
  chain?: string;
  basePrice?: number;
  onTradeExecuted?: (side: 'Buy' | 'Sell') => void;
}

export default function DetailRecentTrades({ tokenSymbol = 'SKATE', chain = 'solana', basePrice = 0.055, onTradeExecuted }: DetailRecentTradesProps) {
  const native = getChainNative(chain);
  const sampleTrades = useMemo(() => buildSampleTrades(tokenSymbol, native.symbol, native.icon), [tokenSymbol, native.symbol, native.icon]);

  const now = Date.now();
  const initialTrades = useMemo(() => generateDetailRecentTrades(tokenSymbol, chain, basePrice), [tokenSymbol, chain, basePrice]);
  const [trades, setTrades] = useState<DetailTrade[]>(() =>
    initialTrades.map((t) => ({
      ...t,
      createdAt: now - parseTimeToSeconds(t.time) * 1000,
    }))
  );
  const nextIdRef = useRef(initialTrades.length + 1);
  const sampleIndexRef = useRef(0);

  // Scroll state for custom scrollbar
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ y: 0, scrollTop: 0 });

  const maxHeight = VISIBLE_ROWS * ROW_HEIGHT;

  // Sync custom thumb position with scroll
  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight) {
      setThumbHeight(0);
      return;
    }
    const ratio = clientHeight / scrollHeight;
    setThumbHeight(ratio * clientHeight);
    setThumbTop((scrollTop / scrollHeight) * clientHeight);
  }, []);

  // Add new trade periodically
  const addNewTrade = useCallback(() => {
    const sample = sampleTrades[sampleIndexRef.current % sampleTrades.length];
    sampleIndexRef.current += 1;

    const newTrade: DetailTrade = {
      ...sample,
      id: `dt-new-${nextIdRef.current}`,
      time: 'Just now',
      createdAt: Date.now(),
      isNew: true,
    };
    nextIdRef.current += 1;

    setTrades((prev) => [newTrade, ...prev.slice(0, MAX_TRADES - 1)]);

    // Notify parent to update order book fill
    onTradeExecuted?.(sample.side);

    // Remove isNew flag after animation
    setTimeout(() => {
      setTrades((prev) =>
        prev.map((t) => (t.id === newTrade.id ? { ...t, isNew: false } : t))
      );
    }, 600);
  }, [sampleTrades, onTradeExecuted]);

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

  // Listen to scroll events for thumb sync
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateThumb();
    el.addEventListener('scroll', onScroll, { passive: true });
    updateThumb();
    return () => el.removeEventListener('scroll', onScroll);
  }, [updateThumb, trades]);

  // Drag handlers for custom scrollbar thumb
  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => {
      const el = scrollRef.current;
      if (!el) return;
      const delta = e.clientY - dragStartRef.current.y;
      const scrollRatio = el.scrollHeight / el.clientHeight;
      el.scrollTop = dragStartRef.current.scrollTop + delta * scrollRatio;
    };
    const onMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    dragStartRef.current = { y: e.clientY, scrollTop: el.scrollTop };
    setIsDragging(true);
  };

  const showScrollbar = (isHovering || isDragging) && thumbHeight > 0;

  return (
    <div>
      {/* Header — no Show All button */}
      <div className="flex items-center h-[52px]">
        <h2 className="text-xl font-medium leading-7 text-[#f9f9fa]">Recent Trades</h2>
      </div>

      {/* Table header */}
      <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2">
        <div className="flex-1 min-w-0 flex items-center">
          <div className="w-[128px] shrink-0">
            <span className="text-xs font-normal text-[#7a7a83]">Time</span>
          </div>
          <span className="text-xs font-normal text-[#7a7a83]">Side</span>
        </div>
        <div className="w-[140px] shrink-0 text-left">
          <span className="text-xs font-normal text-[#7a7a83]">Pair</span>
        </div>
        <div className="w-[120px] shrink-0 text-right">
          <span className="text-xs font-normal text-[#7a7a83]">Price ($)</span>
        </div>
        <div className="w-[120px] shrink-0 text-right">
          <span className="text-xs font-normal text-[#7a7a83]">Amount</span>
        </div>
        <div className="w-[160px] shrink-0 text-right">
          <span className="text-xs font-normal text-[#7a7a83]">Collateral</span>
        </div>
        <div className="w-[112px] shrink-0 text-right">
          <span className="text-xs font-normal text-[#7a7a83]">Tx.ID</span>
        </div>
      </div>

      {/* Scroll area: native scrollbar hidden, custom 4px scrollbar overlays */}
      <div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { if (!isDragging) setIsHovering(false); }}
      >
        <div
          ref={scrollRef}
          className="detail-trades-scroll"
          style={{ maxHeight: `${maxHeight}px`, overflowY: 'auto' }}
        >
          {trades.map(trade => {
            const isRS = trade.hasBadge === 'RS';
            const priceColor = isRS ? 'text-[#eab308]' : 'text-[#f9f9fa]';

            return (
              <div
                key={trade.id}
                className={`flex items-center border-b border-[#1b1b1c] h-[48px] px-2 transition-all hover:bg-[rgba(255,255,255,0.02)] ${
                  trade.isNew ? 'bg-[rgba(91,209,151,0.05)]' : ''
                }`}
                style={trade.isNew ? { animation: 'detailSlideIn 0.4s ease-out' } : undefined}
              >
                {/* Time + Side */}
                <div className="flex-1 min-w-0 flex items-center">
                  <div className="w-[128px] shrink-0">
                    <span className={`text-sm font-normal ${trade.isNew ? 'text-[#5bd197]' : 'text-[#7a7a83]'}`}>
                      {trade.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${trade.side === 'Buy' ? 'text-[#5bd197]' : 'text-[#fd5e67]'}`}>
                      {trade.side}
                    </span>
                    {trade.hasBadge && (
                      <span className="inline-flex items-center justify-center rounded-full bg-[#eab308] px-1.5 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#0a0a0b]">
                        {trade.hasBadge}
                      </span>
                    )}
                  </div>
                </div>
                {/* Pair */}
                <div className="w-[140px] shrink-0 text-left">
                  <span className="text-sm font-medium text-[#f9f9fa]">{trade.pair}</span>
                </div>
                {/* Price — yellow for RS orders */}
                <div className="w-[120px] shrink-0 text-right">
                  <span className={`text-sm font-medium tabular-nums ${priceColor}`}>
                    {trade.price.toFixed(4)}
                  </span>
                </div>
                {/* Amount */}
                <div className="w-[120px] shrink-0 text-right">
                  <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{trade.amount}</span>
                </div>
                {/* Collateral */}
                <div className="w-[160px] shrink-0">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">
                      {trade.collateral >= 1000
                        ? `${(trade.collateral / 1000).toFixed(2)}K`
                        : trade.collateral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <TokenIcon symbol={getCollateralSymbol(trade.collateralIcon)} size="xs" showChain={false} />
                    <TierIcon tier={trade.tierIcon} />
                  </div>
                </div>
                {/* Tx.ID */}
                <div className="w-[112px] shrink-0 flex justify-end">
                  <button className="inline-flex items-center justify-center w-[44px] h-7 rounded-md border border-[#252527] transition-colors hover:border-[#3a3a3d] hover:bg-[rgba(255,255,255,0.03)]">
                    <ArrowRightUpIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom 4px scrollbar — absolutely positioned, overlays content */}
        <div
          className="absolute top-0 right-0 w-[4px] transition-opacity duration-200 pointer-events-none"
          style={{
            height: `${maxHeight}px`,
            opacity: showScrollbar ? 1 : 0,
          }}
        >
          <div
            className="absolute right-0 rounded-full pointer-events-auto cursor-pointer"
            style={{
              width: `${SCROLLBAR_WIDTH}px`,
              height: `${Math.max(thumbHeight, 24)}px`,
              top: `${thumbTop}px`,
              background: isDragging ? '#3a3a3d' : '#252527',
              transition: isDragging ? 'none' : 'background 0.15s',
            }}
            onMouseDown={handleThumbMouseDown}
          />
        </div>
      </div>

      {/* Hide native scrollbar + animation keyframes */}
      <style>{`
        .detail-trades-scroll {
          scrollbar-width: none;
        }
        .detail-trades-scroll::-webkit-scrollbar {
          display: none;
        }
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
