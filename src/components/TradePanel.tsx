import { useState, useEffect, useCallback, useRef } from 'react';
import type { OrderBookEntry } from '../types';
import TokenIcon from './TokenIcon';
import OrderInfoModal from './OrderInfoModal';
import CloseOrderModal from './CloseOrderModal';
import FillOrderModal from './FillOrderModal';
import ResellRiskModal from './ResellRiskModal';
import Toast from './Toast';
import { useWallet } from '../hooks/useWalletContext';
import noOrderSvg from '../assets/images/no-order.svg';

interface TradePanelProps {
  tokenSymbol: string;
  tokenName?: string;
  selectedOrder: { order: OrderBookEntry; side: 'buy' | 'sell' } | null;
  collateralToken?: string;
  chain?: string;
  onOrderClosed?: (orderId: string) => void;
  onOrderFilled?: (orderId: string, side: 'buy' | 'sell', fillFraction: number) => void;
}

const infoRowTooltips: Record<string, string> = {
  'Price': 'The unit price per token for this order.',
  'Price / Original Price': 'The resell price you pay vs. the original position price.',
  'Amount Deliver': 'The amount of tokens or collateral you will deposit to fulfill this trade.',
  'To be Received': 'The amount of tokens or collateral you will receive after the trade is completed.',
};

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  const tooltip = infoRowTooltips[label];
  return (
    <div className="flex items-center justify-between">
      {tooltip ? (
        <span className="relative group cursor-help inline-flex">
          <span className="text-sm leading-5 font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34]">
            {label}
          </span>
          <span className="absolute left-0 bottom-full mb-2 w-56 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-[150]">
            {tooltip}
          </span>
        </span>
      ) : (
        <span className="text-sm leading-5 font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34]">
          {label}
        </span>
      )}
      {children ?? (
        <span className="text-sm leading-5 font-medium text-[#f9f9fa] tabular-nums">{value}</span>
      )}
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
function ProgressSlider({ value, onChange, disabled = false, hideThumb = false }: { value: number; onChange: (v: number) => void; disabled?: boolean; hideThumb?: boolean }) {
  const steps = [0, 25, 50, 75, 100];
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const pctFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return value;
    const rect = track.getBoundingClientRect();
    const pad = 12;
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
      <div className="relative h-0.5 w-full bg-[#1b1b1c] rounded-full">
        <div
          className={`absolute inset-y-0 left-0 bg-[#f9f9fa] rounded-full ${dragging ? '' : 'transition-all duration-150'}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {!hideThumb && steps.map((step) => {
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
      {!hideThumb && (
        <div
          className={`absolute -translate-y-1/2 top-1/2 -translate-x-1/2 size-4 rounded-full bg-[#f9f9fa] shadow-md pointer-events-none ${dragging ? '' : 'transition-all duration-150'}`}
          style={{ left: `calc(12px + (100% - 24px) * ${value / 100})` }}
        />
      )}
    </div>
  );
}

