import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface TokenBalance {
  symbol: string;
  amount: number;
}

interface ChainBalances {
  native: TokenBalance;
  tokens: TokenBalance[];
}

interface WalletState {
  isConnected: boolean;
  /** The chain the wallet is currently connected to */
  connectedChain: string;
  /** Native token balance (e.g. SOL) */
  walletBalance: number;
  /** Get balance for a specific token symbol on connected chain */
  getBalance: (symbol: string) => number;
  /** Get all balances for connected chain */
  getChainBalances: () => ChainBalances | null;
  /** Deduct balance for a specific token on a specific chain */
  deductBalance: (chain: string, symbol: string, amount: number) => void;
  /** Open the connect wallet modal, optionally pre-selecting a network */
  openConnectModal: (defaultNetwork?: string) => void;
  closeConnectModal: () => void;
  connect: (chain?: string) => void;
  disconnect: () => void;
  showConnectModal: boolean;
  /** Network ID to pre-select in connect modal (evm, solana, sui, etc.) */
  defaultModalNetwork: string;
}

const WalletContext = createContext<WalletState | null>(null);

/** Map token page chain to connect modal network ID */
function chainToModalNetwork(chain: string): string {
  switch (chain) {
    case 'ethereum': return 'evm';
    case 'solana': return 'solana';
    case 'sui': return 'sui';
    default: return 'solana';
  }
}

/** Map connect modal network ID back to token chain */
function modalNetworkToChain(network: string): string {
  switch (network) {
    case 'evm': return 'ethereum';
    case 'solana': return 'solana';
    case 'sui': return 'sui';
    default: return 'solana';
  }
}

/** Initial mock balances per chain */
const INITIAL_BALANCES: Record<string, ChainBalances> = {
  solana: {
    native: { symbol: 'SOL', amount: 18.32 },
    tokens: [
      { symbol: 'USDC', amount: 293.51 },
      { symbol: 'USDT', amount: 0 },
    ],
  },
  ethereum: {
    native: { symbol: 'ETH', amount: 0.85 },
    tokens: [
      { symbol: 'USDC', amount: 1420.00 },
      { symbol: 'USDT', amount: 500.00 },
    ],
  },
  sui: {
    native: { symbol: 'SUI', amount: 245.60 },
    tokens: [
      { symbol: 'USDC', amount: 88.20 },
      { symbol: 'USDT', amount: 0 },
    ],
  },
};

/** Deep clone balances for mutable state */
function cloneBalances(src: Record<string, ChainBalances>): Record<string, ChainBalances> {
  const out: Record<string, ChainBalances> = {};
  for (const [chain, bal] of Object.entries(src)) {
    out[chain] = {
      native: { ...bal.native },
      tokens: bal.tokens.map(t => ({ ...t })),
    };
  }
  return out;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [connectedChain, setConnectedChain] = useState('solana');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [defaultModalNetwork, setDefaultModalNetwork] = useState('solana');
  const [balances, setBalances] = useState<Record<string, ChainBalances>>(() => cloneBalances(INITIAL_BALANCES));

  const chainBal = balances[connectedChain] ?? balances.solana;
  const walletBalance = isConnected ? chainBal.native.amount : 0;

  const getBalance = useCallback((symbol: string): number => {
    if (!isConnected) return 0;
    const bal = balances[connectedChain] ?? balances.solana;
    if (bal.native.symbol === symbol) return bal.native.amount;
    const token = bal.tokens.find(t => t.symbol === symbol);
    return token?.amount ?? 0;
  }, [isConnected, connectedChain, balances]);

  const getChainBalances = useCallback((): ChainBalances | null => {
    if (!isConnected) return null;
    return balances[connectedChain] ?? balances.solana;
  }, [isConnected, connectedChain, balances]);

  const deductBalance = useCallback((chain: string, symbol: string, amount: number) => {
    setBalances(prev => {
      const chainKey = chain;
      const chainData = prev[chainKey];
      if (!chainData) return prev;

      const updated = { ...prev };
      if (chainData.native.symbol === symbol) {
        updated[chainKey] = {
          ...chainData,
          native: { ...chainData.native, amount: Math.max(0, chainData.native.amount - amount) },
        };
      } else {
        updated[chainKey] = {
          ...chainData,
          tokens: chainData.tokens.map(t =>
            t.symbol === symbol ? { ...t, amount: Math.max(0, t.amount - amount) } : t
          ),
        };
      }
      return updated;
    });
  }, []);

  const openConnectModal = useCallback((defaultNetwork?: string) => {
    if (defaultNetwork) {
      setDefaultModalNetwork(chainToModalNetwork(defaultNetwork));
    }
    setShowConnectModal(true);
  }, []);

  const closeConnectModal = useCallback(() => {
    setShowConnectModal(false);
  }, []);

  const connect = useCallback((chain?: string) => {
    setIsConnected(true);
    if (chain) {
      setConnectedChain(chain);
    } else {
      // Use the current modal network selection when no explicit chain given
      setConnectedChain(modalNetworkToChain(defaultModalNetwork));
    }
    setShowConnectModal(false);
  }, [defaultModalNetwork]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  return (
    <WalletContext.Provider value={{
      isConnected,
      connectedChain,
      walletBalance,
      getBalance,
      getChainBalances,
      deductBalance,
      openConnectModal,
      closeConnectModal,
      connect,
      disconnect,
      showConnectModal,
      defaultModalNetwork,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
