import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import MarketsPage from './pages/MarketsPage';
import TokenDetailPage from './pages/TokenDetailPage';
import DashboardPage from './pages/DashboardPage';
import EarnPage from './pages/EarnPage';
import ResourcesPage from './pages/ResourcesPage';
import ComingSoonPage from './pages/ComingSoonPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/markets" replace />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/markets/:tokenId" element={<TokenDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/earn" element={<EarnPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/staking" element={<ComingSoonPage />} />
        <Route path="/incentives" element={<ComingSoonPage />} />
        <Route path="/referral" element={<ComingSoonPage />} />
        <Route path="/affiliate" element={<ComingSoonPage />} />
        <Route path="/about" element={<ComingSoonPage />} />
      </Route>
    </Routes>
  );
}
