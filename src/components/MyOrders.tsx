import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MyOrder, MyOrdersTab } from '../types';

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function OrderItem({ order }: { order: MyOrder }) {
  return (
    <div className="border-b border-[#1b1b1c] py-3 px-2">
      {/* Row 1: Side + Pair + Badge | Date */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${order.side === 'Buy' ? 'text-[#5bd197]' : 'text-[#fd5e67]'}`}>
            {order.side}
          </span>
          <span className="text-sm font-medium text-[#f9f9fa]">{order.pair}</span>
          {order.hasBadge && (
            <span className="inline-flex items-center justify-center rounded-full bg-[#eab308] px-2 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#0a0a0b]">
              {order.hasBadge}
            </span>
          )}
        </div>
        <span className="text-xs font-normal text-[#7a7a83] tabular-nums">{order.date}</span>
      </div>

      {/* Row 2: Price info */}
      <div className="mb-1">
        {order.entryPrice && order.originalPrice ? (
          <span className="text-xs text-[#7a7a83]">
            Your Entry / Original Price{' '}
            <span className="text-[#facc15] font-medium tabular-nums">${order.entryPrice.toFixed(4)}</span>
            {' / '}
            <span className="text-[#f9f9fa] tabular-nums">${order.originalPrice.toFixed(4)}</span>
          </span>
        ) : (
          <span className="text-xs text-[#7a7a83]">
            Price <span className="text-[#f9f9fa] tabular-nums">${order.price.toFixed(4)}</span>
          </span>
        )}
      </div>

      {/* Row 3: Amount / Collateral + Resell button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#7a7a83]">
          Amount / Collateral <span className="text-[#f9f9fa] tabular-nums">{order.amount} / {order.collateral}</span>
        </span>
        {order.canResell && (
          <button className="rounded-lg bg-[rgba(234,179,8,0.1)] px-3 py-1.5 text-xs font-medium text-[#facc15] transition-colors hover:bg-[rgba(234,179,8,0.2)]">
            Resell
          </button>
        )}
      </div>
    </div>
  );
}

interface MyOrdersProps {
  filledOrders: MyOrder[];
  openOrders: MyOrder[];
}

export default function MyOrders({ filledOrders, openOrders }: MyOrdersProps) {
  const [activeTab, setActiveTab] = useState<MyOrdersTab>('filled');

  const tabs: { key: MyOrdersTab; label: string; count: number }[] = [
    { key: 'filled', label: 'My Filled Orders', count: filledOrders.length },
    { key: 'open', label: 'My Open Orders', count: openOrders.length },
  ];

  const orders = activeTab === 'filled' ? filledOrders : openOrders;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-[#1b1b1c]">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                isActive ? 'text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-3 ${
                  isActive
                    ? 'bg-[rgba(22,194,132,0.1)] text-[#5bd197]'
                    : 'bg-[#1b1b1c] text-[#b4b4ba]'
                }`}
              >
                {tab.count}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#5bd197]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div className="max-h-[500px] overflow-y-auto">
        {orders.map(order => (
          <OrderItem key={order.id} order={order} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-4 px-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-[10px] bg-[#1b1b1c] px-4 py-3 transition-colors hover:bg-[#252527]"
        >
          <span className="text-[#5bd197]">
            <DashboardIcon />
          </span>
          <span className="flex-1 text-xs font-normal text-[#5bd197]">
            Visit Dashboard to monitor all Pre-Market orders
          </span>
          <span className="text-[#5bd197]">
            <ChevronRightIcon />
          </span>
        </Link>
      </div>
    </div>
  );
}
