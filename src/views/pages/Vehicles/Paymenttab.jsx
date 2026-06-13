import React, { useState, useEffect } from 'react'
import { getPayments, addPayment, deletePayment } from '../../../services/Vehicleservice'

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (identical to VehicleDetail / TripTab)
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
  successMid:   '#bbf7d0',
  warn:         '#ea580c',
  warnLight:    '#fff7ed',
  violet:       '#7c3aed',
  violetLight:  '#f5f3ff',
  violetMid:    '#ddd6fe',
}

/* ─────────────────────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────────────────────── */
const Icon = ({ name, size = 16, color = 'currentColor', style: sx }) => {
  const paths = {
    plus:    'M12 5v14M5 12h14',
    alert:   'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
    close:   'M18 6L6 18M6 6l12 12',
    trash:   'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    rupee:   'M6 3h12M6 8h12M15 21L9 8m0 0h1.5a4.5 4.5 0 0 1 0 9H9l6 4',
    payment: 'M3 10h18M3 6h18M3 14h6m4 0h5M3 18h3m4 0h7',
    info:    'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 9v5m0-9h.01',
    check:   'M20 6L9 17l-5-5',
    minus:   'M5 12h14',
    tag:     'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
    car:     'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l4 6v8a2 2 0 0 1-2 2h-2M14 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
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
   PAYMENT META
───────────────────────────────────────────────────────────── */
const PAYMENT_META = {
  shifting_charge: {
    label: 'Shifting Charge',
    icon: 'car',
    bg: T.successLight, text: T.success, border: T.successMid,
    effectBg: T.successLight, effectText: T.success,
    sign: '+', isDeduction: false,
  },
  auto_charge: {
    label: 'Auto Charge',
    icon: 'tag',
    bg: T.dangerLight, text: T.danger, border: T.dangerBorder,
    effectBg: T.dangerLight, effectText: T.danger,
    sign: '−', isDeduction: true,
  },
  cash_received: {
    label: 'Cash Received',
    icon: 'rupee',
    bg: T.blueLight, text: T.blue, border: T.blueMid,
    effectBg: T.dangerLight, effectText: T.danger,
    sign: '−', isDeduction: true,
  },
  other_charge: {
    label: 'Other Charge',
    icon: 'info',
    bg: T.violetLight, text: T.violet, border: T.violetMid,
    effectBg: T.amberLight, effectText: T.amber,
    sign: '±', isDeduction: false,
  },
}

const EMPTY = { type: 'shifting_charge', date: '', amount: '', notes: '' }

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmt = (n) =>
  n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'

/* ─────────────────────────────────────────────────────────────
   SHARED UI PRIMITIVES  (same as TripTab)
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

const inputStyle = {
  width: '100%', padding: '8px 11px', borderRadius: 7,
  border: `1px solid ${T.border}`, fontSize: 13, color: T.textPrimary,
  background: T.white, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', transition: 'border-color 0.12s',
}

const Btn = ({ onClick, disabled, variant = 'primary', size = 'md', children }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: size === 'sm' ? '5px 12px' : '8px 18px',
    borderRadius: 7, fontSize: size === 'sm' ? 12 : 13,
    fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent', transition: 'all 0.12s',
    fontFamily: 'inherit', opacity: disabled ? 0.6 : 1,
  }
  const variants = {
    primary:     { background: T.navy,        color: T.white,      borderColor: T.navy },
    secondary:   { background: T.white,       color: T.textSecond, borderColor: T.border },
    danger:      { background: T.dangerLight, color: T.danger,     borderColor: T.dangerBorder },
    dangerSolid: { background: T.danger,      color: T.white,      borderColor: T.danger },
  }
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.85' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
      {children}
    </button>
  )
}

const Modal = ({ visible, onClose, title, children, footer }) => {
  if (!visible) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,22,41,0.55)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: T.white, borderRadius: 14, width: '100%', maxWidth: 540,
        boxShadow: '0 20px 60px rgba(15,22,41,0.2)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, borderRadius: 5, display: 'flex', color: T.textMuted }}
            onMouseEnter={e => e.currentTarget.style.color = T.textPrimary}
            onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div style={{ padding: '22px 22px 4px', overflowY: 'auto', flex: 1 }}>{children}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '16px 22px', borderTop: `1px solid ${T.border}` }}>
          {footer}
        </div>
      </div>
    </div>
  )
}

const StatPill = ({ icon, label, value, accent }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', borderRadius: 8,
    background: accent + '12', border: `1px solid ${accent}30` }}>
    <Icon name={icon} size={14} color={accent} />
    <span style={{ fontSize: 12, color: T.textMuted }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{value}</span>
  </div>
)

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
   TYPE BADGE
───────────────────────────────────────────────────────────── */
const TypeBadge = ({ type }) => {
  const m = PAYMENT_META[type] || PAYMENT_META.other_charge
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: m.bg, color: m.text, border: `1px solid ${m.border}` }}>
      <Icon name={m.icon} size={10} color={m.text} />
      {m.label}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   EFFECT PILL  (+Added / −Deducted)
───────────────────────────────────────────────────────────── */
const EffectPill = ({ isDeduction, sign }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
    background: isDeduction ? T.dangerLight : T.successLight,
    color: isDeduction ? T.danger : T.success,
    border: `1px solid ${isDeduction ? T.dangerBorder : T.successMid}` }}>
    {isDeduction ? '− Deducted' : '+ Added'}
  </span>
)

