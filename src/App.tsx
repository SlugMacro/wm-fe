import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import MarketsPage from './pages/MarketsPage';
import DashboardPage from './pages/DashboardPage';
import EarnPage from './pages/EarnPage';
import ResourcesPage from './pages/ResourcesPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/earn" element={<EarnPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Route>
    </Routes>
  );
}
