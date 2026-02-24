// Local token images (downloaded from Figma design)
import tokenZbt from '../assets/images/token-zbt.png';
import tokenSkate from '../assets/images/token-skate.png';
import tokenEra from '../assets/images/token-era.png';
import tokenGrass from '../assets/images/token-grass.png';
import tokenLoud from '../assets/images/token-loud.png';
import tokenMmt from '../assets/images/token-mmt.png';
import tokenSol from '../assets/images/token-sol.png';
import tokenUsdc from '../assets/images/token-usdc.png';
import tokenUsdt from '../assets/images/token-usdt.png';
import tokenPengu from '../assets/images/token-pengu.png';
import tokenIka from '../assets/images/token-ika.png';
import tokenNexo from '../assets/images/token-nexo.png';
import tokenArc from '../assets/images/token-arc.png';
import tokenDrift from '../assets/images/token-drift.png';

// Chain badge images (downloaded from Figma design)
import chainSolana from '../assets/images/chain-solana.png';
import chainEthereum from '../assets/images/chain-ethereum.png';
import chainSui from '../assets/images/chain-sui.png';

// Token images map — local files from Figma design
const TOKEN_IMAGES: Record<string, string> = {
  ZBT: tokenZbt,
  SKATE: tokenSkate,
  ERA: tokenEra,
  GRASS: tokenGrass,
  LOUD: tokenLoud,
  MMT: tokenMmt,
  SOL: tokenSol,
  USDC: tokenUsdc,
  USDT: tokenUsdt,
  PENGU: tokenPengu,
  IKA: tokenIka,
  NEXO: tokenNexo,
  ARC: tokenArc,
  DRIFT: tokenDrift,
};

// Fallback brand colors for tokens without local images
const TOKEN_COLORS: Record<string, string> = {
  XPL: '#eab308',
  PTB: '#ec4899',
  ME: '#14b8a6',
  MERL: '#8b5cf6',
  NEXO: '#2563eb',
  KARAK: '#f59e0b',
  METEORA: '#6d28d9',
  KARAD: '#d946ef',
  ARC: '#22c55e',
  DRIFT: '#e040fb',
  PYTH: '#7c3aed',
  RENDER: '#ef4444',
  ONDO: '#1e40af',
  WEN: '#f97316',
  JUP: '#16c284',
  TIA: '#7c3aed',
  BONK: '#f59e0b',
  SEI: '#991b1b',
  BLUR: '#f97316',
  ARB: '#2563eb',
  OP: '#ef4444',
  APT: '#000000',
  SUI: '#4da2ff',
};

// Chain badge images map
const CHAIN_IMAGES: Record<string, string> = {
  solana: chainSolana,
  ethereum: chainEthereum,
  sui: chainSui,
};

interface TokenIconProps {
  symbol: string;
  chain?: string;
  size?: 'sm' | 'md' | 'lg';
  showChain?: boolean;
}

const SIZES = {
  sm: { container: 'size-6', image: 'size-5', badge: 'size-3', badgeText: 'text-[5px]', text: 'text-[8px]' },
  md: { container: 'size-[44px]', image: 'size-9', badge: 'size-4', badgeText: 'text-[6px]', text: 'text-[10px]' },
  lg: { container: 'size-12', image: 'size-10', badge: 'size-5', badgeText: 'text-[7px]', text: 'text-xs' },
};

export default function TokenIcon({ symbol, chain, size = 'md', showChain = true }: TokenIconProps) {
  const s = SIZES[size];
  const tokenKey = symbol.toUpperCase();
  const imageUrl = TOKEN_IMAGES[tokenKey];
  const color = TOKEN_COLORS[tokenKey] || '#4b5563';
  const chainKey = chain?.toLowerCase() || '';
  const chainImage = CHAIN_IMAGES[chainKey];

  return (
    <div className={`relative ${s.container} shrink-0 flex items-center justify-center`}>
      {/* Token image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={symbol}
          className={`${s.image} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${s.image} rounded-full flex items-center justify-center`}
          style={{ backgroundColor: color }}
        >
          <span className={`${s.text} font-bold text-white`}>
            {tokenKey.charAt(0)}
          </span>
        </div>
      )}

      {/* Chain badge - bottom left (Figma: rounded-[4px], border-2 #0a0a0b) */}
      {showChain && chain && chainImage && (
        <div className="absolute bottom-0 left-0">
          <img
            src={chainImage}
            alt={chain}
            className={`${s.badge} rounded-[4px] border-2 border-[#0a0a0b] object-cover`}
          />
        </div>
      )}
    </div>
  );
}
