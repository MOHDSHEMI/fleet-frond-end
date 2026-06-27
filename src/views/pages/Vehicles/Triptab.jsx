import React, { useState, useEffect } from 'react'
import { getTrips, addTrip, deleteTrip, } from '../../../services/Vehicleservice'
import { PartyIcon } from '../Parties/PartiesModal'
import { getParties } from '../../../services/Parties.Service'

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (identical to VehicleDetail)
───────────────────────────────────────────────────────────── */
const T = {
  navy: '#0f1629',
  navyMid: '#1e2a45',
  navyLight: '#2d3f5f',
  blue: '#2563eb',
  blueLight: '#eff6ff',
  blueMid: '#bfdbfe',
  amber: '#d97706',
  amberLight: '#fffbeb',
  amberMid: '#fde68a',
  slate: '#64748b',
  slateLight: '#f8fafc',
  border: '#e2e8f0',
  borderHover: '#cbd5e1',
  white: '#ffffff',
  textPrimary: '#0f172a',
  textSecond: '#475569',
  textMuted: '#94a3b8',
  danger: '#dc2626',
  dangerLight: '#fef2f2',
  dangerBorder: '#fecaca',
  success: '#16a34a',
  successLight: '#f0fdf4',
  warn: '#ea580c',
  warnLight: '#fff7ed',
  violet: '#7c3aed',
  violetLight: '#f5f3ff',
}

/* ─────────────────────────────────────────────────────────────
   SVG ICONS  (identical to VehicleDetail)
───────────────────────────────────────────────────────────── */
const Icon = ({ name, size = 16, color = 'currentColor', style: sx }) => {
  const paths = {
    truck: 'M1 3h11v9H1zm11 3h3l2 2v4h-5zM4 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    excavator: 'M3 17L3 9l4-4h3l1 1v5l3 1 1 3H3zm9-11l2-2 3 3-2 2z',
    plus: 'M12 5v14M5 12h14',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    alert: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
    check: 'M20 6L9 17l-5-5',
    calendar: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
    fuel: 'M3 22V6l4-4h8l4 4v16M10 22v-6h4v6M3 10h18',
    close: 'M18 6L6 18M6 6l12 12',
    car: 'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l4 6v8a2 2 0 0 1-2 2h-2M14 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
    rupee: 'M6 3h12M6 8h12M15 21L9 8m0 0h1.5a4.5 4.5 0 0 1 0 9H9l6 4',
    trending: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0v6M12 3v3M4.22 4.22l2.12 2.12M1 12H4m14.66-7.78l-2.12 2.12M23 12h-3m-2.34 7.78l-2.12-2.12M4.22 19.78l2.12-2.12',
    hash: 'M4 9h16M4 15h16M10 3L8 21M16 3l-2 18',
    info: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 9v5m0-9h.01',
    road: 'M3 17l3-12h12l3 12H3zM9 17V9m6 8V9',
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
const fmt = (n) =>
  n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'

const EMPTY_LORRY = {
  tripDate: '', slipNo: '', leadKm: '', uChainage: '',
  kmDriven: '', rentPerKm: '', otherExpense: '', notes: '', partyId: '',
}
const EMPTY_HITACHI = {
  tripDate: '', workType: 'bucket', startingHours: '',
  closingHours: '', income: '', bata: '1500', diesel: '', notes: '', partyId: '',
}

/* ─────────────────────────────────────────────────────────────
   FORM FIELD  — reusable labeled input
───────────────────────────────────────────────────────────── */
const Field = ({ label, required, children, hint }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: T.textSecond, letterSpacing: '0.04em' }}>
      {label}{required && <span style={{ color: T.danger, marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <span style={{ fontSize: 10, color: T.textMuted }}>{hint}</span>}
  </div>
)

const inputStyle = (readOnly) => ({
  width: '100%', padding: '8px 11px', borderRadius: 7,
  border: `1px solid ${T.border}`, fontSize: 13, color: readOnly ? T.textMuted : T.textPrimary,
  background: readOnly ? T.slateLight : T.white,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color 0.12s',
})

/* ─────────────────────────────────────────────────────────────
   STAT PILL  — summary totals at the bottom
───────────────────────────────────────────────────────────── */
const StatPill = ({ icon, label, value, accent }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', borderRadius: 8, background: accent + '12',
    border: `1px solid ${accent}30`
  }}>
    <Icon name={icon} size={14} color={accent} />
    <span style={{ fontSize: 12, color: T.textMuted }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{value}</span>
  </div>
)

/* ─────────────────────────────────────────────────────────────
   BADGE  — work type pill
───────────────────────────────────────────────────────────── */
const Badge = ({ type }) => {
  const isBucket = type === 'bucket'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: isBucket ? T.blueLight : T.amberLight,
      color: isBucket ? T.blue : T.amber,
      border: `1px solid ${isBucket ? T.blueMid : T.amberMid}`,
      textTransform: 'capitalize',
    }}>
      {type}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   MODAL  — shared container
