import { useState, useMemo, useCallback } from 'react';
import type { DashboardOpenOrder, DashboardOrdersTab, OrderBookEntry } from '../types';
import Pagination from './Pagination';
import TokenIconComponent from './TokenIcon';
import CloseOrderModal from './CloseOrderModal';

function SortIcon({ active, direction }: { active: boolean; direction: 'asc' | 'desc' | null }) {
  return (
    <span className="ml-1 inline-flex flex-col gap-[1px]">
      <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
        <path d="M3 0L6 4H0L3 0Z" fill={active && direction === 'asc' ? '#f9f9fa' : '#3a3a3d'} />
      </svg>
      <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
        <path d="M3 4L0 0H6L3 4Z" fill={active && direction === 'desc' ? '#f9f9fa' : '#3a3a3d'} />
      </svg>
    </span>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4.5 6.5L8 10L11.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`transition-transform ${collapsed ? '-rotate-90' : ''}`}
    >
      <path d="M4.5 6.5L8 10L11.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProgressBar({ value }: { value: number }) {
  const hasProgress = value > 0;
  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`text-[10px] leading-3 tabular-nums ${hasProgress ? 'text-[#f9f9fa]' : 'text-[#7a7a83]'}`}>
        {value.toFixed(1)}%
      </span>
      <div className="h-1 w-12 rounded-full bg-[#1b1b1c]">
        <div
          className="h-1 rounded-full bg-[#16c284] transition-all"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function formatPrice(price: number): string {
  if (price < 0.01) return price.toFixed(4);
  if (price < 0.1) return price.toFixed(3);
  return price.toFixed(2);
}

/** Build an OrderBookEntry from a DashboardOpenOrder for the CloseOrderModal */
function toOrderBookEntry(o: DashboardOpenOrder): OrderBookEntry {
  return {
    id: o.id,
    price: o.price,
    amount: o.totalAmount,
    amountFormatted: o.amount,
    collateral: o.collateralAmount,
    collateralIcon: '',
    collateralToken: o.collateralToken as OrderBookEntry['collateralToken'],
    fillPercent: o.progress,
    filledAmount: o.filledAmount,
    totalAmount: o.totalAmount,
    isResell: o.isResell,
    originalPrice: o.originalPrice,
  };
}

interface DashboardOpenOrdersProps {
  openOrders: DashboardOpenOrder[];
  filledOrders: DashboardOpenOrder[];
  onCloseOrder?: (orderId: string) => void;
}

const ITEMS_PER_PAGE = 10;

export default function DashboardOpenOrders({ openOrders, filledOrders, onCloseOrder }: DashboardOpenOrdersProps) {
  const [activeTab, setActiveTab] = useState<DashboardOrdersTab>('open');
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const [sideFilter, setSideFilter] = useState<string>('all');
  const [showSideDropdown, setShowSideDropdown] = useState(false);

  // Close modal state
  const [closeModalOrder, setCloseModalOrder] = useState<DashboardOpenOrder | null>(null);

  const activeOrders = activeTab === 'open' ? openOrders : filledOrders;

  const filteredOrders = useMemo(() => {
    let orders = activeOrders;
    if (searchTerm) {
      orders = orders.filter(o => o.pair.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (sideFilter !== 'all') {
      orders = orders.filter(o => o.side === sideFilter);
    }
    if (sortField && sortDir) {
      orders = [...orders].sort((a, b) => {
        const aVal = a[sortField as keyof DashboardOpenOrder] as number;
        const bVal = b[sortField as keyof DashboardOpenOrder] as number;
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    return orders;
  }, [activeOrders, searchTerm, sideFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortField(null); setSortDir(null); }
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleTabChange = (tab: DashboardOrdersTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const sideColor = (side: string) => {
    if (side === 'Buy') return 'text-[#5bd197]';
    if (side === 'Sell') return 'text-[#fd5e67]';
    return 'text-[#facc15]';
  };

  const handleCloseConfirm = useCallback(() => {
    if (closeModalOrder) {
      onCloseOrder?.(closeModalOrder.id);
    }
    setCloseModalOrder(null);
  }, [closeModalOrder, onCloseOrder]);

  /** Determine icon symbol for deposited column */
  const getDepositedSymbol = (order: DashboardOpenOrder) => order.collateralToken;

  /** Determine icon symbol for "to be received" column */
  const getReceivedSymbol = (order: DashboardOpenOrder) => {
    if (order.side === 'Sell') return order.collateralToken; // sell → receive collateral back
    return order.tokenSymbol; // buy/resell → receive tokens
  };

  return (
    <div>
      {/* Header: Tabs + Filters */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          {/* Collapse toggle — circular bg, leftmost */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex size-9 items-center justify-center rounded-full bg-[#1b1b1c] text-[#7a7a83] transition-colors hover:bg-[#252527] hover:text-[#f9f9fa]"
          >
            <CollapseIcon collapsed={collapsed} />
          </button>

          {/* Tabs — match homepage LiveMarketTable style */}
          <button
            onClick={() => handleTabChange('open')}
            className={`inline-flex items-center gap-2 text-xl font-medium leading-7 transition-colors ${
              activeTab === 'open' ? 'text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'
            }`}
          >
            Open Orders
            <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium leading-4 ${
              activeTab === 'open'
                ? 'bg-[rgba(22,194,132,0.15)] text-[#5bd197]'
                : 'bg-[#252527] text-[#7a7a83]'
            }`}>
              {openOrders.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('filled')}
            className={`inline-flex items-center gap-2 text-xl font-medium leading-7 transition-colors ${
              activeTab === 'filled' ? 'text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'
            }`}
          >
            Filled Orders
            <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium leading-4 ${
              activeTab === 'filled'
                ? 'bg-[rgba(22,194,132,0.15)] text-[#5bd197]'
                : 'bg-[#252527] text-[#7a7a83]'
            }`}>
              {filledOrders.length}
            </span>
          </button>
        </div>

        {/* Right: Filters + Collapse */}
        <div className="flex items-center gap-3">
          {/* Side dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSideDropdown(!showSideDropdown)}
              className="flex h-9 items-center gap-1 rounded-lg bg-[#1b1b1c] px-3 text-sm font-medium text-[#f9f9fa] transition-colors hover:bg-[#252527]"
            >
              Side
              <ChevronDownIcon />
            </button>
            {showSideDropdown && (
              <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-[#252527] bg-[#0a0a0b] py-1 shadow-lg">
                {['all', 'Buy', 'Sell', 'Resell'].map((side) => (
                  <button
                    key={side}
                    onClick={() => { setSideFilter(side); setShowSideDropdown(false); setCurrentPage(1); }}
                    className={`w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-[#1b1b1c] ${
                      sideFilter === side ? 'text-[#5bd197]' : 'text-[#f9f9fa]'
                    }`}
                  >
                    {side === 'all' ? 'All' : side}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-[#252527]" />

          {/* Search — match homepage SearchInput style */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7a83]" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="h-9 w-[200px] rounded-lg border border-[#1f1f23] bg-transparent pl-9 pr-3 text-sm text-[#f9f9fa] placeholder-[#7a7a83] outline-none transition-colors focus:border-[#2e2e34]"
            />
          </div>

        </div>
      </div>

      {/* Table */}
      {!collapsed && (
        <>
          {/* Table Header */}
          <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2">
            <div className="w-[14%] min-w-[160px]">
              <span className="text-xs font-medium text-[#7a7a83]">Pair</span>
            </div>
            <div className="w-[12%] min-w-[130px]">
              <button onClick={() => handleSort('createdTime')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                Created Time <SortIcon active={sortField === 'createdTime'} direction={sortField === 'createdTime' ? sortDir : null} />
              </button>
            </div>
            <div className="w-[8%] min-w-[80px]">
              <span className="text-xs font-medium text-[#7a7a83]">Side</span>
            </div>
            <div className="w-[10%] min-w-[100px] text-right">
              <button onClick={() => handleSort('price')} className="group relative inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                <span className="border-b border-dashed border-[#2e2e34]">Price ($)</span> <SortIcon active={sortField === 'price'} direction={sortField === 'price' ? sortDir : null} />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-[150]">
                  The price per token in USD for this order.
                </span>
              </button>
            </div>
            <div className="w-[10%] min-w-[100px] text-right">
              <button onClick={() => handleSort('amount')} className="group relative inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                <span className="border-b border-dashed border-[#2e2e34]">Amount</span> <SortIcon active={sortField === 'amount'} direction={sortField === 'amount' ? sortDir : null} />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-[150]">
                  The total number of tokens in this order.
                </span>
              </button>
            </div>
            <div className="w-[10%] min-w-[100px] text-right">
              <button onClick={() => handleSort('deposited')} className="group relative inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                <span className="border-b border-dashed border-[#2e2e34]">Deposited</span> <SortIcon active={sortField === 'deposited'} direction={sortField === 'deposited' ? sortDir : null} />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-[150]">
                  The collateral you have deposited for this order.
                </span>
              </button>
            </div>
            <div className="w-[12%] min-w-[120px] text-right">
              <button onClick={() => handleSort('toBeReceived')} className="group relative inline-flex items-center text-xs font-medium text-[#16c284] hover:text-[#5bd197]">
                <span className="border-b border-dashed border-[#2e2e34]">To be Received</span> <SortIcon active={sortField === 'toBeReceived'} direction={sortField === 'toBeReceived' ? sortDir : null} />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-[150]">
                  The tokens or collateral you will receive when the order is settled.
                </span>
              </button>
            </div>
            <div className="w-[10%] min-w-[100px] text-right">
              <button onClick={() => handleSort('progress')} className="group relative inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                <span className="border-b border-dashed border-[#2e2e34]">Progress</span> <SortIcon active={sortField === 'progress'} direction={sortField === 'progress' ? sortDir : null} />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-[150]">
                  The percentage of this order that has been filled.
                </span>
              </button>
            </div>
            <div className="flex-1 text-right pr-1">
              <span className="text-xs font-medium text-[#7a7a83]">Action</span>
            </div>
          </div>

          {/* Table Rows */}
          {paginatedOrders.map((order) => {
            const isResell = order.side === 'Resell';
            return (
              <div
                key={order.id}
                className="flex items-center border-b border-[#1b1b1c] h-[60px] px-2 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              >
                {/* Pair */}
                <div className="w-[14%] min-w-[160px] flex items-center gap-2">
                  <TokenIconComponent symbol={order.tokenSymbol} size="xs" showChain={false} />
                  <span className="text-sm text-[#f9f9fa]">{order.pair}</span>
                  {order.hasBadge === 'FULL' && (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-[#1b1b1c] text-[#7a7a83]">
                      FULL
                    </span>
                  )}
                  {order.hasBadge === 'RS' && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#eab308] px-1.5 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#0a0a0b]">
                      RS
                    </span>
                  )}
                </div>

                {/* Created Time */}
                <div className="w-[12%] min-w-[130px]">
                  <span className="text-sm text-[#7a7a83]">{order.createdTime}</span>
                </div>

                {/* Side */}
                <div className="w-[8%] min-w-[80px]">
                  <span className={`text-sm font-medium ${sideColor(order.side)}`}>
                    {order.side}
                  </span>
                </div>

                {/* Price */}
                <div className="w-[10%] min-w-[100px] text-right">
                  <span className={`text-sm tabular-nums ${isResell ? 'text-[#16c284]' : 'text-[#f9f9fa]'}`}>
                    {formatPrice(order.price)}
                  </span>
                </div>

                {/* Amount */}
                <div className="w-[10%] min-w-[100px] text-right">
                  <span className="text-sm text-[#f9f9fa] tabular-nums">{order.amount}</span>
                </div>

                {/* Deposited — collateral token icon */}
                <div className="w-[10%] min-w-[100px] flex items-center justify-end gap-2">
                  <span className="text-sm text-[#f9f9fa] tabular-nums">{order.deposited}</span>
                  <TokenIconComponent symbol={getDepositedSymbol(order)} size="xs" showChain={false} />
                </div>

                {/* To be Received — token or collateral icon based on side */}
                <div className="w-[12%] min-w-[120px] flex items-center justify-end gap-2">
                  <span className="text-sm tabular-nums text-[#f9f9fa]">
                    {order.toBeReceived}
                  </span>
                  <TokenIconComponent symbol={getReceivedSymbol(order)} size="xs" showChain={false} />
                </div>

                {/* Progress */}
                <div className="w-[10%] min-w-[100px] flex justify-end">
                  <ProgressBar value={order.progress} />
                </div>

                {/* Action — Close button opens modal */}
                <div className="flex-1 flex justify-end pr-1">
                  <button
                    onClick={() => setCloseModalOrder(order)}
                    className="rounded-md bg-[#1b1b1c] px-3 py-1.5 text-xs font-medium text-[#f9f9fa] transition-colors hover:bg-[#252527]"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Close Order Modal */}
      {closeModalOrder && (
        <CloseOrderModal
          isOpen={!!closeModalOrder}
          order={toOrderBookEntry(closeModalOrder)}
          side={closeModalOrder.side === 'Sell' ? 'sell' : 'buy'}
          tokenSymbol={closeModalOrder.tokenSymbol}
          chain={closeModalOrder.chain}
          onClose={() => setCloseModalOrder(null)}
          onConfirm={handleCloseConfirm}
        />
      )}
    </div>
  );
}
