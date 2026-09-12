import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { SupplierDashboardPage } from './pages/SupplierDashboardPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { CreateSupplyListingPage } from './pages/CreateSupplyListingPage';
import { CreateBuyerRequirementPage } from './pages/CreateBuyerRequirementPage';
import { MatchResultsPage } from './pages/MatchResultsPage';
import { ListingDetailsPage } from './pages/ListingDetailsPage';
import { RequestBidPage } from './pages/RequestBidPage';
import { TransactionStatusPage } from './pages/TransactionStatusPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* 1. Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Login/Register page */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />

        {/* 3. Supplier dashboard */}
        <Route path="/dashboard/supplier" element={<SupplierDashboardPage />} />

        {/* 4. Buyer dashboard */}
        <Route path="/dashboard/buyer" element={<BuyerDashboardPage />} />

        {/* 5. CO2 marketplace */}
        <Route path="/marketplace" element={<MarketplacePage />} />

        {/* 6. Create CO2 supply listing */}
        <Route path="/supplier/create-listing" element={<CreateSupplyListingPage />} />
        <Route path="/listings/create-supply" element={<Navigate to="/supplier/create-listing" replace />} />

        {/* 7. Create buyer requirement */}
        <Route path="/buyer/create-requirement" element={<CreateBuyerRequirementPage />} />
        <Route path="/requirements/create" element={<Navigate to="/buyer/create-requirement" replace />} />

        {/* 8. Match results */}
        <Route path="/matches" element={<MatchResultsPage />} />
        <Route path="/matches/:id" element={<MatchResultsPage />} />
        <Route path="/matching" element={<Navigate to="/matches" replace />} />

        {/* 9. CO2 listing details */}
        <Route path="/listings/:id" element={<ListingDetailsPage />} />

        {/* 10. Request/Bid page */}
        <Route path="/listings/:id/bid" element={<RequestBidPage />} />
        <Route path="/bids/create" element={<Navigate to="/listings/SUP-001/bid" replace />} />

        {/* 11. Transaction status page */}
        <Route path="/transactions" element={<TransactionStatusPage />} />
        <Route path="/transactions/:id" element={<TransactionStatusPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
