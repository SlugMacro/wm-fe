import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import TokenMarketHeader from '../components/TokenMarketHeader';
import PriceChart from '../components/PriceChart';
import OrderBook from '../components/OrderBook';
import TradePanel from '../components/TradePanel';
import MyOrders from '../components/MyOrders';
import DetailRecentTrades from '../components/DetailRecentTrades';
import BottomStats from '../components/BottomStats';
import type { OrderBookEntry, PriceDataPoint, MyOrder } from '../types';
import { useWallet } from '../hooks/useWalletContext';
import {
  tokenDetails,
  defaultTokenId,
  generateBuyOrders,
  generateSellOrders,
  generatePriceData,
  generateMyFilledOrders,
  generateMyOpenOrders,
} from '../mock-data/tokenDetail';

function TokenDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] px-12 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 py-3">
        <div className="h-3 w-24 rounded bg-[#1b1b1c]" />
        <div className="h-3 w-3 rounded bg-[#1b1b1c]" />
        <div className="h-3 w-16 rounded bg-[#1b1b1c]" />
        <div className="h-3 w-3 rounded bg-[#1b1b1c]" />
        <div className="h-3 w-12 rounded bg-[#1b1b1c]" />
      </div>
      {/* Header skeleton */}
      <div className="flex items-center gap-4 py-3">
        <div className="size-10 rounded-full bg-[#1b1b1c]" />
        <div className="flex flex-col gap-1.5">
          <div className="h-5 w-32 rounded bg-[#1b1b1c]" />
          <div className="h-3 w-48 rounded bg-[#1b1b1c]" />
        </div>
        <div className="ml-auto flex gap-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex flex-col gap-1.5 items-end">
              <div className="h-3 w-16 rounded bg-[#1b1b1c]" />
              <div className="h-4 w-20 rounded bg-[#1b1b1c]" />
            </div>
          ))}
        </div>
      </div>
      {/* Main content columns */}
      <div className="flex">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          {/* Chart skeleton */}
          <div className="pt-4">
            <div className="h-[300px] rounded-[10px] bg-[#1b1b1c]" />
          </div>
          {/* Order book skeleton */}
          <div className="pt-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-5 w-24 rounded bg-[#1b1b1c]" />
              <div className="h-5 w-20 rounded bg-[#1b1b1c]" />
            </div>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center border-b border-[#1b1b1c] h-[52px] px-2" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="h-3 w-16 rounded bg-[#1b1b1c] flex-1" />
                <div className="h-3 w-20 rounded bg-[#1b1b1c]" />
                <div className="h-3 w-16 rounded bg-[#1b1b1c] ml-6" />
              </div>
            ))}
          </div>
        </div>
        {/* Divider */}
        <div className="mx-4 w-px shrink-0 bg-[#1b1b1c]" />
        {/* Right column */}
        <div className="w-[384px] shrink-0 pt-4">
          {/* Trade panel skeleton */}
          <div className="rounded-[10px] border border-[#1b1b1c] p-5">
            <div className="flex gap-2 mb-5">
              <div className="h-9 flex-1 rounded-lg bg-[#1b1b1c]" />
              <div className="h-9 flex-1 rounded-lg bg-[#1b1b1c]" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-[72px] rounded-[10px] bg-[#1b1b1c]" />
              <div className="h-[72px] rounded-[10px] bg-[#1b1b1c]" />
              <div className="h-11 rounded-[10px] bg-[#1b1b1c]" />
            </div>
          </div>
          {/* My orders skeleton */}
          <div className="mt-4">
            <div className="h-5 w-24 rounded bg-[#1b1b1c] mb-3" />
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center border-b border-[#1b1b1c] h-[52px] px-2" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="h-3 w-20 rounded bg-[#1b1b1c] flex-1" />
                <div className="h-3 w-16 rounded bg-[#1b1b1c]" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-12" />
      <BottomStats />
    </div>
  );
}

