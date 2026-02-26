import { useState, useEffect, useCallback } from 'react';
import type { OrderBookEntry } from '../types';

interface ResellRiskModalProps {
  isOpen: boolean;
  order: OrderBookEntry;
  tokenSymbol: string;
  onClose: () => void;
  onConfirm: () => void;
}

/* ── Icons ── */
function AlertFillIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L22 20H2L12 2Z" fill="currentColor" />
      <path d="M12 10V14M12 16.5V17" stroke="#ff3b46" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6 15L12 9L18 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   ResellRiskModal — Risk warning before buying a resell position
   ═══════════════════════════════════════════════════════════ */
export default function ResellRiskModal({
  isOpen,
  order,
  tokenSymbol: _tokenSymbol,
  onClose,
  onConfirm,
}: ResellRiskModalProps) {
  void _tokenSymbol;
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [pnlOpen, setPnlOpen] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmed(false);
      setPnlOpen(false);
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
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (!confirmed) return;
    setVisible(false);
    setTimeout(onConfirm, 200);
  }, [confirmed, onConfirm]);

  if (!isOpen && !animating) return null;

  const resellPrice = order.price;
  const originalPrice = order.originalPrice ?? resellPrice * 0.6;
  const prevBuyerProfit = originalPrice > 0
    ? ((resellPrice - originalPrice) / originalPrice * 100)
    : 0;
  const defaultThreshold = originalPrice * 2; // +100% from original
  const capProfitPct = order.originalCollateral != null && order.collateral > 0
    ? (((order.originalCollateral) / order.collateral) * 100 - 100).toFixed(1)
    : '8.3';

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
        {/* Header — title left, badge right */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-7 text-[#f9f9fa]">
            Resell Order Risk Warning
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ff3b46] py-1 pl-1 pr-2">
            <AlertFillIcon />
            <span className="text-[10px] font-medium uppercase leading-3 text-[#f9f9fa]">
              High-risk
            </span>
          </span>
        </div>

        {/* Price Review — 3 columns with borders */}
        <div className="flex rounded-[10px] border border-[#252527]">
          {/* Original Price */}
          <div className="flex flex-1 flex-col gap-2 border-r border-[#252527] p-4">
            <span className="group relative inline-flex cursor-help self-start">
              <span className="border-b border-dashed border-[#44444b] text-xs font-normal leading-4 text-[#b4b4ba]">
                Original Price
              </span>
              <span className="pointer-events-none absolute bottom-full left-0 z-[150] mb-2 w-48 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] font-normal leading-4 text-[#b4b4ba] opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                The price the previous buyer originally paid when entering this position.
              </span>
            </span>
            <span className="text-base font-medium leading-6 tabular-nums text-[#f9f9fa]">
              ${originalPrice.toFixed(2)}
            </span>
          </div>
          {/* Your Entry */}
          <div className="flex flex-1 flex-col gap-2 border-r border-[#252527] p-4">
            <span className="group relative inline-flex cursor-help self-start">
              <span className="border-b border-dashed border-[#44444b] text-xs font-normal leading-4 text-[#b4b4ba]">
                Your Entry
              </span>
              <span className="pointer-events-none absolute bottom-full left-0 z-[150] mb-2 w-48 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] font-normal leading-4 text-[#b4b4ba] opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                The price you are paying to buy this resell position.
              </span>
            </span>
            <span className="text-base font-medium leading-6 tabular-nums text-[#f9f9fa]">
              ${resellPrice.toFixed(2)}
            </span>
          </div>
          {/* Prev. Buyer Profit */}
          <div className="flex flex-1 flex-col gap-2 p-4">
            <span className="group relative inline-flex cursor-help self-start">
              <span className="border-b border-dashed border-[#44444b] text-xs font-normal leading-4 text-[#b4b4ba]">
                Prev. Buyer Profit
              </span>
              <span className="pointer-events-none absolute bottom-full right-0 z-[150] mb-2 w-48 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] font-normal leading-4 text-[#b4b4ba] opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                The profit the previous buyer makes by reselling this position to you at a higher price.
              </span>
            </span>
            <span className="text-base font-medium leading-6 tabular-nums text-[#fd5e67]">
              +{prevBuyerProfit.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* PNL Scenarios — accordion */}
        <div className="overflow-hidden rounded-xl border border-[#252527]">
          {/* Accordion header */}
          <button
            className={`flex w-full items-center justify-between px-4 py-3 ${pnlOpen ? 'border-b border-[#252527]' : ''}`}
            onClick={() => setPnlOpen(!pnlOpen)}
          >
            <span className="text-base font-medium leading-6 text-[#f9f9fa]">
              Your PNL Scenarios
            </span>
            <span className="text-[#f9f9fa]">
              {pnlOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </span>
          </button>

          {/* Accordion content */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              pnlOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {/* Two scenario columns */}
            <div className="flex">
              {/* Loss scenario */}
              <div className="flex flex-1 flex-col gap-2 border-r border-[#252527] p-4">
                <p className="text-sm font-medium leading-5 text-[#f9f9fa]">
                  TGE Price ≤ ${resellPrice.toFixed(2)}
                </p>
                <p className="text-sm font-normal leading-5 text-[#fd5e67]">
                  Your Resell will incur loss
                </p>
              </div>
              {/* Profit scenario */}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-sm font-medium leading-5 text-[#f9f9fa]">
                  TGE Price &gt; ${resellPrice.toFixed(2)}
                </p>
                <p className="text-sm font-normal leading-5 text-[#5bd197]">
                  Your Resell will be in profit
                </p>
              </div>
            </div>

            {/* Default / cap scenario */}
            <div className="flex flex-col gap-2 border-t border-[#2e2e34] p-4">
              <p className="text-sm font-medium leading-5 text-[#f9f9fa]">
                TGE Price ≥ ${defaultThreshold.toFixed(2)} (+100% from Original Price)
              </p>
              <p className="text-sm font-normal leading-5 text-[#b4b4ba]">
                The original seller will likely NOT settle,{' '}
                <span className="font-medium text-[#fd5e67]">you only receive xxx collateral</span>{' '}
                from original buyer &amp; seller → Cap profit ={' '}
                <span className="font-medium text-[#fd5e67]">{capProfitPct}%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex cursor-pointer items-start gap-2">
          <div className="flex items-center justify-center p-0.5 shrink-0">
            <div
              className={`flex size-4 items-center justify-center rounded border-2 transition-colors ${
                confirmed ? 'border-[#f9f9fa] bg-[#f9f9fa]' : 'border-[#44444b] bg-[#252527]'
              }`}
              onClick={() => setConfirmed(!confirmed)}
            >
              {confirmed && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0a0a0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm font-medium leading-5 text-[#f9f9fa]">
            Yes, I understand the risks of buying this Resell Position.
          </span>
        </label>

        {/* Buttons — Cancel + Buy Anyway, gap-4 (16px) */}
        <div className="flex gap-4">
          <button
            onClick={handleClose}
            className="flex flex-1 h-11 items-center justify-center rounded-[10px] bg-[#252527] px-5 text-base font-medium leading-6 text-[#f9f9fa] transition-colors hover:bg-[#2e2e34] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!confirmed}
            className={`flex flex-1 h-11 items-center justify-center rounded-[10px] px-5 text-base font-medium leading-6 transition-colors ${
              confirmed
                ? 'bg-[#16c284] text-[#f9f9fa] hover:opacity-90 cursor-pointer'
                : 'bg-[#16c284] cursor-not-allowed opacity-40 text-[#f9f9fa]'
            }`}
          >
            Buy Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
