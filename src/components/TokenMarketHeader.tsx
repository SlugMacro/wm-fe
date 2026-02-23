import { useState } from 'react';
import type { TokenDetail } from '../types';

const chainIcons: Record<string, string> = {
  solana: '◎',
  ethereum: '⟠',
  sui: '💧',
};

const chainColors: Record<string, string> = {
  solana: '#9945ff',
  ethereum: '#627eea',
  sui: '#4da2ff',
};

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4.5 6.5L8 10L11.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatSettleTime(settleTime: string | null): string {
  if (!settleTime) return 'TBA';
  const date = new Date(settleTime);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

function formatVol(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${value.toFixed(2)}`;
}

export default function TokenMarketHeader({ token }: { token: TokenDetail }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const isPositive = token.priceChange >= 0;

  const stats = [
    {
      label: '24h Vol.',
      value: formatVol(token.volume24h),
      change: token.volumeChange24h !== 0 ? `+${token.volumeChange24h.toFixed(2)}%` : undefined,
      changeColor: token.volumeChange24h >= 0 ? 'text-[#5bd197]' : 'text-[#fd5e67]',
    },
    {
      label: 'Total Vol.',
      value: formatVol(token.totalVolume),
    },
    {
      label: 'Implied FDV',
      value: token.impliedFdv,
      dashed: true,
    },
    {
      label: 'Settle Time (UTC)',
      value: formatSettleTime(token.settleTime),
      dashed: true,
    },
  ];

  return (
    <div className="flex items-start justify-between border-b-4 border-[#1b1b1c] pb-6">
      {/* Left: Token info + stats */}
      <div className="flex items-center gap-8">
        {/* Token icon + name */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#252527] text-sm font-bold text-[#f9f9fa]">
              {token.tokenSymbol.charAt(0)}
            </div>
            <div
              className="absolute -bottom-0.5 -left-0.5 flex size-4 items-center justify-center rounded text-[8px]"
              style={{ backgroundColor: chainColors[token.chain] }}
            >
              {chainIcons[token.chain]}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#f9f9fa]">{token.tokenSymbol}</span>
            <div className="flex items-center gap-2">
              <div
                className="flex size-4 items-center justify-center rounded text-[8px]"
                style={{ backgroundColor: chainColors[token.chain] }}
              >
                {chainIcons[token.chain]}
              </div>
              <span className="text-sm font-normal text-[#7a7a83]">{token.subtitle}</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <span className="text-lg font-medium text-[#f9f9fa] tabular-nums">
            ${token.price.toFixed(4)}
          </span>
          <span className={`text-xs font-normal tabular-nums ${isPositive ? 'text-[#5bd197]' : 'text-[#fd5e67]'}`}>
            {isPositive ? '+' : ''}{token.priceChange.toFixed(2)}%
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-start gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className={`text-xs font-normal text-[#7a7a83] ${stat.dashed ? 'border-b border-dashed border-[#2e2e34]' : ''}`}>
                {stat.label}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-normal text-[#f9f9fa] tabular-nums">{stat.value}</span>
                {stat.change && (
                  <span className={`text-xs font-normal tabular-nums ${stat.changeColor}`}>{stat.change}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Buttons */}
      <div className="flex items-center gap-3 pt-1.5">
        {/* About token button */}
        <div className="flex items-center">
          <button
            onClick={() => setAboutOpen(!aboutOpen)}
            className="flex items-center gap-2 rounded-l-lg border border-[#252527] px-4 py-2 text-sm font-medium text-[#f9f9fa] transition-colors hover:border-[#3a3a3d]"
          >
            About {token.tokenSymbol}
            <ExternalLinkIcon />
          </button>
          <button
            className="flex items-center justify-center rounded-r-lg border border-l-0 border-[#252527] p-2 text-[#7a7a83] transition-colors hover:border-[#3a3a3d]"
          >
            <ChevronDownIcon />
          </button>
        </div>

        {/* Divider */}
        <div className="h-[18px] w-px bg-[#252527]" />

        {/* Create Order */}
        <button className="flex items-center justify-center rounded-lg bg-[#f9f9fa] px-4 py-2 text-sm font-medium text-[#0a0a0b] transition-opacity hover:opacity-90">
          Create Order
        </button>
      </div>
    </div>
  );
}
