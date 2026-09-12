import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CarbonLoopOrb, 
  Badge, 
  Button, 
  Card, 
  LabelCaps, 
  ProgressBar 
} from '../components/common/UIComponents';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPathway, setSelectedPathway] = useState(0);

  const pathways = [
    {
      name: 'Concrete Mineralization',
      tag: 'Permanent Sequestration',
      purityNeeds: '90 – 99% CO₂',
      volumeRange: '20k – 150k t/yr',
      description: 'CO₂ permanently bound into concrete matrix as crystalline calcium carbonate, accelerating curing while trapping emissions indefinitely.',
      matchScore: 98
    },
    {
      name: 'Synthetic Aviation Fuels (e-SAF)',
      tag: 'Power-to-Liquids',
      purityNeeds: '95 – 99.5% CO₂',
      volumeRange: '50k – 300k t/yr',
      description: 'Combining point-source CO₂ with green electrolytic hydrogen to formulate drop-in synthetic paraffinic kerosene compliant with CORSIA.',
      matchScore: 96
    },
    {
      name: 'Specialty Polymers & Chemicals',
      tag: 'Petrochemical Replacement',
      purityNeeds: '98.5%+ Ultra-Pure',
      volumeRange: '10k – 80k t/yr',
      description: 'Replacing fossil naphtha with recycled carbon feeds for polyurethane foams, polycarbonates, and high-performance circular materials.',
      matchScore: 92
    },
    {
      name: 'Controlled Environment Agriculture',
      tag: 'AgTech Enrichment',
      purityNeeds: '99.9% Food-Grade',
      volumeRange: '5k – 40k t/yr',
      description: 'Purified emissions injected into automated greenhouse canopies to enhance crop photosynthesis and elevate agricultural yield.',
      matchScore: 89
    }
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 80px' }}>
      
      {/* ─── Hero Section ────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 48,
          alignItems: 'center',
          marginBottom: 64
        }}
      >
        
        {/* Left column */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Badge variant="teal" dot pulse>Industrial CCUS Exchange</Badge>
            <span style={{ fontSize: 12, color: '#8A8C8A' }}>B2B Point-Source Matchmaking</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.12,
              color: '#1A1D1B',
              letterSpacing: '-0.03em',
              marginBottom: 20
            }}
          >
            Turn Captured <br />
            <span style={{ color: '#0F3D2E' }}>Carbon Streams</span> <br />
            Into Commercial Value.
          </h1>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: '#5A5C5A',
              maxWidth: 520,
              marginBottom: 32
            }}
          >
            CarbonLoop connects verified industrial CO₂ capture emitters with downstream utilization off-takers.
            Our rule-based weighted matching algorithm harmonizes gas composition, volumetric commitments, and transit corridors across Gujarat and Western India.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/marketplace')}
            >
              Explore CO₂ Marketplace →
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/matches')}
            >
              Run Match Engine
            </Button>
          </div>

          {/* Quick Demo Previews */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              padding: '12px 16px',
              background: '#FFFFFF',
              border: '1px solid #E5E5E2',
              borderRadius: 8,
              width: 'fit-content',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: '#8A8C8A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Quick Demo:
            </span>
            <button
              onClick={() => navigate('/dashboard/supplier')}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#0F3D2E',
                background: '#EAF0EB',
                border: '1px solid rgba(15,61,46,0.2)',
                borderRadius: 5,
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif"
              }}
            >
              ABC Cement (Supplier 500t)
            </button>
            <button
              onClick={() => navigate('/dashboard/buyer')}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#1A6158',
                background: '#E8F4F1',
                border: '1px solid rgba(46,158,138,0.25)',
                borderRadius: 5,
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif"
              }}
            >
              GreenFuel (Buyer 300t)
            </button>
            <button
              onClick={() => navigate('/transactions/TXN-8801')}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#5A5C5A',
                background: '#F1F1EF',
                border: '1px solid #E5E5E2',
                borderRadius: 5,
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans', sans-serif"
              }}
            >
              Live Contract
            </button>
          </div>
        </div>

        {/* Right column: Live Match Preview Card */}
        <div>
          <Card style={{ padding: 28, background: '#FFFFFF', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CarbonLoopOrb size={22} variant="teal-on-white" />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1A1D1B' }}>
                  Live Algorithmic Match Demo
                </span>
              </div>
              <Badge variant="teal" dot pulse>96% Fit</Badge>
            </div>

            {/* Emitter Pill */}
            <div style={{ background: '#FAFAF9', border: '1px solid #E5E5E2', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#0F3D2E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Point-Source Emitter
                </span>
                <span className="tabular-nums" style={{ fontSize: 11, color: '#8A8C8A' }}>SUP-001</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1B' }}>ABC Cement (Ahmedabad)</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: '#5A5C5A' }}>
                <span>Purity: <strong className="tabular-nums" style={{ color: '#0F3D2E' }}>96.0%</strong></span>
                <span>Volume: <strong className="tabular-nums">500 t/mo</strong></span>
                <span>State: <strong>Liquefied</strong></span>
              </div>
            </div>

            {/* Corridor Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#F1F1EF', borderRadius: 9999, fontSize: 11, color: '#5A5C5A' }}>
                <span>⚡ <strong className="tabular-nums">112 km</strong> via NH-48 Corridor · 5 hr roundtrip</span>
              </div>
            </div>

            {/* Buyer Pill */}
            <div style={{ background: '#FAFAF9', border: '1px solid #E5E5E2', borderRadius: 8, padding: 14, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#1A6158', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Utilization Off-taker
                </span>
                <span className="tabular-nums" style={{ fontSize: 11, color: '#8A8C8A' }}>BUY-001</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1B' }}>GreenFuel SynTech (Vadodara)</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: '#5A5C5A' }}>
                <span>Intake: <strong className="tabular-nums">300 t/mo</strong></span>
                <span>Min Purity: <strong className="tabular-nums" style={{ color: '#2E9E8A' }}>&ge; 95.0%</strong></span>
                <span>Application: <strong>e-SAF</strong></span>
              </div>
            </div>

            {/* Match Scoring Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div>
                <ProgressBar value={100} color="#0F3D2E" label="Chemical Purity & Contaminants (40% Weight)" height={6} />
              </div>
              <div>
                <ProgressBar value={91} color="#2E9E8A" label="Geodesic Corridor Transit (30% Weight)" height={6} />
              </div>
              <div>
                <ProgressBar value={96} color="#1A6158" label="Volumetric Capacity Fit (30% Weight)" height={6} />
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={() => navigate('/matches')}
            >
              Inspect Complete Match Breakdown →
            </Button>
          </Card>
        </div>

      </div>

      {/* ─── Macro Metrics Ticker ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 64
        }}
      >
        <Card style={{ padding: '20px 24px' }}>
          <LabelCaps style={{ marginBottom: 6 }}>Tracked Point-Sources</LabelCaps>
          <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: '#1A1D1B' }}>48,500 <span style={{ fontSize: 13, fontWeight: 400, color: '#8A8C8A' }}>t/mo</span></div>
          <div style={{ fontSize: 12, color: '#2E9E8A', marginTop: 4, fontWeight: 600 }}>Active capture across Western India</div>
        </Card>

        <Card style={{ padding: '20px 24px' }}>
          <LabelCaps style={{ marginBottom: 6 }}>Average Purity Floor</LabelCaps>
          <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: '#0F3D2E' }}>96.8% <span style={{ fontSize: 13, fontWeight: 400, color: '#8A8C8A' }}>CO₂</span></div>
          <div style={{ fontSize: 12, color: '#5A5C5A', marginTop: 4 }}>GC-MS verified compliance</div>
        </Card>

        <Card style={{ padding: '20px 24px' }}>
          <LabelCaps style={{ marginBottom: 6 }}>Mean Clearing Price</LabelCaps>
          <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: '#1A1D1B' }}>$42.50 <span style={{ fontSize: 13, fontWeight: 400, color: '#8A8C8A' }}>/ tonne</span></div>
          <div style={{ fontSize: 12, color: '#5A5C5A', marginTop: 4 }}>Ex-works liquefaction baseline</div>
        </Card>

        <Card style={{ padding: '20px 24px' }}>
          <LabelCaps style={{ marginBottom: 6 }}>Average Transit Corridor</LabelCaps>
          <div className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, color: '#2E9E8A' }}>134 <span style={{ fontSize: 13, fontWeight: 400, color: '#8A8C8A' }}>km</span></div>
          <div style={{ fontSize: 12, color: '#2E9E8A', marginTop: 4, fontWeight: 600 }}>&lt;1.8% gross transit emissions</div>
        </Card>
      </div>

      {/* ─── CCUS Utilization Pathways Tabs ──────────────────────────────────── */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <LabelCaps style={{ marginBottom: 8 }}>Downstream Utilization Pathways</LabelCaps>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1A1D1B', margin: 0 }}>
            Matching Point-Source Carbon with Certified Off-Takers
          </h2>
          <p style={{ fontSize: 14, color: '#5A5C5A', maxWidth: 600, margin: '8px auto 0' }}>
            Explore standardized technical criteria and purity tolerances across priority decarbonization sectors.
          </p>
        </div>

        {/* Pathway Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {pathways.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => setSelectedPathway(idx)}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 12,
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: selectedPathway === idx ? 600 : 500,
                border: selectedPathway === idx ? '1px solid #0F3D2E' : '1px solid #E5E5E2',
                background: selectedPathway === idx ? '#0F3D2E' : '#FFFFFF',
                color: selectedPathway === idx ? '#FAFAF9' : '#5A5C5A',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Active Pathway Detail Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {pathways.map((p, idx) => (
            <Card
              key={p.name}
              style={{
                padding: 24,
                border: selectedPathway === idx ? '1.5px solid #2E9E8A' : '1px solid #E5E5E2',
                boxShadow: selectedPathway === idx ? '0 4px 16px rgba(46,158,138,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                background: '#FFFFFF'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Badge variant={selectedPathway === idx ? 'teal' : 'neutral'}>
                  {p.tag}
                </Badge>
                <span className="tabular-nums" style={{ fontSize: 13, fontWeight: 700, color: '#2E9E8A' }}>
                  {p.matchScore}% Avg Fit
                </span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D1B', margin: '0 0 8px' }}>
                {p.name}
              </h3>
              <p style={{ fontSize: 13, color: '#5A5C5A', lineHeight: 1.5, marginBottom: 16 }}>
                {p.description}
              </p>
              <div style={{ borderTop: '1px solid #F1F1EF', paddingTop: 12, fontSize: 11, color: '#8A8C8A' }}>
                <div>Intake Spec: <strong className="tabular-nums" style={{ color: '#1A1D1B' }}>{p.purityNeeds}</strong></div>
                <div style={{ marginTop: 2 }}>Volume: <strong className="tabular-nums" style={{ color: '#1A1D1B' }}>{p.volumeRange}</strong></div>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
