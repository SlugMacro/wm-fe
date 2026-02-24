import { useState } from 'react';
import type { OrderBookEntry, OrderBookTab } from '../types';
import TokenIcon from './TokenIcon';

function SortIcon({ active, direction }: { active: boolean; direction: 'asc' | 'desc' | null }) {
  return (
    <span className="ml-0.5 inline-flex flex-col gap-[1px]">
      <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
        <path d="M3 0L6 4H0L3 0Z" fill={active && direction === 'asc' ? '#f9f9fa' : '#3a3a3d'} />
      </svg>
      <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
        <path d="M3 4L0 0H6L3 4Z" fill={active && direction === 'desc' ? '#f9f9fa' : '#3a3a3d'} />
      </svg>
    </span>
  );
}

function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" opacity="0.6">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
      <path d="M6 5.5V8.5M6 3.5V4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4.5 6.5L8 10L11.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12V8L5.5 5L8.5 7.5L14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 14H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1" />
      <path d="M2 10.5C2 8.5 3.8 7 6 7C8.2 7 10 8.5 10 10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/** Tooltip for order row showing filled/remaining amounts */
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
      {/* Tooltip arrow */}
      <div className="absolute left-1/2 top-full -translate-x-1/2">
        <div className="h-0 w-0 border-x-[5px] border-t-[5px] border-x-transparent border-t-[#252527]" />
      </div>
    </div>
  );
}

interface OrderBookProps {
  buyOrders: OrderBookEntry[];
  sellOrders: OrderBookEntry[];
  onSelectOrder: (order: OrderBookEntry, side: 'buy' | 'sell') => void;
  selectedOrderId?: string | null;
  tokenSymbol: string;
}

