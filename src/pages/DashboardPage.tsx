import { useState, useCallback, useEffect } from 'react';
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

/* ───── Skeleton loaders ───── */

function ProfileSkeleton() {
  return (
    <div className="animate-pulse rounded-[10px] border border-[#1b1b1c] px-6 py-5">
      <div className="flex items-center gap-5">
        <div className="size-16 rounded-full bg-[#1b1b1c]" />
        <div className="flex flex-col gap-2">
          <div className="h-5 w-36 rounded bg-[#1b1b1c]" />
          <div className="h-3 w-28 rounded bg-[#1b1b1c]" />
        </div>
        <div className="ml-auto flex gap-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-20 rounded bg-[#1b1b1c]" />
              <div className="h-5 w-16 rounded bg-[#1b1b1c]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BannersSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 animate-pulse">
      {[0, 1].map(i => (
        <div key={i} className="rounded-[10px] border border-[#1b1b1c] px-5 py-4">
          <div className="h-4 w-40 rounded bg-[#1b1b1c] mb-3" />
          <div className="h-3 w-56 rounded bg-[#1b1b1c]" />
        </div>
      ))}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-7 w-36 rounded bg-[#1b1b1c]" />
        <div className="h-5 w-28 rounded bg-[#1b1b1c]" />
      </div>
      <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2 mb-1">
        <div className="flex-1 h-3 w-12 rounded bg-[#1b1b1c]" />
        <div className="w-28 h-3 rounded bg-[#1b1b1c]" />
        <div className="w-16 h-3 rounded bg-[#1b1b1c] ml-8" />
      </div>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center border-b border-[#1b1b1c] h-[60px] px-2" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="flex items-center gap-2 flex-1">
            <div className="size-6 rounded-full bg-[#1b1b1c]" />
            <div className="h-3 w-20 rounded bg-[#1b1b1c]" />
          </div>
          <div className="h-3 w-16 rounded bg-[#1b1b1c]" />
          <div className="h-3 w-12 rounded bg-[#1b1b1c] ml-8" />
          <div className="h-3 w-16 rounded bg-[#1b1b1c] ml-8" />
        </div>
      ))}
    </div>
  );
}

/* ───── Main dashboard page ───── */

export default function DashboardPage() {
  const wallet = useWallet();
  const [openOrders, setOpenOrders] = useState(initialOpenOrders);
  const [filledOrders, setFilledOrders] = useState(initialFilledOrders);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseOrder = useCallback((orderId: string) => {
    setOpenOrders(prev => prev.filter(o => o.id !== orderId));
    setFilledOrders(prev => prev.filter(o => o.id !== orderId));
  }, []);

  /* Not connected → show empty state (same layout as ComingSoon) */
  if (!wallet.isConnected) {
    return <DashboardEmpty onConnect={() => wallet.openConnectModal()} />;
  }

  if (isPageLoading) {
    return (
      <div className="mx-auto max-w-[1440px] px-12 pb-16">
        <Breadcrumb items={breadcrumbItems} />
        <ProfileSkeleton />
        <div className="mt-4"><BannersSkeleton /></div>
        <div className="mt-3"><OrdersSkeleton /></div>
        <div className="mt-3"><OrdersSkeleton /></div>
        <BottomStats />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-12 pb-16">
      <Breadcrumb items={breadcrumbItems} />
      <DashboardProfile
        walletShort={profileData.walletShort}
        walletAddress={profileData.walletAddress}
        totalTradingVol={profileData.totalTradingVol}
        discountTier={profileData.discountTier}
        xWhalesHolding={profileData.xWhalesHolding}
        linkedWallets={profileData.linkedWallets}
      />
      <div className="mt-4"><SettlementBanners /></div>
      <div className="mt-3">
        <DashboardOpenOrders openOrders={openOrders} filledOrders={filledOrders} onCloseOrder={handleCloseOrder} />
      </div>
      <div className="mt-3"><DashboardEndedOrders orders={endedOrders} /></div>
      <BottomStats />
    </div>
  );
}
