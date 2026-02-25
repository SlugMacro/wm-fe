import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { OrderBookEntry, OrderBookTab } from '../types';
import TokenIcon from './TokenIcon';

/* ═══════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════ */

const VISIBLE_ROWS = 15;
const ROW_HEIGHT = 42;
const SCROLLBAR_WIDTH = 4;
const MIN_ROWS = 5;

const USD_RATES: Record<string, number> = {
  SOL: 180, ETH: 2800, SUI: 3, USDC: 1, USDT: 1,
};

/* ═══════════════════════════════════════════════════════════════════════
   Filter Types & Options
   ═══════════════════════════════════════════════════════════════════════ */

type SizeRange = 'all' | 'lt5k' | '5k-10k' | '10k-50k' | '50k-100k' | 'gt100k';
type DropdownType = 'size' | 'minFill' | 'collateral';

const SIZE_OPTIONS: { id: SizeRange; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'lt5k', label: '<$5K' },
  { id: '5k-10k', label: '$5K → $10K' },
  { id: '10k-50k', label: '$10K → $50K' },
  { id: '50k-100k', label: '$50K → $100K' },
  { id: 'gt100k', label: '> $100K' },
];

const MIN_FILL_OPTIONS: { value: number; label: string }[] = [
  { value: 10, label: '≥ $10' },
  { value: 50, label: '≥ $50' },
  { value: 100, label: '≥ $100' },
  { value: 500, label: '≥ $500' },
  { value: 1000, label: '≥ $1,000' },
];

/* ═══════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════ */

function getOrderValueUSD(order: OrderBookEntry): number {
  return order.collateral * (USD_RATES[order.collateralToken] || 1);
}

