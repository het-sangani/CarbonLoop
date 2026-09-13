import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CarbonLoopOrb, 
  Button, 
  Card, 
  AlertBanner,
  Badge
} from '../components/common/UIComponents';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [role, setRole] = useState<'supplier' | 'buyer' | 'transporter' | 'government'>('supplier');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const demoPersonas = [
    {
      id: 'abc-cement',
      name: 'ABC Cement Ltd',
      role: 'supplier' as const,
      email: 'rajesh.varma@abccement.com',
      subtext: 'Supplier (Cement • 500t / 96%)',
      route: '/dashboard/supplier'
    },
    {
      id: 'gujarat-bio',
      name: 'Gujarat Bio-Refinery',
      role: 'supplier' as const,
      email: 'ananya.patel@gujaratbio.com',
      subtext: 'Supplier (Bio-Ethanol • 1200t / 99%)',
      route: '/dashboard/supplier'
    },
    {
      id: 'surat-power',
      name: 'Surat Coastal Power',
      role: 'supplier' as const,
      email: 'vikram.mehta@suratpower.in',
      subtext: 'Supplier (Power Plant • 3500t / 91.5%)',
      route: '/dashboard/supplier'
    },
    {
      id: 'jamnagar-dac',
      name: 'Jamnagar Direct Air Hub',
      role: 'supplier' as const,
      email: 'siddharth.dave@jamnagardac.in',
      subtext: 'Supplier (DAC Alpha • 250t / 99.8%)',
      route: '/dashboard/supplier'
    },
    {
      id: 'greenfuel',
      name: 'GreenFuel SynTech',
      role: 'buyer' as const,
      email: 'procurement@greenfuel.in',
      subtext: 'Buyer (e-SAF • 300t / 95%)',
      route: '/dashboard/buyer'
    },
    {
      id: 'ultratech-concrete',
      name: 'Ultratech Eco-Concrete',
      role: 'buyer' as const,
      email: 'procurement@ultratech-eco.in',
      subtext: 'Buyer (Mineralization • 800t / 92%)',
      route: '/dashboard/buyer'
    },
    {
      id: 'reliance-chem',
      name: 'Reliance Clean Chem',
      role: 'buyer' as const,
      email: 'feedstock@reliancechem.in',
      subtext: 'Buyer (Chemical Synthesis • 2000t / 98%)',
      route: '/dashboard/buyer'
    },
    {
      id: 'cryo-trans',
      name: 'CryoTrans Logistics',
      role: 'transporter' as const,
      email: 'fleet.dispatch@cryotrans.in',
      subtext: 'Carrier (Cryogenic ISO Tanker Fleet)',
      route: '/transactions'
    },
    {
      id: 'gpcb-auditor',
      name: 'GPCB Compliance Node',
      role: 'government' as const,
      email: 'compliance.officer@gpcb.gov.in',
      subtext: 'Auditor (Gujarat Pollution Control)',
      route: '/marketplace'
    }
  ];

  const handleSelectPersona = (persona: typeof demoPersonas[0]) => {
    setSelectedPersona(persona.id);
    setRole(persona.role);
    setEmail(persona.email);
    setPassword('••••••••••••');
    setOrgName(persona.name);
    setErrorMessage(null);
  };

  const handleClearInputs = () => {
    setSelectedPersona(null);
    setEmail('');
    setPassword('');
    setOrgName('');
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid corporate email address.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('Password must contain at least 4 characters.');
      return;
    }

    if (mode === 'register' && !orgName.trim()) {
      setErrorMessage('Organization name is required to initialize an industrial node.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);

      const effectiveName = orgName.trim() || email.split('@')[0];
      const effectiveOrg = orgName.trim() || `${email.split('@')[0]} Industrial`;

      login({
        id: `user-${Date.now()}`,
        email: email,
        name: effectiveName,
        organization: effectiveOrg,
        role: role,
      });

      // If user came from a specific protected sub-route, return them there; otherwise proceed to role dashboard
      const returnUrl = (location.state as any)?.from?.pathname;
      if (returnUrl && returnUrl !== '/auth' && returnUrl !== '/') {
        navigate(returnUrl);
      } else if (role === 'supplier') {
        navigate('/dashboard/supplier');
      } else if (role === 'buyer') {
        navigate('/dashboard/buyer');
      } else if (role === 'transporter') {
        navigate('/transactions');
      } else {
        navigate('/marketplace');
      }
    }, 600);
  };

  const requiredFrom = (location.state as any)?.from?.pathname;

  return (
    <div style={{ maxWidth: 520, margin: '50px auto', padding: '0 20px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 12 }}>
          <CarbonLoopOrb size={48} variant="teal-on-white" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1D1B', margin: '0 0 6px' }}>
          {mode === 'signin' ? 'Sign in to CarbonLoop' : 'Register Industrial Entity'}
        </h1>
        <p style={{ fontSize: 13, color: '#5A5C5A', margin: 0 }}>
          B2B Carbon Capture-to-Product Exchange Platform
        </p>
      </div>

      {requiredFrom && requiredFrom !== '/' && (
        <div style={{ marginBottom: 20 }}>
          <AlertBanner
            variant="warning"
            title="Authentication Required"
            message={`Access to ${requiredFrom} is restricted to authorized industrial entities. Please sign in or register below.`}
          />
        </div>
      )}

      {/* Active Session Notification */}
      {isAuthenticated && user && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 8,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#14532D' }}>
                  Signed in as {user.organization || user.name}
                </span>
                <Badge variant="supplier" size="sm">{user.role.toUpperCase()}</Badge>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#166534', margin: 0, lineHeight: 1.4 }}>
              You currently have an active session saved. You can continue to your platform dashboard, or sign out to register or switch to another entity account.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (user.role === 'supplier') navigate('/dashboard/supplier');
                  else if (user.role === 'buyer') navigate('/dashboard/buyer');
                  else if (user.role === 'transporter') navigate('/transactions');
                  else navigate('/marketplace');
                }}
              >
                Continue to Dashboard →
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  logout();
                  handleClearInputs();
                }}
              >
                Sign Out / Switch Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Demo Pre-Fillers (Optional Testing Personas) */}
      <Card style={{ padding: '16px 20px', marginBottom: 24, background: '#FAFAF9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0F3D2E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ⚡ Ecosystem Testing Personas (Optional)
          </div>
          {selectedPersona && (
            <button
              type="button"
              onClick={handleClearInputs}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 11,
                color: '#8A8C8A',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              Reset to Blank
            </button>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#5A5C5A', marginBottom: 12, lineHeight: 1.4 }}>
          Select an entity to test specific industrial dashboards, or enter your own corporate credentials below.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
          {demoPersonas.map((p) => {
            const isSelected = selectedPersona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPersona(p)}
                style={{
                  padding: '8px 10px',
                  textAlign: 'left',
                  background: isSelected ? '#EAF0EB' : '#FFFFFF',
                  border: isSelected ? '1.5px solid #2A5C3A' : '1px solid #E5E5E2',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1D1B' }}>{p.name}</div>
                <div className="tabular-nums" style={{ fontSize: 10, color: '#5A5C5A', marginTop: 2 }}>{p.subtext}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Authentication Form Card */}
      <Card style={{ padding: 28 }}>
        
        {/* Toggle signin / register */}
        <div style={{ display: 'flex', background: '#F1F1EF', borderRadius: 6, padding: 3, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setMode('signin')}
            style={{
              flex: 1,
              padding: '6px 0',
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: mode === 'signin' ? '#FFFFFF' : 'transparent',
              color: mode === 'signin' ? '#1A1D1B' : '#8A8C8A',
              boxShadow: mode === 'signin' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 150ms ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '6px 0',
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: mode === 'register' ? '#FFFFFF' : 'transparent',
              color: mode === 'register' ? '#1A1D1B' : '#8A8C8A',
              boxShadow: mode === 'register' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 150ms ease'
            }}
          >
            Register Entity
          </button>
        </div>

        {errorMessage && (
          <div style={{ marginBottom: 20 }}>
            <AlertBanner
              variant="error"
              title="Authentication Notice"
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Role selector */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Select Entity Type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="form-input"
            >
              <option value="supplier">CO₂ Capture Supplier (Point-Source Emitter)</option>
              <option value="buyer">CO₂ Utilization Off-taker (Industrial Sink)</option>
              <option value="transporter">Cryogenic Logistics Carrier</option>
              <option value="government">Registry / Compliance Auditor</option>
            </select>
          </div>

          {/* Org Name (if register mode) */}
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Industrial Organization / Plant Name *
              </label>
              <input
                type="text"
                placeholder="e.g. ABC Cement Ltd"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          {/* Email input */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Corporate Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="name@enterprise.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Password input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#5A5C5A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Password *
              </label>
              <span style={{ fontSize: 11, color: '#8A8C8A', cursor: 'pointer' }}>Forgot?</span>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isLoading}
            loadingText={mode === 'signin' ? 'Verifying credentials...' : 'Registering entity...'}
            aria-label={mode === 'signin' ? 'Sign In to Portal' : 'Register Entity'}
            style={{ marginTop: 8 }}
          >
            {mode === 'signin' ? 'Sign In to Portal' : 'Register Entity'}
          </Button>

        </form>
      </Card>

    </div>
  );
};

export default AuthPage;