───────────────────────────────────────────────────────────── */
const Modal = ({ visible, onClose, title, children, footer }) => {
  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,22,41,0.55)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: T.white, borderRadius: 14, width: '100%', maxWidth: 680,
        boxShadow: '0 20px 60px rgba(15,22,41,0.2)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: `1px solid ${T.border}`
        }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, borderRadius: 5, display: 'flex',
            color: T.textMuted, transition: 'color 0.12s'
          }}
            onMouseEnter={e => e.currentTarget.style.color = T.textPrimary}
            onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
            <Icon name="close" size={16} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '22px 22px 4px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '16px 22px', borderTop: `1px solid ${T.border}`
        }}>
          {footer}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   BUTTONS
───────────────────────────────────────────────────────────── */
const Btn = ({ onClick, disabled, variant = 'primary', size = 'md', children, style: sx }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: size === 'sm' ? '5px 12px' : '8px 18px',
    borderRadius: 7, fontSize: size === 'sm' ? 12 : 13,
    fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent', transition: 'all 0.12s',
    fontFamily: 'inherit', opacity: disabled ? 0.6 : 1, ...sx,
  }
  const variants = {
    primary: { background: T.navy, color: T.white, borderColor: T.navy },
    secondary: { background: T.white, color: T.textSecond, borderColor: T.border },
    danger: { background: T.dangerLight, color: T.danger, borderColor: T.dangerBorder },
    dangerSolid: { background: T.danger, color: T.white, borderColor: T.danger },
  }
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
      {children}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────
   TABLE CELL STYLES
───────────────────────────────────────────────────────────── */
const th = {
  padding: '10px 14px', fontSize: 11, fontWeight: 700, color: T.slate,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  background: T.slateLight, borderBottom: `1px solid ${T.border}`,
  whiteSpace: 'nowrap',
}
const td = (muted) => ({
  padding: '11px 14px', fontSize: 13,
  color: muted ? T.textMuted : T.textPrimary,
  borderBottom: `1px solid ${T.border}`, verticalAlign: 'middle',
})

