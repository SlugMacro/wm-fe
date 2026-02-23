import Breadcrumb from '../components/Breadcrumb';
import DashboardProfile from '../components/DashboardProfile';
import SettlementBanners from '../components/SettlementBanners';
import DashboardOpenOrders from '../components/DashboardOpenOrders';
import DashboardEndedOrders from '../components/DashboardEndedOrders';
import BottomStats from '../components/BottomStats';
import {
  profileData,
  openOrders,
  filledOrders,
  endedOrders,
} from '../mock-data/dashboard';

const breadcrumbItems = [
  { label: 'Whales.Market', to: '/markets' },
  { label: 'My Dashboard' },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-8">
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
      <div className="mt-6">
        <DashboardOpenOrders
          openOrders={openOrders}
          filledOrders={filledOrders}
        />
      </div>

      {/* Ended Settlement */}
      <div className="mt-6">
        <DashboardEndedOrders orders={endedOrders} />
      </div>

      {/* Bottom Stats */}
      <BottomStats />
    </div>
  );
}
