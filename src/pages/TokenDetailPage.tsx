import { useState, useMemo } from 'react';
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

  const buyOrders = useMemo(() => generateBuyOrders(token.price), [token.price]);
  const sellOrders = useMemo(() => generateSellOrders(token.price), [token.price]);
  const priceData = useMemo(() => generatePriceData(), []);

  const breadcrumbItems = [
    { label: 'Whales.Market', to: '/markets' },
    { label: token.category, to: '/markets' },
    { label: token.tokenSymbol },
  ];

  const handleSelectOrder = (order: OrderBookEntry, side: 'buy' | 'sell') => {
    setSelectedOrder({ order, side });
  };

  return (
    <div className="mx-auto max-w-[1440px] px-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Market Header */}
      <TokenMarketHeader token={token} />

      {/* Main content: left + right columns */}
      <div className="flex gap-0 mt-0">
        {/* Left column */}
        <div className="flex-1 min-w-0 pr-4 border-r border-[#1b1b1c]">
          {/* Chart */}
          <div className="py-4">
            <PriceChart
              data={priceData}
              currentPrice={token.price}
              priceChange={token.priceChange}
            />
          </div>

          {/* Order Book */}
          <div className="py-4">
            <OrderBook
              buyOrders={buyOrders}
              sellOrders={sellOrders}
              onSelectOrder={handleSelectOrder}
            />
          </div>

          {/* Recent Trades */}
          <div className="py-4">
            <DetailRecentTrades />
          </div>
        </div>

        {/* Right column */}
        <div className="w-[384px] shrink-0 pl-4">
          {/* Trade Panel */}
          <div className="py-4">
            <TradePanel
              tokenSymbol={token.tokenSymbol}
              selectedOrder={selectedOrder}
            />
          </div>

          {/* My Orders */}
          <div className="py-4">
            <MyOrders
              filledOrders={myFilledOrders}
              openOrders={myOpenOrders}
            />
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <BottomStats />
    </div>
  );
}
