import React from 'react'

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (identical to VehicleList / VehicleModal)
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
   SVG ICONS  (identical set + a few additions for Parties)
───────────────────────────────────────────────────────────── */
const Icon = ({ name, size = 16, color = 'currentColor', style: sx }) => {
  const paths = {
    plus: 'M12 5v14M5 12h14',
    edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    close: 'M18 6L6 18M6 6l12 12',
    check: 'M20 6L9 17l-5-5',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    hash: 'M4 9h16M4 15h16M10 3L8 21M16 3l-2 18',
    phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
    mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
    note: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6',
    info: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 9v5m0-9h.01',
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
   STEPS  — 2-step wizard: Basic Info → Contact & Notes
───────────────────────────────────────────────────────────── */
export const STEPS = [
  { key: 'basic', label: 'Basic Info' },
  { key: 'contact', label: 'Contact & Notes' },
]

/* ─────────────────────────────────────────────────────────────
   STEP BAR  (identical structure to VehicleModal's StepBar)
───────────────────────────────────────────────────────────── */
export const StepBar = ({ current, accentColor }) => (
  <div style={{
    display: 'flex', alignItems: 'center', padding: '0 28px',
    background: T.white, borderBottom: `1px solid ${T.border}`
  }}>
    {STEPS.map((s, i) => {
      const done = i < current
      const active = i === current
      return (
        <React.Fragment key={s.key}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              background: done ? T.blue : active ? accentColor : T.slateLight,
              color: done || active ? T.white : T.textMuted,
              border: `1.5px solid ${done ? T.blue : active ? accentColor : T.border}`,
              transition: 'all 0.2s',
            }}>
              {done ? <Icon name="check" size={11} color="#fff" /> : i + 1}
            </div>
            <span style={{
              fontSize: 12.5, fontWeight: active ? 700 : 500,
              color: active ? T.textPrimary : T.textMuted, whiteSpace: 'nowrap'
            }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 1, background: T.border, margin: '0 14px' }} />
          )}
        </React.Fragment>
      )
    })}
  </div>
)

