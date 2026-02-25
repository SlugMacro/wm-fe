import { useState, useEffect, useCallback } from 'react';
import type { OrderBookEntry } from '../types';
import TokenIcon from './TokenIcon';

interface FillOrderModalProps {
  isOpen: boolean;
  order: OrderBookEntry;
  side: 'buy' | 'sell';
  tokenSymbol: string;
  chain: string;
  /** How much the user is filling (fraction 0-1) */
  fillFraction: number;
  onClose: () => void;
  onConfirm: () => void;
}

/* ── Icons ── */
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="#eab308" />
      <path d="M10 6V11M10 13V13.5" stroke="#0a0a0b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Tooltip-enabled info row ── */
const infoRowTooltips: Record<string, string> = {
  'Buying': 'The amount of tokens you are purchasing in this trade.',
  'Selling': 'The amount of tokens you are selling in this trade.',
  'For': 'The collateral amount you will deposit for this trade.',
  'Price': 'The unit price per token for this order.',
  'Collateral': 'The collateral locked for this trade. Returned on settlement or compensation if counterparty defaults.',
  'Fee': 'The fee charged for this trade. Currently waived during the promotional period.',
};

function InfoRow({ label, children, badge }: { label: string; children: React.ReactNode; badge?: React.ReactNode }) {
  const tooltip = infoRowTooltips[label];
  return (
    <div className="flex items-center justify-between border-b border-[#252527] px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-2">
        {tooltip ? (
          <span className="group relative inline-flex cursor-help">
            <span className="border-b border-dashed border-[#44444b] text-sm font-normal leading-5 text-[#b4b4ba]">
              {label}
            </span>
            <span className="pointer-events-none absolute bottom-full left-0 z-[150] mb-2 w-56 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] font-normal leading-4 text-[#b4b4ba] opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              {tooltip}
            </span>
          </span>
        ) : (
          <span className="text-sm font-normal leading-5 text-[#b4b4ba]">{label}</span>
        )}
        {badge}
      </div>
      <div className="flex items-center gap-1 text-sm font-medium leading-5 tabular-nums text-[#f9f9fa]">
        {children}
      </div>
    </div>
  );
}

