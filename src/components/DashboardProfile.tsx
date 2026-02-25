import { useState } from 'react';
import type { LinkedWallet } from '../types';

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="5.5" y="5.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1" />
      <path d="M10.5 5.5V4C10.5 3.17 9.83 2.5 9 2.5H4C3.17 2.5 2.5 3.17 2.5 4V9C2.5 9.83 3.17 10.5 4 10.5H5.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 7H14" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11" cy="9.5" r="1" fill="currentColor" />
    </svg>
  );
}

function ExternalArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface DashboardProfileProps {
  walletShort: string;
  totalTradingVol: string;
  discountTier: string;
  xWhalesHolding: number;
  linkedWallets: LinkedWallet[];
}

export default function DashboardProfile({
  walletShort,
  totalTradingVol,
  discountTier,
  xWhalesHolding,
  linkedWallets,
}: DashboardProfileProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.03)] px-5 py-4">
      {/* Left: Avatar + Wallet Info + Stats */}
      <div className="flex items-center gap-8">
        {/* Avatar + Wallet */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#16c284] to-[#0a8a5e]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="8" r="4" fill="white" opacity="0.9" />
              <path d="M3 18C3 14.13 6.13 11 10 11C13.87 11 17 14.13 17 18" stroke="white" strokeWidth="1.5" opacity="0.9" />
            </svg>
          </div>
          {/* Wallet info */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-medium text-[#f9f9fa]">{walletShort}</span>
              <button
                onClick={() => handleCopy(walletShort)}
                className="text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
                title={copied === walletShort ? 'Copied!' : 'Copy address'}
              >
                <CopyIcon />
              </button>
            </div>
            <button className="flex items-center gap-1 text-xs text-[#7a7a83] transition-colors hover:text-[#f9f9fa]">
              Open in Explorer <ExternalArrow />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-start gap-8">
          {/* Total Trading Vol */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#7a7a83]">Total Trading Vol.</span>
            <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{totalTradingVol}</span>
          </div>

          {/* Discount Tier */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#7a7a83]">Discount Tier</span>
            <span className="text-sm font-medium text-[#5bd197]">{discountTier}</span>
          </div>

          {/* XWhales Holding */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#7a7a83]">XWhales Holding</span>
            <div className="flex items-center gap-1.5">
              <div className="flex size-4 items-center justify-center rounded-full bg-[#eab308]">
                <span className="text-[7px] font-bold text-white">W</span>
              </div>
              <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{xWhalesHolding.toFixed(2)}</span>
            </div>
          </div>

          {/* Linked Wallets */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#7a7a83]">Linked Wallets</span>
            <div className="flex items-center gap-4">
              {linkedWallets.map((wallet) => (
                <div key={wallet.address} className="flex items-center gap-1">
                  <div
                    className="flex size-4 items-center justify-center rounded-full"
                    style={{ backgroundColor: wallet.chainColor }}
                  >
                    <span className="text-[6px] font-bold text-white">
                      {wallet.chain === 'ethereum' ? 'E' : wallet.chain === 'solana' ? '◎' : 'S'}
                    </span>
                  </div>
                  <span className="text-sm text-[#f9f9fa] tabular-nums">{wallet.address}</span>
                  <button
                    onClick={() => handleCopy(wallet.address)}
                    className="text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
                  >
                    <CopyIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Link Wallet button */}
      <button className="flex items-center gap-2 rounded-lg bg-[#f9f9fa] px-4 py-2 text-sm font-medium text-[#0a0a0b] transition-colors hover:bg-[#e4e4e6]">
        <WalletIcon />
        Link Wallet
      </button>
    </div>
  );
}