/* ─────────────────────────────────────────────────────────────
   FORM FIELD HELPERS
───────────────────────────────────────────────────────────── */
const Field = ({ label, required, children, hint, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: T.textSecond, letterSpacing: '0.04em' }}>
      {label}{required && <span style={{ color: T.danger, marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error
      ? <span style={{ fontSize: 10.5, color: T.danger, fontWeight: 600 }}>{error}</span>
      : hint && <span style={{ fontSize: 10, color: T.textMuted }}>{hint}</span>}
  </div>
)

const inputBase = {
  width: '100%', padding: '9px 12px', borderRadius: 7,
  border: `1px solid ${T.border}`, fontSize: 13, color: T.textPrimary,
  background: T.white, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box', transition: 'border-color 0.12s',
}

const InputWithIcon = ({ icon, ...props }) => (
  <div style={{ position: 'relative' }}>
    <div style={{
      position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
      color: T.textMuted, display: 'flex', pointerEvents: 'none'
    }}>
      <Icon name={icon} size={14} color={T.textMuted} />
    </div>
    <input {...props} style={{ ...inputBase, paddingLeft: 34 }} />
  </div>
)

/* ─────────────────────────────────────────────────────────────
   STEP CONTENT  — switches on step index
───────────────────────────────────────────────────────────── */
export const StepContent = ({ step, form, set, errors = {} }) => {
  const field = (k) => ({
    value: form[k] ?? '',
    onChange: (e) => set(k, e.target.value),
  })

  /* ── Step 0: Basic Info ── */
  if (step === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Party Name" required error={errors.name}>
          <InputWithIcon icon="user" placeholder="e.g. Sree Builders" {...field('name')} />
        </Field>

        <Field label="Location" hint="City, district or full address">
          <InputWithIcon icon="pin" placeholder="e.g. Thrissur, Kerala" {...field('location')} />
        </Field>

        <Field
          label="GST Number"
          hint="Optional — 15-character GSTIN, e.g. 32AAAAA0000A1Z5"
          error={errors.gstNumber}
        >
          <InputWithIcon
            icon="hash"
            placeholder="e.g. 32AAAAA0000A1Z5"
            maxLength={15}
            style={{ textTransform: 'uppercase' }}
            value={form.gstNumber ?? ''}
            onChange={(e) => set('gstNumber', e.target.value.toUpperCase())}
          />
        </Field>
      </div>
    )
  }

  /* ── Step 1: Contact & Notes ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Phone" hint="Optional">
          <InputWithIcon icon="phone" type="tel" placeholder="e.g. 9876543210" {...field('phone')} />
        </Field>
        <Field label="Email" hint="Optional" error={errors.email}>
          <InputWithIcon icon="mail" type="email" placeholder="e.g. contact@party.com" {...field('email')} />
        </Field>
      </div>

      <Field label="Notes" hint="Any additional details about this party">
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 11, top: 12,
            color: T.textMuted, display: 'flex', pointerEvents: 'none'
          }}>
            <Icon name="note" size={14} color={T.textMuted} />
          </div>
          <textarea
            placeholder="e.g. Main loading site contractor, pays via bank transfer"
            rows={4}
            {...field('notes')}
            style={{ ...inputBase, paddingLeft: 34, paddingTop: 10, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
      </Field>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PARTY MODAL  — identical shell structure to VehicleModal
───────────────────────────────────────────────────────────── */
const PartyModal = ({
  visible, onClose, title, subtitle,
  step, setStep, form, set, canNext0,
  onSubmit, saving, isEdit = false,
  errors = {},
}) => {
  if (!visible) return null
  const accentColor = isEdit ? T.violet : T.navy

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,22,41,0.55)',
        zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: T.white, borderRadius: 14, width: '100%', maxWidth: 600,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: `1px solid ${T.border}`
      }}>

        {/* Title bar */}
        <div style={{
          padding: '20px 28px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: `1px solid ${T.border}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: isEdit ? T.violetLight : T.slateLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon name={isEdit ? 'edit' : 'plus'} size={16} color={accentColor} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.textPrimary }}>{title}</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMuted }}>{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 6,
            border: `1px solid ${T.border}`, background: T.slateLight,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon name="close" size={14} color={T.textSecond} />
          </button>
        </div>

        <StepBar current={step} accentColor={accentColor} />

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <StepContent step={step} form={form} set={set} errors={errors} />
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px', borderTop: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: T.slateLight, borderRadius: '0 0 14px 14px'
        }}>
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            style={{
              padding: '8px 18px', borderRadius: 7, border: `1px solid ${T.border}`,
              background: T.white, color: T.textSecond, fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}>
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          {/* Dot progress */}
          <div style={{ display: 'flex', gap: 5 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                height: 5, borderRadius: 3, transition: 'all 0.2s',
                width: i === step ? 18 : 5,
                background: i < step ? T.blue : i === step ? accentColor : T.border
              }} />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && !canNext0}
              style={{
                padding: '8px 20px', borderRadius: 7, border: 'none',
                background: step === 0 && !canNext0 ? T.border : accentColor,
                color: step === 0 && !canNext0 ? T.textMuted : T.white,
                fontSize: 13, fontWeight: 700,
                cursor: step === 0 && !canNext0 ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s'
              }}>
              Continue →
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={saving || !canNext0}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 20px', borderRadius: 7, border: 'none',
                background: saving ? T.navyLight : accentColor,
                color: T.white, fontSize: 13, fontWeight: 700,
                cursor: saving ? 'default' : 'pointer'
              }}>
              {saving ? (
                <>
                  <span style={{
                    width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                    animation: 'spin 0.7s linear infinite'
                  }} />
                  Saving…
                </>
              ) : (
                <>
                  <Icon name="check" size={14} color="#fff" />
                  {isEdit ? 'Save Changes' : 'Add Party'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PartyModal
export { Icon as PartyIcon, T as PartyTokens }