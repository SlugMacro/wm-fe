import { useState, useCallback } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import DashboardProfile from '../components/DashboardProfile';
import SettlementBanners from '../components/SettlementBanners';
import DashboardOpenOrders from '../components/DashboardOpenOrders';
import DashboardEndedOrders from '../components/DashboardEndedOrders';
import BottomStats from '../components/BottomStats';
import { useWallet } from '../hooks/useWalletContext';
import comingSoonSvg from '../assets/images/coming-soon.svg';
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

/* ───── Empty state when wallet not connected ───── */

function DashboardEmpty({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-8 py-4">
      <div className="flex flex-col items-center gap-4 max-w-[448px] pt-8 pb-10 px-6">
        {/* Illustration */}
        <img src={comingSoonSvg} alt="" className="size-48" />

        {/* Content */}
        <div className="flex flex-col gap-2 items-center text-center pb-4 px-8 w-full">
          <h1 className="text-xl font-medium leading-7 text-[#f9f9fa]">
            Connect Your Wallet
          </h1>
          <p className="text-sm font-normal leading-5 text-[#b4b4ba] max-w-[280px]">
            Connect your wallet to view your dashboard, track orders, and manage your portfolio.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onConnect}
          className="flex items-center justify-center rounded-[10px] bg-[#f9f9fa] px-5 py-2.5 text-base font-medium leading-6 text-[#0a0a0b] hover:bg-[#e0e0e2] transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

/* ───── Main dashboard page ───── */

export default function DashboardPage() {
  const wallet = useWallet();
  const [openOrders, setOpenOrders] = useState(initialOpenOrders);
  const [filledOrders, setFilledOrders] = useState(initialFilledOrders);

  const handleCloseOrder = useCallback((orderId: string) => {
    setOpenOrders(prev => prev.filter(o => o.id !== orderId));
    setFilledOrders(prev => prev.filter(o => o.id !== orderId));
  }, []);

  /* Not connected → show empty state (same layout as ComingSoon) */
  if (!wallet.isConnected) {
    return <DashboardEmpty onConnect={() => wallet.openConnectModal()} />;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-12 pb-16">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Profile Header */}
      <DashboardProfile
        walletShort={profileData.walletShort}
        walletAddress={profileData.walletAddress}
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
