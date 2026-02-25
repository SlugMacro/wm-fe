import { useState, useMemo } from 'react';
import type { DashboardEndedOrder } from '../types';
import Pagination from './Pagination';
import TokenIconComponent from './TokenIcon';

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

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusBadge({ status }: { status: DashboardEndedOrder['status'] }) {
  const styles: Record<string, string> = {
    settled: 'bg-[rgba(22,194,132,0.1)] text-[#5bd197]',
    claimed: 'bg-[#1b1b1c] text-[#7a7a83]',
    closed: 'bg-[#1b1b1c] text-[#7a7a83]',
    resold: 'bg-[rgba(234,179,8,0.1)] text-[#facc15]',
    exited: 'bg-[rgba(234,179,8,0.1)] text-[#facc15]',
  };

  const labels: Record<string, string> = {
    settled: 'SETTLED',
    claimed: 'CLAIMED',
    closed: 'CLOSED',
    resold: 'RESOLD',
    exited: 'EXITED',
  };

  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium uppercase ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatPrice(price: number): string {
  if (price < 0.01) return price.toFixed(4);
  if (price < 0.1) return price.toFixed(3);
  return price.toFixed(2);
}

interface DashboardEndedOrdersProps {
  orders: DashboardEndedOrder[];
}

const ITEMS_PER_PAGE = 8;

export default function DashboardEndedOrders({ orders }: DashboardEndedOrdersProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const [sideFilter, setSideFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSideDropdown, setShowSideDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (searchTerm) {
      result = result.filter(o => o.pair.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (sideFilter !== 'all') {
      result = result.filter(o => o.side === sideFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }
    if (sortField && sortDir) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortField as keyof DashboardEndedOrder] as number;
        const bVal = b[sortField as keyof DashboardEndedOrder] as number;
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    return result;
  }, [orders, searchTerm, sideFilter, statusFilter, sortField, sortDir]);

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

  const sideColor = (side: string) => {
    if (side === 'Buy') return 'text-[#5bd197]';
    if (side === 'Sell') return 'text-[#fd5e67]';
    return 'text-[#facc15]';
  };

  /** Deposited icon = collateral token (SOL/USDC/USDT) */
  const getDepositedSymbol = (order: DashboardEndedOrder) => order.collateralToken;

  /** Received icon: sell → collateral back, buy/resell → token */
  const getReceivedSymbol = (order: DashboardEndedOrder) => {
    if (order.side === 'Sell') return order.collateralToken;
    return order.tokenSymbol;
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

          <span className="inline-flex items-center gap-2 text-xl font-medium leading-7 text-[#f9f9fa]">
            Ended Settlement
            <span className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium leading-4 bg-[rgba(22,194,132,0.15)] text-[#5bd197]">
              {orders.length}
            </span>
          </span>
        </div>

        {/* Right: Filters */}
        <div className="flex items-center gap-3">
          {/* Side dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowSideDropdown(!showSideDropdown); setShowStatusDropdown(false); }}
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

          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowSideDropdown(false); }}
              className="flex items-center gap-1 rounded-lg bg-[#1b1b1c] px-3 py-1.5 text-sm font-medium text-[#f9f9fa] transition-colors hover:bg-[#252527]"
            >
              Status
              <ChevronDownIcon />
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-[#252527] bg-[#0a0a0b] py-1 shadow-lg">
                {['all', 'settled', 'claimed', 'closed', 'resold', 'exited'].map((status) => (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setShowStatusDropdown(false); setCurrentPage(1); }}
                    className={`w-full px-3 py-1.5 text-left text-sm capitalize transition-colors hover:bg-[#1b1b1c] ${
                      statusFilter === status ? 'text-[#5bd197]' : 'text-[#f9f9fa]'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                ))}
              </div>
            )}
          </div>

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
              <button onClick={() => handleSort('time')} className="inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                Time <SortIcon active={sortField === 'time'} direction={sortField === 'time' ? sortDir : null} />
              </button>
            </div>
            <div className="w-[8%] min-w-[80px]">
              <span className="text-xs font-medium text-[#7a7a83]">Side</span>
            </div>
            <div className="w-[10%] min-w-[100px] text-right">
              <button onClick={() => handleSort('price')} className="group relative inline-flex items-center text-xs font-medium text-[#7a7a83] hover:text-[#f9f9fa]">
                <span className="border-b border-dashed border-[#2e2e34]">Price ($)</span> <SortIcon active={sortField === 'price'} direction={sortField === 'price' ? sortDir : null} />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-[150]">
                  The price per token in USD at the time of settlement.
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
                  The collateral that was deposited for this order.
                </span>
              </button>
            </div>
            <div className="w-[12%] min-w-[120px] text-right">
              <button onClick={() => handleSort('received')} className="group relative inline-flex items-center text-xs font-medium text-[#16c284] hover:text-[#5bd197]">
                <span className="border-b border-dashed border-[#2e2e34]">Received</span> <SortIcon active={sortField === 'received'} direction={sortField === 'received' ? sortDir : null} />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-[150]">
                  The tokens or collateral received after settlement.
                </span>
              </button>
            </div>
            <div className="w-[10%] min-w-[100px] text-right">
              <span className="text-xs font-medium text-[#7a7a83]" />
            </div>
            <div className="flex-1 text-right pr-1">
              <span className="text-xs font-medium text-[#7a7a83]">Tx.ID</span>
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
                {/* Pair — 16x16 token icon, no chain */}
                <div className="w-[14%] min-w-[160px] flex items-center gap-2">
                  <TokenIconComponent symbol={order.tokenSymbol} size="xs" showChain={false} />
                  <span className="text-sm text-[#f9f9fa]">{order.pair}</span>
                  {order.hasBadge === 'RS' && (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#eab308] px-1.5 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#0a0a0b]">
                      RS
                    </span>
                  )}
                </div>

                {/* Time */}
                <div className="w-[12%] min-w-[130px]">
                  <span className="text-sm text-[#7a7a83]">{order.time}</span>
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

                {/* Deposited — collateral token icon, 16x16, gap-2 */}
                <div className="w-[10%] min-w-[100px] flex items-center justify-end gap-2">
                  <span className="text-sm text-[#f9f9fa] tabular-nums">{order.deposited}</span>
                  <TokenIconComponent symbol={getDepositedSymbol(order)} size="xs" showChain={false} />
                </div>

                {/* Received — token or collateral icon, 16x16, gap-2 */}
                <div className="w-[12%] min-w-[120px] flex items-center justify-end gap-2">
                  <span className={`text-sm tabular-nums ${isResell ? 'text-[#16c284]' : 'text-[#f9f9fa]'}`}>
                    {order.received}
                  </span>
                  <TokenIconComponent symbol={getReceivedSymbol(order)} size="xs" showChain={false} />
                </div>

                {/* Status */}
                <div className="w-[10%] min-w-[100px] flex justify-end">
                  <StatusBadge status={order.status} />
                </div>

                {/* Tx.ID — icon-only square button */}
                <div className="flex-1 flex justify-end pr-1">
                  <button className="flex size-7 items-center justify-center rounded border border-[#252527] text-[#7a7a83] transition-colors hover:border-[#3a3a3d] hover:text-[#f9f9fa]">
                    <ExternalLinkIcon />
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
            showGoToPage
          />
        </>
      )}
    </div>
  );
}
