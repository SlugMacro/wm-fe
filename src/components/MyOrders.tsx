import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MyOrder, MyOrdersTab, OrderBookEntry } from '../types';
import { useWallet } from '../hooks/useWalletContext';
import CloseOrderModal from './CloseOrderModal';

function RightArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 12L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 7.5V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16.5 12H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.5 12H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M19 7V5.5C19 4.67 18.33 4 17.5 4H5.5C4.67 4 4 4.67 4 5.5V18.5C4 19.33 4.67 20 5.5 20H18.5C19.33 20 20 19.33 20 18.5V9H18.5C17.67 9 17 9.67 17 10.5V11.5C17 12.33 17.67 13 18.5 13H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18.5" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

function EmptyOrderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M9 5H5C4.44772 5 4 5.44772 4 6V18C4 18.5523 4.44772 19 5 19H19C19.5523 19 20 18.5523 20 18V6C20 5.44772 19.5523 5 19 5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 5L12 2L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 15.5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 4C14.5 6.5 14.5 17.5 12 20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 4C9.5 6.5 9.5 17.5 12 20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 9.5H19.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 14.5H19.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const CHAIN_NAMES: Record<string, string> = {
  solana: 'Solana',
  ethereum: 'Ethereum',
  sui: 'Sui',
};

interface OrderItemProps {
  order: MyOrder;
  isFilled?: boolean;
  onClose?: (order: MyOrder) => void;
}

