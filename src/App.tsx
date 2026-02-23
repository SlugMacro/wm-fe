import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import MarketsPage from './pages/MarketsPage';
import DashboardPage from './pages/DashboardPage';
import EarnPage from './pages/EarnPage';
import ResourcesPage from './pages/ResourcesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/markets" replace />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/earn" element={<EarnPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