/* ── Helpers ── */
function fmtTokenAmount(val: number): string {
  if (val === 0) return '0';
  return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function fmtCollateral(val: number): string {
  if (val === 0) return '0';
  return val.toFixed(2);
}

/* ═══════════════════════════════════════════════════════════
   FillOrderModal — Confirm Buy / Sell flow
   ═══════════════════════════════════════════════════════════ */
export default function FillOrderModal({
  isOpen,
  order,
  side,
  tokenSymbol,
  chain: _chain,
  fillFraction,
  onClose,
  onConfirm,
}: FillOrderModalProps) {
  void _chain;
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmed(false);
      setPending(false);
    }
  }, [isOpen]);

  // Animation
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
    if (pending) return; // don't close while pending
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose, pending]);

  const handleConfirm = useCallback(() => {
    if (!confirmed || pending) return;
    setPending(true);

    // Simulate wallet approval — after 2.5s, call onConfirm
    setTimeout(() => {
      setVisible(false);
      setTimeout(onConfirm, 200);
    }, 2500);
  }, [confirmed, pending, onConfirm]);

  if (!isOpen && !animating) return null;

  const isBuy = side === 'buy';
  const collateralToken = order.collateralToken;

  // Compute amounts based on fill fraction
  const fraction = Math.max(0.01, Math.min(1, fillFraction));
  const tokenAmount = Math.round(order.amount * fraction);
  const collateralAmount = order.collateral * fraction;
  const feeAmount = tokenAmount * 0.025; // 2.5% fee (mocked as 0% promo)

  // Native symbol for chain
  const nativeSymbol = _chain === 'ethereum' ? 'ETH' : _chain === 'sui' ? 'SUI' : 'SOL';

  // Notice text varies by side
  const noticeText = isBuy
    ? {
        line1: "You'll receive your tokens after Settle Starts when seller settles.",
        line2p1: "If they don't settle by Settle Ends, you can cancel the order to get back your deposited ",
        highlight1: `${fmtCollateral(collateralAmount)} ${collateralToken}`,
        mid: ' plus ',
        highlight2: `${fmtCollateral(collateralAmount * 0.8)} ${nativeSymbol}`,
        line2p2: ' compensation from their collateral.',
      }
    : {
        line1: "You'll need to settle your tokens after Settle Starts.",
        line2p1: "If you don't settle by Settle Ends, the buyer can claim ",
        highlight1: `${fmtCollateral(collateralAmount)} ${collateralToken}`,
        mid: ' from your collateral as compensation, plus their ',
        highlight2: `${fmtCollateral(collateralAmount)} ${collateralToken}`,
        line2p2: ' back.',
      };

  // Button colors
  const activeColor = isBuy ? 'bg-[#16c284]' : 'bg-[#fd5e67]';
  const actionVerb = isBuy ? 'buying' : 'selling';
  const actionColor = isBuy ? 'text-[#5bd197]' : 'text-[#fd5e67]';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 flex w-[448px] flex-col gap-6 rounded-3xl bg-[#1b1b1c] p-6 shadow-[0_0_32px_rgba(0,0,0,0.2)] transition-all duration-200 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <p className="text-lg font-medium leading-7 text-[#f9f9fa]">
            Confirm {isBuy ? 'Buy' : 'Sell'} Order
          </p>
          <div className="flex flex-1 justify-end">
            <button
              onClick={handleClose}
              disabled={pending}
              className="flex items-center justify-center rounded-full bg-[#252527] p-2 text-[#f9f9fa] transition-colors hover:bg-[#2e2e34] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-center text-sm font-normal leading-5 text-[#b4b4ba]">
          You are <span className={actionColor}>{actionVerb}</span>{' '}
          <span className="font-medium text-[#f9f9fa]">{fmtTokenAmount(tokenAmount)} {tokenSymbol}</span>{' '}
          for <span className="font-medium text-[#f9f9fa]">{fmtCollateral(collateralAmount)} {collateralToken}</span>.
          <br />
          Are you sure?
        </p>

        {/* Info table */}
        <div className="rounded-[10px] border border-[#252527]">
          {/* Buying / Selling amount */}
          <InfoRow label={isBuy ? 'Buying' : 'Selling'}>
            <span>{fmtTokenAmount(tokenAmount)}</span>
            <TokenIcon symbol={tokenSymbol} size="xs" showChain={false} />
          </InfoRow>

          {/* For */}
          <InfoRow label="For">
            <span>{fmtCollateral(collateralAmount)}</span>
            <TokenIcon symbol={collateralToken} size="xs" showChain={false} />
          </InfoRow>

          {/* Price */}
          <InfoRow label="Price">
            <span>${order.price.toFixed(4)}</span>
          </InfoRow>

          {/* Collateral */}
          <InfoRow label="Collateral">
            <span>{fmtCollateral(collateralAmount)}</span>
            <TokenIcon symbol={collateralToken} size="xs" showChain={false} />
          </InfoRow>

          {/* Fee */}
          <InfoRow
            label="Fee"
            badge={
              <span className="rounded-full bg-[rgba(22,194,132,0.1)] px-2 py-1 text-[10px] font-medium uppercase leading-3 text-[#5bd197]">
                -0% Fee
              </span>
            }
          >
            <span>{fmtTokenAmount(Math.round(feeAmount))}</span>
            <TokenIcon symbol={tokenSymbol} size="xs" showChain={false} />
          </InfoRow>
        </div>

        {/* Notice */}
        <div className="flex flex-col gap-4">
          {/* Title with divider */}
          <div className="flex items-center gap-2">
            <WarningIcon />
            <span className="text-sm font-medium text-[#f9f9fa]">Notice</span>
            <div className="h-px flex-1 bg-[#252527]" />
          </div>
          {/* Notice body */}
          <p className="text-sm font-normal leading-5 text-[#b4b4ba]">
            {noticeText.line1}
            <br />
            {noticeText.line2p1}
            <span className="font-medium text-[#f9f9fa]">{noticeText.highlight1}</span>
            {noticeText.mid}
            <span className="font-medium text-[#f9f9fa]">{noticeText.highlight2}</span>
            {noticeText.line2p2}
          </p>
        </div>

        {/* Checkbox */}
        <label className="flex cursor-pointer items-center gap-2">
          <div
            className={`flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
              confirmed ? 'border-[#f9f9fa] bg-[#f9f9fa]' : 'border-[#44444b] bg-[#252527]'
            }`}
            onClick={() => !pending && setConfirmed(!confirmed)}
          >
            {confirmed && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0a0a0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm font-normal text-[#f9f9fa]">Yes, I understand.</span>
        </label>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!confirmed || pending}
          className={`flex w-full items-center justify-center rounded-[10px] px-5 py-2.5 text-base font-medium leading-6 transition-colors ${
            pending
              ? `${activeColor} cursor-not-allowed opacity-40 text-[#f9f9fa]`
              : confirmed
                ? `${activeColor} text-[#f9f9fa] hover:opacity-90`
                : `${activeColor} cursor-not-allowed opacity-40 text-[#f9f9fa]`
          }`}
        >
          {pending ? 'Pending Approval...' : `Deposit ${fmtCollateral(collateralAmount)} ${collateralToken}`}
        </button>
      </div>
    </div>
  );
}
