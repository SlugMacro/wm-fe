import { useState } from 'react';
import type { LinkedWallet } from '../types';
import avatarPng from '../assets/images/avatar.png';
import tokenFeePng from '../assets/images/token-fee.png';
import chainEthereumPng from '../assets/images/chain-ethereum.png';
import chainSolanaPng from '../assets/images/chain-solana.png';
import chainSuiPng from '../assets/images/chain-sui.png';

/* ───── Icons (outline style — consistent across app) ───── */

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7 0C6.46957 0 5.96086 0.210714 5.58579 0.585786C5.21071 0.960859 5 1.46957 5 2V4H7V2H18V13H16V15H18C18.5304 15 19.0391 14.7893 19.4142 14.4142C19.7893 14.0391 20 13.5304 20 13V2C20 1.46957 19.7893 0.960859 19.4142 0.585786C19.0391 0.210714 18.5304 0 18 0H7ZM2 5C1.46957 5 0.960859 5.21071 0.585786 5.58579C0.210714 5.96086 0 6.46957 0 7V18C0 18.5304 0.210714 19.0391 0.585786 19.4142C0.960859 19.7893 1.46957 20 2 20H13C13.5304 20 14.0391 19.7893 14.4142 19.4142C14.7893 19.0391 15 18.5304 15 18V7C15 6.46957 14.7893 5.96086 14.4142 5.58579C14.0391 5.21071 13.5304 5 13 5H2ZM2 7H13V18H2V7Z" fill="currentColor" />
    </svg>
  );
}

function ExternalArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
    <div className="flex items-center justify-between border-b-[4px] border-[#1b1b1c] py-4">
      {/* Left: Token info (avatar + wallet + stats) */}
      <div className="flex flex-1 items-end gap-8 overflow-visible">
        {/* Avatar + Wallet info */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Avatar slot — 44px container, 32px image */}
          <div className="flex size-[44px] items-center justify-center">
            <img src={avatarPng} alt="Avatar" className="size-8 rounded-full object-cover" />
          </div>

          {/* Wallet address + explorer link */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-lg font-medium leading-7 text-[#f9f9fa] tabular-nums">
                {walletShort}
              </span>
              <button
                onClick={() => handleCopy(walletAddress)}
                className="flex items-center p-0.5 text-[#7a7a83] transition-colors hover:text-[#f9f9fa]"
                title={copied === walletAddress ? 'Copied!' : 'Copy address'}
              >
                <CopyIcon />
              </button>
            </div>
            <a
              href={`https://solscan.io/account/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 border-b border-[#252527] self-start text-xs leading-4 font-normal text-[#7a7a83] transition-colors hover:text-[#f9f9fa] tabular-nums"
            >
              Open in Explorer
              <ExternalArrowIcon />
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8">
          {/* Total Trading Vol */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <span className="text-xs leading-4 font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34] self-start">
              Total Trading Vol.
            </span>
            <span className="text-xs leading-4 font-normal tabular-nums text-[#f9f9fa]">
              {totalTradingVol}
            </span>
          </div>

          {/* Discount Tier */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <span className="text-xs leading-4 font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34] self-start">
              Discount Tier
            </span>
            <span className="text-xs leading-4 font-normal tabular-nums text-[#5bd197]">
              {discountTier}
            </span>
          </div>

          {/* XWhales Holding */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <span className="text-xs leading-4 font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34] self-start">
              XWhales Holding
            </span>
            <div className="flex items-center gap-1">
              <img src={tokenFeePng} alt="XWhales" className="size-4 rounded-full" />
              <span className="text-xs leading-4 font-normal tabular-nums text-[#f9f9fa]">
                {xWhalesHolding.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Linked Wallets */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <span className="text-xs leading-4 font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34] self-start">
              Linked Wallets
            </span>
            <div className="flex items-center gap-4">
              {linkedWallets.map((wallet) => (
                <div key={wallet.address} className="flex items-center gap-1">
                  <img
                    src={CHAIN_ICONS[wallet.chain] ?? chainSolanaPng}
                    alt={wallet.chain}
                    className="size-4 rounded border-2 border-[#0a0a0b]"
                  />
                  <span className="text-xs leading-4 font-normal tabular-nums text-[#f9f9fa]">
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
      <div className="flex items-center gap-3 shrink-0">
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
