import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from '../../../services/Vehicleservice'

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
const T = {
  navy:        '#0f1629',
  navyMid:     '#1e2a45',
  navyLight:   '#2d3f5f',
  blue:        '#2563eb',
  blueLight:   '#eff6ff',
  blueMid:     '#bfdbfe',
  amber:       '#d97706',
  amberLight:  '#fffbeb',
  amberMid:    '#fde68a',
  slate:       '#64748b',
  slateLight:  '#f8fafc',
  border:      '#e2e8f0',
  borderHover: '#cbd5e1',
  white:       '#ffffff',
  textPrimary: '#0f172a',
  textSecond:  '#475569',
  textMuted:   '#94a3b8',
  danger:      '#dc2626',
  dangerLight: '#fef2f2',
  dangerBorder:'#fecaca',
  success:     '#16a34a',
  successLight:'#f0fdf4',
  warn:        '#ea580c',
  warnLight:   '#fff7ed',
  violet:      '#7c3aed',
  violetLight: '#f5f3ff',
}

/* ─────────────────────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────────────────────── */
const Icon = ({ name, size = 16, color = 'currentColor', style: sx }) => {
  const paths = {
    truck:     'M1 3h11v9H1zm11 3h3l2 2v4h-5zM4 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    excavator: 'M3 17L3 9l4-4h3l1 1v5l3 1 1 3H3zm9-11l2-2 3 3-2 2z',
    plus:      'M12 5v14M5 12h14',
    search:    'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
    trash:     'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    eye:       'M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    edit:      'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    alert:     'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
    check:     'M20 6L9 17l-5-5',
    calendar:  'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
    fuel:      'M3 22V6l4-4h8l4 4v16M10 22v-6h4v6M3 10h18',
    shield:    'M12 2L3 7v5c0 5.25 3.75 10.17 9 11.25C17.25 22.17 21 17.25 21 12V7z',
    tag:       'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
    settings:  'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0v6M12 3v3M4.22 4.22l2.12 2.12M1 12H4m14.66-7.78l-2.12 2.12M23 12h-3m-2.34 7.78l-2.12-2.12M4.22 19.78l2.12-2.12',
    user:      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    hash:      'M4 9h16M4 15h16M10 3L8 21M16 3l-2 18',
    info:      'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 9v5m0-9h.01',
    close:     'M18 6L6 18M6 6l12 12',
    car:       'M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l4 6v8a2 2 0 0 1-2 2h-2M14 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
    permit:    'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4',
    battery:   'M23 7H1v10h22zM23 10v4',
    tyre:      'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4a6 6 0 1 1 0 12A6 6 0 0 1 12 6zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    rupee:     'M6 3h12M6 8h12M15 21L9 8m0 0h1.5a4.5 4.5 0 0 1 0 9H9l6 4',
    trending:  'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
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
   FORM SHAPE
───────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: '', registrationNumber: '', type: 'lorry',
  model: '', driverName: '', chassisNumber: '',
  fuelType: 'diesel',
  insuranceStartDate: '', insuranceRenewalDate: '', insurancePremium: '',
  taxStartDate: '', taxExpiryDate: '',
  permitStartDate: '', permitExpiryDate: '',
  batteryPurchaseDate: '', batteryWarrantyDate: '',
  tyrePurchaseDate: '', tyreWarrantyDate: '',
  purchaseDate: '', purchaseCost: '',
  notes: '',
}

/* Map vehicle API response → form fields */
const vehicleToForm = (v) => ({
  name:                 v.name                 ?? '',
  registrationNumber:   v.registrationNumber   ?? '',
  type:                 v.type                 ?? 'lorry',
  model:                v.model                ?? '',
  driverName:           v.driverName           ?? '',
  chassisNumber:        v.chassisNumber        ?? '',
  fuelType:             'diesel',
  insuranceStartDate:   v.insuranceStartDate   ?? '',
  insuranceRenewalDate: v.insuranceRenewalDate ?? '',
  insurancePremium:     v.insurancePremium != null ? String(v.insurancePremium) : '',
  taxStartDate:         v.taxStartDate         ?? '',
  taxExpiryDate:        v.taxExpiryDate        ?? '',
  permitStartDate:      v.permitStartDate      ?? '',
  permitExpiryDate:     v.permitExpiryDate     ?? '',
  batteryPurchaseDate:  v.batteryPurchaseDate  ?? '',
  // UpdateDto uses batteryWarrantyExpiryDate; read from either field
  batteryWarrantyDate:  v.batteryWarrantyExpiryDate ?? v.batteryWarrantyDate ?? '',
  tyrePurchaseDate:     v.tyrePurchaseDate     ?? '',
  tyreWarrantyDate:     v.tyreWarrantyExpiryDate ?? v.tyreWarrantyDate ?? '',
  purchaseDate:         v.purchaseDate         ?? '',
  purchaseCost:         v.purchaseCost != null ? String(v.purchaseCost) : '',
  notes:                v.notes                ?? '',
})

const STEPS = [
  { label: 'Identity',     icon: 'hash'    },
  { label: 'Purchase',     icon: 'tag'     },
  { label: 'Insurance',    icon: 'shield'  },
  { label: 'Tax & Permit', icon: 'permit'  },
  { label: 'Warranty',     icon: 'settings'},
  { label: 'Notes',        icon: 'info'    },
]

const TYPE_CFG = {
  lorry:   { label: 'Lorry',   icon: 'truck',     pill: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' } },
  hitachi: { label: 'Hitachi', icon: 'excavator', pill: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' } },
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const daysUntil = (d) => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null

const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—'

const ExpiryTag = ({ label, dateStr }) => {
  const days = daysUntil(dateStr)
  if (days === null) return null
  const expired = days < 0
  const warn    = !expired && days <= 30
  if (!expired && !warn) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
      background: expired ? T.dangerLight : T.warnLight,
      color:      expired ? T.danger      : T.warn,
      border:     `1px solid ${expired ? T.dangerBorder : '#fed7aa'}`,
      letterSpacing: '0.02em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%',
        background: expired ? T.danger : T.warn, flexShrink: 0 }} />
      {label} · {expired ? 'Expired' : `${days}d`}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   FORM PRIMITIVES
───────────────────────────────────────────────────────────── */
const labelSx = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: T.textSecond, letterSpacing: '0.05em',
  textTransform: 'uppercase', marginBottom: 6,
}

const inputBase = {
  width: '100%', boxSizing: 'border-box',
  border: `1px solid ${T.border}`,
  borderRadius: 8, padding: '9px 12px',
  fontSize: 14, color: T.textPrimary,
  background: T.white, outline: 'none',
  fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s',
}

const focusIn  = (e) => { e.target.style.borderColor = T.blue; e.target.style.boxShadow = `0 0 0 3px ${T.blueLight}` }
const focusOut = (e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none' }

const Inp = ({ label, required, readOnly, prefix, half, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gridColumn: half ? 'span 2' : undefined }}>
    {label && (
      <label style={labelSx}>
        {label}{required && <span style={{ color: T.danger, marginLeft: 2 }}>*</span>}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {prefix && (
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 13, color: T.textMuted, pointerEvents: 'none' }}>{prefix}</span>
      )}
      <input
        {...props}
        readOnly={readOnly}
        style={{
          ...inputBase, paddingLeft: prefix ? 28 : 12,
          background: readOnly ? T.slateLight : T.white,
          color: readOnly ? T.slate : T.textPrimary,
          cursor: readOnly ? 'default' : 'text', ...props.style,
        }}
        onFocus={readOnly ? undefined : focusIn}
        onBlur={readOnly ? undefined : focusOut}
      />
    </div>
  </div>
)

const Sel = ({ label, required, children, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {label && (
      <label style={labelSx}>
        {label}{required && <span style={{ color: T.danger, marginLeft: 2 }}>*</span>}
      </label>
    )}
    <select
      {...props}
      style={{
        ...inputBase, appearance: 'none', cursor: 'pointer', paddingRight: 36,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
      }}
      onFocus={focusIn} onBlur={focusOut}>
      {children}
    </select>
  </div>
)

const Row = ({ cols = 2, children, gap = 16, style: sx }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, ...sx }}>
    {children}
  </div>
)

const Divider = ({ icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 16px' }}>
    <Icon name={icon} size={14} color={T.slate} />
    <span style={{ fontSize: 11, fontWeight: 700, color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: T.border }} />
  </div>
)

/* Read-only fuel field */
const FuelField = () => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label style={labelSx}>Fuel Type</label>
    <div style={{ ...inputBase, display: 'flex', alignItems: 'center', gap: 8,
      background: T.slateLight, color: T.slate, cursor: 'default' }}>
      <Icon name="fuel" size={14} color={T.textMuted} />
      <span style={{ fontSize: 14 }}>Diesel</span>
      <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600,
        background: '#f1f5f9', color: T.slate, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.04em' }}>
        READ ONLY
      </span>
    </div>
  </div>
)

/* ─────────────────────────────────────────────────────────────
   STEP BAR  (shared by both modals)
───────────────────────────────────────────────────────────── */
const StepBar = ({ current, accentColor = T.navy }) => (
  <div style={{ display: 'flex', padding: '0 28px', borderBottom: `1px solid ${T.border}`, background: T.slateLight }}>
    {STEPS.map((s, i) => {
      const done   = i < current
      const active = i === current
      return (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '14px 4px', position: 'relative',
          borderBottom: active ? `2px solid ${T.blue}` : '2px solid transparent' }}>
          {i < STEPS.length - 1 && (
            <div style={{ position: 'absolute', top: 23, left: '60%', width: '80%', height: 1,
              background: done ? T.blue : T.border }} />
          )}
          <div style={{ width: 26, height: 26, borderRadius: '50%', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: done ? T.blue : active ? accentColor : T.white,
            border: `1.5px solid ${done || active ? 'transparent' : T.border}`,
            transition: 'all 0.2s' }}>
            {done
              ? <Icon name="check" size={12} color="#fff" />
              : <Icon name={s.icon} size={12} color={active ? '#fff' : T.textMuted} />
            }
          </div>
          <span style={{ fontSize: 10, marginTop: 5, fontWeight: active ? 700 : 500,
            color: active ? accentColor : done ? T.blue : T.textMuted, whiteSpace: 'nowrap' }}>
            {s.label}
          </span>
        </div>
      )
    })}
  </div>
)