function matchesSizeFilter(order: OrderBookEntry, sizes: Set<SizeRange>): boolean {
  if (sizes.has('all') || sizes.size === 0) return true;
  const v = getOrderValueUSD(order);
  return (
    (sizes.has('lt5k') && v < 5000) ||
    (sizes.has('5k-10k') && v >= 5000 && v < 10000) ||
    (sizes.has('10k-50k') && v >= 10000 && v < 50000) ||
    (sizes.has('50k-100k') && v >= 50000 && v < 100000) ||
    (sizes.has('gt100k') && v >= 100000)
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SVG Icons
   ═══════════════════════════════════════════════════════════════════════ */

function ChevronDownIcon({ isOpen }: { isOpen?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
      <path d="M4.5 6.5L8 10L11.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartLineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 12L6 7.5L9 10L13.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 4H13.5V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MyOrderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="3" stroke="#eab308" strokeWidth="1.2" />
      <circle cx="7" cy="5.5" r="2" stroke="#eab308" strokeWidth="1" />
      <path d="M3.5 11.5C3.5 9.8 5 8.5 7 8.5C9 8.5 10.5 9.8 10.5 11.5" stroke="#eab308" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function InfoLineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="#7a7a83" strokeWidth="1.2" />
      <path d="M8 7.5V11M8 5V5.5" stroke="#7a7a83" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckMarkSvg() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GreenCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5L6.5 12L13 4" stroke="#16c284" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
      <circle cx="10" cy="10" r="8" fill="#252527" />
      <path d="M7.5 7.5L12.5 12.5M12.5 7.5L7.5 12.5" stroke="#7a7a83" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AllTokenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#252527" stroke="#44444b" strokeWidth="1" />
      <circle cx="5.5" cy="6.5" r="1.5" fill="#7a7a83" />
      <circle cx="10.5" cy="6.5" r="1.5" fill="#7a7a83" />
      <circle cx="8" cy="11" r="1.5" fill="#7a7a83" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   OrderTooltip
   ═══════════════════════════════════════════════════════════════════════ */

function OrderTooltip({ order, tokenSymbol }: { order: OrderBookEntry; tokenSymbol: string }) {
  const filledFormatted = Math.round(order.filledAmount).toLocaleString('en-US');
  const remainingAmount = order.totalAmount - order.filledAmount;
  const remainingFormatted = Math.round(remainingAmount).toLocaleString('en-US');

  return (
    <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 animate-[fadeIn_0.15s_ease-out]">
      <div className="whitespace-nowrap rounded-lg border border-[#252527] bg-[#131314] px-3 py-2 shadow-lg">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs text-[#7a7a83]">Filled ({tokenSymbol})</span>
            <span className="text-xs font-medium text-[#f9f9fa] tabular-nums">{filledFormatted}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs text-[#7a7a83]">Remaining ({tokenSymbol})</span>
            <span className="text-xs font-medium text-[#f9f9fa] tabular-nums">{remainingFormatted}</span>
          </div>
        </div>
      </div>
      <div className="absolute left-1/2 top-full -translate-x-1/2">
        <div className="h-0 w-0 border-x-[5px] border-t-[5px] border-x-transparent border-t-[#252527]" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   useColumnScroll Hook
   ═══════════════════════════════════════════════════════════════════════ */

function useColumnScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ y: 0, scrollTop: 0 });

  const maxHeight = VISIBLE_ROWS * ROW_HEIGHT;

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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateThumb();
    el.addEventListener('scroll', onScroll, { passive: true });
    updateThumb();
    return () => el.removeEventListener('scroll', onScroll);
  }, [updateThumb]);

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

  return {
    scrollRef,
    isHovering,
    setIsHovering,
    isDragging,
    thumbTop,
    thumbHeight,
    maxHeight,
    showScrollbar,
    handleThumbMouseDown,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   Main OrderBook Component
   ═══════════════════════════════════════════════════════════════════════ */

interface OrderBookProps {
  buyOrders: OrderBookEntry[];
  sellOrders: OrderBookEntry[];
  onSelectOrder: (order: OrderBookEntry, side: 'buy' | 'sell') => void;
  selectedOrderId?: string | null;
  tokenSymbol: string;
  flashedOrderId?: string | null;
  showChart: boolean;
  onToggleChart: () => void;
}

export default function OrderBook({
  buyOrders,
  sellOrders,
  onSelectOrder,
  selectedOrderId,
  tokenSymbol,
  flashedOrderId,
  showChart,
  onToggleChart,
}: OrderBookProps) {
  const [activeTab, setActiveTab] = useState<OrderBookTab>('regular');
  const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null);

  // Filter state
  const [sizeFilters, setSizeFilters] = useState<Set<SizeRange>>(new Set(['all']));
  const [minFillFilter, setMinFillFilter] = useState<number | null>(null);
  const [collateralFilter, setCollateralFilter] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<DropdownType | null>(null);

  // Dropdown refs
  const sizeRef = useRef<HTMLDivElement>(null);
  const minFillRef = useRef<HTMLDivElement>(null);
  const collateralRef = useRef<HTMLDivElement>(null);

  const buyScroll = useColumnScroll();
  const sellScroll = useColumnScroll();

  // Close dropdown when tab changes
  useEffect(() => {
    setOpenDropdown(null);
  }, [activeTab]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const refs: Record<DropdownType, React.RefObject<HTMLDivElement | null>> = {
        size: sizeRef, minFill: minFillRef, collateral: collateralRef,
      };
      const activeRef = refs[openDropdown];
      if (activeRef?.current && !activeRef.current.contains(target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdown]);

  // ─── Available collateral tokens ─────────────────────────────────
  const availableCollaterals = useMemo(() => {
    const tokens = new Set<string>();
    buyOrders.forEach(o => tokens.add(o.collateralToken));
    sellOrders.forEach(o => tokens.add(o.collateralToken));
    return Array.from(tokens);
  }, [buyOrders, sellOrders]);

  // ─── Filtered orders ─────────────────────────────────────────────
  const filteredBuyOrders = useMemo(() => {
    let orders = buyOrders;

    // Tab-based filtering
    if (activeTab === 'regular') {
      orders = orders.filter(o => !o.isResell);
    } else if (activeTab === 'resell') {
      orders = orders.filter(o => o.isResell);
    }

    // Size & min fill (not for resell tab)
    if (activeTab !== 'resell') {
      if (!sizeFilters.has('all') && sizeFilters.size > 0) {
        orders = orders.filter(o => matchesSizeFilter(o, sizeFilters));
      }
      if (minFillFilter !== null) {
        orders = orders.filter(o => getOrderValueUSD(o) >= minFillFilter);
      }
    }

    // Collateral (all tabs)
    if (collateralFilter) {
      orders = orders.filter(o => o.collateralToken === collateralFilter);
    }

    return orders;
  }, [buyOrders, activeTab, sizeFilters, minFillFilter, collateralFilter]);

  const filteredSellOrders = useMemo(() => {
    if (activeTab === 'resell') return [];

    let orders = sellOrders;

    if (!sizeFilters.has('all') && sizeFilters.size > 0) {
      orders = orders.filter(o => matchesSizeFilter(o, sizeFilters));
    }
    if (minFillFilter !== null) {
      orders = orders.filter(o => getOrderValueUSD(o) >= minFillFilter);
    }
    if (collateralFilter) {
      orders = orders.filter(o => o.collateralToken === collateralFilter);
    }

    return orders;
  }, [sellOrders, activeTab, sizeFilters, minFillFilter, collateralFilter]);

  // ─── Has active filters ──────────────────────────────────────────
  const hasActiveFilters = useMemo(() => {
    const hasSizeFilter = activeTab !== 'resell' && !sizeFilters.has('all') && sizeFilters.size > 0;
    const hasMinFill = activeTab !== 'resell' && minFillFilter !== null;
    const hasCollateral = collateralFilter !== null;
    return hasSizeFilter || hasMinFill || hasCollateral;
  }, [activeTab, sizeFilters, minFillFilter, collateralFilter]);

  // ─── Filter handlers ─────────────────────────────────────────────
  const handleSizeToggle = (id: SizeRange) => {
    setSizeFilters(prev => {
      if (id === 'all') return new Set<SizeRange>(['all']);
      const next = new Set(prev);
      next.delete('all');
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) return new Set<SizeRange>(['all']);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMinFillSelect = (value: number) => {
    setMinFillFilter(prev => prev === value ? null : value);
  };

  const handleCollateralSelect = (token: string | null) => {
    setCollateralFilter(prev => prev === token ? null : token);
    setOpenDropdown(null);
  };

  const handleClearAll = () => {
    setSizeFilters(new Set<SizeRange>(['all']));
    setMinFillFilter(null);
    setCollateralFilter(null);
  };

  const handleToggleDropdown = (type: DropdownType) => {
    setOpenDropdown(prev => prev === type ? null : type);
  };

  // ─── Tab definitions ─────────────────────────────────────────────
  const tabs: { key: OrderBookTab; label: string; hasInfo?: boolean }[] = [
    { key: 'regular', label: 'Regular' },
    { key: 'resell', label: 'Resell', hasInfo: true },
    { key: 'all', label: 'All' },
  ];

  // ─── Render a single order row ───────────────────────────────────
  const renderRow = (order: OrderBookEntry, side: 'buy' | 'sell', showResellBadge: boolean, fullWidth?: boolean) => {
    const isSelected = selectedOrderId === order.id;
    const isHovered = hoveredOrderId === order.id;
    const isFlashed = flashedOrderId === order.id;
    const isResell = !!order.isResell;
    // Resell orders fill entirely in one go — no partial fill, no fadeout
    const isFadingOut = !isResell && order.fillPercent >= 100 && order.fillType !== 'FULL';
    const isBuy = side === 'buy';

    return (
      <div
        key={order.id}
        className={`relative flex items-center cursor-pointer transition-all duration-500 rounded-md px-2 ${
          isFadingOut ? 'h-0 mt-0 opacity-0 overflow-hidden' : 'h-10 mt-0.5'
        } ${
          isFlashed
            ? isBuy ? 'bg-[rgba(22,194,132,0.18)]' : 'bg-[rgba(255,59,70,0.18)]'
            : isSelected
              ? 'bg-[#1e1e1f]'
              : 'bg-[#121213] hover:bg-[#161617]'
        }`}
        onClick={() => onSelectOrder(order, side)}
        onMouseEnter={() => setHoveredOrderId(order.id)}
        onMouseLeave={() => setHoveredOrderId(null)}
      >
        {/* Fill bar — resell orders have no partial fill */}
        {!isResell && order.fillType !== 'FULL' && (
          <div
            className={`absolute inset-y-0 left-0 rounded-sm pointer-events-none transition-[width] duration-500 ease-out ${
              isBuy ? 'bg-[rgba(22,194,132,0.06)]' : 'bg-[rgba(255,59,70,0.06)]'
            }`}
            style={{ width: `${order.fillPercent}%` }}
          />
        )}
        {/* Content */}
        <div className="relative flex items-center w-full z-[1]">
          <div className="flex-1 flex items-center gap-1">
            <span className={`text-sm font-normal tabular-nums ${
              isResell ? 'text-[#eab308]' : 'text-[#f9f9fa]'
            }`}>
              {order.price.toFixed(4)}
            </span>
            {order.isOwner && <MyOrderIcon />}
          </div>
          <div className={`${fullWidth ? 'w-40' : 'w-28'} text-right`}>
            <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">{order.amountFormatted}</span>
          </div>
          <div className={`${fullWidth ? 'w-40' : 'w-28'} text-right flex items-center justify-end gap-2`}>
            <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">
              {order.collateral < 1 ? order.collateral.toFixed(2) : order.collateral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <TokenIcon symbol={order.collateralToken} size="xs" showChain={false} />
          </div>
          <div className="w-24 flex items-center justify-end gap-1">
            {/* FULL badge — only for non-resell (resell is inherently full) */}
            {!isResell && order.fillType === 'FULL' && (
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                isSelected ? 'bg-[#2a2a2c] text-[#9a9a9f]' : 'bg-[#1b1b1c] text-[#7a7a83]'
              }`}>Full</span>
            )}
            {showResellBadge && isResell && (
              <span className="inline-flex items-center justify-center rounded-full bg-[#eab308] px-1.5 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#0a0a0b]">RS</span>
            )}
            <button className={`relative rounded px-3 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? isResell
                  ? 'bg-[#eab308] hover:bg-[#d4a207]'
                  : isBuy
                    ? 'bg-[#16c284] hover:bg-[#14b077]'
                    : 'bg-[#fd5e67] hover:bg-[#e5545c]'
                : isResell
                  ? 'text-[#eab308] bg-[rgba(234,179,8,0.1)] hover:bg-[rgba(234,179,8,0.2)]'
                  : isBuy
                    ? 'text-[#5bd197] bg-[rgba(22,194,132,0.1)] hover:bg-[rgba(22,194,132,0.2)]'
                    : 'text-[#fd5e67] bg-[rgba(255,59,70,0.1)] hover:bg-[rgba(255,59,70,0.2)]'
            }`}>
              <span className={isSelected ? 'invisible' : ''}>
                {isResell ? 'Buy' : isBuy ? 'Buy' : 'Sell'}
              </span>
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="absolute inset-0 m-auto">
                  <path d="M4.5 2.5L8.5 6L4.5 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Tooltip — resell orders have no partial fill to show */}
        {!isResell && isHovered && order.fillPercent > 0 && order.fillType !== 'FULL' && (
          <OrderTooltip order={order} tokenSymbol={tokenSymbol} />
        )}
      </div>
    );
  };

  // ─── Render scrollable column ────────────────────────────────────
  const renderColumn = (
    orders: OrderBookEntry[],
    side: 'buy' | 'sell',
    scroll: ReturnType<typeof useColumnScroll>,
    showResellBadge: boolean,
    fullWidth?: boolean,
  ) => (
    <div>
      {/* Header */}
      <div className="flex items-center border-b border-[#1b1b1c] h-8 px-2">
        <div className="flex-1">
          <span className="text-xs font-medium text-[#7a7a83]">Price ($)</span>
        </div>
        <div className={`${fullWidth ? 'w-40' : 'w-28'} text-right`}>
          <span className="text-xs font-medium text-[#7a7a83]">Amount</span>
        </div>
        <div className={`${fullWidth ? 'w-40' : 'w-28'} text-right`}>
          <span className="text-xs font-medium text-[#7a7a83]">Collateral</span>
        </div>
        <div className="w-24" />
      </div>

      {/* Scrollable rows */}
      <div
        className="relative"
        style={{ minHeight: `${MIN_ROWS * ROW_HEIGHT}px` }}
        onMouseEnter={() => scroll.setIsHovering(true)}
        onMouseLeave={() => { if (!scroll.isDragging) scroll.setIsHovering(false); }}
      >
        {orders.length === 0 ? (
          <div
            className="flex items-center justify-center text-sm text-[#7a7a83]"
            style={{ minHeight: `${MIN_ROWS * ROW_HEIGHT}px` }}
          >
            No results found
          </div>
        ) : (
          <>
            <div
              ref={scroll.scrollRef}
              className="ob-scroll"
              style={{ maxHeight: `${scroll.maxHeight}px`, overflowY: 'auto' }}
            >
              {orders.map(order => renderRow(order, side, showResellBadge, fullWidth))}
            </div>

            {/* Custom scrollbar */}
            <div
              className="absolute top-0 right-0 w-[4px] transition-opacity duration-200 pointer-events-none"
              style={{ height: `${scroll.maxHeight}px`, opacity: scroll.showScrollbar ? 1 : 0 }}
            >
              <div
                className="absolute right-0 rounded-full pointer-events-auto cursor-pointer"
                style={{
                  width: `${SCROLLBAR_WIDTH}px`,
                  height: `${Math.max(scroll.thumbHeight, 24)}px`,
                  top: `${scroll.thumbTop}px`,
                  background: scroll.isDragging ? '#3a3a3d' : '#252527',
                  transition: scroll.isDragging ? 'none' : 'background 0.15s',
                }}
                onMouseDown={scroll.handleThumbMouseDown}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════
     JSX
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <div>
      {/* ─── Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-2">
        {/* Left: Type tabs */}
        <div className="flex items-center rounded-lg border border-[#252527] h-9">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.key;
            return (
              <div key={tab.key} className="flex items-center h-full">
                {idx > 0 && <div className="self-stretch w-px bg-[#252527]" />}
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center h-full text-sm font-medium leading-5 transition-colors ${
                    tab.hasInfo ? 'gap-1.5 pl-4 pr-2' : 'px-4'
                  } ${
                    isActive
                      ? 'text-[#16c284] bg-[rgba(22,194,132,0.08)]'
                      : 'text-[#f9f9fa] hover:text-[#b4b4ba]'
                  }`}
                >
                  {tab.label}
                  {tab.hasInfo && (
                    <span className="relative group p-0.5">
                      <InfoLineIcon />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-[150]">
                        <div className="rounded-lg border border-[#252527] bg-[#131314] px-3 py-2 text-left text-xs text-[#b4b4ba] font-normal leading-relaxed shadow-lg">
                          Resell orders are pre-market buy positions being resold by original buyers. Each order must be filled entirely — partial fills are not supported.
                        </div>
                        <div className="absolute left-1/2 top-full -translate-x-1/2">
                          <div className="h-0 w-0 border-x-[5px] border-t-[5px] border-x-transparent border-t-[#252527]" />
                        </div>
                      </div>
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Right: Filter dropdowns + chart toggle */}
        <div className="flex items-center gap-2">
          {/* Size dropdown — hidden in resell tab */}
          {activeTab !== 'resell' && (
            <div className="relative" ref={sizeRef}>
              <button
                onClick={() => handleToggleDropdown('size')}
                className={`relative flex items-center gap-1 rounded-lg px-3 h-9 text-sm font-medium transition-colors ${
                  openDropdown === 'size' ? 'bg-[#252527] text-[#f9f9fa]' : 'bg-[#1b1b1c] text-[#f9f9fa] hover:bg-[#252527]'
                }`}
              >
                Size
                <ChevronDownIcon isOpen={openDropdown === 'size'} />
                {!sizeFilters.has('all') && sizeFilters.size > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#16c284]" />
                )}
              </button>

              {openDropdown === 'size' && (
                <div className="absolute top-full right-0 mt-1 z-50 min-w-[200px] rounded-[10px] bg-[#1b1b1c] shadow-[0_0_32px_rgba(0,0,0,0.2)] overflow-hidden">
                  <div className="flex flex-col gap-1 p-2">
                    <div className="px-2 pb-0.5">
                      <span className="text-xs text-[#7a7a83]" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                        Select Order Size
                      </span>
                    </div>
                    {SIZE_OPTIONS.map(opt => {
                      const isChecked = sizeFilters.has(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSizeToggle(opt.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#252527]"
                        >
                          <div className="flex items-center p-0.5 shrink-0">
                            {isChecked ? (
                              <div className="flex size-4 items-center justify-center rounded bg-[#16c284]">
                                <CheckMarkSvg />
                              </div>
                            ) : (
                              <div className="size-4 rounded border-2 border-[#44444b] bg-[#252527]" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-[#f9f9fa]" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Min.Fill dropdown — hidden in resell tab */}
          {activeTab !== 'resell' && (
            <div className="relative" ref={minFillRef}>
              <button
                onClick={() => handleToggleDropdown('minFill')}
                className={`relative flex items-center gap-1 rounded-lg px-3 h-9 text-sm font-medium transition-colors ${
                  openDropdown === 'minFill' ? 'bg-[#252527] text-[#f9f9fa]' : 'bg-[#1b1b1c] text-[#f9f9fa] hover:bg-[#252527]'
                }`}
              >
                Min.Fill
                <ChevronDownIcon isOpen={openDropdown === 'minFill'} />
                {minFillFilter !== null && (
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#16c284]" />
                )}
              </button>

              {openDropdown === 'minFill' && (
                <div className="absolute top-full right-0 mt-1 z-50 min-w-[200px] rounded-[10px] bg-[#1b1b1c] shadow-[0_0_32px_rgba(0,0,0,0.2)] overflow-hidden">
                  <div className="flex flex-col gap-1 p-2">
                    <div className="px-2 pb-0.5">
                      <span className="text-xs text-[#7a7a83]" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                        Select Minimum Fill
                      </span>
                    </div>
                    {MIN_FILL_OPTIONS.map(opt => {
                      const isActive = minFillFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleMinFillSelect(opt.value)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#252527]"
                        >
                          <div className="flex items-center p-0.5 shrink-0">
                            {isActive ? (
                              <div className="flex size-4 items-center justify-center rounded-full bg-[#16c284]">
                                <div className="size-1.5 rounded-full bg-white" />
                              </div>
                            ) : (
                              <div className="size-4 rounded-full border-2 border-[#2e2e34] bg-[#1b1b1c]" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-[#f9f9fa]" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collateral dropdown — always visible */}
          <div className="relative" ref={collateralRef}>
            <button
              onClick={() => handleToggleDropdown('collateral')}
              className={`relative flex items-center gap-1 rounded-lg px-3 h-9 text-sm font-medium transition-colors ${
                openDropdown === 'collateral' ? 'bg-[#252527] text-[#f9f9fa]' : 'bg-[#1b1b1c] text-[#f9f9fa] hover:bg-[#252527]'
              }`}
            >
              Collateral
              <ChevronDownIcon isOpen={openDropdown === 'collateral'} />
              {collateralFilter !== null && (
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#16c284]" />
              )}
            </button>

            {openDropdown === 'collateral' && (
              <div className="absolute top-full right-0 mt-1 z-50 min-w-[180px] rounded-[10px] bg-[#1b1b1c] shadow-[0_0_32px_rgba(0,0,0,0.2)] overflow-hidden">
                <div className="flex flex-col gap-1 p-2">
                  <div className="px-2 pb-0.5">
                    <span className="text-xs text-[#7a7a83]" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                      Select Token
                    </span>
                  </div>
                  {/* All option */}
                  <button
                    onClick={() => handleCollateralSelect(null)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                      collateralFilter === null ? 'bg-[#252527]' : 'hover:bg-[#252527]'
                    }`}
                  >
                    <div className="flex items-center p-0.5 shrink-0">
                      <AllTokenIcon />
                    </div>
                    <span className="flex-1 text-sm font-medium text-[#f9f9fa]" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>All</span>
                    {collateralFilter === null && <GreenCheckIcon />}
                  </button>
                  {/* Token options */}
                  {availableCollaterals.map(token => (
                    <button
                      key={token}
                      onClick={() => handleCollateralSelect(token)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                        collateralFilter === token ? 'bg-[#252527]' : 'hover:bg-[#252527]'
                      }`}
                    >
                      <div className="flex items-center p-0.5 shrink-0">
                        <TokenIcon symbol={token} size="xs" showChain={false} />
                      </div>
                      <span className="flex-1 text-sm font-medium text-[#f9f9fa]" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>{token}</span>
                      {collateralFilter === token && <GreenCheckIcon />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-[#252527]" />

          {/* Chart toggle */}
          <button
            onClick={onToggleChart}
            className={`flex items-center justify-center rounded-lg bg-[#1b1b1c] h-9 w-9 transition-colors hover:bg-[#252527] ${
              showChart ? 'text-[#16c284]' : 'text-[#f9f9fa]'
            }`}
          >
            <ChartLineIcon />
          </button>
        </div>
      </div>

      {/* ─── Filter Chips ───────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex items-center gap-4 border-b border-[#1b1b1c] pb-2">
          <div className="flex flex-1 items-center gap-4 flex-wrap">
            {/* Size chips */}
            {activeTab !== 'resell' && !sizeFilters.has('all') && sizeFilters.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7a7a83]" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                  Order Size
                </span>
                {Array.from(sizeFilters).map(s => {
                  const opt = SIZE_OPTIONS.find(o => o.id === s);
                  if (!opt) return null;
                  return (
                    <button
                      key={s}
                      onClick={() => handleSizeToggle(s)}
                      className="flex items-center gap-1 rounded-full bg-[#1b1b1c] px-2 py-1 transition-colors hover:bg-[#252527]"
                    >
                      <span className="text-[10px] font-medium text-[#b4b4ba] uppercase" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                        {opt.label}
                      </span>
                      <CloseCircleIcon />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Min fill chip */}
            {activeTab !== 'resell' && minFillFilter !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7a7a83]" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                  Minimum Fill Value
                </span>
                <button
                  onClick={() => setMinFillFilter(null)}
                  className="flex items-center gap-1 rounded-full bg-[#1b1b1c] px-2 py-1 transition-colors hover:bg-[#252527]"
                >
                  <span className="text-[10px] font-medium text-[#b4b4ba] uppercase" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                    {MIN_FILL_OPTIONS.find(o => o.value === minFillFilter)?.label ?? `≥ $${minFillFilter}`}
                  </span>
                  <CloseCircleIcon />
                </button>
              </div>
            )}

            {/* Collateral chip */}
            {collateralFilter && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7a7a83]" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                  Collateral
                </span>
                <button
                  onClick={() => setCollateralFilter(null)}
                  className="flex items-center gap-1 rounded-full bg-[#1b1b1c] px-2 py-1 transition-colors hover:bg-[#252527]"
                >
                  <span className="text-[10px] font-medium text-[#b4b4ba] uppercase" style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}>
                    {collateralFilter}
                  </span>
                  <CloseCircleIcon />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleClearAll}
            className="shrink-0 text-xs text-[#f9f9fa] hover:text-[#b4b4ba] transition-colors"
            style={{ fontFeatureSettings: "'lnum' 1, 'tnum' 1" }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* ─── Order Columns ──────────────────────────────────────────── */}
      {activeTab === 'resell' ? (
        /* Resell: single full-width column for resell buy orders */
        renderColumn(filteredBuyOrders, 'buy', buyScroll, true, true)
      ) : (
        /* Regular / All: two columns */
        <div className="flex gap-4">
          <div className="flex-1">
            {renderColumn(filteredBuyOrders, 'buy', buyScroll, activeTab === 'all')}
          </div>
          <div className="flex-1">
            {renderColumn(filteredSellOrders, 'sell', sellScroll, false)}
          </div>
        </div>
      )}

      {/* Hide native scrollbar */}
      <style>{`
        .ob-scroll {
          scrollbar-width: none;
        }
        .ob-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