function OrderItem({ order, isFilled, onClose }: OrderItemProps) {
  const isBuy = order.side === 'Buy';
  const isResellOrder = !isFilled && order.hasBadge === 'RS';
  const isOpenOrder = !isFilled;

  // Determine side label + color
  let sideLabel: string = order.side;
  let sideColor = isBuy ? 'text-[#5bd197]' : 'text-[#fd5e67]';
  if (isResellOrder) {
    sideLabel = 'Resell';
    sideColor = 'text-[#facc15]';
  }

  // Determine price row label + format
  const isResellPriceLayout = order.entryPrice != null && order.originalPrice != null;
  const priceLabel = isResellOrder
    ? 'Price / Original Price'
    : isResellPriceLayout
      ? 'Your Entry / Original Price'
      : 'Price';

  // Button logic:
  // Filled orders: Buy → "Resell" (yellow theme)
  // Open orders: all → "Close" (ghost pill)
  const showFilledResell = isFilled && isBuy;
  const showOpenButton = isOpenOrder;

  return (
    <div className="flex flex-col gap-3 border-b border-[#1b1b1c] pb-4">
      {/* Row 1: Side + Pair + Badge | Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className={`text-sm font-medium leading-5 ${sideColor}`}>
            {sideLabel}
          </span>
          <span className="text-sm font-medium leading-5 text-[#f9f9fa]">{order.pair}</span>
          {order.hasBadge && (
            <span className="inline-flex items-center justify-center rounded-full bg-[#eab308] px-1.5 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#0a0a0b]">
              {order.hasBadge}
            </span>
          )}
        </div>
        <span className="text-xs leading-4 font-normal text-[#7a7a83] tabular-nums">{order.date}</span>
      </div>

      {/* Row 2+3: Price and Amount info + button */}
      <div className="flex items-end gap-2.5">
        <div className="flex flex-1 flex-col gap-1">
          {/* Price row */}
          <div className="flex items-center gap-1 text-xs leading-4">
            {isResellPriceLayout ? (
              <>
                <span className="text-[#7a7a83]">{priceLabel}</span>
                <span className="text-[#facc15] tabular-nums">${order.entryPrice!.toFixed(4)}</span>
                <span className="text-[#f9f9fa]">/</span>
                <span className="text-[#f9f9fa] tabular-nums">${order.originalPrice!.toFixed(4)}</span>
              </>
            ) : (
              <>
                <span className="text-[#7a7a83]">Price</span>
                <span className="text-[#f9f9fa] tabular-nums">${order.price.toFixed(4)}</span>
              </>
            )}
          </div>

          {/* Amount / Collateral row */}
          <div className="flex items-center gap-1 text-xs leading-4">
            <span className="text-[#7a7a83]">Amount / Collateral</span>
            <span className="text-[#f9f9fa] tabular-nums">{order.amount}</span>
            <span className="text-[#f9f9fa]">/</span>
            <span className="text-[#f9f9fa] tabular-nums">{order.collateral.split(' ')[0]}</span>
            <span className="text-[#7a7a83]">{order.collateral.split(' ')[1]}</span>
          </div>
        </div>

        {/* Filled order: Resell button (yellow theme) */}
        {showFilledResell && (
          <button className="shrink-0 overflow-clip rounded-[4px] bg-[rgba(234,179,8,0.1)] px-3 py-1.5 text-xs font-medium leading-4 text-[#eab308] transition-colors hover:bg-[rgba(234,179,8,0.18)]">
            Resell
          </button>
        )}

        {/* Open order: Close button */}
        {showOpenButton && (
          <button
            onClick={() => onClose?.(order)}
            className="shrink-0 overflow-clip rounded-[4px] bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs font-medium leading-4 text-[rgba(255,255,255,0.9)] transition-colors hover:bg-[rgba(255,255,255,0.14)]"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

/** Convert a MyOrder into a mock OrderBookEntry for CloseOrderModal */
function toOrderBookEntry(order: MyOrder): OrderBookEntry {
  const colParts = order.collateral.split(' ');
  const collateralVal = parseFloat(colParts[0]);
  const collateralToken = (colParts[1] ?? 'SOL') as OrderBookEntry['collateralToken'];
  const amountStr = order.amount.replace(/[^\d.]/g, '');
  const amountNum = parseFloat(amountStr) * (order.amount.includes('K') ? 1000 : 1);
  return {
    id: order.id,
    price: order.entryPrice ?? order.price,
    amount: amountNum,
    amountFormatted: order.amount,
    collateral: collateralVal,
    collateralIcon: '',
    collateralToken,
    fillPercent: 0,
    filledAmount: 0,
    totalAmount: amountNum,
    isResell: order.hasBadge === 'RS',
    originalPrice: order.originalPrice,
  };
}

interface MyOrdersProps {
  filledOrders: MyOrder[];
  openOrders: MyOrder[];
  chain: string;
  tokenSymbol: string;
  onCloseOrder?: (orderId: string) => void;
}

export default function MyOrders({ filledOrders, openOrders, chain, tokenSymbol, onCloseOrder }: MyOrdersProps) {
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState<MyOrdersTab>('filled');
  const [closeModal, setCloseModal] = useState<{ order: MyOrder } | null>(null);

  const isConnected = wallet.isConnected;
  const isWrongNetwork = isConnected && wallet.connectedChain !== chain;
  const showOrders = isConnected && !isWrongNetwork;

  const tabs: { key: MyOrdersTab; label: string; count: number }[] = [
    { key: 'filled', label: 'My Filled Orders', count: showOrders ? filledOrders.length : 0 },
    { key: 'open', label: 'My Open Orders', count: showOrders ? openOrders.length : 0 },
  ];

  const orders = activeTab === 'filled' ? filledOrders : openOrders;

  const handleCloseOrder = (order: MyOrder) => {
    setCloseModal({ order });
  };

  const handleConfirmClose = () => {
    if (closeModal && onCloseOrder) {
      onCloseOrder(closeModal.order.id);
    }
    setCloseModal(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex h-[52px] items-center gap-6 border-b border-[#1b1b1c]">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex h-full flex-col items-center justify-between"
            >
              {/* Top spacer */}
              <div className="h-0.5 w-4" />
              {/* Label + count */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium leading-5 transition-colors ${isActive ? 'text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'}`}>
                  {tab.label}
                </span>
                {showOrders && (
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-[10px] font-medium leading-3 ${
                      isActive
                        ? 'bg-[rgba(22,194,132,0.1)] text-[#5bd197]'
                        : 'bg-[#1b1b1c] text-[#b4b4ba]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </div>
              {/* Bottom indicator */}
              {isActive ? (
                <div className="h-0.5 w-full bg-[#5bd197]" />
              ) : (
                <div className="h-0.5 w-4" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {!isConnected ? (
        <div className="flex h-[240px] flex-col items-center justify-center gap-3 rounded-[10px] border border-[#1b1b1c] px-16">
          <span className="text-[#44444b]">
            <WalletIcon />
          </span>
          <p className="text-center text-xs leading-4 text-[#7a7a83]">
            Connect your wallet
            <br />
            to view your orders
          </p>
          <button
            onClick={() => wallet.openConnectModal(chain)}
            className="mt-1 rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2 text-sm font-medium text-[#b4b4ba] transition-colors hover:bg-[rgba(255,255,255,0.12)] hover:text-[#f9f9fa]"
          >
            Connect Wallet
          </button>
        </div>
      ) : isWrongNetwork ? (
        <div className="flex h-[240px] flex-col items-center justify-center gap-3 rounded-[10px] border border-[#1b1b1c] px-16">
          <span className="text-[#44444b]">
            <NetworkIcon />
          </span>
          <p className="text-center text-xs leading-4 text-[#7a7a83]">
            Switch to <span className="text-[#f9f9fa] font-medium">{CHAIN_NAMES[chain] ?? chain}</span>
            <br />
            to view your orders on this market
          </p>
          <button
            onClick={() => wallet.openConnectModal(chain)}
            className="mt-1 rounded-lg bg-[rgba(255,255,255,0.08)] px-5 py-2 text-sm font-medium text-[#b4b4ba] transition-colors hover:bg-[rgba(255,255,255,0.12)] hover:text-[#f9f9fa]"
          >
            Switch Network
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-[240px] flex-col items-center justify-center gap-3 rounded-[10px] border border-[#1b1b1c] px-16">
          <span className="text-[#44444b]">
            <EmptyOrderIcon />
          </span>
          <p className="text-center text-xs leading-4 text-[#7a7a83]">
            No orders yet.
            <br />
            Start trading to see your history here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.slice(0, 5).map(order => (
            <OrderItem
              key={order.id}
              order={order}
              isFilled={activeTab === 'filled'}
              onClose={handleCloseOrder}
            />
          ))}
        </div>
      )}

      {/* Bottom CTA: Dashboard link */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 rounded-[10px] bg-[#1b1b1c] px-4 py-3 transition-colors hover:bg-[#252527]"
      >
        <span className="shrink-0 text-[#5bd197]">
          <DashboardIcon />
        </span>
        <span className="flex-1 text-xs leading-4 font-normal text-[#5bd197]">
          Visit Dashboard to monitor all Pre-Market orders
        </span>
        <span className="shrink-0 text-[#5bd197]">
          <RightArrowIcon />
        </span>
      </Link>

      {/* Close Order Modal */}
      {closeModal && (
        <CloseOrderModal
          isOpen={!!closeModal}
          order={toOrderBookEntry(closeModal.order)}
          side={closeModal.order.side === 'Sell' ? 'sell' : 'buy'}
          tokenSymbol={tokenSymbol}
          chain={chain}
          onClose={() => setCloseModal(null)}
          onConfirm={handleConfirmClose}
        />
      )}
    </div>
  );
}
