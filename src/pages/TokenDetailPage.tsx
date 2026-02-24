import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import TokenMarketHeader from '../components/TokenMarketHeader';
import PriceChart from '../components/PriceChart';
import OrderBook from '../components/OrderBook';
import TradePanel from '../components/TradePanel';
import MyOrders from '../components/MyOrders';
import DetailRecentTrades from '../components/DetailRecentTrades';
import BottomStats from '../components/BottomStats';
import type { OrderBookEntry } from '../types';
import {
  tokenDetails,
  defaultTokenId,
  generateBuyOrders,
  generateSellOrders,
  generatePriceData,
  myFilledOrders,
  myOpenOrders,
} from '../mock-data/tokenDetail';

export default function TokenDetailPage() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const token = tokenDetails[tokenId ?? defaultTokenId] ?? tokenDetails[defaultTokenId];

  const [selectedOrder, setSelectedOrder] = useState<{ order: OrderBookEntry; side: 'buy' | 'sell' } | null>(null);
  const [flashedOrderId, setFlashedOrderId] = useState<string | null>(null);

  // Orders as mutable state — updated when trades execute
  const [buyOrders, setBuyOrders] = useState<OrderBookEntry[]>(() =>
    generateBuyOrders(token.price, token.chain)
  );
  const [sellOrders, setSellOrders] = useState<OrderBookEntry[]>(() =>
    generateSellOrders(token.price, token.chain)
  );
  const priceData = useMemo(() => generatePriceData(), []);

  // When a trade executes in Recent Trades, update a matching order's fill
  const handleTradeExecuted = useCallback((side: 'Buy' | 'Sell') => {
    const setOrders = side === 'Buy' ? setBuyOrders : setSellOrders;

    setOrders(prevOrders => {
      // Find eligible orders: not FULL, not already 100% filled
      const eligible = prevOrders
        .map((order, index) => ({ order, index }))
        .filter(({ order }) => order.fillType !== 'FULL' && order.fillPercent < 100);

      if (eligible.length === 0) return prevOrders;

      // Pick a random eligible order
      const chosen = eligible[Math.floor(Math.random() * eligible.length)];
      const increment = Math.random() * 25 + 15; // 15-40% increment
      const newFillPercent = Math.min(100, chosen.order.fillPercent + increment);
      const newFilledAmount = (newFillPercent / 100) * chosen.order.totalAmount;

      const updated = [...prevOrders];
      updated[chosen.index] = {
        ...chosen.order,
        fillPercent: newFillPercent,
        filledAmount: newFilledAmount,
      };

      // Flash the affected order
      setFlashedOrderId(chosen.order.id);
      setTimeout(() => setFlashedOrderId(null), 600);

      // If order hit 100%, schedule removal after fade-out animation
      if (newFillPercent >= 100) {
        const orderId = chosen.order.id;
        setTimeout(() => {
          setOrders(prev => prev.filter(o => o.id !== orderId));
        }, 800);
      }

      return updated;
    });
  }, []);

  // Clear selected order if it gets removed from the book
  useEffect(() => {
    if (selectedOrder) {
      const allOrders = selectedOrder.side === 'buy' ? buyOrders : sellOrders;
      if (!allOrders.find(o => o.id === selectedOrder.order.id)) {
        setSelectedOrder(null);
      }
    }
  }, [buyOrders, sellOrders, selectedOrder]);

  const breadcrumbItems = [
    { label: 'Whales.Market', to: '/markets' },
    { label: token.category, to: '/markets' },
    { label: token.tokenSymbol },
  ];

  const handleSelectOrder = (order: OrderBookEntry, side: 'buy' | 'sell') => {
    // Toggle off if same order is clicked again
    if (selectedOrder?.order.id === order.id) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder({ order, side });
    }
  };

  // Determine collateral token based on chain
  const collateralToken = token.chain === 'ethereum' ? 'ETH' : token.chain === 'sui' ? 'SUI' : 'SOL';

  return (
    <div className="mx-auto max-w-[1440px] px-12">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Market Header */}
      <TokenMarketHeader token={token} />

      {/* Main content: left + right columns */}
      <div className="flex">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          {/* Chart */}
          <div className="pt-4">
            <PriceChart
              data={priceData}
              currentPrice={token.price}
              priceChange={token.priceChange}
            />
          </div>

          {/* Order Book */}
          <div className="pt-4">
            <OrderBook
              buyOrders={buyOrders}
              sellOrders={sellOrders}
              onSelectOrder={handleSelectOrder}
              selectedOrderId={selectedOrder?.order.id ?? null}
              tokenSymbol={token.tokenSymbol}
              flashedOrderId={flashedOrderId}
            />
          </div>

          {/* Recent Trades */}
          <div className="pt-4">
            <DetailRecentTrades tokenSymbol={token.tokenSymbol} chain={token.chain} onTradeExecuted={handleTradeExecuted} />
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 w-px shrink-0 bg-[#1b1b1c]" />

        {/* Right column */}
        <div className="w-[384px] shrink-0">
          {/* Trade Panel */}
          <div className="pt-4">
            <TradePanel
              tokenSymbol={token.tokenSymbol}
              selectedOrder={selectedOrder}
              collateralToken={collateralToken}
            />
          </div>

          {/* My Orders */}
          <div className="pt-4">
            <MyOrders
              filledOrders={myFilledOrders}
              openOrders={myOpenOrders}
            />
          </div>
        </div>
      </div>

      {/* Spacer for fixed BottomStats */}
      <div className="h-12" />

      {/* Bottom Stats — fixed to viewport bottom */}
      <BottomStats />
    </div>
  );
}
