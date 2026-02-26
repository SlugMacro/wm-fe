import { useState } from 'react';
import type { LinkedWallet } from '../types';
import avatarPng from '../assets/images/avatar.png';
import tokenFeePng from '../assets/images/token-fee.png';
import chainEthereumPng from '../assets/images/chain-ethereum.png';
import chainSolanaPng from '../assets/images/chain-solana.png';
import chainSuiPng from '../assets/images/chain-sui.png';

/* ───── Icons ───── */

function CopyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="8" y="8" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 8V6C16 4.9 15.1 4 14 4H6C4.9 4 4 4.9 4 6V14C4 15.1 4.9 16 6 16H8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ExternalArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WalletLinkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.5" cy="14.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

/* ───── Chain icon map ───── */

const CHAIN_ICONS: Record<string, string> = {
  ethereum: chainEthereumPng,
  solana: chainSolanaPng,
  sui: chainSuiPng,
  sei: chainSuiPng, // fallback
};

/* ───── Props ───── */

interface DashboardProfileProps {
  walletShort: string;
  walletAddress: string;
  totalTradingVol: string;
  discountTier: string;
  xWhalesHolding: number;
  linkedWallets: LinkedWallet[];
}

export default function DashboardProfile({
  walletShort,
  walletAddress,
  totalTradingVol,
  discountTier,
  xWhalesHolding,
  linkedWallets,
}: DashboardProfileProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {/* noop */});
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex items-center gap-4 border-b-4 border-[#1b1b1c] py-6">
      {/* Left: Token info (avatar + wallet + stats) */}
      <div className="flex flex-1 items-center gap-8 overflow-hidden">
        {/* Avatar + Wallet info */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Avatar slot — 44px container, 32px image */}
          <div className="flex size-[44px] items-center justify-center">
            <img src={avatarPng} alt="Avatar" className="size-8 rounded-full object-cover" />
          </div>

          {/* Wallet address + explorer link */}
          <div className="flex flex-col w-[168px]">
            <div className="flex items-center gap-1">
              <span className="text-lg font-medium leading-7 text-[#f9f9fa] tabular-nums">
                {walletShort}
              </span>
              <button
                onClick={() => handleCopy(walletAddress)}
                className="flex items-center p-1 text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
                title={copied === walletAddress ? 'Copied!' : 'Copy address'}
              >
                <CopyIcon />
              </button>
            </div>
            <a
              href={`https://solscan.io/account/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 border-b border-[#252527] self-start text-sm text-[#b4b4ba] transition-colors hover:text-[#f9f9fa] tabular-nums"
            >
              Open in Explorer
              <span className="flex items-center p-0.5">
                <ExternalArrowIcon />
              </span>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 shrink-0">
          {/* Total Trading Vol */}
          <StatItem label="Total Trading Vol." value={totalTradingVol} />

          {/* Discount Tier */}
          <StatItem label="Discount Tier" value={discountTier} valueColor="text-[#5bd197]" />

          {/* XWhales Holding */}
          <div className="flex flex-col">
            <StatLabel>XWhales Holding</StatLabel>
            <div className="flex items-center gap-1 px-0 py-0.5">
              <div className="flex items-center p-0.5">
                <img src={tokenFeePng} alt="XWhales" className="size-4 rounded-full" />
              </div>
              <span className="text-xs text-[#f9f9fa] tabular-nums text-center leading-4">
                {xWhalesHolding.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Linked Wallets */}
          <div className="flex flex-col">
            <StatLabel>Linked Wallets</StatLabel>
            <div className="flex items-center gap-4">
              {linkedWallets.map((wallet) => (
                <div key={wallet.address} className="flex items-center gap-1 rounded-md">
                  <div className="flex items-center p-0.5">
                    <img
                      src={CHAIN_ICONS[wallet.chain] ?? chainSolanaPng}
                      alt={wallet.chain}
                      className="size-4 rounded border-2 border-[#0a0a0b]"
                    />
                  </div>
                  <span className="text-xs text-[#f9f9fa] tabular-nums leading-4">
                    {wallet.address}
                  </span>
                  <button
                    onClick={() => handleCopy(wallet.address)}
                    className="flex items-center p-0.5 text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
                    title={copied === wallet.address ? 'Copied!' : 'Copy'}
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
      <div className="flex items-center justify-end shrink-0">
        <button className="flex items-center gap-1.5 rounded-lg bg-[#f9f9fa] pl-2 pr-4 py-2 text-sm font-medium leading-5 text-[#0a0a0b] transition-colors hover:bg-[#e4e4e6]">
          <span className="flex items-center p-0.5">
            <WalletLinkIcon />
          </span>
          Link Wallet
        </button>
      </div>
    </div>
  );
}

/* ───── Helpers ───── */

function StatLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center py-1.5">
      <span className="border-b border-dashed border-[#2e2e34] text-xs text-[#7a7a83] leading-4">
        {children}
      </span>
    </div>
  );
}

function StatItem({ label, value, valueColor = 'text-[#f9f9fa]' }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex flex-col">
      <StatLabel>{label}</StatLabel>
      <div className="flex items-center justify-center px-0 py-0.5">
        <span className={`text-xs ${valueColor} tabular-nums text-center leading-4`}>
          {value}
        </span>
      </div>
    </div>
  );
}
