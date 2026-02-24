import { useState, useEffect, useCallback } from 'react';
import type { OrderBookEntry } from '../types';
import TokenIcon from './TokenIcon';
import mascotSvg from '../assets/images/mascot.svg';

interface TradePanelProps {
  tokenSymbol: string;
  selectedOrder: { order: OrderBookEntry; side: 'buy' | 'sell' } | null;
  collateralToken?: string;
  walletBalance?: number;
}

const infoRowTooltips: Record<string, string> = {
  'Price': 'The unit price per token for this order.',
  'Amount Deliver': 'The amount of tokens or collateral you will deposit to fulfill this trade.',
  'To be Received': 'The amount of tokens or collateral you will receive after the trade is completed.',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  const tooltip = infoRowTooltips[label];
  return (
    <div className="flex items-center justify-between">
      {tooltip ? (
        <span className="relative group cursor-help inline-flex">
          <span className="text-sm leading-5 font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34]">
            {label}
          </span>
          <span className="absolute left-0 bottom-full mb-2 w-56 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-50">
            {tooltip}
          </span>
        </span>
      ) : (
        <span className="text-sm leading-5 font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34]">
          {label}
        </span>
      )}
      <span className="text-sm leading-5 font-medium text-[#f9f9fa] tabular-nums">{value}</span>
    </div>
  );
}

function InfoCircleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="#7a7a83" strokeWidth="1" />
      <path d="M6 5.5V8.5M6 3.5V4" stroke="#7a7a83" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3V13M8 13L4 9M8 13L12 9" stroke="#7a7a83" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Slider with 5 dot positions (0%, 25%, 50%, 75%, 100%) */
function ProgressSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const steps = [0, 25, 50, 75, 100];

  return (
    <div className="relative flex h-6 items-center px-3">
      {/* Track background */}
      <div className="relative h-0.5 w-full bg-[#1b1b1c] rounded-full">
        {/* Filled track */}
        <div
          className="absolute inset-y-0 left-0 bg-[#f9f9fa] rounded-full transition-all duration-150"
          style={{ width: `${value}%` }}
        />
      </div>
      {/* Dots */}
      {steps.map((step) => {
        const isFilled = value >= step;
        return (
          <button
            key={step}
            onClick={() => onChange(step)}
            className="absolute -translate-y-1/2 top-1/2 flex items-center justify-center size-6 -translate-x-1/2"
            style={{ left: `calc(12px + (100% - 24px) * ${step / 100})` }}
          >
            <div
              className={`rounded-full border-2 transition-all duration-150 ${
                isFilled
                  ? 'size-3 border-[#efeff1] bg-[#0a0a0b]'
                  : 'size-2 border-[#252527] bg-[#0a0a0b]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function TradePanel({ tokenSymbol, selectedOrder, collateralToken = 'SOL', walletBalance = 18.32 }: TradePanelProps) {
  const hasOrder = selectedOrder !== null;
  const isBuy = selectedOrder?.side === 'buy';

  // Form state
  const [topAmount, setTopAmount] = useState('');
  const [bottomAmount, setBottomAmount] = useState('');
  const [sliderValue, setSliderValue] = useState(0);

  // Compute values based on selected order
  const price = hasOrder ? selectedOrder.order.price : 0;
  const maxAmount = hasOrder ? selectedOrder.order.amount : 0;
  const maxCollateral = hasOrder ? selectedOrder.order.collateral : 0;

  // When order changes, auto-fill the form
  useEffect(() => {
    if (hasOrder) {
      const topVal = isBuy
        ? selectedOrder.order.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
        : selectedOrder.order.amountFormatted.replace('K', '');
      const bottomVal = isBuy
        ? selectedOrder.order.collateral.toFixed(2)
        : selectedOrder.order.collateral.toFixed(2);
      setTopAmount(topVal);
      setBottomAmount(bottomVal);
      setSliderValue(100);
    } else {
      setTopAmount('');
      setBottomAmount('');
      setSliderValue(0);
    }
  }, [hasOrder, selectedOrder, isBuy]);

  const handleSliderChange = useCallback((val: number) => {
    setSliderValue(val);
    if (hasOrder) {
      const fraction = val / 100;
      if (isBuy) {
        const amt = maxAmount * fraction;
        setTopAmount(amt > 0 ? amt.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '');
        const cost = maxCollateral * fraction;
        setBottomAmount(cost > 0 ? cost.toFixed(2) : '');
      } else {
        const amt = maxAmount * fraction;
        const amtK = amt / 1000;
        setTopAmount(amt > 0 ? (amtK >= 1 ? `${amtK.toFixed(2)}` : amt.toFixed(0)) : '');
        const cost = maxCollateral * fraction;
        setBottomAmount(cost > 0 ? cost.toFixed(2) : '');
      }
    }
  }, [hasOrder, isBuy, maxAmount, maxCollateral]);

  // Determine button state
  const bottomNum = parseFloat(bottomAmount.replace(/,/g, ''));
  const topNum = parseFloat(topAmount.replace(/,/g, ''));
  const isInsufficientBalance = bottomNum > walletBalance;
  const canTrade = hasOrder && topNum > 0 && bottomNum > 0 && !isInsufficientBalance;

  // Computed info values
  const amountDeliver = hasOrder
    ? isBuy
      ? `${bottomAmount} ${collateralToken}`
      : `${topAmount}K ${tokenSymbol}`
    : '-';
  const toBeReceived = hasOrder
    ? isBuy
      ? `${topAmount} ${tokenSymbol}`
      : `${bottomAmount} ${collateralToken}`
    : '-';

  // Colors based on buy/sell
  const accentBg = isBuy ? 'bg-[#16c284]' : 'bg-[#fd5e67]';
  const accentText = isBuy ? 'text-[#5bd197]' : 'text-[#fd5e67]';

  return (
    <div className="flex flex-col gap-4 border-b-[4px] border-[#1b1b1c] pb-6">
      {/* Title */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-medium leading-7 ${hasOrder ? accentText : 'text-[#f9f9fa]'}`}>
              {hasOrder ? `${isBuy ? 'Buy' : 'Sell'} ${tokenSymbol}` : `Trade ${tokenSymbol}`}
            </h3>
            {hasOrder && selectedOrder.order.fillType && (
              <span className="rounded-sm bg-[rgba(255,255,255,0.08)] px-1.5 py-0.5 text-[10px] font-medium uppercase text-[#7a7a83]">
                {selectedOrder.order.fillType}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs leading-4 font-normal text-[#7a7a83]">Price</span>
            <span className="text-xs leading-4 font-normal text-[#f9f9fa]">
              {hasOrder ? `$${price.toFixed(4)}` : '$-'}
            </span>
          </div>
        </div>
        {hasOrder && (
          <button className="flex items-center justify-center rounded-full bg-[#1b1b1c] p-1.5">
            <InfoCircleIcon />
          </button>
        )}
      </div>

      {/* Empty state or Trade Form */}
      {!hasOrder ? (
        <div className="flex h-[216px] flex-col items-center justify-center rounded-[10px] border border-[#1b1b1c] p-8">
          <img src={mascotSvg} alt="" className="size-24 mb-4" />
          <p className="text-xs leading-4 text-[#7a7a83] text-center">
            No order selected yet.
            <br />
            Pick one from the list to start trading.
          </p>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-[10px] border border-[#1b1b1c]">
          {/* Top field: Buying/Selling token */}
          <div className="flex flex-col gap-2 bg-[#1b1b1c] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium leading-4 text-[#7a7a83]">
                {isBuy ? 'Buying' : 'Selling'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-0.5">
                <input
                  type="text"
                  value={topAmount}
                  onChange={(e) => setTopAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-2xl font-medium leading-8 text-[#f9f9fa] placeholder-[#3a3a3d] outline-none tabular-nums"
                />
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#252527] py-1 pl-1 pr-4">
                <TokenIcon symbol={tokenSymbol} size="sm" showChain={false} />
                <span className="text-sm font-medium text-[#f9f9fa]">{tokenSymbol}</span>
              </div>
            </div>
          </div>

          {/* Swap button */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center justify-center rounded-full border border-[#0a0a0b] bg-[#1b1b1c] p-1.5">
              <ArrowDownIcon />
            </div>
          </div>

          {/* Bottom field: Selling/Buying collateral */}
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium leading-4 text-[#7a7a83]">
                {isBuy ? 'Selling' : 'Buying'}
              </span>
              <span className="text-xs font-normal leading-4 text-[#7a7a83]">
                Balance: {walletBalance.toFixed(2)} {collateralToken}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-0.5">
                <input
                  type="text"
                  value={bottomAmount}
                  onChange={(e) => setBottomAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-2xl font-medium leading-8 text-[#f9f9fa] placeholder-[#3a3a3d] outline-none tabular-nums"
                />
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#252527] py-1 pl-1 pr-4">
                <TokenIcon symbol={collateralToken} size="sm" showChain={false} />
                <span className="text-sm font-medium text-[#f9f9fa]">{collateralToken}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress slider - only when order is selected */}
      {hasOrder && (
        <ProgressSlider value={sliderValue} onChange={handleSliderChange} />
      )}

      {/* Trade button */}
      <button
        className={`w-full rounded-[10px] px-5 py-2.5 text-base font-medium leading-6 transition-colors ${
          !hasOrder
            ? 'bg-[#f9f9fa] text-[#0a0a0b] opacity-40 cursor-not-allowed'
            : isInsufficientBalance
              ? 'bg-[rgba(255,255,255,0.08)] text-[#fd5e67] cursor-not-allowed'
              : canTrade
                ? `${accentBg} text-[#f9f9fa] hover:opacity-90`
                : 'bg-[rgba(255,255,255,0.08)] text-[#7a7a83] cursor-not-allowed'
        }`}
        disabled={!canTrade}
      >
        {!hasOrder
          ? `Trade STAKE`
          : isInsufficientBalance
            ? 'Insufficient Balance'
            : `${isBuy ? 'Buy' : 'Sell'}`
        }
      </button>

      {/* Info rows */}
      <div className="flex flex-col gap-2">
        <InfoRow label="Price" value={hasOrder ? `$${price.toFixed(4)}` : '-'} />
        <InfoRow label="Amount Deliver" value={amountDeliver} />
        <InfoRow label="To be Received" value={toBeReceived} />
      </div>
    </div>
  );
}
