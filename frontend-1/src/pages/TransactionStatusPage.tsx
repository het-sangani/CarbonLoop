import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  Button,
  Badge,
  LabelCaps,
  PageHeader,
  ProgressBar,
  StatTile
} from '../components/common/UIComponents';
import { mockTransactions, Transaction } from '../mockData';
import {
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Download,
  ExternalLink,
  ArrowLeft,
  Gauge,
  Thermometer,
  AlertCircle,
  Play,
  CheckCheck
} from 'lucide-react';
import { carbonLoopApi } from '../services/api';

export default function TransactionStatusPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [realJob, setRealJob] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTransportData = async () => {
      setLoading(true);
      setError(null);
      try {
        const jobs = await carbonLoopApi.getTransportJobs();
        if (jobs && jobs.length > 0) {
          // Find by id or request_id
          const matched = jobs.find((j: any) => j.id === id || j.request_id === id);
          setRealJob(matched || jobs[0]);
        }
      } catch (err: any) {
        console.error('Failed to load transport jobs', err);
        setError(err.message || 'Error fetching transport status');
      } finally {
        setLoading(false);
      }
    };

    fetchTransportData();
  }, [id]);

  const handleUpdateTransportStatus = async (newStatus: 'IN_TRANSIT' | 'DELIVERED') => {
    if (!realJob) return;
    setUpdating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await carbonLoopApi.updateTransportJobStatus(realJob.id, newStatus);
      setRealJob(updated);
      setSuccessMsg(`Transport status updated to ${newStatus} successfully.`);
    } catch (err: any) {
      console.error('Failed to update transport status', err);
      setError(`Failed to update transport status: ${err.message || 'API error'}`);
    } finally {
      setUpdating(false);
    }
  };

  // Find fallback mock transaction
  const txn: Transaction =
    mockTransactions.find((t) => t.id === id) || mockTransactions[0];

  const currentStatus = realJob?.status || (txn ? 'IN_TRANSIT' : 'ASSIGNED');

  const stages = [
    { 
      title: 'Bilateral Term Sheet', 
      desc: 'Signed by Supplier & Off-taker', 
      status: 'completed' 
    },
    { 
      title: 'Laboratory Purity Assay', 
      desc: 'GC-MS verified 96.0% purity', 
      status: 'completed' 
    },
    { 
      title: 'Active Road Transit', 
      desc: currentStatus === 'IN_TRANSIT' ? 'Cryo-Tanker dispatch on highway' : currentStatus === 'DELIVERED' ? 'Transit completed' : 'Awaiting transporter pickup', 
      status: currentStatus === 'IN_TRANSIT' ? 'active' : currentStatus === 'DELIVERED' ? 'completed' : 'pending' 
    },
    { 
      title: 'Custody Transfer & Ledger', 
      desc: currentStatus === 'DELIVERED' ? 'Off-take manifold intake & cert verified' : 'Off-take manifold intake & cert', 
      status: currentStatus === 'DELIVERED' ? 'completed' : 'pending' 
    },
  ];


  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px' }}>
      <button
        onClick={() => navigate('/dashboard/supplier')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#5A5C5A',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 16,
          padding: 0
        }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Alerts */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '12px 16px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '12px 16px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} color="#166534" />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{successMsg}</span>
        </div>
      )}

      <PageHeader
        badge={`Clearinghouse Protocol • Job #${realJob ? realJob.id.slice(0, 8) : txn.id}`}
        title={`Custody Settlement & Transit Tracking — ${realJob ? realJob.id.slice(0, 8) : txn.id}`}
        subtitle={`Live bilateral execution between ${realJob ? realJob.pickup_location : txn.originLocation} and ${realJob ? realJob.delivery_location : txn.destinationLocation}.`}
        actions={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={14} />}
              onClick={() => alert(`Custody Transfer Note downloaded.`)}
            >
              Export Transfer Note
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ShieldCheck size={14} />}
              onClick={() => alert(`Verified Certificate matches ISO 14064-2 ledger record.`)}
            >
              Verify ISO Stamp
            </Button>
          </div>
        }
      />

      {/* TOP STAT TILES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28
        }}
      >
        <StatTile
          label="Estimated Freight Cost"
          value={realJob ? `$${realJob.estimated_cost.toLocaleString()}` : `$${txn.totalValueUSD.toLocaleString()}`}
          unit={realJob ? `@ ${realJob.distance_km} km` : `@ $${txn.pricePerTonneUSD}/t`}
        />
        <StatTile
          label="Corridor Distance"
          value={realJob ? `${realJob.distance_km}` : `${txn.distanceKm}`}
          unit="km highway route"
        />
        <StatTile
          label="Net Carbon Displaced"
          value={txn.netCarbonImpactTonnes}
          unit="tonnes CO₂e"
          delta="+99.5% Net"
        />
        <StatTile
          label="Current Transit Stage"
          value={currentStatus === 'IN_TRANSIT' ? 'In Transit' : currentStatus === 'DELIVERED' ? 'Delivered' : 'Assigned'}
          unit={currentStatus === 'DELIVERED' ? '100% complete' : currentStatus === 'IN_TRANSIT' ? '65% complete' : 'Dispatched'}
        />
      </div>

      {/* 4-STAGE PIPELINE STEPPER */}
      <Card style={{ padding: '24px', marginBottom: 28 }}>
        <LabelCaps style={{ marginBottom: 16 }}>Digital Chain of Custody Pipeline</LabelCaps>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            position: 'relative'
          }}
        >
          {stages.map((stage, idx) => (
            <div
              key={idx}
              style={{
                background: stage.status === 'active' ? '#FFFFFF' : '#FAFAF9',
                border: stage.status === 'active' ? '2px solid #2E9E8A' : '1px solid #E5E5E2',
                borderRadius: 8,
                padding: '16px',
                boxShadow: stage.status === 'active' ? '0 4px 14px rgba(46,158,138,0.14)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: stage.status === 'completed' ? '#2E9E8A' : stage.status === 'active' ? '#0F3D2E' : '#8A8C8A'
                  }}
                >
                  PHASE 0{idx + 1}
                </span>
                {stage.status === 'completed' && <CheckCircle2 size={16} color="#2E9E8A" />}
                {stage.status === 'active' && <Badge variant="teal" dot pulse>Live Now</Badge>}
                {stage.status === 'pending' && <Clock size={16} color="#8A8C8A" />}
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1B', marginBottom: 4 }}>
                {stage.title}
              </div>
              <div style={{ fontSize: 12, color: '#5A5C5A' }}>
                {stage.desc}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* ACTIVE LIVE TRANSIT MONITOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '1.8' }}>
          <Card style={{ padding: '24px' }} accentColor="#2E9E8A">
            <CardHeader
              title="Cryogenic Tanker Telemetry & Corridor Tracker"
              subtitle="Real-time IoT telemetry from GJ-01-CZ-4920 on National Highway 48"
              action={<Badge variant="teal" dot pulse>Live Telemetry Feed</Badge>}
              style={{ padding: 0, marginBottom: 20 }}
            />

            {/* Route Map Representation */}
            <div
              style={{
                background: '#FAFAF9',
                border: '1px solid #E5E5E2',
                borderRadius: 8,
                padding: '20px',
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <LabelCaps style={{ fontSize: 9 }}>Origin Point</LabelCaps>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1B' }}>
                    {realJob ? realJob.pickup_location : txn.originLocation}
                  </div>
                  <div style={{ fontSize: 11, color: '#8A8C8A' }}>Emitter Dispatch Terminal</div>
                </div>

                <div style={{ textAlign: 'center', padding: '0 16px' }}>
                  <Badge variant="neutral">
                    <Truck size={12} /> Highway Corridor
                  </Badge>
                  <div className="tabular-nums" style={{ fontSize: 11, color: '#8A8C8A', marginTop: 4 }}>
                    Total: {realJob ? realJob.distance_km : txn.distanceKm} km
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <LabelCaps style={{ fontSize: 9 }}>Destination Hub</LabelCaps>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1B' }}>
                    {realJob ? realJob.delivery_location : txn.destinationLocation}
                  </div>
                  <div style={{ fontSize: 11, color: '#8A8C8A' }}>Off-taker Synthesis Plant</div>
                </div>
              </div>

              {/* Transit Progress Bar */}
              <div style={{ marginBottom: 8 }}>
                <ProgressBar
                  value={currentStatus === 'DELIVERED' ? 100 : currentStatus === 'IN_TRANSIT' ? 65 : 15}
                  label={currentStatus === 'DELIVERED' ? 'Delivery Completed at Off-take Manifold' : currentStatus === 'IN_TRANSIT' ? `Active Highway Transit: ${realJob ? realJob.distance_km : txn.distanceKm} km` : 'Dispatched to Hauler Depot'}
                  color="#2E9E8A"
                  height={8}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#5A5C5A' }}>
                <span>Dispatched: <strong className="tabular-nums">{realJob ? new Date(realJob.created_at).toLocaleDateString() : txn.createdAt}</strong></span>
                <span>Job Status: <strong className="tabular-nums">{currentStatus}</strong></span>
              </div>
            </div>

            {/* Live Trailer Sensor Readings */}
            <LabelCaps style={{ marginBottom: 10 }}>Trailer On-Board Telemetry Sensors</LabelCaps>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div style={{ background: '#FAFAF9', padding: '12px 16px', borderRadius: 6, border: '1px solid #E5E5E2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8A8C8A', marginBottom: 2 }}>
                  <Gauge size={13} />
                  <span style={{ fontSize: 11 }}>Vapor Pressure</span>
                </div>
                <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1B' }}>
                  18.2 bar <span style={{ fontSize: 11, color: '#2E9E8A', fontWeight: 600 }}>(Nominal)</span>
                </div>
              </div>

              <div style={{ background: '#FAFAF9', padding: '12px 16px', borderRadius: 6, border: '1px solid #E5E5E2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8A8C8A', marginBottom: 2 }}>
                  <Thermometer size={13} />
                  <span style={{ fontSize: 11 }}>Cryo Core Temp</span>
                </div>
                <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1B' }}>
                  -21.8 °C <span style={{ fontSize: 11, color: '#2E9E8A', fontWeight: 600 }}>(Stable)</span>
                </div>
              </div>

              <div style={{ background: '#FAFAF9', padding: '12px 16px', borderRadius: 6, border: '1px solid #E5E5E2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8A8C8A', marginBottom: 2 }}>
                  <Truck size={13} />
                  <span style={{ fontSize: 11 }}>Vehicle Speed</span>
                </div>
                <div className="tabular-nums" style={{ fontSize: 15, fontWeight: 700, color: '#1A1D1B' }}>
                  {currentStatus === 'IN_TRANSIT' ? '62 km/h' : currentStatus === 'DELIVERED' ? '0 km/h (Docked)' : 'Idle at Depot'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* FINANCIAL & CARBON LINEAGE RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '1.1' }}>
          {/* Transporter Dispatch Control Card */}
          {realJob && (
            <Card style={{ padding: '24px' }} accentColor="#2E9E8A">
              <CardHeader
                title="Transporter & Dispatch Operations"
                subtitle={`Job ID: ${realJob.id ? realJob.id.slice(0, 8) : 'JOB'}...`}
                action={
                  <Badge variant={currentStatus === 'DELIVERED' ? 'teal' : currentStatus === 'IN_TRANSIT' ? 'green' : 'neutral'} dot>
                    {currentStatus}
                  </Badge>
                }
                style={{ padding: 0, marginBottom: 14 }}
              />
              <div style={{ fontSize: 13, color: '#5A5C5A', marginBottom: 16 }}>
                Operate cryogenic fleet dispatch stages in real-time across the regional transport network.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(currentStatus === 'ASSIGNED' || currentStatus === 'PENDING' || currentStatus === 'CREATED') && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Play size={13} />}
                    disabled={updating}
                    onClick={() => handleUpdateTransportStatus('IN_TRANSIT')}
                  >
                    {updating ? 'Updating Fleet...' : 'Dispatch Tanker (Start In-Transit)'}
                  </Button>
                )}

                {currentStatus === 'IN_TRANSIT' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CheckCheck size={14} />}
                    disabled={updating}
                    onClick={() => handleUpdateTransportStatus('DELIVERED')}
                  >
                    {updating ? 'Confirming...' : 'Confirm Delivery at Off-take Manifold'}
                  </Button>
                )}

                {currentStatus === 'DELIVERED' && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 6, padding: '10px 12px', fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={15} color="#166534" />
                    <span>Custody transfer finalized. Off-take volume logged.</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Carbon Credit & Accounting Certificate */}
          <Card style={{ padding: '24px' }} accentColor="#0F3D2E">
            <CardHeader
              title="Verified Carbon Accounting"
              subtitle="ISO 14064-2 registered credit stamp"
              style={{ padding: 0, marginBottom: 16 }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Gross CO₂ Avoided:</span>
                <span className="tabular-nums" style={{ fontWeight: 700, color: '#2E9E8A' }}>
                  +{txn.grossEmissionsAvoidedTonnes.toFixed(2)} tonnes
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#8A8C8A' }}>Hauling Logistics Footprint:</span>
                <span className="tabular-nums" style={{ fontWeight: 700, color: '#C0604A' }}>
                  -{txn.logisticsTransitEmissionsTonnes.toFixed(2)} tonnes
                </span>
              </div>

              <div style={{ height: 1, background: '#F1F1EF' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: '#1A1D1B' }}>Net Displaced Carbon:</span>
                <span className="tabular-nums" style={{ fontSize: 16, fontWeight: 800, color: '#0F3D2E' }}>
                  +{txn.netCarbonImpactTonnes.toFixed(2)} tonnes
                </span>
              </div>

              <div
                style={{
                  background: '#FAFAF9',
                  border: '1px solid #E5E5E2',
                  borderRadius: 6,
                  padding: '10px 12px',
                  marginTop: 6
                }}
              >
                <div style={{ fontSize: 11, color: '#8A8C8A' }}>Certificate Registry Hash:</div>
                <div className="tabular-nums" style={{ fontSize: 12, fontWeight: 700, color: '#0F3D2E', marginTop: 2 }}>
                  {txn.carbonAccountingCertId}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              icon={<ExternalLink size={14} />}
              onClick={() => alert(`Certificate ${txn.carbonAccountingCertId} verified against Indian Carbon Credit Registry.`)}
            >
              Verify On National Registry
            </Button>
          </Card>

          {/* Quick Navigation Cards */}
          <Card style={{ padding: '20px' }}>
            <LabelCaps style={{ marginBottom: 10 }}>Operational Portals</LabelCaps>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate('/dashboard/supplier')}
              >
                Switch to ABC Cement Supplier Hub
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate('/dashboard/buyer')}
              >
                Switch to GreenFuel Buyer Hub
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
