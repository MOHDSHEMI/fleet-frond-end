import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVehicle, getVehicleSummary } from '../../../services/Vehicleservice'
import TripTab        from './Triptab'
import PaymentTab     from './Paymenttab'
import FuelTab        from './Fueltab'
import MaintenanceTab from './Maintenancetab'
import SummaryTab     from './Summarytab'
import DocumentsTab   from './DcoumentTab'
import TyreTab       from './Tyretab'
/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (identical to VehicleList)
───────────────────────────────────────────────────────────── */
const T = {
  navy:         '#0f1629',
  navyMid:      '#1e2a45',
  navyLight:    '#2d3f5f',
  blue:         '#2563eb',
  blueLight:    '#eff6ff',
  blueMid:      '#bfdbfe',
  amber:        '#d97706',
  amberLight:   '#fffbeb',
  amberMid:     '#fde68a',
  slate:        '#64748b',
  slateLight:   '#f8fafc',
  border:       '#e2e8f0',
  borderHover:  '#cbd5e1',
  white:        '#ffffff',
  textPrimary:  '#0f172a',
  textSecond:   '#475569',
  textMuted:    '#94a3b8',
  danger:       '#dc2626',
  dangerLight:  '#fef2f2',
  dangerBorder: '#fecaca',
  success:      '#16a34a',
  successLight: '#f0fdf4',
  warn:         '#ea580c',
  warnLight:    '#fff7ed',
  violet:       '#7c3aed',
  violetLight:  '#f5f3ff',
}

