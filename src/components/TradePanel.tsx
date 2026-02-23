import { useState } from 'react';
import type { OrderBookEntry } from '../types';
import mascotSvg from '../assets/images/mascot.svg';

interface TradePanelProps {
  tokenSymbol: string;
  selectedOrder: { order: OrderBookEntry; side: 'buy' | 'sell' } | null;
}

function InfoRow({ label, value, dashed = true }: { label: string; value: string; dashed?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm font-normal text-[#7a7a83] ${dashed ? 'border-b border-dashed border-[#2e2e34]' : ''}`}>
        {label}
      </span>
      <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{value}</span>
    </div>
  );
}

export default function TradePanel({ tokenSymbol, selectedOrder }: TradePanelProps) {
  const [amount, setAmount] = useState('');
  const hasOrder = selectedOrder !== null;

  return (
    <div className="border-b border-[#1b1b1c] pb-6">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-[#f9f9fa]">Trade {tokenSymbol}</h3>
        <span className="text-xs font-normal text-[#7a7a83]">
          Price {hasOrder ? `$${selectedOrder.order.price.toFixed(4)}` : '-'}
        </span>
      </div>

      {/* Empty state or order details */}
      {!hasOrder ? (
        <div className="flex flex-col items-center justify-center rounded-[10px] border border-[#1b1b1c] px-8 py-8 mb-4">
          <img src={mascotSvg} alt="" className="size-24 mb-4 opacity-60" />
          <p className="text-xs text-[#7a7a83] text-center">No order selected yet.</p>
          <p className="text-xs text-[#7a7a83] text-center">Pick one from the list to start trading.</p>
        </div>
      ) : (
        <div className="mb-4">
          <div className="rounded-[10px] border border-[#1b1b1c] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#7a7a83]">Price</span>
              <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">${selectedOrder.order.price.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#7a7a83]">Available Amount</span>
              <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{selectedOrder.order.amountFormatted}</span>
            </div>
            <div>
              <label className="text-xs text-[#7a7a83] mb-1 block">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-lg border border-[#252527] bg-[#1b1b1c] px-3 py-2 text-sm text-[#f9f9fa] placeholder-[#3a3a3d] outline-none focus:border-[#5bd197] transition-colors tabular-nums"
              />
            </div>
          </div>
        </div>
      )}

      {/* Trade button */}
      <button
        className={`w-full rounded-[10px] py-2.5 px-5 text-base font-medium transition-colors ${
          hasOrder
            ? 'bg-[#f9f9fa] text-[#0a0a0b] hover:opacity-90'
            : 'bg-[#f9f9fa] text-[#0a0a0b] opacity-40 cursor-not-allowed'
        }`}
        disabled={!hasOrder}
      >
        Trade STAKE
      </button>

      {/* Info rows */}
      <div className="mt-4 flex flex-col gap-2">
        <InfoRow label="Price" value={hasOrder ? `$${selectedOrder.order.price.toFixed(4)}` : '-'} />
        <InfoRow label="Amount Deliver" value="-" />
        <InfoRow label="To be Received" value="-" />
      </div>
    </div>
  );
}