export default function TokenDetailPage() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const token = tokenDetails[tokenId ?? defaultTokenId] ?? tokenDetails[defaultTokenId];
  const wallet = useWallet();

  const [isPageLoading, setIsPageLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<{ order: OrderBookEntry; side: 'buy' | 'sell' } | null>(null);
  const [flashedOrderId, setFlashedOrderId] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(true);

  // Orders as mutable state — updated when trades execute
  const [buyOrders, setBuyOrders] = useState<OrderBookEntry[]>(() =>
    generateBuyOrders(token.price, token.chain)
  );
  const [sellOrders, setSellOrders] = useState<OrderBookEntry[]>(() =>
    generateSellOrders(token.price, token.chain)
  );
  const [priceData, setPriceData] = useState<PriceDataPoint[]>(() => generatePriceData(token.price, token.chartData));

  // My orders — generated per token (LOUD has no orders for testing empty state)
  const [myFilledOrders, setMyFilledOrders] = useState<MyOrder[]>(() =>
    token.tokenSymbol === 'LOUD' ? [] : generateMyFilledOrders(token.tokenSymbol, token.chain, token.price)
  );
  const [myOpenOrders, setMyOpenOrders] = useState<MyOrder[]>(() =>
    token.tokenSymbol === 'LOUD' ? [] : generateMyOpenOrders(token.tokenSymbol, token.chain, token.price)
  );

  // When a trade executes in Recent Trades, update a matching order's fill AND chart
  const handleTradeExecuted = useCallback((side: 'Buy' | 'Sell') => {
    // Add new price data point to chart — Buy pushes price up, Sell pushes down
    setPriceData(prev => {
      const lastPoint = prev[prev.length - 1];
      const priceShift = side === 'Buy'
        ? Math.random() * 0.0002 + 0.0001
        : -(Math.random() * 0.0002 + 0.0001);
      const newPrice = Math.max(0.001, lastPoint.price + priceShift);
      const newVolume = Math.random() * 150000 + 20000;
      const newPoint: PriceDataPoint = {
        time: new Date().toISOString(),
        price: newPrice,
        volume: newVolume,
      };
      return [...prev, newPoint];
    });

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

  // Live price derived from latest trade data
  const livePrice = useMemo(() => {
    if (priceData.length === 0) return token.price;
    return priceData[priceData.length - 1].price;
  }, [priceData, token.price]);

  // Live price change % = (current - first) / first * 100
  const livePriceChange = useMemo(() => {
    if (priceData.length < 2) return token.priceChange;
    const firstPrice = priceData[0].price;
    return ((livePrice - firstPrice) / firstPrice) * 100;
  }, [priceData, livePrice, token.priceChange]);

  // Live token object with updated price for header
  const liveToken = useMemo(() => ({
    ...token,
    price: livePrice,
    priceChange: livePriceChange,
  }), [token, livePrice, livePriceChange]);

  // Determine collateral token based on chain
  const collateralToken = token.chain === 'ethereum' ? 'ETH' : token.chain === 'sui' ? 'SUI' : 'SOL';

  if (isPageLoading) return <TokenDetailSkeleton />;

  return (
    <div className="mx-auto max-w-[1440px] px-12">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Market Header */}
      <TokenMarketHeader token={liveToken} />

      {/* Main content: left + right columns */}
      <div className="flex">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          {/* Chart — toggleable from OrderBook with smooth transition */}
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: showChart ? '600px' : '0px',
              opacity: showChart ? 1 : 0,
            }}
          >
            <div className="pt-4">
              <PriceChart
                data={priceData}
                currentPrice={livePrice}
                priceChange={livePriceChange}
                impliedFdv={token.impliedFdv}
              />
            </div>
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
              showChart={showChart}
              onToggleChart={() => setShowChart(prev => !prev)}
            />
          </div>

          {/* Recent Trades */}
          <div className="pt-4">
            <DetailRecentTrades tokenSymbol={token.tokenSymbol} chain={token.chain} basePrice={token.price} onTradeExecuted={handleTradeExecuted} />
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
              tokenName={token.tokenName}
              selectedOrder={selectedOrder}
              collateralToken={collateralToken}
              chain={token.chain}
              onOrderClosed={(orderId) => {
                // Remove the order from the book and deselect
                setSelectedOrder(null);
                setBuyOrders(prev => prev.filter(o => o.id !== orderId));
                setSellOrders(prev => prev.filter(o => o.id !== orderId));
              }}
              onOrderFilled={(orderId, side, fillFraction) => {
                // Find the order from the book
                const allOrders = side === 'buy' ? buyOrders : sellOrders;
                const filledOrder = allOrders.find(o => o.id === orderId);
                if (!filledOrder) return;

                const nativeSymbol = token.chain === 'ethereum' ? 'ETH' : token.chain === 'sui' ? 'SUI' : 'SOL';
                const tokenAmt = Math.round(filledOrder.amount * fillFraction);
                const collateralAmt = filledOrder.collateral * fillFraction;

                // Create a new MyOrder entry for the filled orders list
                const newFilledOrder: MyOrder = {
                  id: `filled-${Date.now()}`,
                  side: side === 'buy' ? 'Buy' : 'Sell',
                  pair: `${token.tokenSymbol}/${nativeSymbol}`,
                  date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                  price: filledOrder.price,
                  amount: tokenAmt >= 1000
                    ? `${(tokenAmt / 1000).toFixed(2)}K ${token.tokenSymbol}`
                    : `${tokenAmt.toLocaleString()} ${token.tokenSymbol}`,
                  collateral: `${collateralAmt.toFixed(2)} ${filledOrder.collateralToken}`,
                  canResell: side === 'buy',
                  // Resell-specific fields
                  ...(filledOrder.isResell ? {
                    hasBadge: 'RS',
                    entryPrice: filledOrder.price,
                    originalPrice: filledOrder.originalPrice,
                  } : {}),
                };

                // Add to filled orders (prepend so it appears first)
                setMyFilledOrders(prev => [newFilledOrder, ...prev]);

                // Deduct collateral from wallet balance
                wallet.deductBalance(token.chain, filledOrder.collateralToken, collateralAmt);

                // Update the order book — increase fill percent or remove
                const setOrders = side === 'buy' ? setBuyOrders : setSellOrders;
                setOrders(prev => {
                  const idx = prev.findIndex(o => o.id === orderId);
                  if (idx === -1) return prev;
                  const order = prev[idx];
                  const newFillPercent = Math.min(100, order.fillPercent + fillFraction * 100);
                  const newFilledAmount = (newFillPercent / 100) * order.totalAmount;

                  if (newFillPercent >= 100) {
                    // Fully filled — remove from book
                    return prev.filter(o => o.id !== orderId);
                  }
                  // Partially filled — update
                  const updated = [...prev];
                  updated[idx] = { ...order, fillPercent: newFillPercent, filledAmount: newFilledAmount };
                  return updated;
                });

                // Deselect
                setSelectedOrder(null);
              }}
            />
          </div>

          {/* My Orders */}
          <div className="pt-4">
            <MyOrders
              filledOrders={myFilledOrders}
              openOrders={myOpenOrders}
              chain={token.chain}
              tokenSymbol={token.tokenSymbol}
              onCloseOrder={(orderId) => setMyOpenOrders(prev => prev.filter(o => o.id !== orderId))}
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
