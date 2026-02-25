import { useState, useEffect, useCallback } from 'react';
import type { OrderBookEntry } from '../types';
import TokenIcon from './TokenIcon';

interface OrderInfoModalProps {
  isOpen: boolean;
  order: OrderBookEntry;
  side: 'buy' | 'sell';
  tokenSymbol: string;
  tokenName: string;
  chain: string;
  isOwner?: boolean;
  onClose: () => void;
}

/** Map chain to block explorer name + base URL */
function getExplorer(chain: string): { name: string; url: string } {
  switch (chain) {
    case 'ethereum': return { name: 'Etherscan', url: 'https://etherscan.io' };
    case 'sui': return { name: 'SuiScan', url: 'https://suiscan.xyz' };
    default: return { name: 'Solscan', url: 'https://solscan.io' };
  }
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
      <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const infoCellTooltips: Record<string, string> = {
  'Price': 'The unit price per token for this order.',
  'Fill Type': 'Determines whether the order must be filled entirely (Full) or can be partially filled (Partial).',
  'Amount': 'The total number of tokens being offered in this order.',
  'For': 'The total collateral amount required to fulfill this order.',
  'Filled Amount': 'How many tokens have already been matched and filled by other traders.',
  'Remaining Amount': 'Tokens still available to be filled in this order.',
  'Settle Starts': 'When the settlement period begins. Tokens must be delivered after this time.',
  'Settle Ends': 'The deadline for settlement. Unfulfilled orders will have collateral refunded after this date.',
  'Order TX': 'The on-chain transaction hash for when this order was created.',
  'Countdown': 'Time remaining until the settlement period begins.',
};

function InfoCell({ label, children }: { label: string; children: React.ReactNode }) {
  const tooltip = infoCellTooltips[label];
  return (
    <div className="flex flex-1 flex-col gap-2 p-4">
      {tooltip ? (
        <span className="relative group cursor-help inline-flex w-fit">
          <span className="text-xs font-normal leading-4 text-[#b4b4ba] border-b border-dashed border-[#44444b]">
            {label}
          </span>
          <span className="absolute left-0 bottom-full mb-2 w-56 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-[150]">
            {tooltip}
          </span>
        </span>
      ) : (
        <span className="text-xs font-normal leading-4 text-[#b4b4ba] border-b border-dashed border-[#44444b] w-fit">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1 text-sm font-medium leading-5 text-[#f9f9fa] tabular-nums">
        {children}
      </div>
    </div>
  );
}

/** Mock wallet address — same as in Header AvatarDropdown & dashboard profile */
const MY_WALLET_SHORT = 'GQ98...iA5Y';

/** Simple hash from string → number for deterministic randomness */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const HEX = '0123456789abcdef';

/** Generate a deterministic shortened wallet address based on order ID and chain */
function generateWalletShort(orderId: string, chain: string): string {
  const h = hashStr(orderId);
  if (chain === 'ethereum' || chain === 'sui') {
    // 0x prefixed hex: 0xAbCd...eF12
    const pick = (seed: number) => HEX[seed % HEX.length];
    const front = Array.from({ length: 4 }, (_, i) => pick(h * (i + 1) + i * 7)).join('');
    const back = Array.from({ length: 4 }, (_, i) => pick(h * (i + 5) + i * 13)).join('');
    return `0x${front}...${back}`;
  }
  // Solana: Base58 chars like GH3k...Ui81
  const pick58 = (seed: number) => BASE58[seed % BASE58.length];
  const front = Array.from({ length: 4 }, (_, i) => pick58(h * (i + 1) + i * 7)).join('');
  const back = Array.from({ length: 4 }, (_, i) => pick58(h * (i + 5) + i * 13)).join('');
  return `${front}...${back}`;
}

export default function OrderInfoModal({
  isOpen,
  order,
  side,
  tokenSymbol,
  tokenName,
  chain,
  isOwner = false,
  onClose,
}: OrderInfoModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Animation — same pattern as ConnectWalletModal
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

  if (!isOpen && !animating) return null;

  const isBuy = side === 'buy';
  const amountK = order.amount / 1000;
  const amountFormatted = amountK >= 1 ? `${amountK.toFixed(2)}K` : order.amount.toFixed(0);
  const filledK = order.filledAmount / 1000;
  const filledFormatted = order.filledAmount === 0 ? '0' : (filledK >= 1 ? `${filledK.toFixed(2)}K` : order.filledAmount.toFixed(0));
  const remaining = order.totalAmount - order.filledAmount;
  const remainingK = remaining / 1000;
  const remainingFormatted = remaining === 0 ? '0' : (remainingK >= 1 ? `${remainingK.toFixed(2)}K` : remaining.toFixed(0));
  const fillTypeLabel = order.fillType ?? (order.isResell ? 'RESELL' : 'Partial');
  const explorer = getExplorer(chain);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-[672px] flex flex-col gap-6 rounded-3xl bg-[#1b1b1c] p-6 shadow-[0_0_32px_rgba(0,0,0,0.2)] transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          {/* Close button — top right */}
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 flex items-center justify-center rounded-full bg-[#252527] p-2 text-[#f9f9fa] transition-colors hover:bg-[#2e2e34]"
          >
            <CloseIcon />
          </button>

          {/* Token icon */}
          <TokenIcon symbol={tokenSymbol} chain={chain} size="md" showChain />

          {/* Token info */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium leading-5 text-[#f9f9fa]">{tokenSymbol}</span>
            <span className="text-sm font-normal leading-5 text-[#7a7a83]">{tokenName}</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6">
          {/* Message */}
          <p className="text-sm font-normal leading-5 text-[#b4b4ba]">
            <span>{isOwner ? MY_WALLET_SHORT : generateWalletShort(order.id, chain)} is </span>
            <span className={isBuy ? 'text-[#5bd197]' : 'text-[#fd5e67]'}>
              {isBuy ? 'buying' : 'selling'}
            </span>
            <span> </span>
            <span className="text-[#f9f9fa]">{amountFormatted} {tokenSymbol}</span>
            <span> for </span>
            <span className="text-[#f9f9fa]">{order.collateral} {order.collateralToken}</span>
          </p>

          {/* Review info grid */}
          <div className="rounded-[10px] border border-[#252527]">
            {/* Row 1: Price | Fill Type */}
            <div className="flex border-b border-[#252527]">
              <div className="flex-1 border-r border-[#252527]">
                <InfoCell label="Price">
                  <span>${order.price.toFixed(4)}</span>
                </InfoCell>
              </div>
              <div className="flex-1">
                <InfoCell label="Fill Type">
                  <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-2 py-1 text-[10px] font-medium uppercase leading-3 text-[#7a7a83]">
                    {fillTypeLabel}
                  </span>
                </InfoCell>
              </div>
            </div>

            {/* Row 2: Amount | For */}
            <div className="flex border-b border-[#252527]">
              <div className="flex-1 border-r border-[#252527]">
                <InfoCell label="Amount">
                  <span>{amountFormatted}</span>
                  <TokenIcon symbol={tokenSymbol} size="xs" showChain={false} />
                </InfoCell>
              </div>
              <div className="flex-1">
                <InfoCell label="For">
                  <span>{order.collateral}</span>
                  <TokenIcon symbol={order.collateralToken} size="xs" showChain={false} />
                </InfoCell>
              </div>
            </div>

            {/* Row 3: Filled Amount | Remaining Amount */}
            <div className="flex border-b border-[#252527]">
              <div className="flex-1 border-r border-[#252527]">
                <InfoCell label="Filled Amount">
                  <span>{filledFormatted}</span>
                  <TokenIcon symbol={tokenSymbol} size="xs" showChain={false} />
                </InfoCell>
              </div>
              <div className="flex-1">
                <InfoCell label="Remaining Amount">
                  <span>{remainingFormatted}</span>
                  <TokenIcon symbol={tokenSymbol} size="xs" showChain={false} />
                </InfoCell>
              </div>
            </div>

            {/* Row 4: Settle Starts | Settle Ends */}
            <div className="flex border-b border-[#252527]">
              <div className="flex-1 border-r border-[#252527]">
                <InfoCell label="Settle Starts">
                  <span>10/08/2025 10:24 AM</span>
                </InfoCell>
              </div>
              <div className="flex-1">
                <InfoCell label="Settle Ends">
                  <span>12/08/2025 10:24 AM</span>
                </InfoCell>
              </div>
            </div>

            {/* Row 5: Order TX | Countdown */}
            <div className="flex">
              <div className="flex-1 border-r border-[#252527]">
                <InfoCell label="Order TX">
                  <a
                    href={explorer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#f9f9fa] hover:opacity-80 transition-opacity"
                  >
                    <span>{explorer.name}</span>
                    <ExternalLinkIcon />
                  </a>
                </InfoCell>
              </div>
              <div className="flex-1">
                <InfoCell label="Countdown">
                  <span>Not Started</span>
                </InfoCell>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