/* ─────────────────────────────────────────────────────────────
   STEP CONTENT  (shared Create + Edit — type selector hidden on edit)
───────────────────────────────────────────────────────────── */
const StepContent = ({ step, form, set, isEdit = false }) => {
  switch (step) {
    case 0: return (
      <>
        <Row cols={2}>
          <Inp label="Vehicle Name" required placeholder="e.g. HYUNDAI-1" value={form.name} onChange={set('name')} />
          <Inp label="Registration Number" required placeholder="e.g. KL-52-S-5470" value={form.registrationNumber} onChange={set('registrationNumber')} />
        </Row>
        <Row cols={isEdit ? 2 : 3} style={{ marginTop: 16 }}>
          {!isEdit && (
            <Sel label="Vehicle Type" required value={form.type} onChange={set('type')}>
              <option value="lorry">Lorry</option>
              <option value="hitachi">Hitachi</option>
            </Sel>
          )}
          <Inp label="Model" placeholder="e.g. Hyundai 210" value={form.model} onChange={set('model')} />
          <Inp label="Chassis Number" placeholder="MA3FJEB1S00123456" value={form.chassisNumber} onChange={set('chassisNumber')} />
        </Row>
        <Row cols={2} style={{ marginTop: 16 }}>
          <Inp label="Driver Name" placeholder="Full name" value={form.driverName} onChange={set('driverName')} />
          <FuelField />
        </Row>
        {isEdit && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: T.blueLight,
            border: `1px solid ${T.blueMid}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="info" size={14} color={T.blue} />
            <span style={{ fontSize: 13, color: T.blue }}>
              Vehicle type (<strong>{TYPE_CFG[form.type]?.label}</strong>) cannot be changed after registration.
            </span>
          </div>
        )}
      </>
    )
    case 1: return (
      <Row cols={2}>
        <Inp label="Purchase Date" type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
        <Inp label="Purchase Cost" type="number" placeholder="0.00" prefix="₹" value={form.purchaseCost} onChange={set('purchaseCost')} />
      </Row>
    )
    case 2: return (
      <Row cols={3}>
        <Inp label="Start Date"          type="date"   value={form.insuranceStartDate}   onChange={set('insuranceStartDate')} />
        <Inp label="Renewal / Expiry"    type="date"   value={form.insuranceRenewalDate} onChange={set('insuranceRenewalDate')} />
        <Inp label="Annual Premium" type="number" placeholder="0.00" prefix="₹" value={form.insurancePremium} onChange={set('insurancePremium')} />
      </Row>
    )
    case 3: return (
      <>
        <Divider icon="tag"    label="Road Tax" />
        <Row cols={2}>
          <Inp label="Tax Start Date"   type="date" value={form.taxStartDate}   onChange={set('taxStartDate')} />
          <Inp label="Tax Expiry Date"  type="date" value={form.taxExpiryDate}  onChange={set('taxExpiryDate')} />
        </Row>
        <Divider icon="permit" label="Permit" />
        <Row cols={2}>
          <Inp label="Permit Start Date"  type="date" value={form.permitStartDate}  onChange={set('permitStartDate')} />
          <Inp label="Permit Expiry Date" type="date" value={form.permitExpiryDate} onChange={set('permitExpiryDate')} />
        </Row>
      </>
    )
    case 4: return (
      <>
        <Divider icon="battery" label="Battery" />
        <Row cols={2}>
          <Inp label="Battery Purchase Date"   type="date" value={form.batteryPurchaseDate} onChange={set('batteryPurchaseDate')} />
          <Inp label="Battery Warranty Expiry" type="date" value={form.batteryWarrantyDate} onChange={set('batteryWarrantyDate')} />
        </Row>
        {/* <Divider icon="tyre" label="Tyres" />
        <Row cols={2}>
          <Inp label="Tyre Purchase Date"   type="date" value={form.tyrePurchaseDate} onChange={set('tyrePurchaseDate')} />
          <Inp label="Tyre Warranty Expiry" type="date" value={form.tyreWarrantyDate} onChange={set('tyreWarrantyDate')} />
        </Row> */}
      </>
    )
    case 5: return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelSx}>Additional Notes</label>
        <textarea rows={5}
          placeholder="Any additional details, remarks, or maintenance notes about this vehicle…"
          value={form.notes} onChange={set('notes')}
          style={{ ...inputBase, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={focusIn} onBlur={focusOut} />
        <p style={{ fontSize: 12, color: T.textMuted, margin: '4px 0 0' }}>Optional — visible only internally.</p>
      </div>
    )
    default: return null
  }
}

/* ─────────────────────────────────────────────────────────────
   MODAL SHELL  (shared by Create + Edit)
───────────────────────────────────────────────────────────── */
const VehicleModal = ({
  visible, onClose, title, subtitle,
  step, setStep, form, set, canNext0,
  onSubmit, saving, isEdit = false,
}) => {
  if (!visible) return null
  const accentColor = isEdit ? T.violet : T.navy

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,22,41,0.55)',
        zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: T.white, borderRadius: 14, width: '100%', maxWidth: 660,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: `1px solid ${T.border}` }}>

        {/* Title bar */}
        <div style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: isEdit ? T.violetLight : T.slateLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={isEdit ? 'edit' : 'plus'} size={16} color={accentColor} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.textPrimary }}>{title}</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMuted }}>{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 6,
            border: `1px solid ${T.border}`, background: T.slateLight,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={14} color={T.textSecond} />
          </button>
        </div>

        <StepBar current={step} accentColor={accentColor} />

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <StepContent step={step} form={form} set={set} isEdit={isEdit} />
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: T.slateLight, borderRadius: '0 0 14px 14px' }}>
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            style={{ padding: '8px 18px', borderRadius: 7, border: `1px solid ${T.border}`,
              background: T.white, color: T.textSecond, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          {/* Dot progress */}
          <div style={{ display: 'flex', gap: 5 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ height: 5, borderRadius: 3, transition: 'all 0.2s',
                width: i === step ? 18 : 5,
                background: i < step ? T.blue : i === step ? accentColor : T.border }} />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && !canNext0}
              style={{ padding: '8px 20px', borderRadius: 7, border: 'none',
                background: step === 0 && !canNext0 ? T.border : accentColor,
                color:      step === 0 && !canNext0 ? T.textMuted : T.white,
                fontSize: 13, fontWeight: 700,
                cursor: step === 0 && !canNext0 ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s' }}>
              Continue →
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={saving || !canNext0}
              style={{ display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 20px', borderRadius: 7, border: 'none',
                background: saving ? T.navyLight : accentColor,
                color: T.white, fontSize: 13, fontWeight: 700,
                cursor: saving ? 'default' : 'pointer' }}>
              {saving ? (
                <>
                  <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                    animation: 'spin 0.7s linear infinite' }} />
                  Saving…
                </>
              ) : (
                <>
                  <Icon name="check" size={14} color="#fff" />
                  {isEdit ? 'Save Changes' : 'Register Vehicle'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   STAT CARD
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
   VEHICLE CARD
───────────────────────────────────────────────────────────── */
const VehicleCard = ({ v, onView, onEdit, onDelete }) => {
  const cfg  = TYPE_CFG[v.type] || TYPE_CFG.lorry
  const [hov, setHov] = useState(false)

  const alerts = [
    { label: 'Insurance', d: v.insuranceRenewalDate },
    { label: 'Tax',       d: v.taxExpiryDate },
    { label: 'Permit',    d: v.permitExpiryDate },
    { label: 'Battery',   d: v.batteryWarrantyExpiryDate ?? v.batteryWarrantyDate },
    // { label: 'Tyre',      d: v.tyreWarrantyExpiryDate    ?? v.tyreWarrantyDate },
  ].filter(a => { const days = daysUntil(a.d); return days !== null && days <= 30 })

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: T.white, border: `1px solid ${hov ? T.borderHover : T.border}`,
        borderRadius: 12, overflow: 'hidden',
        boxShadow: hov ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.15s',
        transform: hov ? 'translateY(-2px)' : 'none' }}>

      {/* Card header */}
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        cursor: 'pointer' }} onClick={onView}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0,
            background: cfg.pill.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={cfg.icon} size={18} color={cfg.pill.text} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{v.name}</div>
            <div style={{ fontSize: 12, color: T.textMuted, fontFamily: 'monospace', marginTop: 1 }}>
              {v.registrationNumber}
            </div>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
          background: cfg.pill.bg, color: cfg.pill.text, border: `1px solid ${cfg.pill.border}`,
          letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
          {cfg.label}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 18px' }}>
        {/* Driver */}
        {v.driverName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
            padding: '7px 10px', background: T.slateLight, borderRadius: 6 }}>
            <Icon name="user" size={13} color={T.slate} />
            <span style={{ fontSize: 13, color: T.textSecond }}>{v.driverName}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: T.textMuted, fontStyle: 'italic' }}>Driver</span>
          </div>
        )}

        {/* Metric row */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
              {v.type === 'lorry' ? 'Total KM' : 'Total Hours'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary }}>
              {v.type === 'lorry'
                ? Number(v.totalKm    || 0).toLocaleString('en-IN')
                : Number(v.totalHours || 0).toLocaleString('en-IN')}
              <span style={{ fontSize: 12, fontWeight: 500, color: T.textMuted, marginLeft: 4 }}>
                {v.type === 'lorry' ? 'km' : 'hrs'}
              </span>
            </div>
          </div>
          {v.model && (
            <div style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Model</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.textSecond }}>{v.model}</div>
            </div>
          )}
        </div>

        {/* Expiry alerts */}
        {alerts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {alerts.map(a => <ExpiryTag key={a.label} label={a.label} dateStr={a.d} />)}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onView}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '7px 0', borderRadius: 7, border: `1px solid ${T.border}`,
              background: T.white, color: T.textSecond, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = T.slateLight; e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.color = T.blue }}
            onMouseLeave={e => { e.currentTarget.style.background = T.white; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecond }}>
            <Icon name="eye" size={13} /> View
          </button>
          <button
            onClick={onEdit}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '7px 0', borderRadius: 7, border: `1px solid ${T.border}`,
              background: T.white, color: T.textSecond, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = T.violetLight; e.currentTarget.style.borderColor = T.violet; e.currentTarget.style.color = T.violet }}
            onMouseLeave={e => { e.currentTarget.style.background = T.white; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecond }}>
            <Icon name="edit" size={13} /> Edit
          </button>
          <button
            onClick={onDelete}
            style={{ width: 34, height: 34, borderRadius: 7,
              border: `1px solid ${T.dangerBorder}`, background: T.white, color: T.danger,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.background = T.dangerLight}
            onMouseLeave={e => e.currentTarget.style.background = T.white}>
            <Icon name="trash" size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const VehicleList = () => {
  const navigate = useNavigate()

  const [vehicles,  setVehicles]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')

  // Create modal
  const [addModal,  setAddModal]  = useState(false)
  const [addForm,   setAddForm]   = useState(EMPTY_FORM)
  const [addStep,   setAddStep]   = useState(0)
  const [addSaving, setAddSaving] = useState(false)

  // Edit modal
  const [editModal,  setEditModal]  = useState(false)
  const [editTarget, setEditTarget] = useState(null)   // vehicle being edited
  const [editForm,   setEditForm]   = useState(EMPTY_FORM)
  const [editStep,   setEditStep]   = useState(0)
  const [editSaving, setEditSaving] = useState(false)

  // Delete modal
  const [delModal,  setDelModal]  = useState(false)
  const [delTarget, setDelTarget] = useState(null)

  /* onChange factory */
  const setAdd  = (field) => (e) => setAddForm(f  => ({ ...f,  [field]: e.target.value }))
  const setEdit = (field) => (e) => setEditForm(f => ({ ...f, [field]: e.target.value }))

  /* ── Load ── */
  const load = async () => {
    try { setLoading(true); setError(''); setVehicles(await getVehicles()) }
    catch { setError('Failed to load vehicles. Please try again.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  /* ── Create ── */
  const openAdd = () => { setAddForm(EMPTY_FORM); setAddStep(0); setAddModal(true) }
  const handleAdd = async () => {
    setAddSaving(true)
    try {
      await createVehicle({
        name:                 addForm.name,
        registrationNumber:   addForm.registrationNumber,
        type:                 addForm.type,
        model:                addForm.model             || undefined,
        driverName:           addForm.driverName        || undefined,
        chassisNumber:        addForm.chassisNumber     || undefined,
        fuelType:             'diesel',
        insuranceStartDate:   addForm.insuranceStartDate   || undefined,
        insuranceRenewalDate: addForm.insuranceRenewalDate || undefined,
        insurancePremium:     addForm.insurancePremium  ? Number(addForm.insurancePremium)  : undefined,
        taxStartDate:         addForm.taxStartDate      || undefined,
        taxExpiryDate:        addForm.taxExpiryDate     || undefined,
        permitStartDate:      addForm.permitStartDate   || undefined,
        permitExpiryDate:     addForm.permitExpiryDate  || undefined,
        batteryPurchaseDate:  addForm.batteryPurchaseDate || undefined,
        batteryWarrantyDate:  addForm.batteryWarrantyDate || undefined,
        tyrePurchaseDate:     addForm.tyrePurchaseDate  || undefined,
        tyreWarrantyDate:     addForm.tyreWarrantyDate  || undefined,
        purchaseDate:         addForm.purchaseDate      || undefined,
        purchaseCost:         addForm.purchaseCost      ? Number(addForm.purchaseCost)      : undefined,
        notes:                addForm.notes             || undefined,
      })
      setAddModal(false); setAddForm(EMPTY_FORM); setAddStep(0); load()
    } catch { setError('Failed to create vehicle. Please try again.') }
    finally { setAddSaving(false) }
  }

  /* ── Edit ── */
  const openEdit = (v) => {
    setEditTarget(v)
    setEditForm(vehicleToForm(v))
    setEditStep(0)
    setEditModal(true)
  }
  const handleEdit = async () => {
    if (!editTarget) return
    setEditSaving(true)
    try {
      await updateVehicle(editTarget.id, {
        name:                       editForm.name             || undefined,
        registrationNumber:         editForm.registrationNumber || undefined,
        model:                      editForm.model            || undefined,
        driverName:                 editForm.driverName       || undefined,
        chassisNumber:              editForm.chassisNumber    || undefined,
        fuelType:                   'diesel',
        insuranceStartDate:         editForm.insuranceStartDate   || undefined,
        insuranceRenewalDate:       editForm.insuranceRenewalDate || undefined,
        insurancePremium:           editForm.insurancePremium  ? Number(editForm.insurancePremium)  : undefined,
        taxStartDate:               editForm.taxStartDate     || undefined,
        taxExpiryDate:              editForm.taxExpiryDate    || undefined,
        permitStartDate:            editForm.permitStartDate  || undefined,
        permitExpiryDate:           editForm.permitExpiryDate || undefined,
        batteryPurchaseDate:        editForm.batteryPurchaseDate || undefined,
        // UpdateDto field name differs from CreateDto
        batteryWarrantyExpiryDate:  editForm.batteryWarrantyDate || undefined,
        tyrePurchaseDate:           editForm.tyrePurchaseDate || undefined,
        tyreWarrantyExpiryDate:     editForm.tyreWarrantyDate || undefined,
        purchaseDate:               editForm.purchaseDate     || undefined,
        purchaseCost:               editForm.purchaseCost     ? Number(editForm.purchaseCost) : undefined,
        notes:                      editForm.notes            || undefined,
      })
      setEditModal(false); setEditTarget(null); load()
    } catch { setError('Failed to update vehicle. Please try again.') }
    finally { setEditSaving(false) }
  }

  /* ── Delete ── */
  const handleDelete = async () => {
    try { await deleteVehicle(delTarget.id); setDelModal(false); setDelTarget(null); load() }
    catch { setError('Failed to delete vehicle. Please try again.') }
  }

  /* ── Derived ── */
  const canNextAdd  = addForm.name.trim()  && addForm.registrationNumber.trim()
  const canNextEdit = editForm.name.trim() && editForm.registrationNumber.trim()

  const displayed = vehicles
    .filter(v => filter === 'all' || v.type === filter)
    .filter(v => !search
      || v.name.toLowerCase().includes(search.toLowerCase())
      || v.registrationNumber.toLowerCase().includes(search.toLowerCase()))

  const expiring = vehicles.filter(v =>
    [v.insuranceRenewalDate, v.taxExpiryDate, v.permitExpiryDate].some(d => {
      const days = daysUntil(d); return days !== null && days <= 30
    })).length

  /* ── Render ── */
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9',
      fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: '20px 28px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: T.navy,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="truck" size={16} color="#fff" />
              </div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800,
                color: T.textPrimary, letterSpacing: '-0.02em' }}>
                Fleet Management
              </h1>
            </div>
            <p style={{ margin: '3px 0 0 42px', fontSize: 13, color: T.textMuted }}>
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 8, border: 'none',
            background: T.navy, color: T.white,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = T.navyMid}
            onMouseLeave={e => e.currentTarget.style.background = T.navy}>
            <Icon name="plus" size={16} color="#fff" />
            Register Vehicle
          </button>
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

        {/* ── STAT ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard icon="truck"     label="Total Lorries"       value={vehicles.filter(v => v.type === 'lorry').length}   accent={T.blue} />
          <StatCard icon="excavator" label="Total Hitachi"       value={vehicles.filter(v => v.type === 'hitachi').length} accent={T.amber} />
          <StatCard icon="alert"     label="Documents Expiring"  value={expiring}
            sub={expiring > 0 ? 'Within 30 days' : 'All documents valid'}
            accent={expiring > 0 ? T.danger : T.success} />
        </div>

        {/* ── TOOLBAR ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}>
              <Icon name="search" size={14} color={T.textMuted} />
            </span>
            <input placeholder="Search by name or registration…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputBase, paddingLeft: 34, fontSize: 13 }}
              onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div style={{ display: 'flex', gap: 4, background: T.white,
            border: `1px solid ${T.border}`, borderRadius: 8, padding: 3 }}>
            {[['all','All','car'],['lorry','Lorry','truck'],['hitachi','Hitachi','excavator']].map(([val, lbl, ico]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: filter === val ? T.navy : 'transparent',
                color:      filter === val ? T.white : T.textSecond,
                transition: 'all 0.12s' }}>
                <Icon name={ico} size={13} color={filter === val ? '#fff' : T.textMuted} />
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* ── GRID ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`,
              borderTopColor: T.blue, borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              margin: '0 auto 12px' }} />
            <p style={{ color: T.textMuted, fontSize: 14 }}>Loading fleet data…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: T.white,
            borderRadius: 12, border: `1px solid ${T.border}` }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: T.slateLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="truck" size={24} color={T.textMuted} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: '0 0 6px' }}>No vehicles found</p>
            <p style={{ fontSize: 14, color: T.textMuted, margin: 0 }}>
              {search ? 'Try a different search term.' : 'Register your first vehicle to get started.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
            {displayed.map(v => (
              <VehicleCard key={v.id} v={v}
                onView={() => navigate(`/vehicles/${v.id}`)}
                onEdit={() => openEdit(v)}
                onDelete={() => { setDelTarget(v); setDelModal(true) }} />
            ))}
          </div>
        )}
      </div>

      {/* ══ CREATE MODAL ══ */}
      <VehicleModal
        visible={addModal}
        onClose={() => setAddModal(false)}
        title="Register New Vehicle"
        subtitle={`Step ${addStep + 1} of ${STEPS.length} — ${STEPS[addStep].label}`}
        step={addStep} setStep={setAddStep}
        form={addForm} set={setAdd}
        canNext0={canNextAdd}
        onSubmit={handleAdd}
        saving={addSaving}
        isEdit={false}
      />

      {/* ══ EDIT MODAL ══ */}
      <VehicleModal
        visible={editModal}
        onClose={() => setEditModal(false)}
        title={`Edit — ${editTarget?.name ?? ''}`}
        subtitle={`Step ${editStep + 1} of ${STEPS.length} — ${STEPS[editStep].label}`}
        step={editStep} setStep={setEditStep}
        form={editForm} set={setEdit}
        canNext0={canNextEdit}
        onSubmit={handleEdit}
        saving={editSaving}
        isEdit={true}
      />

      {/* ══ DELETE CONFIRM MODAL ══ */}
      {delModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,22,41,0.55)',
          zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: T.white, borderRadius: 14, width: '100%', maxWidth: 400,
            padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: `1px solid ${T.border}` }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: T.dangerLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon name="trash" size={20} color={T.danger} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: T.textPrimary }}>
              Delete Vehicle
            </h3>
            <p style={{ margin: '0 0 6px', fontSize: 14, color: T.textSecond, lineHeight: 1.6 }}>
              You are about to permanently delete{' '}
              <strong style={{ color: T.textPrimary }}>{delTarget?.name}</strong>.
            </p>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>
              All associated trips, fuel logs, and maintenance records will also be deleted.
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDelModal(false)}
                style={{ flex: 1, padding: '9px 0', borderRadius: 7,
                  border: `1px solid ${T.border}`, background: T.white,
                  color: T.textSecond, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDelete}
                style={{ flex: 1, padding: '9px 0', borderRadius: 7, border: 'none',
                  background: T.danger, color: T.white, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VehicleList