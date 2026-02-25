import { useState, useCallback } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import DashboardProfile from '../components/DashboardProfile';
import SettlementBanners from '../components/SettlementBanners';
import DashboardOpenOrders from '../components/DashboardOpenOrders';
import DashboardEndedOrders from '../components/DashboardEndedOrders';
import BottomStats from '../components/BottomStats';
import {
  profileData,
  openOrders as initialOpenOrders,
  filledOrders as initialFilledOrders,
  endedOrders,
} from '../mock-data/dashboard';

const breadcrumbItems = [
  { label: 'Whales.Market', to: '/markets' },
  { label: 'My Dashboard' },
];

export default function DashboardPage() {
  const [openOrders, setOpenOrders] = useState(initialOpenOrders);
  const [filledOrders, setFilledOrders] = useState(initialFilledOrders);

  const handleCloseOrder = useCallback((orderId: string) => {
    setOpenOrders(prev => prev.filter(o => o.id !== orderId));
    setFilledOrders(prev => prev.filter(o => o.id !== orderId));
  }, []);

  return (
    <div className="mx-auto max-w-[1440px] px-12 pb-16">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Profile Header */}
      <DashboardProfile
        walletShort={profileData.walletShort}
        totalTradingVol={profileData.totalTradingVol}
        discountTier={profileData.discountTier}
        xWhalesHolding={profileData.xWhalesHolding}
        linkedWallets={profileData.linkedWallets}
      />

      {/* Settlement Banners */}
      <div className="mt-4">
        <SettlementBanners />
      </div>

      {/* Open Orders / Filled Orders */}
      <div className="mt-3">
        <DashboardOpenOrders
          openOrders={openOrders}
          filledOrders={filledOrders}
          onCloseOrder={handleCloseOrder}
        />
      </div>

      {/* Ended Settlement */}
      <div className="mt-3">
        <DashboardEndedOrders orders={endedOrders} />
      </div>

      {/* Bottom Stats */}
      <BottomStats />
    </div>
  );
}