/* ─────────────────────────────────────────────────────────────
   PAYMENT TAB
───────────────────────────────────────────────────────────── */
const PaymentTab = ({ vehicleId }) => {
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [modal,    setModal]    = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState(EMPTY)
  const [delId,    setDelId]    = useState(null)

  const load = async () => {
    try { setLoading(true); setPayments(await getPayments(vehicleId)) }
    catch { setError('Failed to load payments.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [vehicleId])

  const field = (k) => ({
    value: form[k],
    onChange: e => setForm(prev => ({ ...prev, [k]: e.target.value })),
  })

  const handleAdd = async () => {
    setSaving(true)
    try {
      const meta = PAYMENT_META[form.type] || PAYMENT_META.other_charge
      await addPayment(vehicleId, {
        ...form,
        amount: Number(form.amount),
        isDeduction: meta.isDeduction,
      })
      setModal(false); setForm(EMPTY); load()
    } catch { setError('Failed to add payment.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await deletePayment(id); load() }
    catch { setError('Failed to delete payment.') }
    finally { setDelId(null) }
  }

  // Totals
  const totalAdded    = payments.filter(p => !p.isDeduction).reduce((s, p) => s + Number(p.amount || 0), 0)
  const totalDeducted = payments.filter(p =>  p.isDeduction).reduce((s, p) => s + Number(p.amount || 0), 0)
  const netBalance    = totalAdded - totalDeducted

  // Preview effect for selected type in form
  const selectedMeta = PAYMENT_META[form.type] || PAYMENT_META.other_charge

  return (
    <div style={{ fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input:focus, select:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) }
      `}</style>

      {/* ── Error banner ── */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
          background: T.dangerLight, border: `1px solid ${T.dangerBorder}`,
          borderRadius: 8, marginBottom: 16 }}>
          <Icon name="alert" size={15} color={T.danger} />
          <span style={{ flex: 1, fontSize: 13, color: T.danger }}>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none',
            cursor: 'pointer', display: 'flex', padding: 2 }}>
            <Icon name="close" size={13} color={T.danger} />
          </button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="payment" size={14} color={T.textMuted} />
          <span style={{ fontSize: 13, color: T.textMuted }}>
            <strong style={{ color: T.textPrimary }}>{payments.length}</strong>
            {' '}payment record{payments.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Btn onClick={() => setModal(true)}>
          <Icon name="plus" size={13} color={T.white} /> Add Payment
        </Btn>
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div style={{ width: 28, height: 28, border: `2.5px solid ${T.border}`,
            borderTopColor: T.blue, borderRadius: '50%',
            animation: 'spin 0.7s linear infinite' }} />
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
                    <th style={th}>Type</th>
                    <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                    <th style={th}>Effect</th>
                    <th style={th}>Notes</th>
                    <th style={{ ...th, width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <Icon name="payment" size={28} color={T.border} />
                          <span style={{ fontSize: 13, color: T.textMuted }}>No payment records yet</span>
                        </div>
                      </td>
                    </tr>
                  ) : payments.map((p, i) => (
                    <tr key={p.id}
                      style={{ background: i % 2 === 0 ? T.white : T.slateLight + '80' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.blueLight}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.white : T.slateLight + '80'}>
                      <td style={td(true)}>
                        {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={td()}><TypeBadge type={p.type} /></td>
                      <td style={{ ...td(), textAlign: 'right', fontWeight: 700,
                        color: p.isDeduction ? T.danger : T.success }}>
                        {p.isDeduction ? '−' : '+'} {fmt(p.amount)}
                      </td>
                      <td style={td()}><EffectPill isDeduction={p.isDeduction} /></td>
                      <td style={td(true)}>{p.notes || '—'}</td>
                      <td style={{ ...td(), textAlign: 'center' }}>
                        {delId === p.id ? (
                          <span style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                            <Btn size="sm" variant="dangerSolid" onClick={() => handleDelete(p.id)}>Yes</Btn>
                            <Btn size="sm" variant="secondary"   onClick={() => setDelId(null)}>No</Btn>
                          </span>
                        ) : (
                          <button onClick={() => setDelId(p.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer',
                              padding: '4px 6px', borderRadius: 6, color: T.textMuted,
                              transition: 'color 0.12s' }}
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
          {payments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
              <StatPill icon="plus"   label="Total Added"    value={fmt(totalAdded)}    accent={T.success} />
              <StatPill icon="minus"  label="Total Deducted" value={fmt(totalDeducted)} accent={T.danger}  />
              <StatPill icon="rupee"  label="Net Balance"
                value={fmt(Math.abs(netBalance))}
                accent={netBalance >= 0 ? T.success : T.danger} />
            </div>
          )}
        </>
      )}

      {/* ── Add Payment Modal ── */}
      <Modal
        visible={modal}
        onClose={() => setModal(false)}
        title="Add Payment"
        footer={<>
          <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn onClick={handleAdd} disabled={saving || !form.date || !form.amount}>
            {saving
              ? <><div style={{ width: 12, height: 12, border: `2px solid rgba(255,255,255,0.4)`,
                  borderTopColor: T.white, borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite' }} /> Saving…</>
              : <><Icon name="plus" size={13} color={T.white} /> Add Payment</>
            }
          </Btn>
        </>}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingBottom: 20 }}>

          <Field label="Type">
            <select style={{ ...inputStyle, cursor: 'pointer' }} {...field('type')}>
              <option value="shifting_charge">Shifting Charge  (+ added)</option>
              <option value="auto_charge">Auto Charge  (− deducted)</option>
              <option value="cash_received">Cash Received  (− deducted)</option>
              <option value="other_charge">Other Charge</option>
            </select>
          </Field>

          <Field label="Date" required>
            <input type="date" style={inputStyle} {...field('date')} />
          </Field>

          <Field label="Amount (₹)" required>
            <input type="number" placeholder="e.g. 5500" style={inputStyle} {...field('amount')} />
          </Field>

          {/* Effect preview */}
          <Field label="Effect">
            <div style={{ display: 'flex', alignItems: 'center', height: 36,
              padding: '0 11px', borderRadius: 7, border: `1px solid ${T.border}`,
              background: T.slateLight, gap: 8 }}>
              <EffectPill isDeduction={selectedMeta.isDeduction} />
              <span style={{ fontSize: 11, color: T.textMuted }}>auto-set by type</span>
            </div>
          </Field>

          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Notes">
              <input placeholder="Optional" style={inputStyle} {...field('notes')} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PaymentTab