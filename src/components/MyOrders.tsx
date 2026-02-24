import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MyOrder, MyOrdersTab } from '../types';

function RightArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function OrderItem({ order }: { order: MyOrder }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#1b1b1c] pb-4">
      {/* Row 1: Side + Pair + Badge | Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-1">
          <span className={`text-sm font-medium leading-5 ${order.side === 'Buy' ? 'text-[#5bd197]' : 'text-[#fd5e67]'}`}>
            {order.side}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium leading-5 text-[#f9f9fa]">{order.pair}</span>
          </div>
          {order.hasBadge && (
            <span className="inline-flex items-center justify-center rounded-full bg-[#eab308] px-2 py-1 text-[10px] font-medium uppercase leading-3 text-[#0a0a0b]">
              {order.hasBadge}
            </span>
          )}
        </div>
        <span className="text-xs leading-4 font-normal text-[#7a7a83] tabular-nums">{order.date}</span>
      </div>

      {/* Row 2+3: Price and Amount info + Resell button */}
      <div className="flex items-end gap-2.5">
        <div className="flex flex-1 flex-col gap-1">
          {/* Price row */}
          <div className="flex items-center gap-1 text-xs leading-4">
            {order.entryPrice && order.originalPrice ? (
              <>
                <span className="text-[#7a7a83]">Your Entry / Original Price</span>
                <span className="text-[#facc15] tabular-nums">${order.entryPrice.toFixed(4)}</span>
                <span className="text-[#f9f9fa]">/</span>
                <span className="text-[#f9f9fa] tabular-nums">${order.originalPrice.toFixed(4)}</span>
              </>
            ) : (
              <>
                <span className="text-[#7a7a83]">Price</span>
                <span className="text-[#f9f9fa] tabular-nums">${order.price.toFixed(4)}</span>
              </>
            )}
          </div>

          {/* Amount / Collateral row */}
          <div className="flex items-center gap-1 text-xs leading-4">
            <span className="text-[#7a7a83]">Amount / Collateral</span>
            <span className="text-[#f9f9fa] tabular-nums">{order.amount}</span>
            <span className="text-[#f9f9fa]">/</span>
            <span className="text-[#f9f9fa] tabular-nums">{order.collateral.split(' ')[0]}</span>
            <span className="text-[#7a7a83]">{order.collateral.split(' ')[1]}</span>
          </div>
        </div>

        {order.canResell && (
          <button className="shrink-0 rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs font-medium leading-4 text-[rgba(255,255,255,0.9)] transition-colors hover:bg-[rgba(255,255,255,0.12)]">
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
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex h-[52px] items-center gap-6 border-b border-[#1b1b1c]">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex h-full flex-col items-center justify-between"
            >
              {/* Top spacer */}
              <div className="h-0.5 w-4" />
              {/* Label + count */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium leading-5 transition-colors ${isActive ? 'text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'}`}>
                  {tab.label}
                </span>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-[10px] font-medium leading-3 ${
                    isActive
                      ? 'bg-[rgba(22,194,132,0.1)] text-[#5bd197]'
                      : 'bg-[#1b1b1c] text-[#b4b4ba]'
                  }`}
                >
                  {tab.count}
                </span>
              </div>
              {/* Bottom indicator */}
              {isActive ? (
                <div className="h-0.5 w-full bg-[#5bd197]" />
              ) : (
                <div className="h-0.5 w-4" />
              )}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div className="flex flex-col gap-4">
        {orders.map(order => (
          <OrderItem key={order.id} order={order} />
        ))}
      </div>

      {/* Bottom CTA: Dashboard link */}
      <Link
        to="/dashboard"
        className="flex items-center justify-between rounded-[10px] bg-[#1b1b1c] px-4 py-3 transition-colors hover:bg-[#252527]"
      >
        <div className="flex flex-1 items-center gap-2">
          <span className="text-[#5bd197]">
            <DashboardIcon />
          </span>
          <span className="flex-1 text-xs leading-4 font-normal text-[#5bd197]">
            Visit Dashboard to monitor all Pre-Market orders
          </span>
        </div>
        <span className="text-[#5bd197]">
          <RightArrowIcon />
        </span>
      </Link>
    </div>
  );
}
