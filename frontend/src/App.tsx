import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { MatchingPage } from './pages/MatchingPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/matching" element={<MatchingPage />} />
        {/* Fallback to landing */}
        <Route path="*" element={<LandingPage />} />
      </Route>
    </Routes>
  );
};

export default App;
