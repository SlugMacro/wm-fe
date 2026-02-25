import { useState, useEffect, useCallback, useRef } from 'react';
import type { OrderBookEntry } from '../types';
import TokenIcon from './TokenIcon';
import OrderInfoModal from './OrderInfoModal';
import { useWallet } from '../hooks/useWalletContext';
import mascotSvg from '../assets/images/mascot.svg';

interface TradePanelProps {
  tokenSymbol: string;
  tokenName?: string;
  selectedOrder: { order: OrderBookEntry; side: 'buy' | 'sell' } | null;
  collateralToken?: string;
  chain?: string;
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

function QuestionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 13.333 13.333" fill="none">
      <path d="M6.667 0a6.667 6.667 0 1 1 0 13.333A6.667 6.667 0 0 1 6.667 0Zm0 1.333a5.333 5.333 0 1 0 0 10.667 5.333 5.333 0 0 0 0-10.667Zm0 8a.667.667 0 1 1 0 1.334.667.667 0 0 1 0-1.334Zm0-6.333a2.417 2.417 0 0 1 2.373 2.917 2.42 2.42 0 0 1-1.474 1.743c-.077.03-.147.075-.204.134a.143.143 0 0 0-.033.12l.005.086a.667.667 0 0 1-1.334.078V8c0-.768.62-1.23 1.07-1.41a1.09 1.09 0 0 0 .575-.67 1.09 1.09 0 0 0-.23-1.103 1.083 1.083 0 0 0-1.824.6.667.667 0 1 1-1.333 0A2.417 2.417 0 0 1 6.667 3Z" fill="currentColor" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 5V19M12 19L7 14M12 19L17 14" stroke="#7a7a83" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Slider with 5 dot snap points + free drag anywhere on track */
function ProgressSlider({ value, onChange, disabled = false }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const steps = [0, 25, 50, 75, 100];
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const pctFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return value;
    const rect = track.getBoundingClientRect();
    const pad = 12; // px padding for dot centers
    const x = Math.max(0, Math.min(e.clientX - rect.left - pad, rect.width - pad * 2));
    return Math.round((x / (rect.width - pad * 2)) * 100);
  }, [value]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setDragging(true);
    onChange(pctFromEvent(e));
  }, [disabled, onChange, pctFromEvent]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => onChange(pctFromEvent(e));
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, onChange, pctFromEvent]);

  return (
    <div
      ref={trackRef}
      className={`relative flex h-6 items-center px-3 select-none ${disabled ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
      onMouseDown={handleMouseDown}
    >
      {/* Track background */}
      <div className="relative h-0.5 w-full bg-[#1b1b1c] rounded-full">
        {/* Filled track */}
        <div
          className={`absolute inset-y-0 left-0 bg-[#f9f9fa] rounded-full ${dragging ? '' : 'transition-all duration-150'}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {/* Dot snap points */}
      {steps.map((step) => {
        const isFilled = value >= step;
        return (
          <button
            key={step}
            onClick={(e) => { e.stopPropagation(); if (!disabled) onChange(step); }}
            className="absolute -translate-y-1/2 top-1/2 flex items-center justify-center size-6 -translate-x-1/2"
            style={{ left: `calc(12px + (100% - 24px) * ${step / 100})` }}
          >
            <div
              className={`rounded-full border-2 ${dragging ? '' : 'transition-all duration-150'} ${
                isFilled
                  ? 'size-3 border-[#efeff1] bg-[#0a0a0b]'
                  : 'size-2 border-[#252527] bg-[#0a0a0b]'
              }`}
            />
          </button>
        );
      })}
      {/* Draggable thumb */}
      <div
        className={`absolute -translate-y-1/2 top-1/2 -translate-x-1/2 size-4 rounded-full bg-[#f9f9fa] shadow-md pointer-events-none ${dragging ? '' : 'transition-all duration-150'}`}
        style={{ left: `calc(12px + (100% - 24px) * ${value / 100})` }}
      />
    </div>
  );
}

export default function TradePanel({
  tokenSymbol,
  tokenName = 'Pre-market Token',
  selectedOrder,
  collateralToken = 'SOL',
  chain = 'solana',
}: TradePanelProps) {
  const wallet = useWallet();
  const hasOrder = selectedOrder !== null;
  const isBuy = selectedOrder?.side === 'buy';
  const [showInfoModal, setShowInfoModal] = useState(false);

  // FULL or resell orders → must fill 100%, no editing allowed
  const isFixedFill = hasOrder && (selectedOrder.order.fillType === 'FULL' || selectedOrder.order.isResell === true);

  // Form state
  const [topAmount, setTopAmount] = useState('');
  const [bottomAmount, setBottomAmount] = useState('');
  const [sliderValue, setSliderValue] = useState(0);

  // Compute values based on selected order
  const price = hasOrder ? selectedOrder.order.price : 0;
  const maxAmount = hasOrder ? selectedOrder.order.amount : 0;
  const maxCollateral = hasOrder ? selectedOrder.order.collateral : 0;

  // Wallet state checks — based on wallet chain vs TOKEN chain (not order chain)
  const isWrongNetwork = wallet.isConnected && wallet.connectedChain !== chain;
  const needsAction = !wallet.isConnected || isWrongNetwork;

  // Collateral token from order (for display)
  const orderCollateralToken = hasOrder ? selectedOrder.order.collateralToken : collateralToken;

  // When order changes, auto-fill capped to affordable amount
  const collateralBal = wallet.getBalance(hasOrder ? selectedOrder.order.collateralToken : collateralToken);

  useEffect(() => {
    if (hasOrder) {
      const orderCollateral = selectedOrder.order.collateral;
      const orderAmount = selectedOrder.order.amount;

      // Fixed-fill (FULL/resell) → always 100%
      // Otherwise, cap to affordable amount if wallet connected + correct network
      let fraction = 1;
      if (!isFixedFill) {
        const canAfford = wallet.isConnected && wallet.connectedChain === chain;
        fraction = canAfford && orderCollateral > 0
          ? Math.min(1, collateralBal / orderCollateral)
          : 1;
      }

      const amt = orderAmount * fraction;
      const cost = orderCollateral * fraction;
      const pct = Math.round(fraction * 100);

      if (isBuy) {
        setTopAmount(amt > 0 ? amt.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '');
      } else {
        const amtK = amt / 1000;
        setTopAmount(amt > 0 ? (amtK >= 1 ? amtK.toFixed(2) : amt.toFixed(0)) : '');
      }
      setBottomAmount(cost > 0 ? cost.toFixed(2) : '');
      setSliderValue(pct);
    } else {
      setTopAmount('');
      setBottomAmount('');
      setSliderValue(0);
    }
  }, [hasOrder, selectedOrder, isBuy, isFixedFill, wallet.isConnected, wallet.connectedChain, chain, collateralBal]);

  // Compute collateral from token amount
  const computeCollateral = useCallback((tokenAmt: number): string => {
    if (!hasOrder || maxAmount === 0 || tokenAmt <= 0) return '';
    const fraction = Math.min(tokenAmt / maxAmount, 1);
    const cost = maxCollateral * fraction;
    return cost > 0 ? cost.toFixed(2) : '';
  }, [hasOrder, maxAmount, maxCollateral]);

  // Handle top input change — recalculate bottom + slider, clamp to max
  const handleTopAmountChange = useCallback((raw: string) => {
    if (!hasOrder || maxAmount === 0) {
      setTopAmount(raw);
      return;
    }

    const parsed = parseFloat(raw.replace(/,/g, ''));
    if (isNaN(parsed) || parsed <= 0) {
      setTopAmount(raw);
      setBottomAmount('');
      setSliderValue(0);
      return;
    }

    // For buy: top is raw token amount. For sell: top is in K (×1000)
    const tokenAmt = isBuy ? parsed : parsed * 1000;

    // Clamp to max — snap to 100% if exceeds
    if (tokenAmt >= maxAmount) {
      if (isBuy) {
        setTopAmount(maxAmount.toLocaleString('en-US', { maximumFractionDigits: 0 }));
      } else {
        const amtK = maxAmount / 1000;
        setTopAmount(amtK >= 1 ? amtK.toFixed(2) : maxAmount.toFixed(0));
      }
      setBottomAmount(maxCollateral.toFixed(2));
      setSliderValue(100);
      return;
    }

    setTopAmount(raw);
    setBottomAmount(computeCollateral(tokenAmt));
    const pct = Math.round((tokenAmt / maxAmount) * 100);
    setSliderValue(pct);
  }, [hasOrder, isBuy, maxAmount, maxCollateral, computeCollateral]);

  const handleSliderChange = useCallback((val: number) => {
    setSliderValue(val);
    if (hasOrder) {
      const fraction = val / 100;
      if (isBuy) {
        const amt = maxAmount * fraction;
        setTopAmount(amt > 0 ? amt.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '');
      } else {
        const amt = maxAmount * fraction;
        const amtK = amt / 1000;
        setTopAmount(amt > 0 ? (amtK >= 1 ? `${amtK.toFixed(2)}` : amt.toFixed(0)) : '');
      }
      const cost = maxCollateral * fraction;
      setBottomAmount(cost > 0 ? cost.toFixed(2) : '');
    }
  }, [hasOrder, isBuy, maxAmount, maxCollateral]);

  // Determine button state — no "Insufficient Balance" when wallet not connected or wrong network
  const bottomNum = parseFloat(bottomAmount.replace(/,/g, ''));
  const topNum = parseFloat(topAmount.replace(/,/g, ''));
  const collateralBalance = wallet.getBalance(orderCollateralToken);
  const isInsufficientBalance = !needsAction && bottomNum > collateralBalance;
  const canTrade = hasOrder && !needsAction && topNum > 0 && bottomNum > 0 && !isInsufficientBalance;

  // Computed info values
  const amountDeliver = hasOrder
    ? isBuy
      ? `${bottomAmount} ${orderCollateralToken}`
      : `${topAmount}K ${tokenSymbol}`
    : '-';
  const toBeReceived = hasOrder
    ? isBuy
      ? `${topAmount} ${tokenSymbol}`
      : `${bottomAmount} ${orderCollateralToken}`
    : '-';

  // Colors based on buy/sell
  const accentBg = isBuy ? 'bg-[#16c284]' : 'bg-[#fd5e67]';
  const accentText = isBuy ? 'text-[#5bd197]' : 'text-[#fd5e67]';

  // CTA button config
  const getButtonConfig = () => {
    if (!hasOrder) {
      return {
        text: `Trade ${tokenSymbol}`,
        className: 'bg-[#f9f9fa] text-[#0a0a0b] opacity-40 cursor-not-allowed',
        disabled: true,
        onClick: undefined as (() => void) | undefined,
      };
    }
    if (!wallet.isConnected) {
      return {
        text: 'Connect Wallet',
        className: 'bg-[#f9f9fa] text-[#0a0a0b] hover:opacity-90 cursor-pointer',
        disabled: false,
        onClick: () => wallet.openConnectModal(chain),
      };
    }
    if (isWrongNetwork) {
      return {
        text: 'Switch Network',
        className: 'bg-[#f9f9fa] text-[#0a0a0b] hover:opacity-90 cursor-pointer',
        disabled: false,
        onClick: () => wallet.openConnectModal(chain),
      };
    }
    if (isInsufficientBalance) {
      return {
        text: 'Insufficient Balance',
        className: 'bg-[rgba(255,255,255,0.08)] text-[#fd5e67] cursor-not-allowed',
        disabled: true,
        onClick: undefined as (() => void) | undefined,
      };
    }
    if (canTrade) {
      return {
        text: isBuy ? 'Buy' : 'Sell',
        className: `${accentBg} text-[#f9f9fa] hover:opacity-90`,
        disabled: false,
        onClick: undefined as (() => void) | undefined,
      };
    }
    return {
      text: isBuy ? 'Buy' : 'Sell',
      className: 'bg-[rgba(255,255,255,0.08)] text-[#7a7a83] cursor-not-allowed',
      disabled: true,
      onClick: undefined as (() => void) | undefined,
    };
  };

  const buttonConfig = getButtonConfig();

  // Balance display — only show when wallet connected AND correct network
  const showBalance = wallet.isConnected && !isWrongNetwork;
  const balanceDisplay = showBalance
    ? `Balance: ${collateralBalance.toFixed(2)} ${orderCollateralToken}`
    : '';

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
          <button
            onClick={() => setShowInfoModal(true)}
            className="flex items-center justify-center rounded-full bg-[#1b1b1c] p-2 text-[#7a7a83] transition-colors hover:bg-[#252527]"
          >
            <QuestionIcon />
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
          <div className={`flex flex-col gap-2 p-4 ${isFixedFill ? 'border-b border-[#1b1b1c]' : 'bg-[#1b1b1c]'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium leading-4 text-[#7a7a83]">
                {isBuy ? 'Buying' : 'Selling'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              {isFixedFill ? (
                <span className="flex-1 text-2xl font-medium leading-8 tabular-nums text-[#f9f9fa]">
                  {topAmount || '0'}
                </span>
              ) : (
                <div className="flex flex-1 items-center gap-0.5">
                  <input
                    type="text"
                    value={topAmount}
                    onChange={(e) => handleTopAmountChange(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent text-2xl font-medium leading-8 text-[#f9f9fa] placeholder-[#3a3a3d] outline-none tabular-nums"
                  />
                </div>
              )}
              <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#252527] py-1 pl-1 pr-4">
                <TokenIcon symbol={tokenSymbol} size="sm" showChain={false} />
                <span className="text-sm font-medium text-[#f9f9fa]">{tokenSymbol}</span>
              </div>
            </div>
          </div>

          {/* Swap button */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center justify-center rounded-full border-2 border-[#0a0a0b] bg-[#1b1b1c] p-1.5">
              <ArrowDownIcon />
            </div>
          </div>

          {/* Bottom field: collateral info — display only, not editable */}
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium leading-4 text-[#7a7a83]">
                {isBuy ? 'Selling' : 'Buying'}
              </span>
              {balanceDisplay && (
                <span className="text-xs font-normal leading-4 text-[#7a7a83]">
                  {balanceDisplay}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex-1 text-2xl font-medium leading-8 tabular-nums text-[#f9f9fa]">
                {bottomAmount || '0'}
              </span>
              <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#252527] py-1 pl-1 pr-4">
                <TokenIcon symbol={orderCollateralToken} size="sm" showChain={false} />
                <span className="text-sm font-medium text-[#f9f9fa]">{orderCollateralToken}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress slider - only when order is selected */}
      {hasOrder && (
        <ProgressSlider value={sliderValue} onChange={handleSliderChange} disabled={isFixedFill} />
      )}

      {/* Trade button */}
      <button
        className={`w-full rounded-[10px] px-5 py-2.5 text-base font-medium leading-6 transition-colors ${buttonConfig.className}`}
        disabled={buttonConfig.disabled}
        onClick={buttonConfig.onClick}
      >
        {buttonConfig.text}
      </button>

      {/* Info rows */}
      <div className="flex flex-col gap-2">
        <InfoRow label="Price" value={hasOrder ? `$${price.toFixed(4)}` : '-'} />
        <InfoRow label="Amount Deliver" value={amountDeliver} />
        <InfoRow label="To be Received" value={toBeReceived} />
      </div>

      {/* Order Info Modal */}
      {hasOrder && (
        <OrderInfoModal
          isOpen={showInfoModal}
          order={selectedOrder.order}
          side={selectedOrder.side}
          tokenSymbol={tokenSymbol}
          tokenName={tokenName}
          chain={chain}
          onClose={() => setShowInfoModal(false)}
        />
      )}
    </div>
  );
}
