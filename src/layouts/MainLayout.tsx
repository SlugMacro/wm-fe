import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import { LiveMarketProvider } from '../hooks/useLiveMarketContext';
import { WalletProvider } from '../hooks/useWalletContext';

export default function MainLayout() {
  return (
    <WalletProvider>
      <LiveMarketProvider>
        <div className="min-h-screen bg-[#0a0a0b]">
          <Header />
          <main>
            <Outlet />
          </main>
        </div>
      </LiveMarketProvider>
    </WalletProvider>
  );
}
