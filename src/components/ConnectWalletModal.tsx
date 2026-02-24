import { useState, useEffect, useCallback } from 'react';

import chainEvmPng from '../assets/images/chain-evm.png';
import chainSolanaPng from '../assets/images/chain-solana.png';
import chainStarknetPng from '../assets/images/chain-starknet.png';
import chainTonPng from '../assets/images/chain-ton.png';
import chainSuiPng from '../assets/images/chain-sui.png';
import chainAptosPng from '../assets/images/chain-aptos.png';
import walletMetamaskPng from '../assets/images/wallet-metamask.png';
import walletPhantomPng from '../assets/images/wallet-phantom.png';
import walletPhantomSolanaPng from '../assets/images/wallet-phantom-solana.png';
import walletRabbyPng from '../assets/images/wallet-rabby.png';
import walletTrustPng from '../assets/images/wallet-trust.png';
import walletCoinbasePng from '../assets/images/wallet-coinbase.png';
import walletOkxPng from '../assets/images/wallet-okx.png';
import walletSolflarePng from '../assets/images/wallet-solflare.png';

/* ───── Types ───── */

interface Network {
  id: string;
  name: string;
  icon: string;
  selectedLabel?: string;
}

interface Wallet {
  name: string;
  icon: string;
  installUrl?: string;
  connectable?: boolean;
}

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

/* ───── Data ───── */

const networks: Network[] = [
  { id: 'evm', name: 'EVM', icon: chainEvmPng, selectedLabel: 'Selected to Ethereum Mainnet' },
  { id: 'solana', name: 'Solana', icon: chainSolanaPng },
  { id: 'starknet', name: 'Starknet', icon: chainStarknetPng },
  { id: 'ton', name: 'Ton', icon: chainTonPng },
  { id: 'sui', name: 'Sui', icon: chainSuiPng },
  { id: 'aptos', name: 'Aptos', icon: chainAptosPng },
];

const walletsByNetwork: Record<string, Wallet[]> = {
  evm: [
    { name: 'Metamask', icon: walletMetamaskPng, connectable: true },
    { name: 'Rabby', icon: walletRabbyPng, installUrl: 'https://rabby.io/' },
    { name: 'Trust', icon: walletTrustPng, connectable: true },
    { name: 'Coinbase', icon: walletCoinbasePng, connectable: true },
    { name: 'OKX', icon: walletOkxPng, connectable: true },
  ],
  solana: [
    { name: 'Phantom', icon: walletPhantomSolanaPng, connectable: true },
    { name: 'Solflare', icon: walletSolflarePng, installUrl: 'https://solflare.com/' },
  ],
  starknet: [
    { name: 'Phantom', icon: walletPhantomPng, connectable: true },
  ],
  ton: [
    { name: 'Phantom', icon: walletPhantomPng, connectable: true },
  ],
  sui: [
    { name: 'Phantom', icon: walletPhantomPng, connectable: true },
  ],
  aptos: [
    { name: 'Phantom', icon: walletPhantomPng, connectable: true },
  ],
};

/* ───── Close Icon ───── */

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 6.586l4.243-4.243 1.414 1.414L9.414 8l4.243 4.243-1.414 1.414L8 9.414l-4.243 4.243-1.414-1.414L6.586 8 2.343 3.757l1.414-1.414L8 6.586z" fill="currentColor" />
    </svg>
  );
}

/* ───── Component ───── */

export default function ConnectWalletModal({ isOpen, onClose, onConnect }: ConnectWalletModalProps) {
  const [activeNetwork, setActiveNetwork] = useState('evm');
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Handle open animation
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

  const handleWalletClick = useCallback((wallet: Wallet) => {
    if (wallet.installUrl) {
      window.open(wallet.installUrl, '_blank');
      return;
    }
    if (wallet.connectable) {
      setVisible(false);
      setTimeout(onConnect, 200);
    }
  }, [onConnect]);

  if (!isOpen && !animating) return null;

  const currentNetwork = networks.find((n) => n.id === activeNetwork);
  const wallets = walletsByNetwork[activeNetwork] ?? [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-[672px] rounded-3xl bg-[#1b1b1c] p-6 shadow-[0_0_32px_rgba(0,0,0,0.2)] transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="flex-1 text-center text-lg font-medium text-[#f9f9fa]">
            Connect Wallet
          </p>
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 flex items-center justify-center rounded-full bg-[#252527] p-2 text-[#f9f9fa] transition-colors hover:bg-[#2e2e34]"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Network Tabs */}
        <div className="mb-6 flex items-center gap-0 overflow-hidden rounded-[10px] border border-[#252527] p-1">
          {networks.map((network) => (
            <button
              key={network.id}
              onClick={() => setActiveNetwork(network.id)}
              className={`flex h-11 items-center gap-2 rounded-lg pl-3 pr-6 py-3 transition-colors ${
                activeNetwork === network.id
                  ? 'bg-[#2e2e34]'
                  : 'hover:bg-[#252527]/50'
              }`}
            >
              <img
                src={network.icon}
                alt={network.name}
                className="size-5 rounded object-cover"
              />
              <span className="text-sm font-medium text-[#f9f9fa] whitespace-nowrap">
                {network.name}
              </span>
            </button>
          ))}
        </div>

        {/* Choose Wallet */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#7a7a83]">Choose Wallet</span>
            {currentNetwork?.selectedLabel && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#5bd197]">{currentNetwork.selectedLabel}</span>
                <img
                  src={currentNetwork.icon}
                  alt=""
                  className="size-4 rounded object-cover"
                />
              </div>
            )}
          </div>

          {/* Wallet Grid */}
          <div className="flex flex-wrap gap-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.name}
                onClick={() => !wallet.installUrl && handleWalletClick(wallet)}
                className="flex w-[calc(50%-8px)] items-center gap-4 rounded-xl border border-[#252527] p-4 transition-colors cursor-pointer hover:bg-[#252527]"
              >
                <img
                  src={wallet.icon}
                  alt={wallet.name}
                  className="size-9 rounded-lg object-cover"
                />
                <span className="flex-1 text-left text-base font-medium text-[#f9f9fa]">
                  {wallet.name}
                </span>
                {wallet.installUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(wallet.installUrl, '_blank');
                    }}
                    className="rounded-md bg-[#252527] px-3 py-1.5 text-xs font-medium text-[#7a7a83] transition-colors hover:bg-[#3a3a3d] hover:text-[#f9f9fa] active:bg-[#444448]"
                  >
                    Install
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