export default function OrderBook({ buyOrders, sellOrders, onSelectOrder, selectedOrderId, tokenSymbol }: OrderBookProps) {
  const [activeTab, setActiveTab] = useState<OrderBookTab>('regular');
  const [buySortField, setBuySortField] = useState<string | null>(null);
  const [buySortDir, setBuySortDir] = useState<'asc' | 'desc' | null>(null);
  const [sellSortField, setSellSortField] = useState<string | null>(null);
  const [sellSortDir, setSellSortDir] = useState<'asc' | 'desc' | null>(null);
  const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null);

  const handleBuySort = (field: string) => {
    if (buySortField === field) {
      if (buySortDir === 'asc') setBuySortDir('desc');
      else if (buySortDir === 'desc') { setBuySortField(null); setBuySortDir(null); }
    } else {
      setBuySortField(field);
      setBuySortDir('asc');
    }
  };

  const handleSellSort = (field: string) => {
    if (sellSortField === field) {
      if (sellSortDir === 'asc') setSellSortDir('desc');
      else if (sellSortDir === 'desc') { setSellSortField(null); setSellSortDir(null); }
    } else {
      setSellSortField(field);
      setSellSortDir('asc');
    }
  };

  const tabs: { key: OrderBookTab; label: string; hasInfo?: boolean }[] = [
    { key: 'regular', label: 'Regular' },
    { key: 'resell', label: 'Resell', hasInfo: true },
    { key: 'all', label: 'All' },
  ];

  const filters = [
    { label: 'Size' },
    { label: 'Min.Fill' },
    { label: 'Collateral' },
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center justify-between py-2">
        {/* Left: Type tabs */}
        <div className="flex items-center rounded-lg border border-[#252527]">
          {tabs.map((tab) => (
            <span key={tab.key} className="flex items-center">
              {tab.key === 'all' && <div className="h-4 w-px bg-[#252527]" />}
              <button
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border border-[rgba(22,194,132,0.2)] bg-[rgba(22,194,132,0.1)] text-[#5bd197] rounded-lg -m-px'
                    : 'text-[#f9f9fa] hover:text-[#5bd197]'
                }`}
              >
                {tab.label}
                {tab.hasInfo && <InfoIcon />}
              </button>
            </span>
          ))}
        </div>

        {/* Right: Filter dropdowns */}
        <div className="flex items-center gap-2">
          {filters.map(f => (
            <button
              key={f.label}
              className="flex items-center gap-1 rounded-lg bg-[#1b1b1c] px-3 py-1.5 text-sm font-medium text-[#f9f9fa] transition-colors hover:bg-[#252527]"
            >
              {f.label}
              <ChevronDownIcon />
            </button>
          ))}

          <div className="h-4 w-px bg-[#252527]" />

          <button className="flex items-center justify-center rounded-lg bg-[#1b1b1c] p-2 text-[#f9f9fa] transition-colors hover:bg-[#252527]">
            <ChartIcon />
          </button>
        </div>
      </div>

      {/* Two-column order table */}
      <div className="flex gap-4">
        {/* Buy orders */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center border-b border-[#1b1b1c] h-8">
            <div className="flex-1">
              <button onClick={() => handleBuySort('price')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                Price ($) <SortIcon active={buySortField === 'price'} direction={buySortField === 'price' ? buySortDir : null} />
              </button>
            </div>
            <div className="w-24 text-right">
              <button onClick={() => handleBuySort('amount')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                Amount <SortIcon active={buySortField === 'amount'} direction={buySortField === 'amount' ? buySortDir : null} />
              </button>
            </div>
            <div className="w-24 text-right">
              <button onClick={() => handleBuySort('collateral')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                Collateral <SortIcon active={buySortField === 'collateral'} direction={buySortField === 'collateral' ? buySortDir : null} />
              </button>
            </div>
            <div className="w-16" />
          </div>

          {/* Rows */}
          {buyOrders.map(order => {
            const isSelected = selectedOrderId === order.id;
            const isHovered = hoveredOrderId === order.id;
            return (
              <div
                key={order.id}
                className={`relative flex items-center h-10 cursor-pointer transition-colors rounded-sm ${
                  isSelected
                    ? 'bg-[rgba(22,194,132,0.08)] border border-[rgba(22,194,132,0.2)] -mx-px'
                    : 'hover:bg-[rgba(22,194,132,0.05)]'
                }`}
                onClick={() => onSelectOrder(order, 'buy')}
                onMouseEnter={() => setHoveredOrderId(order.id)}
                onMouseLeave={() => setHoveredOrderId(null)}
              >
                {/* Fill percentage background bar */}
                {order.fillPercent > 0 && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-sm bg-[rgba(22,194,132,0.12)] pointer-events-none"
                    style={{ width: `${order.fillPercent}%` }}
                  />
                )}
                {/* Content */}
                <div className="relative flex items-center w-full z-[1]">
                  <div className="flex-1 flex items-center gap-1">
                    <span className={`text-sm font-normal tabular-nums ${isSelected ? 'text-[#5bd197]' : 'text-[#f9f9fa]'}`}>
                      {order.price.toFixed(4)}
                    </span>
                    {order.isOwner && <span className="text-[#7a7a83]"><UserIcon /></span>}
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">{order.amountFormatted}</span>
                  </div>
                  <div className="w-24 text-right flex items-center justify-end gap-1">
                    <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">
                      {order.collateral < 1 ? order.collateral.toFixed(2) : order.collateral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <TokenIcon symbol={order.collateralToken} size="sm" showChain={false} />
                  </div>
                  <div className="w-16 flex items-center justify-end gap-1">
                    {order.fillType && (
                      <span className="text-[10px] font-medium text-[#7a7a83] uppercase">{order.fillType}</span>
                    )}
                    <button className="rounded px-3 py-1 text-xs font-medium text-[#5bd197] bg-[rgba(22,194,132,0.1)] transition-colors hover:bg-[rgba(22,194,132,0.2)]">
                      Buy
                    </button>
                  </div>
                </div>
                {/* Tooltip */}
                {isHovered && order.fillPercent > 0 && (
                  <OrderTooltip order={order} tokenSymbol={tokenSymbol} />
                )}
              </div>
            );
          })}
        </div>

        {/* Sell orders */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center border-b border-[#1b1b1c] h-8">
            <div className="flex-1">
              <button onClick={() => handleSellSort('price')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                Price ($) <SortIcon active={sellSortField === 'price'} direction={sellSortField === 'price' ? sellSortDir : null} />
              </button>
            </div>
            <div className="w-24 text-right">
              <button onClick={() => handleSellSort('amount')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                Amount <SortIcon active={sellSortField === 'amount'} direction={sellSortField === 'amount' ? sellSortDir : null} />
              </button>
            </div>
            <div className="w-24 text-right">
              <button onClick={() => handleSellSort('collateral')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                Collateral <SortIcon active={sellSortField === 'collateral'} direction={sellSortField === 'collateral' ? sellSortDir : null} />
              </button>
            </div>
            <div className="w-16" />
          </div>

          {/* Rows */}
          {sellOrders.map(order => {
            const isSelected = selectedOrderId === order.id;
            const isHovered = hoveredOrderId === order.id;
            return (
              <div
                key={order.id}
                className={`relative flex items-center h-10 cursor-pointer transition-colors rounded-sm ${
                  isSelected
                    ? 'bg-[rgba(255,59,70,0.08)] border border-[rgba(255,59,70,0.2)] -mx-px'
                    : 'hover:bg-[rgba(255,59,70,0.05)]'
                }`}
                onClick={() => onSelectOrder(order, 'sell')}
                onMouseEnter={() => setHoveredOrderId(order.id)}
                onMouseLeave={() => setHoveredOrderId(null)}
              >
                {/* Fill percentage background bar — from right for sell */}
                {order.fillPercent > 0 && (
                  <div
                    className="absolute inset-y-0 right-0 rounded-sm bg-[rgba(255,59,70,0.12)] pointer-events-none"
                    style={{ width: `${order.fillPercent}%` }}
                  />
                )}
                {/* Content */}
                <div className="relative flex items-center w-full z-[1]">
                  <div className="flex-1 flex items-center gap-1">
                    <span className={`text-sm font-normal tabular-nums ${isSelected ? 'text-[#fd5e67]' : 'text-[#f9f9fa]'}`}>
                      {order.price.toFixed(4)}
                    </span>
                    {order.isOwner && <span className="text-[#7a7a83]"><UserIcon /></span>}
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">{order.amountFormatted}</span>
                  </div>
                  <div className="w-24 text-right flex items-center justify-end gap-1">
                    <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">
                      {order.collateral < 1 ? order.collateral.toFixed(2) : order.collateral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <TokenIcon symbol={order.collateralToken} size="sm" showChain={false} />
                  </div>
                  <div className="w-16 flex items-center justify-end gap-1">
                    {order.fillType && (
                      <span className="text-[10px] font-medium text-[#7a7a83] uppercase">{order.fillType}</span>
                    )}
                    <button className="rounded px-3 py-1 text-xs font-medium text-[#fd5e67] bg-[rgba(255,59,70,0.1)] transition-colors hover:bg-[rgba(255,59,70,0.2)]">
                      Sell
                    </button>
                  </div>
                </div>
                {/* Tooltip */}
                {isHovered && order.fillPercent > 0 && (
                  <OrderTooltip order={order} tokenSymbol={tokenSymbol} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