/* ─────────────────────────────────────────────────────────────
   SVG ICONS  (identical to VehicleList)
───────────────────────────────────────────────────────────── */
const Icon = ({ name, size = 16, color = 'currentColor', style: sx }) => {
  const paths = {
    truck:       'M1 3h11v9H1zm11 3h3l2 2v4h-5zM4 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    excavator:   'M3 17L3 9l4-4h3l1 1v5l3 1 1 3H3zm9-11l2-2 3 3-2 2z',
    plus:        'M12 5v14M5 12h14',
    search:      'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
    trash:       'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    eye:         'M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    edit:        'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    alert:       'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
    check:       'M20 6L9 17l-5-5',
    calendar:    'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
    fuel:        'M3 22V6l4-4h8l4 4v16M10 22v-6h4v6M3 10h18',
    shield:      'M12 2L3 7v5c0 5.25 3.75 10.17 9 11.25C17.25 22.17 21 17.25 21 12V7z',
    tag:         'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
    settings:    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0v6M12 3v3M4.22 4.22l2.12 2.12M1 12H4m14.66-7.78l-2.12 2.12M23 12h-3m-2.34 7.78l-2.12-2.12M4.22 19.78l2.12-2.12',
    user:        'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    hash:        'M4 9h16M4 15h16M10 3L8 21M16 3l-2 18',
    info:        'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 9v5m0-9h.01',
    close:       'M18 6L6 18M6 6l12 12',
    car:         'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l4 6v8a2 2 0 0 1-2 2h-2M14 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
    back:        'M19 12H5M12 5l-7 7 7 7',
    rupee:       'M6 3h12M6 8h12M15 21L9 8m0 0h1.5a4.5 4.5 0 0 1 0 9H9l6 4',
    trending:    'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
    maintenance: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    payment:     'M3 10h18M3 6h18M3 14h6m4 0h5M3 18h3m4 0h7',
    summary:     'M9 17V7m0 10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10V7m0 10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2',
    permit:      'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...sx }}>
      <path d={paths[name] || paths.info} />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmt    = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'
const daysUntil = (d) => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null

const TYPE_CFG = {
  lorry:   { label: 'Lorry',   icon: 'truck',   pill: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' } },
  hitachi: { label: 'Hitachi', icon: 'excavator', pill: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' } },
}

/* ─────────────────────────────────────────────────────────────
   EXPIRY TAG  (identical to VehicleList)
───────────────────────────────────────────────────────────── */
const ExpiryTag = ({ label, dateStr }) => {
  const days    = daysUntil(dateStr)
  if (days === null) return null
  const expired = days < 0
  const warn    = !expired && days <= 30
  if (!expired && !warn) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600,
      background: expired ? T.dangerLight : T.warnLight,
      color:      expired ? T.danger      : T.warn,
      border:     `1px solid ${expired ? T.dangerBorder : '#fed7aa'}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%',
        background: expired ? T.danger : T.warn, flexShrink: 0 }} />
      {label} · {expired ? 'Expired' : `${days}d left`}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   STAT CARD  (same as VehicleList StatCard)
───────────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, accent }) => (
  <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10,
    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0,
      background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={18} color={accent} />
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: T.textSecond, marginTop: 1 }}>{sub}</div>}
    </div>
  </div>
)

/* ─────────────────────────────────────────────────────────────
   INFO ROW  — small label + value pair used in vehicle info panel
───────────────────────────────────────────────────────────── */
const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
    <Icon name={icon} size={13} color={T.textMuted} />
    <span style={{ fontSize: 12, color: T.textMuted, width: 110, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{value || '—'}</span>
  </div>
)

/* ─────────────────────────────────────────────────────────────
   TAB CONFIG
───────────────────────────────────────────────────────────── */
const TABS = [
  { key: 'trips',       label: 'Trips',       icon: 'car'         },
  { key: 'payments',    label: 'Payments',     icon: 'payment'     },
  { key: 'summary',     label: 'Summary',      icon: 'summary'     },
  { key: 'fuel',        label: 'Fuel Logs',    icon: 'fuel'        },
  { key: 'maintenance', label: 'Maintenance',  icon: 'maintenance' },
  { key: 'tyres',       label: 'Tyres',        icon: 'tyres'       },
  { key: 'documents',    label: 'Documents',     icon: 'documents'    },
]

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const VehicleDetail = () => {
  const { id }  = useParams()
  const navigate = useNavigate()

  const [vehicle, setVehicle] = useState(null)
  const [summary, setSummary] = useState(null)
  const [tab,     setTab]     = useState('trips')
  const [month,   setMonth]   = useState(() => new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const load = async () => {
    try {
      setLoading(true); setError('')
      const [v, s] = await Promise.all([getVehicle(id), getVehicleSummary(id, month)])
      setVehicle(v); setSummary(s)
    } catch { setError('Failed to load vehicle data.') }
    finally   { setLoading(false) }
  }

  useEffect(() => { load() }, [id, month])

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`,
          borderTopColor: T.blue, borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: T.textMuted, fontSize: 14 }}>Loading vehicle data…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!vehicle) return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}>
      <div style={{ padding: '20px 28px', background: T.dangerLight,
        border: `1px solid ${T.dangerBorder}`, borderRadius: 10, color: T.danger, fontSize: 14 }}>
        Vehicle not found.
      </div>
    </div>
  )

  const cfg = TYPE_CFG[vehicle.type] || TYPE_CFG.lorry

  const docAlerts = [
    { label: 'Insurance', d: vehicle.insuranceRenewalDate },
    { label: 'Tax',       d: vehicle.taxExpiryDate },
    { label: 'Permit',    d: vehicle.permitExpiryDate },
    { label: 'Battery',   d: vehicle.batteryWarrantyExpiryDate ?? vehicle.batteryWarrantyDate },
    { label: 'Tyre',      d: vehicle.tyreWarrantyExpiryDate    ?? vehicle.tyreWarrantyDate },
  ].filter(a => { const d = daysUntil(a.d); return d !== null && d <= 30 })

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9',
      fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: '20px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Back button */}
            <button
              onClick={() => navigate('/vehicles')}
              style={{ display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 7, border: `1px solid ${T.border}`,
                background: T.white, color: T.textSecond, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.color = T.blue }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecond }}>
              <Icon name="back" size={13} /> Back
            </button>

            {/* Vehicle icon */}
            <div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0,
              background: cfg.pill.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={cfg.icon} size={18} color={cfg.pill.text} />
            </div>

            {/* Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800,
                  color: T.textPrimary, letterSpacing: '-0.02em' }}>
                  {vehicle.name}
                </h1>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: cfg.pill.bg, color: cfg.pill.text, border: `1px solid ${cfg.pill.border}`,
                  letterSpacing: '0.03em' }}>
                  {cfg.label}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: T.textMuted }}>
                {vehicle.registrationNumber}
                {vehicle.driverName && ` · ${vehicle.driverName}`}
              </p>
            </div>
          </div>

          {/* Month picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="calendar" size={14} color={T.textMuted} />
            <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>Month</span>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{ border: `1px solid ${T.border}`, borderRadius: 7, padding: '6px 10px',
                fontSize: 13, color: T.textPrimary, background: T.white, outline: 'none',
                fontFamily: 'inherit', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 28 }}>

        {/* ── ERROR BANNER ── */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
            background: T.dangerLight, border: `1px solid ${T.dangerBorder}`,
            borderRadius: 8, marginBottom: 20 }}>
            <Icon name="alert" size={16} color={T.danger} />
            <span style={{ fontSize: 14, color: T.danger, flex: 1 }}>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none',
              cursor: 'pointer', padding: 4, display: 'flex' }}>
              <Icon name="close" size={14} color={T.danger} />
            </button>
          </div>
        )}

        {/* ── DOCUMENT ALERTS ── */}
        {docAlerts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20,
            padding: '12px 16px', background: T.warnLight,
            border: '1px solid #fed7aa', borderRadius: 8, alignItems: 'center' }}>
            <Icon name="alert" size={14} color={T.warn} />
            <span style={{ fontSize: 12, fontWeight: 700, color: T.warn, marginRight: 4 }}>
              Documents requiring attention:
            </span>
            {docAlerts.map(a => <ExpiryTag key={a.label} label={a.label} dateStr={a.d} />)}
          </div>
        )}

        {/* ── STAT CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard
            icon={vehicle.type === 'lorry' ? 'trending' : 'settings'}
            label={vehicle.type === 'lorry' ? 'Total KM' : 'Total Hours'}
            value={vehicle.type === 'lorry'
              ? `${Number(vehicle.totalKm || 0).toLocaleString('en-IN')} km`
              : `${Number(vehicle.totalHours || 0).toLocaleString('en-IN')} hrs`}
            accent={T.blue}
          />
          <StatCard
            icon="rupee"
            label="Total Income"
            value={fmt(summary?.tripSummary?.totalIncome)}
            accent={T.success}
          />
          <StatCard
            icon="trending"
            label="Gross Balance"
            value={fmt(summary?.tripSummary?.grossBalance)}
            accent={T.amber}
          />
          <StatCard
            icon="payment"
            label="Final Balance"
            value={fmt(summary?.payments?.finalBalance)}
            sub="After all deductions"
            accent={T.violet}
          />
        </div>

        {/* ── MAIN CONTENT GRID: vehicle info panel + tabs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>

          {/* ── LEFT: Vehicle Info Panel ── */}
          <div style={{ background: T.white, border: `1px solid ${T.border}`,
            borderRadius: 12, overflow: 'hidden' }}>

            {/* Panel header */}
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`,
              background: T.slateLight }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.slate,
                textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Vehicle Info
              </span>
            </div>

            <div style={{ padding: '4px 18px 16px' }}>
              <InfoRow icon="hash"    label="Registration"  value={vehicle.registrationNumber} />
              <InfoRow icon="car"     label="Model"         value={vehicle.model} />
              <InfoRow icon="user"    label="Driver"        value={vehicle.driverName} />
              <InfoRow icon="hash"    label="Chassis No."   value={vehicle.chassisNumber} />
              <InfoRow icon="fuel"    label="Fuel Type"     value="Diesel" />
              <InfoRow icon="tag"     label="Purchase Date" value={vehicle.purchaseDate} />
              <InfoRow icon="rupee"   label="Purchase Cost" value={vehicle.purchaseCost ? `₹${Number(vehicle.purchaseCost).toLocaleString('en-IN')}` : null} />
            </div>

            {/* Documents section */}
            <div style={{ borderTop: `1px solid ${T.border}` }}>
              <div style={{ padding: '12px 18px 4px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.slate,
                  textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Documents
                </span>
              </div>
              <div style={{ padding: '0 18px 16px' }}>
                <InfoRow icon="shield" label="Insurance"     value={vehicle.insuranceRenewalDate ? `Exp: ${vehicle.insuranceRenewalDate}` : null} />
                <InfoRow icon="tag"    label="Road Tax"      value={vehicle.taxExpiryDate        ? `Exp: ${vehicle.taxExpiryDate}`        : null} />
                <InfoRow icon="permit" label="Permit"        value={vehicle.permitExpiryDate     ? `Exp: ${vehicle.permitExpiryDate}`     : null} />
              </div>
            </div>

            {/* Warranty section */}
            <div style={{ borderTop: `1px solid ${T.border}` }}>
              <div style={{ padding: '12px 18px 4px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.slate,
                  textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Warranty
                </span>
              </div>
              <div style={{ padding: '0 18px 16px' }}>
                <InfoRow icon="settings" label="Battery" value={vehicle.batteryWarrantyExpiryDate ?? vehicle.batteryWarrantyDate ? `Exp: ${vehicle.batteryWarrantyExpiryDate ?? vehicle.batteryWarrantyDate}` : null} />
                {/* <InfoRow icon="settings" label="Tyres"   value={vehicle.tyreWarrantyExpiryDate   ?? vehicle.tyreWarrantyDate   ? `Exp: ${vehicle.tyreWarrantyExpiryDate   ?? vehicle.tyreWarrantyDate}`   : null} /> */}
              </div>
            </div>

            {/* Notes */}
            {vehicle.notes && (
              <div style={{ borderTop: `1px solid ${T.border}`, padding: '12px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.slate,
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Notes
                </div>
                <p style={{ margin: 0, fontSize: 12, color: T.textSecond, lineHeight: 1.6 }}>
                  {vehicle.notes}
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Tabs ── */}
          <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>

            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.slateLight }}>
              {TABS.map(t => {
                const active = tab === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 6, padding: '13px 8px', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: active ? 700 : 500,
                      background: active ? T.white : 'transparent',
                      color: active ? T.textPrimary : T.textMuted,
                      borderBottom: active ? `2px solid ${T.navy}` : '2px solid transparent',
                      transition: 'all 0.12s' }}>
                    <Icon name={t.icon} size={13} color={active ? T.navy : T.textMuted} />
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* Tab content */}
            <div style={{ padding: 20 }}>
              {tab === 'trips'       && <TripTab        vehicleId={id} vehicleType={vehicle.type} month={month} />}
              {tab === 'payments'    && <PaymentTab     vehicleId={id} />}
              {tab === 'summary'     && <SummaryTab     summary={summary} vehicleType={vehicle.type} />}
              {tab === 'fuel'        && <FuelTab        vehicleId={id} vehicleType={vehicle.type} />}
              {tab === 'maintenance' && <MaintenanceTab vehicleId={id} vehicleType={vehicle.type} />}
              {tab === 'tyres'       && <TyreTab       vehicleId={id} vehicleType={vehicle.type} />}
              {tab === 'documents'   && <DocumentsTab   vehicleId={id} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleDetail