import { useState, useMemo } from 'react';
import type { DashboardOpenOrder, DashboardOrdersTab } from '../types';
import Pagination from './Pagination';

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

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4.5 6.5L8 10L11.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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

function TokenIcon({ color, label }: { color: string; label: string }) {
  return (
    <div
      className="flex size-5 items-center justify-center rounded-full"
      style={{ backgroundColor: color }}
    >
      <span className="text-[7px] font-bold text-white">{label}</span>
    </div>
  );
}

function AssetIcon({ type }: { type: 'sol' | 'usdc' | 'token' }) {
  if (type === 'sol') {
    return (
      <div className="flex size-3.5 items-center justify-center rounded-full bg-[#9945ff]">
        <span className="text-[6px] font-bold text-white">◎</span>
      </div>
    );
  }
  if (type === 'usdc') {
    return (
      <div className="flex size-3.5 items-center justify-center rounded-full bg-[#2775ca]">
        <span className="text-[6px] font-bold text-white">U</span>
      </div>
    );
  }
  return (
    <div className="flex size-3.5 items-center justify-center rounded-full bg-[#16c284]">
      <span className="text-[6px] font-bold text-white">T</span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const hasProgress = value > 0;
  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`text-xs tabular-nums ${hasProgress ? 'text-[#f9f9fa]' : 'text-[#7a7a83]'}`}>
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

interface DashboardOpenOrdersProps {
  openOrders: DashboardOpenOrder[];
  filledOrders: DashboardOpenOrder[];
}

const ITEMS_PER_PAGE = 6;

export default function DashboardOpenOrders({ openOrders, filledOrders }: DashboardOpenOrdersProps) {
  const [activeTab, setActiveTab] = useState<DashboardOrdersTab>('open');
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const [sideFilter, setSideFilter] = useState<string>('all');
  const [showSideDropdown, setShowSideDropdown] = useState(false);

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

  return (
    <div>
      {/* Header: Collapse + Tabs + Filters */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
          >
            <CollapseIcon collapsed={collapsed} />
          </button>

          {/* Tabs */}
          <button
            onClick={() => handleTabChange('open')}
            className={`text-lg font-medium transition-colors ${
              activeTab === 'open' ? 'text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'
            }`}
          >
            Open Orders
            <span className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              activeTab === 'open'
                ? 'bg-[rgba(22,194,132,0.2)] text-[#5bd197]'
                : 'bg-[#1b1b1c] text-[#7a7a83]'
            }`}>
              {openOrders.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('filled')}
            className={`text-lg font-medium transition-colors ${
              activeTab === 'filled' ? 'text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'
            }`}
          >
            Filled Orders
            <span className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              activeTab === 'filled'
                ? 'bg-[rgba(22,194,132,0.2)] text-[#5bd197]'
                : 'bg-[#1b1b1c] text-[#7a7a83]'
            }`}>
              {filledOrders.length}
            </span>
          </button>
        </div>

        {/* Right: Filters */}
        <div className="flex items-center gap-2">
          {/* Side dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSideDropdown(!showSideDropdown)}
              className="flex items-center gap-1 rounded-lg bg-[#1b1b1c] px-3 py-1.5 text-sm font-medium text-[#f9f9fa] transition-colors hover:bg-[#252527]"
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

          {/* Search */}
          <div className="flex items-center gap-2 rounded-lg bg-[#1b1b1c] px-3 py-1.5">
            <span className="text-[#7a7a83]"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-40 bg-transparent text-sm text-[#f9f9fa] placeholder-[#7a7a83] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {!collapsed && (
        <>
          {/* Table Header */}
          <div className="flex items-center border-b border-[#1b1b1c] h-9">
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
              <button onClick={() => handleSort('price')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                <span className="border-b border-dashed border-[#2e2e34]">Price ($)</span> <SortIcon active={sortField === 'price'} direction={sortField === 'price' ? sortDir : null} />
              </button>
            </div>
            <div className="w-[10%] min-w-[100px] text-right">
              <button onClick={() => handleSort('amount')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                <span className="border-b border-dashed border-[#2e2e34]">Amount</span> <SortIcon active={sortField === 'amount'} direction={sortField === 'amount' ? sortDir : null} />
              </button>
            </div>
            <div className="w-[10%] min-w-[100px] text-right">
              <button onClick={() => handleSort('deposited')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                <span className="border-b border-dashed border-[#2e2e34]">Deposited</span> <SortIcon active={sortField === 'deposited'} direction={sortField === 'deposited' ? sortDir : null} />
              </button>
            </div>
            <div className="w-[12%] min-w-[120px] text-right">
              <button onClick={() => handleSort('toBeReceived')} className="inline-flex items-center text-xs font-medium text-[#16c284] hover:text-[#5bd197]">
                <span className="border-b border-dashed border-[#16c284]">To be Received</span> <SortIcon active={sortField === 'toBeReceived'} direction={sortField === 'toBeReceived' ? sortDir : null} />
              </button>
            </div>
            <div className="w-[10%] min-w-[100px] text-right">
              <button onClick={() => handleSort('progress')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                <span className="border-b border-dashed border-[#2e2e34]">Progress</span> <SortIcon active={sortField === 'progress'} direction={sortField === 'progress' ? sortDir : null} />
              </button>
            </div>
            <div className="w-[7%] min-w-[70px] text-right">
              <span className="text-xs font-medium text-[#7a7a83]">Action</span>
            </div>
          </div>

          {/* Table Rows */}
          {paginatedOrders.map((order) => {
            const isResell = order.side === 'Resell';
            return (
              <div
                key={order.id}
                className="flex items-center border-b border-[#1b1b1c] h-[52px] transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              >
                {/* Pair */}
                <div className="w-[14%] min-w-[160px] flex items-center gap-2">
                  <TokenIcon color={order.tokenColor} label={order.pair.charAt(0)} />
                  <span className="text-sm text-[#f9f9fa]">{order.pair}</span>
                  {order.hasBadge === 'FULL' && (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-[#1b1b1c] text-[#7a7a83]">
                      FULL
                    </span>
                  )}
                  {order.hasBadge === 'RS' && (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-[rgba(234,179,8,0.15)] text-[#facc15]">
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

                {/* Deposited */}
                <div className="w-[10%] min-w-[100px] flex items-center justify-end gap-1">
                  <span className="text-sm text-[#f9f9fa] tabular-nums">{order.deposited}</span>
                  <AssetIcon type={order.depositedType} />
                </div>

                {/* To be Received */}
                <div className="w-[12%] min-w-[120px] flex items-center justify-end gap-1">
                  <span className={`text-sm tabular-nums ${isResell ? 'text-[#16c284]' : 'text-[#f9f9fa]'}`}>
                    {order.toBeReceived}
                  </span>
                  <AssetIcon type={order.toBeReceivedType} />
                </div>

                {/* Progress */}
                <div className="w-[10%] min-w-[100px] flex justify-end">
                  <ProgressBar value={order.progress} />
                </div>

                {/* Action */}
                <div className="w-[7%] min-w-[70px] flex justify-end">
                  <button className="rounded border border-[#252527] px-3 py-1 text-xs font-medium text-[#7a7a83] transition-colors hover:border-[#3a3a3d] hover:text-[#f9f9fa]">
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
    </div>
  );
}
