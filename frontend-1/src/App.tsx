import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { CarbonLoopOrb, Badge, Button } from './components/common/UIComponents';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import SupplierDashboardPage from './pages/SupplierDashboardPage';
import BuyerDashboardPage from './pages/BuyerDashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import CreateSupplyListingPage from './pages/CreateSupplyListingPage';
import CreateBuyerRequirementPage from './pages/CreateBuyerRequirementPage';
import MatchResultsPage from './pages/MatchResultsPage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import RequestBidPage from './pages/RequestBidPage';
import TransactionStatusPage from './pages/TransactionStatusPage';
import { Plus, User, ArrowRight, Menu, X, Shield, Activity } from 'lucide-react';

function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Match Engine', path: '/matches' },
    { label: 'Supplier Hub (ABC Cement)', path: '/dashboard/supplier' },
    { label: 'Buyer Hub (GreenFuel)', path: '/dashboard/buyer' },
    { label: 'Live Custody (TXN-8801)', path: '/transactions/TXN-8801' },
  ];

  return (
    <nav
      style={{
        background: '#0F3D2E',
        color: '#FAFAF9',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div
        style={{
          maxWidth: 1380,
          margin: '0 auto',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}
      >
        {/* Brand logo & tagline */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: '#FAFAF9'
          }}
        >
          <CarbonLoopOrb size={30} variant="teal-on-dark" animated={true} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  fontFamily: "'IBM Plex Sans', sans-serif"
                }}
              >
                CarbonLoop
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: 'rgba(46,158,138,0.22)',
                  color: '#2E9E8A',
                  padding: '2px 6px',
                  borderRadius: 4
                }}
              >
                CLEARINGHOUSE
              </span>
            </div>
          </div>
        </Link>

        {/* Center Desktop Nav Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path !== '/' && location.pathname.startsWith(link.path.split('/')[1] ? `/${link.path.split('/')[1]}` : ''));
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#FAFAF9' : 'rgba(250,250,249,0.72)',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 150ms ease'
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            variant="ghost"
            size="sm"
            style={{ color: '#FAFAF9', border: '1px solid rgba(255,255,255,0.2)' }}
            icon={<Plus size={13} />}
            onClick={() => navigate('/supplier/create-listing')}
          >
            List Supply
          </Button>

          <Button
            variant="ghost"
            size="sm"
            style={{ color: '#FAFAF9', border: '1px solid rgba(255,255,255,0.2)' }}
            icon={<Plus size={13} />}
            onClick={() => navigate('/buyer/create-requirement')}
          >
            Post Tender
          </Button>

          <button
            onClick={() => navigate('/auth')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#2E9E8A',
              color: '#FAFAF9',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'IBM Plex Sans', sans-serif"
            }}
          >
            <User size={13} />
            <span>Portals</span>
          </button>

          {/* Mobile hamburger toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#FAFAF9',
              cursor: 'pointer',
              padding: 6
            }}
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#0B2C21',
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: '#FAFAF9',
                textDecoration: 'none',
                padding: '8px 0',
                fontSize: 13,
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Network Status Sub-banner */}
      <div
        style={{
          background: 'rgba(0,0,0,0.18)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          padding: '4px 24px',
          fontSize: 11,
          color: 'rgba(250,250,249,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E9E8A', display: 'inline-block' }} />
          <span>Gujarat Regional Grid: <strong>8 Nodes Synchronized</strong></span>
          <span>•</span>
          <span>5,450 tonnes/mo Active Supply Capacity</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>Protocol: ISO 14064-2</span>
          <span>Clearing Latency: &lt;15ms</span>
        </div>
      </div>
    </nav>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        maxWidth: 600,
        margin: '100px auto',
        textAlign: 'center',
        padding: '48px 24px',
        background: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #E5E5E2',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <CarbonLoopOrb size={52} variant="teal-on-white" animated={false} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: '#1A1D1B' }}>
        Route Not Found
      </h2>
      <p style={{ fontSize: 13, color: '#8A8C8A', marginBottom: 24, lineHeight: 1.5 }}>
        The requested path is not recognized in the CarbonLoop industrial registry. Return to the marketplace to browse active capture streams.
      </p>
      <Button
        variant="primary"
        size="md"
        icon={<ArrowRight size={15} />}
        iconPosition="right"
        onClick={() => navigate('/')}
      >
        Return to Platform Home
      </Button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#FAFAF9', color: '#1A1D1B', display: 'flex', flexDirection: 'column' }}>
        <NavigationBar />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Page 1: Landing page */}
            <Route path="/" element={<LandingPage />} />

            {/* Page 2: Login / Register page */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Page 3: Supplier dashboard */}
            <Route path="/dashboard/supplier" element={<SupplierDashboardPage />} />

            {/* Page 4: Buyer dashboard */}
            <Route path="/dashboard/buyer" element={<BuyerDashboardPage />} />

            {/* Page 5: CO2 marketplace */}
            <Route path="/marketplace" element={<MarketplacePage />} />

            {/* Page 6: Create CO2 supply listing */}
            <Route path="/supplier/create-listing" element={<CreateSupplyListingPage />} />

            {/* Page 7: Create buyer requirement */}
            <Route path="/buyer/create-requirement" element={<CreateBuyerRequirementPage />} />

            {/* Page 8: Match results */}
            <Route path="/matches" element={<MatchResultsPage />} />
            <Route path="/matches/:id" element={<MatchResultsPage />} />

            {/* Page 9: CO2 listing details */}
            <Route path="/listings/:id" element={<ListingDetailsPage />} />

            {/* Page 10: Request / Bid page */}
            <Route path="/listings/:id/bid" element={<RequestBidPage />} />

            {/* Page 11: Transaction status page */}
            <Route path="/transactions" element={<TransactionStatusPage />} />
            <Route path="/transactions/:id" element={<TransactionStatusPage />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer
          style={{
            background: '#FFFFFF',
            borderTop: '1px solid #E5E5E2',
            padding: '28px 24px',
            marginTop: 'auto',
            fontSize: 12,
            color: '#8A8C8A'
          }}
        >
          <div
            style={{
              maxWidth: 1380,
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CarbonLoopOrb size={20} variant="teal-on-white" animated={false} />
              <span style={{ fontWeight: 700, color: '#1A1D1B' }}>CarbonLoop Platform</span>
              <span>•</span>
              <span>Gujarat Regional Decarbonization Exchange</span>
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <span>ISO 14064-2 Certified Custody</span>
              <span>CEMS Integration Ready</span>
              <span>Permanent Sequestration & e-SAF Clearing</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
