import { useState, useEffect, useCallback } from 'react';
import type { OrderBookEntry } from '../types';
import TokenIcon from './TokenIcon';

interface CloseOrderModalProps {
  isOpen: boolean;
  order: OrderBookEntry;
  side: 'buy' | 'sell';
  tokenSymbol: string;
  chain: string;
  onClose: () => void;
  onConfirm: () => void;
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="#eab308" />
      <path d="M10 6V11M10 13V13.5" stroke="#0a0a0b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function fmtAmount(val: number): string {
  if (val === 0) return '0';
  const k = val / 1000;
  return k >= 1 ? `${k.toFixed(1)}K` : val.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const infoRowTooltips: Record<string, string> = {
  'Order Type': 'Whether this is a buy order (acquiring tokens) or a sell order (selling tokens for collateral).',
  'Filled / Total Amount': 'The amount already filled by other traders versus the total order size. Filled portions will proceed to settlement.',
  'To be Received / Total': 'Collateral received from filled trades versus the total collateral locked in this order.',
  'Price': 'The unit price per token for this order.',
  'Close Fee': 'The fee charged for closing this order. Currently waived during the promotional period.',
};

function InfoRow({ label, children, badge }: { label: string; children: React.ReactNode; badge?: React.ReactNode }) {
  const tooltip = infoRowTooltips[label];
  return (
    <div className="flex items-center justify-between border-b border-[#252527] px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-2">
        {tooltip ? (
          <span className="relative group cursor-help inline-flex">
            <span className="text-sm font-normal leading-5 text-[#7a7a83] border-b border-dashed border-[#44444b]">
              {label}
            </span>
            <span className="absolute left-0 bottom-full mb-2 w-56 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-[150]">
              {tooltip}
            </span>
          </span>
        ) : (
          <span className="text-sm font-normal leading-5 text-[#7a7a83]">{label}</span>
        )}
        {badge}
      </div>
      <div className="flex items-center gap-1 text-sm font-medium leading-5 text-[#f9f9fa] tabular-nums">
        {children}
      </div>
    </div>
  );
}

export default function CloseOrderModal({
  isOpen,
  order,
  side,
  tokenSymbol,
  chain: _chain,
  onClose,
  onConfirm,
}: CloseOrderModalProps) {
  void _chain; // reserved for future chain-specific logic
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Reset checkbox when modal opens
  useEffect(() => {
    if (isOpen) setConfirmed(false);
  }, [isOpen]);

  // Animation — same as ConnectWalletModal
  useEffect(() => {
    if (isOpen) {
      setAnimating(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (!confirmed) return;
    setVisible(false);
    setTimeout(onConfirm, 200);
  }, [confirmed, onConfirm]);

  if (!isOpen && !animating) return null;

  const isBuy = side === 'buy';
  const collateralToken = order.collateralToken;

  // Compute amounts
  const filledAmount = order.filledAmount;
  const totalAmount = order.totalAmount;
  const filledCollateral = totalAmount > 0 ? (filledAmount / totalAmount) * order.collateral : 0;
  const totalCollateral = order.collateral;

  // Close fee (mock: 0% fee, small amount)
  const closeFee = 0.005;

  // What side string to display
  const collateralSymbol = collateralToken;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-[448px] flex flex-col gap-6 rounded-3xl bg-[#1b1b1c] p-6 shadow-[0_0_32px_rgba(0,0,0,0.2)] transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <p className="text-lg font-medium text-[#f9f9fa]">Close Order</p>
          <div className="flex flex-1 justify-end">
            <button
              onClick={handleClose}
              className="flex items-center justify-center rounded-full bg-[#252527] p-2 text-[#f9f9fa] transition-colors hover:bg-[#2e2e34]"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-center text-sm font-normal leading-5 text-[#7a7a83]">
          You are closing this order.
          <br />
          Are you sure?
        </p>

        {/* Info table */}
        <div className="rounded-[10px] border border-[#252527]">
          {/* Order Type */}
          <InfoRow label="Order Type">
            <span className={isBuy ? 'text-[#5bd197]' : 'text-[#fd5e67]'}>
              {isBuy ? 'Buy' : 'Sell'}
            </span>
          </InfoRow>

          {/* Filled / Total Amount */}
          <InfoRow label="Filled / Total Amount">
            <span>{fmtAmount(filledAmount)}</span>
            <TokenIcon symbol={tokenSymbol} size="xs" showChain={false} />
            <span className="text-[#7a7a83] mx-0.5">/</span>
            <span>{fmtAmount(totalAmount)}</span>
            <TokenIcon symbol={tokenSymbol} size="xs" showChain={false} />
          </InfoRow>

          {/* To be Received / Total */}
          <InfoRow label="To be Received / Total">
            <span>{filledCollateral.toFixed(2)}</span>
            <TokenIcon symbol={collateralSymbol} size="xs" showChain={false} />
            <span className="text-[#7a7a83] mx-0.5">/</span>
            <span>{totalCollateral.toFixed(2)}</span>
            <TokenIcon symbol={collateralSymbol} size="xs" showChain={false} />
          </InfoRow>

          {/* Price */}
          <InfoRow label="Price">
            <span>${order.price.toFixed(4)}</span>
          </InfoRow>

          {/* Close Fee */}
          <InfoRow
            label="Close Fee"
            badge={
              <span className="rounded-full bg-[rgba(22,194,132,0.12)] px-1.5 py-0.5 text-[10px] font-medium text-[#16c284]">
                -0% FEE
              </span>
            }
          >
            <span>{closeFee}</span>
            <TokenIcon symbol={collateralSymbol} size="xs" showChain={false} />
          </InfoRow>
        </div>

        {/* Notice */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <WarningIcon />
            <span className="text-sm font-medium text-[#f9f9fa]">Notice</span>
          </div>
          <p className="text-sm font-normal leading-5 text-[#7a7a83]">
            When you close this order, the filled amount will remain for settlement. The unfilled amount will be canceled and sent back to your wallet immediately.
          </p>
        </div>

        {/* Checkbox */}
        <label className="flex cursor-pointer items-center gap-3">
          <div
            className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
              confirmed ? 'border-[#f9f9fa] bg-[#f9f9fa]' : 'border-[#44444b] bg-transparent'
            }`}
            onClick={() => setConfirmed(!confirmed)}
          >
            {confirmed && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0a0a0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm font-normal text-[#f9f9fa]">Yes, I understand.</span>
        </label>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!confirmed}
          className={`w-full rounded-[10px] px-5 py-2.5 text-base font-medium leading-6 transition-colors ${
            confirmed
              ? 'bg-[rgba(253,94,103,0.12)] text-[#fd5e67] hover:bg-[rgba(253,94,103,0.2)] cursor-pointer'
              : 'bg-[rgba(253,94,103,0.06)] text-[#fd5e67]/40 cursor-not-allowed'
          }`}
        >
          Close Order
        </button>
      </div>
    </div>
  );
}