/* ─────────────────────────────────────────────────────────────
   TRIP TAB
───────────────────────────────────────────────────────────── */
const TripTab = ({ vehicleId, vehicleType, month }) => {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [delId, setDelId] = useState(null)
  const [parties, setParties] = useState([])
  const [form, setForm] = useState(vehicleType === 'lorry' ? EMPTY_LORRY : EMPTY_HITACHI)

  const isLorry = vehicleType === 'lorry'

  useEffect(() => {
    getParties().then(setParties).catch(() => { })
  }, [])

  const load = async () => {
    try { setLoading(true); setTrips(await getTrips(vehicleId, month)) }
    catch { setError('Failed to load trips.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [vehicleId, month])

  const field = (k) => ({
    value: form[k],
    onChange: e => setForm(prev => ({ ...prev, [k]: e.target.value })),
  })

  const handleAdd = async () => {
    setSaving(true)
    try {
      const payload = {}
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '')
          payload[k] = isNaN(v) || (typeof v === 'string' && v.includes('-')) ? v : Number(v)
      })
      await addTrip(vehicleId, payload)
      setModal(false)
      setForm(isLorry ? EMPTY_LORRY : EMPTY_HITACHI)
      load()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add trip.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await deleteTrip(id); load() }
    catch { setError('Failed to delete trip.') }
    finally { setDelId(null) }
  }

  // Auto-preview values
  const previewIncome = !isLorry ? null :
    (form.kmDriven && form.rentPerKm
      ? `₹${(Number(form.kmDriven) * Number(form.rentPerKm)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      : null)

  const previewHours = isLorry ? null :
    (form.startingHours && form.closingHours
      ? (Number(form.closingHours) - Number(form.startingHours)).toFixed(2)
      : null)

  // Totals
  const totalIncome = trips.reduce((s, t) => s + Number(t.income || 0), 0)
  const totalKm = trips.reduce((s, t) => s + Number(t.kmDriven || 0), 0)
  const totalHours = trips.reduce((s, t) => s + Number(t.hoursWorked || 0), 0)
  const totalBata = trips.reduce((s, t) => s + Number(t.bata || 0), 0)
  const totalDiesel = trips.reduce((s, t) => s + Number(t.diesel || 0), 0)

  return (
    <div style={{ fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input:focus, select:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) }
      `}</style>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
          background: T.dangerLight, border: `1px solid ${T.dangerBorder}`,
          borderRadius: 8, marginBottom: 16
        }}>
          <Icon name="alert" size={15} color={T.danger} />
          <span style={{ flex: 1, fontSize: 13, color: T.danger }}>{error}</span>
          <button onClick={() => setError('')} style={{
            background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', padding: 2
          }}>
            <Icon name="close" size={13} color={T.danger} />
          </button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name={isLorry ? 'truck' : 'excavator'} size={14} color={T.textMuted} />
          <span style={{ fontSize: 13, color: T.textMuted }}>
            <strong style={{ color: T.textPrimary }}>{trips.length}</strong>
            {' '}trip{trips.length !== 1 ? 's' : ''} this month
          </span>
        </div>
        <Btn onClick={() => setModal(true)}>
          <Icon name="plus" size={13} color={T.white} /> Add Trip
        </Btn>
      </div>

      {/* ── Loading spinner ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div style={{
            width: 28, height: 28, border: `2.5px solid ${T.border}`,
            borderTopColor: T.blue, borderRadius: '50%',
            animation: 'spin 0.7s linear infinite'
          }} />
        </div>
      ) : (
        <>
          {/* ── Table ── */}
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Date</th>
                    <th style={th}>Party</th>
                    {!isLorry && <>
                      <th style={th}>Type</th>
                      <th style={th}>Start Hr</th>
                      <th style={th}>Close Hr</th>
                      <th style={th}>Hours</th>
                      <th style={th}>Bata</th>
                      <th style={th}>Diesel</th>
                    </>}
                    {isLorry && <>
                      <th style={th}>Slip No</th>
                      <th style={th}>Lead KM</th>
                      <th style={th}>U Chainage</th>
                      <th style={th}>KM</th>
                      <th style={th}>Rate/KM</th>
                    </>}
                    <th style={{ ...th, textAlign: 'right' }}>Income</th>
                    <th style={{ ...th, width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {trips.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <Icon name={isLorry ? 'truck' : 'excavator'} size={28} color={T.border} />
                          <span style={{ fontSize: 13, color: T.textMuted }}>No trips recorded for this month</span>
                        </div>
                      </td>
                    </tr>
                  ) : trips.map((t, i) => (
                    <tr key={t.id}
                      style={{ background: i % 2 === 0 ? T.white : T.slateLight + '80' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.blueLight}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.white : T.slateLight + '80'}>
                      <td style={td()}>
                        {new Date(t.tripDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={td(true)}>{t.party?.name || '—'}</td>
                      {!isLorry && <>
                        <td style={td()}><Badge type={t.workType} /></td>
                        <td style={td(true)}>{t.startingHours}</td>
                        <td style={td(true)}>{t.closingHours}</td>
                        <td style={td()}><strong>{t.hoursWorked}</strong></td>
                        <td style={td()}>{fmt(t.bata)}</td>
                        <td style={td(true)}>{t.diesel ? fmt(t.diesel) : '—'}</td>
                      </>}
                      {isLorry && <>
                        <td style={td(true)}>{t.slipNo || '—'}</td>
                        <td style={td(true)}>{t.leadKm}</td>
                        <td style={td(true)}>{t.uChainage}</td>
                        <td style={td()}><strong>{t.kmDriven}</strong></td>
                        <td style={td(true)}>{fmt(t.rentPerKm)}</td>
                      </>}
                      <td style={{ ...td(), textAlign: 'right', fontWeight: 700, color: T.success }}>
                        {fmt(t.income)}
                      </td>
                      <td style={{ ...td(), textAlign: 'center' }}>
                        {delId === t.id ? (
                          <span style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                            <Btn size="sm" variant="dangerSolid" onClick={() => handleDelete(t.id)}>Yes</Btn>
                            <Btn size="sm" variant="secondary" onClick={() => setDelId(null)}>No</Btn>
                          </span>
                        ) : (
                          <button onClick={() => setDelId(t.id)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              padding: '4px 6px', borderRadius: 6, color: T.textMuted,
                              transition: 'color 0.12s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = T.danger}
                            onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
                            <Icon name="trash" size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Totals strip ── */}
          {trips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
              {isLorry
                ? <StatPill icon="road" label="Total KM" value={`${totalKm.toFixed(2)} km`} accent={T.blue} />
                : <>
                  <StatPill icon="settings" label="Total Hours" value={`${totalHours.toFixed(2)} hrs`} accent={T.blue} />
                  <StatPill icon="rupee" label="Bata" value={fmt(totalBata)} accent={T.amber} />
                  <StatPill icon="fuel" label="Diesel" value={fmt(totalDiesel)} accent={T.warn} />
                </>
              }
              <StatPill icon="rupee" label="Total Income" value={fmt(totalIncome)} accent={T.success}
                style={{ marginLeft: 'auto' }} />
            </div>
          )}
        </>
      )}

      {/* ── Add Trip Modal ── */}
      <Modal
        visible={modal}
        onClose={() => setModal(false)}
        title={`Add Trip — ${isLorry ? 'Lorry' : 'Hitachi'}`}
        footer={<>
          <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn
            onClick={handleAdd}
            disabled={saving || !form.tripDate}
          >
            {saving
              ? <><div style={{
                width: 12, height: 12, border: `2px solid rgba(255,255,255,0.4)`,
                borderTopColor: T.white, borderRadius: '50%',
                animation: 'spin 0.7s linear infinite'
              }} /> Saving…</>
              : <><Icon name="plus" size={13} color={T.white} /> Add Trip</>
            }
          </Btn>
        </>}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingBottom: 20 }}>

          {/* ── Shared: Date ── */}
          <Field label="Date" required>
            <input type="date" style={inputStyle(false)} {...field('tripDate')} />
          </Field>

          <Field label="Party" hint="Optional">
            <select style={{ ...inputStyle(false), cursor: 'pointer' }} {...field('partyId')}>
              <option value="">— None —</option>
              {parties.map(p => (
                <option key={p.id} value={p.id}>{p.name}{p.location ? ` — ${p.location}` : ''}</option>
              ))}
            </select>
          </Field>

          {/* ── Hitachi fields ── */}
          {!isLorry && <>
            <Field label="Work Type">
              <select style={{ ...inputStyle(false), cursor: 'pointer' }} {...field('workType')}>
                <option value="bucket">Bucket</option>
                <option value="breaker">Breaker</option>
              </select>
            </Field>
            <div /> {/* spacer */}

            <Field label="Starting Hours" required>
              <input type="number" step="0.1" placeholder="e.g. 5020.4"
                style={inputStyle(false)} {...field('startingHours')} />
            </Field>
            <Field label="Closing Hours" required>
              <input type="number" step="0.1" placeholder="e.g. 5027.0"
                style={inputStyle(false)} {...field('closingHours')} />
            </Field>
            <Field label="Hours Worked" hint="Auto-calculated">
              <input readOnly style={inputStyle(true)} value={previewHours ?? '—'} />
            </Field>

            <Field label="Income (₹)" required>
              <input type="number" placeholder="e.g. 13200"
                style={inputStyle(false)} {...field('income')} />
            </Field>
            <Field label="Bata (₹)">
              <input type="number" style={inputStyle(false)} {...field('bata')} />
            </Field>
            <Field label="Diesel (₹)">
              <input type="number" placeholder="e.g. 19096"
                style={inputStyle(false)} {...field('diesel')} />
            </Field>
          </>}

          {/* ── Lorry fields ── */}
          {isLorry && <>
            <Field label="Slip No">
              <input placeholder="e.g. 44265" style={inputStyle(false)} {...field('slipNo')} />
            </Field>
            <Field label="Lead KM">
              <input type="number" step="0.01" placeholder="e.g. 21.40"
                style={inputStyle(false)} {...field('leadKm')} />
            </Field>

            <Field label="U Chainage">
              <input type="number" placeholder="e.g. 381900"
                style={inputStyle(false)} {...field('uChainage')} />
            </Field>
            <Field label="KM Driven" required>
              <input type="number" step="0.01" placeholder="e.g. 53.30"
                style={inputStyle(false)} {...field('kmDriven')} />
            </Field>
            <Field label="Rent per KM (₹)">
              <input type="number" step="0.01" placeholder="e.g. 175"
                style={inputStyle(false)} {...field('rentPerKm')} />
            </Field>
            <Field label="Income (₹)" hint="Auto: KM × Rate">
              <input readOnly style={inputStyle(true)} value={previewIncome ?? '—'} />
            </Field>

            <Field label="Other Expense (₹)">
              <input type="number" placeholder="Tolls etc."
                style={inputStyle(false)} {...field('otherExpense')} />
            </Field>
          </>}

          {/* ── Shared: Notes ── */}
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Notes">
              <input placeholder="Optional" style={inputStyle(false)} {...field('notes')} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TripTab