/** Fill progress bar for owner orders — same height as ProgressSlider */
function FillProgressBar({ filledAmount, totalAmount, tokenSymbol }: { filledAmount: number; totalAmount: number; tokenSymbol: string }) {
  const pct = totalAmount > 0 ? Math.min(100, (filledAmount / totalAmount) * 100) : 0;
  const filledLabel = fmtAmount(filledAmount);
  const totalLabel = fmtAmount(totalAmount);

  return (
    <div className="relative group flex h-6 items-center cursor-default">
      <div className="relative h-1 w-full bg-[#1b1b1c] rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-[#5bd197] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap z-[150]">
        <span className="text-[#5bd197] font-medium">{filledLabel}</span>
        <span className="text-[#7a7a83]"> / {totalLabel} {tokenSymbol}</span>
        <span className="text-[#7a7a83]"> ({pct.toFixed(0)}% filled)</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Helper: format token amount
   ═══════════════════════════════════════════════════════════ */
function fmtAmount(val: number): string {
  if (val === 0) return '0';
  const k = val / 1000;
  return k >= 1 ? `${k.toFixed(2)}K` : val.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/* ═══════════════════════════════════════════════════════════
   TradePanel
   ═══════════════════════════════════════════════════════════ */
export default function TradePanel({
  tokenSymbol,
  tokenName = 'Pre-market Token',
  selectedOrder,
  collateralToken = 'SOL',
  chain = 'solana',
  onOrderClosed,
  onOrderFilled,
}: TradePanelProps) {
  const wallet = useWallet();
  const hasOrder = selectedOrder !== null;
  const isBuy = selectedOrder?.side === 'buy';
  const isOwner = hasOrder && selectedOrder.order.isOwner === true;
  const isResell = hasOrder && !isOwner && selectedOrder.order.isResell === true;
  const isOwnerResell = isOwner && hasOrder && !!selectedOrder.order.isResell;
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showFillModal, setShowFillModal] = useState(false);
  const [showResellRiskModal, setShowResellRiskModal] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const [pendingFill, setPendingFill] = useState(false);
  const [toast, setToast] = useState<{ type: 'waiting' | 'success'; title: string; subtitle: string; visible: boolean } | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fillTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (fillTimerRef.current) clearTimeout(fillTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Handle close order confirmation flow
  const handleConfirmClose = useCallback(() => {
    setShowCloseModal(false);
    setPendingClose(true);
    setToast({ type: 'waiting', title: 'Waiting for Approval', subtitle: 'Please confirm the transaction in your wallet.', visible: true });

    // Simulate blockchain transaction — after ~2.5s, mark as success
    closeTimerRef.current = setTimeout(() => {
      setPendingClose(false);
      // Show success toast
      setToast({ type: 'success', title: 'Order Closed', subtitle: 'Your order has been successfully closed.', visible: true });

      // Notify parent to remove order from book
      if (hasOrder && onOrderClosed) {
        onOrderClosed(selectedOrder.order.id);
      }

      // Auto-dismiss success toast after 5s
      toastTimerRef.current = setTimeout(() => {
        setToast(prev => prev ? { ...prev, visible: false } : null);
        setTimeout(() => setToast(null), 300);
      }, 5000);
    }, 2500);
  }, [hasOrder, selectedOrder, onOrderClosed]);

  // FULL or resell orders → must fill 100%, no editing allowed
  const isFixedFill = hasOrder && !isOwner && (selectedOrder.order.fillType === 'FULL' || selectedOrder.order.isResell === true);

  // Form state
  const [topAmount, setTopAmount] = useState('');
  const [bottomAmount, setBottomAmount] = useState('');
  const [sliderValue, setSliderValue] = useState(0);

  // Handle fill order (buy/sell) confirmation flow
  const handleConfirmFill = useCallback(() => {
    setShowFillModal(false);
    setPendingFill(true);
    setToast({ type: 'waiting', title: 'Waiting for Approval', subtitle: 'Please confirm the transaction in your wallet.', visible: true });

    const currentSide = selectedOrder?.side;
    const currentOrderId = selectedOrder?.order.id;
    const currentFraction = sliderValue / 100;

    fillTimerRef.current = setTimeout(() => {
      setPendingFill(false);
      const sideLabel = currentSide === 'buy' ? 'Buy' : 'Sell';
      setToast({ type: 'success', title: `${sideLabel} Order Filled`, subtitle: `Your ${sideLabel.toLowerCase()} order has been successfully filled.`, visible: true });

      // Notify parent to move order to filled
      if (currentOrderId && currentSide && onOrderFilled) {
        onOrderFilled(currentOrderId, currentSide, currentFraction);
      }

      // Auto-dismiss success toast after 5s
      toastTimerRef.current = setTimeout(() => {
        setToast(prev => prev ? { ...prev, visible: false } : null);
        setTimeout(() => setToast(null), 300);
      }, 5000);
    }, 2500);
  }, [selectedOrder, sliderValue, onOrderFilled]);

  // Handle resell risk modal → opens fill/confirm modal
  const handleResellRiskConfirm = useCallback(() => {
    setShowResellRiskModal(false);
    // Small delay so the risk modal closes before fill modal opens
    setTimeout(() => setShowFillModal(true), 250);
  }, []);

  // Compute values based on selected order
  const price = hasOrder ? selectedOrder.order.price : 0;
  const maxAmount = hasOrder ? selectedOrder.order.amount : 0;
  const maxCollateral = hasOrder ? selectedOrder.order.collateral : 0;

  // Wallet state checks
  const isWrongNetwork = wallet.isConnected && wallet.connectedChain !== chain;
  const needsAction = !wallet.isConnected || isWrongNetwork;

  // Collateral token from order (for display)
  const orderCollateralToken = hasOrder ? selectedOrder.order.collateralToken : collateralToken;

  // Balance
  const collateralBal = wallet.getBalance(hasOrder ? selectedOrder.order.collateralToken : collateralToken);

  useEffect(() => {
    if (hasOrder) {
      const orderCollateral = selectedOrder.order.collateral;
      const orderAmount = selectedOrder.order.amount;

      if (isOwner) {
        // Owner view: always show full order amounts
        setTopAmount(orderAmount.toLocaleString('en-US', { maximumFractionDigits: 0 }));
        setBottomAmount(orderCollateral > 0 ? orderCollateral.toFixed(2) : '');
        setSliderValue(0);
        return;
      }

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
  }, [hasOrder, selectedOrder, isBuy, isOwner, isFixedFill, wallet.isConnected, wallet.connectedChain, chain, collateralBal]);

  // Compute collateral from token amount
  const computeCollateral = useCallback((tokenAmt: number): string => {
    if (!hasOrder || maxAmount === 0 || tokenAmt <= 0) return '';
    const fraction = Math.min(tokenAmt / maxAmount, 1);
    const cost = maxCollateral * fraction;
    return cost > 0 ? cost.toFixed(2) : '';
  }, [hasOrder, maxAmount, maxCollateral]);

  // Handle top input change
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
    const tokenAmt = isBuy ? parsed : parsed * 1000;
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

  // Button state (non-owner)
  const bottomNum = parseFloat(bottomAmount.replace(/,/g, ''));
  const topNum = parseFloat(topAmount.replace(/,/g, ''));
  const collateralBalance = wallet.getBalance(orderCollateralToken);
  const isInsufficientBalance = !needsAction && bottomNum > collateralBalance;
  const canTrade = hasOrder && !needsAction && topNum > 0 && bottomNum > 0 && !isInsufficientBalance;

  // Computed info values (non-owner)
  const amountDeliver = hasOrder
    ? isBuy ? `${bottomAmount} ${orderCollateralToken}` : `${topAmount}K ${tokenSymbol}`
    : '-';
  const toBeReceived = hasOrder
    ? isBuy ? `${topAmount} ${tokenSymbol}` : `${bottomAmount} ${orderCollateralToken}`
    : '-';

  // Colors
  const accentBg = isBuy ? 'bg-[#16c284]' : 'bg-[#fd5e67]';
  const accentText = isBuy ? 'text-[#5bd197]' : 'text-[#fd5e67]';

  // CTA button config
  const getButtonConfig = () => {
    if (!hasOrder) {
      return { text: `Trade ${tokenSymbol}`, className: 'bg-[#f9f9fa] text-[#0a0a0b] opacity-40 cursor-not-allowed', disabled: true, onClick: undefined as (() => void) | undefined };
    }
    if (isOwner && pendingClose) {
      return { text: 'Pending Approval', className: 'bg-[rgba(253,94,103,0.06)] text-[#fd5e67]/40 cursor-not-allowed', disabled: true, onClick: undefined as (() => void) | undefined };
    }
    if (isOwner) {
      return { text: 'Close Order', className: 'bg-[rgba(253,94,103,0.12)] text-[#fd5e67] hover:bg-[rgba(253,94,103,0.2)] cursor-pointer', disabled: false, onClick: () => setShowCloseModal(true) };
    }
    if (pendingFill) {
      const pendingBg = isResell ? 'bg-[#16c284]' : accentBg;
      return { text: 'Pending Approval', className: `${pendingBg} text-[#f9f9fa] opacity-40 cursor-not-allowed`, disabled: true, onClick: undefined as (() => void) | undefined };
    }
    if (!wallet.isConnected) {
      return { text: 'Connect Wallet', className: 'bg-[#f9f9fa] text-[#0a0a0b] hover:opacity-90 cursor-pointer', disabled: false, onClick: () => wallet.openConnectModal(chain) };
    }
    if (isWrongNetwork) {
      return { text: 'Switch Network', className: 'bg-[#f9f9fa] text-[#0a0a0b] hover:opacity-90 cursor-pointer', disabled: false, onClick: () => wallet.openConnectModal(chain) };
    }
    if (isInsufficientBalance) {
      return { text: 'Insufficient Balance', className: 'bg-[rgba(255,255,255,0.08)] text-[#fd5e67] cursor-not-allowed', disabled: true, onClick: undefined as (() => void) | undefined };
    }
    if (canTrade && isResell) {
      return { text: 'Buy Resell', className: 'bg-[#16c284] text-[#f9f9fa] hover:opacity-90 cursor-pointer', disabled: false, onClick: () => setShowResellRiskModal(true) };
    }
    if (canTrade) {
      return { text: isBuy ? 'Buy' : 'Sell', className: `${accentBg} text-[#f9f9fa] hover:opacity-90 cursor-pointer`, disabled: false, onClick: () => setShowFillModal(true) };
    }
    if (isResell) {
      return { text: 'Buy Resell', className: 'bg-[rgba(255,255,255,0.08)] text-[#7a7a83] cursor-not-allowed', disabled: true, onClick: undefined as (() => void) | undefined };
    }
    return { text: isBuy ? 'Buy' : 'Sell', className: 'bg-[rgba(255,255,255,0.08)] text-[#7a7a83] cursor-not-allowed', disabled: true, onClick: undefined as (() => void) | undefined };
  };

  const buttonConfig = getButtonConfig();

  // Balance display
  const showBalance = wallet.isConnected && !isWrongNetwork && (!isOwner || isOwnerResell);
  const balanceDisplay = showBalance
    ? `Balance: ${collateralBalance.toFixed(2)} ${orderCollateralToken}`
    : '';

  // Both fields display-only when owner or fixedFill
  const isDisplayOnly = isOwner || isFixedFill;

  // ═══ Owner info row data ═══
  const ownerFilledAmount = hasOrder ? selectedOrder.order.filledAmount : 0;
  const ownerTotalAmount = hasOrder ? selectedOrder.order.totalAmount : 0;
  const ownerFilledCollateral = hasOrder && ownerTotalAmount > 0
    ? (ownerFilledAmount / ownerTotalAmount) * maxCollateral
    : 0;
  return (
    <div className="flex flex-col gap-4 border-b-[4px] border-[#1b1b1c] pb-6">
      {/* Title */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-medium leading-7 ${hasOrder ? (isOwner ? 'text-[#f9f9fa]' : isResell ? 'text-[#5bd197]' : accentText) : 'text-[#f9f9fa]'}`}>
              {!hasOrder
                ? `Trade ${tokenSymbol}`
                : isOwnerResell
                  ? <>My <span className="text-[#facc15]">Resell</span> Order</>
                  : isOwner
                    ? <>My <span className={accentText}>{isBuy ? 'Buy' : 'Sell'}</span> Order</>
                    : isResell
                      ? `Buy ${tokenSymbol}`
                      : `${isBuy ? 'Buy' : 'Sell'} ${tokenSymbol}`
              }
            </h3>
            {/* Badge: RS for resell, FULL/PARTIAL for regular */}
            {hasOrder && !isOwner && isResell && (
              <span className="inline-flex items-center justify-center rounded-full bg-[#eab308] px-1.5 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#0a0a0b]">
                RS
              </span>
            )}
            {hasOrder && !isOwner && !isResell && selectedOrder.order.fillType && (
              <span className="rounded-sm bg-[rgba(255,255,255,0.08)] px-1.5 py-0.5 text-[10px] font-medium uppercase text-[#7a7a83]">
                {selectedOrder.order.fillType}
              </span>
            )}
          </div>
          {/* Price subtitle — different for resell / owner resell */}
          {isOwnerResell ? (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs leading-4 font-normal text-[#7a7a83]">Price</span>
              <span className="text-xs leading-4 font-normal text-[#facc15] tabular-nums">
                ${price.toFixed(4)}
              </span>
              <span className="text-xs leading-4 text-[#44444b]">·</span>
              <span className="text-xs leading-4 font-normal text-[#7a7a83]">Org. Price / Collateral</span>
              <span className="text-xs leading-4 font-normal text-[#f9f9fa] tabular-nums">
                ${(selectedOrder.order.originalPrice ?? price).toFixed(4)} / {(selectedOrder.order.originalCollateral ?? maxCollateral).toFixed(1)} {orderCollateralToken}
              </span>
            </div>
          ) : isResell ? (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs leading-4 font-normal text-[#7a7a83]">Price</span>
              <span className="text-xs leading-4 font-normal text-[#facc15] tabular-nums">
                ${price.toFixed(4)}
              </span>
              <span className="text-xs leading-4 text-[#44444b]">·</span>
              <span className="text-xs leading-4 font-normal text-[#7a7a83]">Org. Price / Collateral</span>
              <span className="text-xs leading-4 font-normal text-[#f9f9fa] tabular-nums">
                ${(selectedOrder.order.originalPrice ?? price).toFixed(4)} / {(selectedOrder.order.originalCollateral ?? maxCollateral).toFixed(1)} {orderCollateralToken}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-xs leading-4 font-normal text-[#7a7a83]">Price</span>
              <span className="text-xs leading-4 font-normal text-[#f9f9fa]">
                {hasOrder ? `$${price.toFixed(4)}` : '$-'}
              </span>
            </div>
          )}
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

      {/* Trade form + slider area — grid overlay keeps height consistent */}
      <div className="grid">
        {/* Form + slider — always rendered for height; invisible when no order */}
        <div className={`col-start-1 row-start-1 flex flex-col gap-4 ${hasOrder ? '' : 'invisible'}`}>
          <div className="relative overflow-hidden rounded-[10px] border border-[#1b1b1c]">
            {/* Top field */}
            <div className={`flex flex-col gap-2 p-4 border-b ${isDisplayOnly ? 'border-[#1b1b1c]' : 'bg-[#1b1b1c] border-transparent'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium leading-4 text-[#7a7a83]">
                  {isOwnerResell ? 'Selling' : isBuy ? 'Buying' : 'Selling'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                {isDisplayOnly ? (
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

            {/* Bottom field */}
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium leading-4 text-[#7a7a83]">
                  {isOwnerResell ? 'Buying' : isBuy ? 'Selling' : 'Buying'}
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

          {/* Slider / progress inside the grid cell */}
          {isOwnerResell ? (
            <ProgressSlider value={100} onChange={() => {}} disabled />
          ) : !isOwner ? (
            <ProgressSlider value={sliderValue} onChange={handleSliderChange} disabled={isFixedFill} />
          ) : (
            <FillProgressBar filledAmount={ownerFilledAmount} totalAmount={ownerTotalAmount} tokenSymbol={tokenSymbol} />
          )}
        </div>

        {/* Empty state — fills same grid cell, vertically centers content */}
        {!hasOrder && (
          <div className="col-start-1 row-start-1 flex flex-col items-center justify-center rounded-[10px] border border-[#1b1b1c]">
            <img src={noOrderSvg} alt="" className="size-24 mb-4" />
            <p className="text-xs leading-4 text-[#7a7a83] text-center">
              No order selected yet.
              <br />
              Pick one from the list to start trading.
            </p>
          </div>
        )}
      </div>

      {/* CTA button */}
      <button
        className={`w-full rounded-[10px] px-5 py-2.5 text-base font-medium leading-6 transition-colors ${buttonConfig.className}`}
        disabled={buttonConfig.disabled}
        onClick={buttonConfig.onClick}
      >
        {buttonConfig.text}
      </button>

      {/* Info rows */}
      {hasOrder && isOwnerResell ? (
        /* ── Owner resell info rows ── */
        <div className="flex flex-col gap-2">
          <InfoRow label="Price / Original Price">
            <span className="text-sm leading-5 font-medium tabular-nums">
              <span className="text-[#facc15]">${price.toFixed(4)}</span>
              <span className="text-[#f9f9fa]"> / </span>
              <span className="text-[#f9f9fa]">${(selectedOrder.order.originalPrice ?? price).toFixed(4)}</span>
            </span>
          </InfoRow>
          <InfoRow label="Amount Deliver" value={`${bottomAmount} ${orderCollateralToken}`} />
          <InfoRow label="To be Received" value={`${topAmount} ${tokenSymbol}`} />
        </div>
      ) : hasOrder && isOwner ? (
        /* ── Owner info rows ── */
        <div className="flex flex-col gap-2">
          <InfoRow label="Price" value={`$${price.toFixed(4)}`} />
          <InfoRow label="Filled / Total Amount">
            <span className="text-sm leading-5 font-medium tabular-nums">
              <span className="text-[#5bd197]">{fmtAmount(ownerFilledAmount)}</span>
              <span className="text-[#7a7a83]"> / {fmtAmount(ownerTotalAmount)} {tokenSymbol}</span>
            </span>
          </InfoRow>
          <InfoRow label="To be Received / Total">
            <span className="text-sm leading-5 font-medium tabular-nums">
              <span className="text-[#5bd197]">{ownerFilledCollateral.toFixed(2)}</span>
              <span className="text-[#7a7a83]"> / {maxCollateral.toFixed(2)} {orderCollateralToken}</span>
            </span>
          </InfoRow>
        </div>
      ) : isResell ? (
        /* ── Resell info rows ── */
        <div className="flex flex-col gap-2">
          <InfoRow label="Price / Original Price">
            <span className="text-sm leading-5 font-medium tabular-nums">
              <span className="text-[#facc15]">${price.toFixed(4)}</span>
              <span className="text-[#7a7a83]"> / </span>
              <span className="text-[#f9f9fa]">${(selectedOrder.order.originalPrice ?? price).toFixed(4)}</span>
            </span>
          </InfoRow>
          <InfoRow label="Amount Deliver" value={amountDeliver} />
          <InfoRow label="To be Received" value={toBeReceived} />
        </div>
      ) : (
        /* ── Regular info rows ── */
        <div className="flex flex-col gap-2">
          <InfoRow label="Price" value={hasOrder ? `$${price.toFixed(4)}` : '-'} />
          <InfoRow label="Amount Deliver" value={amountDeliver} />
          <InfoRow label="To be Received" value={toBeReceived} />
        </div>
      )}

      {/* Order Info Modal */}
      {hasOrder && (
        <OrderInfoModal
          isOpen={showInfoModal}
          order={selectedOrder.order}
          side={selectedOrder.side}
          tokenSymbol={tokenSymbol}
          tokenName={tokenName}
          chain={chain}
          isOwner={isOwner}
          onClose={() => setShowInfoModal(false)}
        />
      )}

      {/* Close Order Confirm Modal */}
      {hasOrder && isOwner && (
        <CloseOrderModal
          isOpen={showCloseModal}
          order={selectedOrder.order}
          side={selectedOrder.side}
          tokenSymbol={tokenSymbol}
          chain={chain}
          onClose={() => setShowCloseModal(false)}
          onConfirm={handleConfirmClose}
        />
      )}

      {/* Fill Order (Buy/Sell) Confirm Modal */}
      {hasOrder && !isOwner && (
        <FillOrderModal
          isOpen={showFillModal}
          order={selectedOrder.order}
          side={selectedOrder.side}
          tokenSymbol={tokenSymbol}
          chain={chain}
          fillFraction={sliderValue / 100}
          onClose={() => setShowFillModal(false)}
          onConfirm={handleConfirmFill}
        />
      )}

      {/* Resell Risk Warning Modal */}
      {hasOrder && isResell && (
        <ResellRiskModal
          isOpen={showResellRiskModal}
          order={selectedOrder.order}
          tokenSymbol={tokenSymbol}
          onClose={() => setShowResellRiskModal(false)}
          onConfirm={handleResellRiskConfirm}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          subtitle={toast.subtitle}
          visible={toast.visible}
          action={toast.type === 'success' ? { label: 'View Transaction', href: 'https://github.com/SlugMacro/wm-fe' } : undefined}
        />
      )}
    </div>
  );
}
