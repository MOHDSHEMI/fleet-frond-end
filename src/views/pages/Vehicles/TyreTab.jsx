import React, { useState, useEffect } from 'react'
import { getTyres, addTyre, updateTyre, deleteTyre, replaceTyre } from '../../../services/Vehicleservice'

const T = {
  navy:         '#0f1629',
  navyMid:      '#1e2a45',
  blue:         '#2563eb',
  blueLight:    '#eff6ff',
  blueMid:      '#bfdbfe',
  slate:        '#64748b',
  slateLight:   '#f8fafc',
  border:       '#e2e8f0',
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
}

const Icon = ({ name, size = 16, color = 'currentColor' }) => {
  const paths = {
    plus:    'M12 5v14M5 12h14',
    alert:   'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
    close:   'M18 6L6 18M6 6l12 12',
    trash:   'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    tyre:    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    rupee:   'M6 3h12M6 8h12M15 21L9 8m0 0h1.5a4.5 4.5 0 0 1 0 9H9l6 4',
    refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
    check:   'M20 6L9 17l-5-5',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <path d={paths[name] || paths.alert} />
    </svg>
  )
}

const fmt = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

const daysUntil = (d) => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null

/* ── Shared primitives (same as FuelTab) ── */
const Field = ({ label, required, children, hint }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
    <label style={{ fontSize:11, fontWeight:700, color:T.textSecond, letterSpacing:'0.04em' }}>
      {label}{required && <span style={{ color:T.danger, marginLeft:2 }}>*</span>}
    </label>
    {children}
    {hint && <span style={{ fontSize:10, color:T.textMuted }}>{hint}</span>}
  </div>
)

const inputStyle = {
  width:'100%', padding:'8px 11px', borderRadius:7,
  border:`1px solid ${T.border}`, fontSize:13, color:T.textPrimary,
  background:T.white, outline:'none', fontFamily:'inherit',
  boxSizing:'border-box', transition:'border-color 0.12s',
}

const Btn = ({ onClick, disabled, variant = 'primary', size = 'md', children }) => {
  const base = {
    display:'inline-flex', alignItems:'center', gap:6,
    padding: size === 'sm' ? '5px 12px' : '8px 18px',
    borderRadius:7, fontSize: size === 'sm' ? 12 : 13,
    fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer',
    border:'1px solid transparent', transition:'all 0.12s',
    fontFamily:'inherit', opacity: disabled ? 0.6 : 1,
  }
  const variants = {
    primary:     { background:T.navy,        color:T.white,      borderColor:T.navy },
    secondary:   { background:T.white,       color:T.textSecond, borderColor:T.border },
    dangerSolid: { background:T.danger,      color:T.white,      borderColor:T.danger },
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
    <div style={{ position:'fixed', inset:0, zIndex:1000,
      background:'rgba(15,22,41,0.55)', backdropFilter:'blur(3px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:T.white, borderRadius:14, width:'100%', maxWidth:560,
        boxShadow:'0 20px 60px rgba(15,22,41,0.2)',
        display:'flex', flexDirection:'column', maxHeight:'90vh' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'18px 22px', borderBottom:`1px solid ${T.border}` }}>
          <span style={{ fontSize:15, fontWeight:800, color:T.textPrimary }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
            padding:4, borderRadius:5, display:'flex', color:T.textMuted }}
            onMouseEnter={e => e.currentTarget.style.color = T.textPrimary}
            onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div style={{ padding:'22px 22px 4px', overflowY:'auto', flex:1 }}>{children}</div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10,
          padding:'16px 22px', borderTop:`1px solid ${T.border}` }}>
          {footer}
        </div>
      </div>
    </div>
  )
}

const StatPill = ({ icon, label, value, accent }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8,
    padding:'10px 16px', borderRadius:8,
    background:`${accent}12`, border:`1px solid ${accent}30` }}>
    <Icon name={icon} size={14} color={accent} />
    <span style={{ fontSize:12, color:T.textMuted }}>{label}</span>
    <span style={{ fontSize:13, fontWeight:700, color:T.textPrimary }}>{value}</span>
  </div>
)

const th = {
  padding:'10px 14px', fontSize:11, fontWeight:700, color:T.slate,
  textTransform:'uppercase', letterSpacing:'0.06em',
  background:T.slateLight, borderBottom:`1px solid ${T.border}`,
  whiteSpace:'nowrap',
}
const td = (muted) => ({
  padding:'11px 14px', fontSize:13,
  color: muted ? T.textMuted : T.textPrimary,
  borderBottom:`1px solid ${T.border}`, verticalAlign:'middle',
})

/* ── Warranty status badge ── */
const WarrantyBadge = ({ dateStr }) => {
  const days = daysUntil(dateStr)
  if (days === null) return <span style={{ fontSize:13, color:T.textMuted }}>—</span>
  const expired = days < 0
  const warn    = !expired && days <= 30
  const color   = expired ? T.danger : warn ? T.warn : T.success
  const bg      = expired ? T.dangerLight : warn ? T.warnLight : T.successLight
  const label   = expired ? `Expired ${Math.abs(days)}d ago` : warn ? `${days}d left` : 'Active'
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 9px', borderRadius:5, fontSize:11, fontWeight:700,
      background:bg, color }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0 }} />
      {label}
    </span>
  )
}

const EMPTY = {
  brand:'', serialNumber:'', purchaseDate:'', warrantyExpiryDate:'', cost:'', notes:'',
}

/* ── TyreTab ── */
const TyreTab = ({ vehicleId }) => {
  const [tyres,   setTyres]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [modal,   setModal]   = useState(false)
  const [replaceModal, setReplaceModal] = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState(EMPTY)
  const [delId,   setDelId]   = useState(null)

  const load = async () => {
    try { setLoading(true); setTyres(await getTyres(vehicleId)) }
    catch { setError('Failed to load tyre records.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [vehicleId])

  const field = (k) => ({
    value: form[k],
    onChange: e => setForm(prev => ({ ...prev, [k]: e.target.value })),
  })

  const activeTyres = tyres.filter(t => t.isActive)
  const atLimit = activeTyres.length >= 12

  const handleAdd = async () => {
    setSaving(true)
    try {
      await addTyre(vehicleId, {
        ...form,
        cost: form.cost ? Number(form.cost) : undefined,
      })
      setModal(false); setForm(EMPTY); load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to add tyre.')
    } finally { setSaving(false) }
  }

  const handleReplace = async () => {
    setSaving(true)
    try {
      await replaceTyre(vehicleId, replaceModal.id, {
        ...form,
        cost: form.cost ? Number(form.cost) : undefined,
      })
      setReplaceModal(null); setForm(EMPTY); load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to replace tyre.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await deleteTyre(id); load() }
    catch { setError('Failed to delete tyre.') }
    finally { setDelId(null) }
  }

  const openReplace = (tyre) => {
    setForm(EMPTY)
    setReplaceModal(tyre)
  }

  const totalSpend  = tyres.reduce((s, t) => s + Number(t.cost || 0), 0)
  const expiringSoon = activeTyres.filter(t => {
    const d = daysUntil(t.warrantyExpiryDate)
    return d !== null && d <= 30
  }).length

  return (
    <div style={{ fontFamily:"'Geist','DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input:focus, select:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) }
      `}</style>

      {error && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
          background:T.dangerLight, border:`1px solid ${T.dangerBorder}`,
          borderRadius:8, marginBottom:16 }}>
          <Icon name="alert" size={15} color={T.danger} />
          <span style={{ flex:1, fontSize:13, color:T.danger }}>{error}</span>
          <button onClick={() => setError('')} style={{ background:'none', border:'none',
            cursor:'pointer', display:'flex', padding:2 }}>
            <Icon name="close" size={13} color={T.danger} />
          </button>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Icon name="tyre" size={14} color={T.textMuted} />
          <span style={{ fontSize:13, color:T.textMuted }}>
            <strong style={{ color:T.textPrimary }}>{activeTyres.length}</strong>
            {' '}/ 12 active tyre{activeTyres.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Btn onClick={() => { setForm(EMPTY); setModal(true) }} disabled={atLimit}>
          <Icon name="plus" size={13} color={T.white} /> Add tyre
        </Btn>
      </div>

      {atLimit && (
        <div style={{ marginBottom:16, fontSize:12, color:T.warn,
          display:'flex', alignItems:'center', gap:6 }}>
          <Icon name="alert" size={13} color={T.warn} />
          12 active tyres reached. Retire or replace one before adding another.
        </div>
      )}

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
          <div style={{ width:28, height:28, border:`2.5px solid ${T.border}`,
            borderTopColor:T.blue, borderRadius:'50%',
            animation:'spin 0.7s linear infinite' }} />
        </div>
      ) : (
        <>
          <div style={{ border:`1px solid ${T.border}`, borderRadius:10, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Brand</th>
                    <th style={th}>Serial / DOT</th>
                    <th style={th}>Purchased</th>
                    <th style={th}>Warranty status</th>
                    <th style={{ ...th, textAlign:'right' }}>Cost</th>
                    <th style={th}>Status</th>
                    <th style={th}>Notes</th>
                    <th style={{ ...th, width:140 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {tyres.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding:'40px 20px', textAlign:'center' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                          <Icon name="tyre" size={28} color={T.border} />
                          <span style={{ fontSize:13, color:T.textMuted }}>No tyre records yet</span>
                        </div>
                      </td>
                    </tr>
                  ) : tyres.map((t, i) => (
                    <tr key={t.id}
                      style={{ background: i % 2 === 0 ? T.white : `${T.slateLight}80`, opacity: t.isActive ? 1 : 0.55 }}
                      onMouseEnter={e => e.currentTarget.style.background = T.blueLight}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.white : `${T.slateLight}80`}>
                      <td style={td()}>{t.brand || '—'}</td>
                      <td style={td(true)}>{t.serialNumber || '—'}</td>
                      <td style={td(true)}>
                        {t.purchaseDate ? new Date(t.purchaseDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' }) : '—'}
                      </td>
                      <td style={td()}><WarrantyBadge dateStr={t.warrantyExpiryDate} /></td>
                      <td style={{ ...td(), textAlign:'right', fontWeight:700 }}>{t.cost ? fmt(t.cost) : '—'}</td>
                      <td style={td(true)}>
                        {t.isActive
                          ? <span style={{ color:T.success, fontWeight:600, fontSize:12 }}>Active</span>
                          : <span style={{ color:T.textMuted, fontWeight:600, fontSize:12 }}>Replaced</span>}
                      </td>
                      <td style={td(true)}>{t.notes || '—'}</td>
                      <td style={{ ...td(), textAlign:'center' }}>
                        {delId === t.id ? (
                          <span style={{ display:'flex', gap:5, justifyContent:'center' }}>
                            <Btn size="sm" variant="dangerSolid" onClick={() => handleDelete(t.id)}>Yes</Btn>
                            <Btn size="sm" variant="secondary"   onClick={() => setDelId(null)}>No</Btn>
                          </span>
                        ) : (
                          <span style={{ display:'flex', gap:4, justifyContent:'center' }}>
                            {t.isActive && (
                              <button onClick={() => openReplace(t)} title="Replace this tyre"
                                style={{ background:'none', border:'none', cursor:'pointer',
                                  padding:'4px 6px', borderRadius:6, color:T.textMuted,
                                  transition:'color 0.12s' }}
                                onMouseEnter={e => e.currentTarget.style.color = T.blue}
                                onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
                                <Icon name="refresh" size={14} />
                              </button>
                            )}
                            <button onClick={() => setDelId(t.id)} title="Delete record"
                              style={{ background:'none', border:'none', cursor:'pointer',
                                padding:'4px 6px', borderRadius:6, color:T.textMuted,
                                transition:'color 0.12s' }}
                              onMouseEnter={e => e.currentTarget.style.color = T.danger}
                              onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
                              <Icon name="trash" size={14} />
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {tyres.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:14 }}>
              <StatPill icon="tyre"  label="Active tyres"  value={`${activeTyres.length} / 12`} accent={T.blue}    />
              <StatPill icon="rupee" label="Total spend"   value={fmt(totalSpend)}              accent={T.danger} />
              {expiringSoon > 0 && (
                <StatPill icon="alert" label="Expiring soon" value={expiringSoon} accent={T.warn} />
              )}
            </div>
          )}
        </>
      )}

      <Modal
        visible={modal}
        onClose={() => setModal(false)}
        title="Add tyre"
        footer={<>
          <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn onClick={handleAdd} disabled={saving}>
            {saving
              ? <><div style={{ width:12, height:12, border:`2px solid rgba(255,255,255,0.4)`,
                  borderTopColor:T.white, borderRadius:'50%',
                  animation:'spin 0.7s linear infinite' }} /> Saving…</>
              : <><Icon name="plus" size={13} color={T.white} /> Add tyre</>
            }
          </Btn>
        </>}
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, paddingBottom:20 }}>
          <Field label="Brand">
            <input placeholder="e.g. MRF, CEAT" style={inputStyle} {...field('brand')} />
          </Field>
          <Field label="Serial / DOT number">
            <input placeholder="Optional" style={inputStyle} {...field('serialNumber')} />
          </Field>
          <Field label="Purchase date">
            <input type="date" style={inputStyle} {...field('purchaseDate')} />
          </Field>
          <Field label="Warranty expiry date">
            <input type="date" style={inputStyle} {...field('warrantyExpiryDate')} />
          </Field>
          <Field label="Cost (₹)">
            <input type="number" step="0.01" placeholder="e.g. 8500" style={inputStyle} {...field('cost')} />
          </Field>
          <div style={{ gridColumn:'1 / -1' }}>
            <Field label="Notes">
              <input placeholder="Optional" style={inputStyle} {...field('notes')} />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        visible={!!replaceModal}
        onClose={() => setReplaceModal(null)}
        title="Replace tyre"
        footer={<>
          <Btn variant="secondary" onClick={() => setReplaceModal(null)}>Cancel</Btn>
          <Btn onClick={handleReplace} disabled={saving}>
            {saving
              ? <><div style={{ width:12, height:12, border:`2px solid rgba(255,255,255,0.4)`,
                  borderTopColor:T.white, borderRadius:'50%',
                  animation:'spin 0.7s linear infinite' }} /> Saving…</>
              : <><Icon name="check" size={13} color={T.white} /> Confirm replacement</>
            }
          </Btn>
        </>}
      >
        <div style={{ marginBottom:16, padding:'10px 14px', background:T.slateLight,
          borderRadius:8, fontSize:12, color:T.textSecond }}>
          This marks the existing tyre{replaceModal?.brand ? ` (${replaceModal.brand})` : ''} as <strong>replaced</strong> and adds a new active tyre record below.
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, paddingBottom:20 }}>
          <Field label="New tyre brand">
            <input placeholder="e.g. MRF, CEAT" style={inputStyle} {...field('brand')} />
          </Field>
          <Field label="Serial / DOT number">
            <input placeholder="Optional" style={inputStyle} {...field('serialNumber')} />
          </Field>
          <Field label="Purchase date">
            <input type="date" style={inputStyle} {...field('purchaseDate')} />
          </Field>
          <Field label="Warranty expiry date">
            <input type="date" style={inputStyle} {...field('warrantyExpiryDate')} />
          </Field>
          <Field label="Cost (₹)">
            <input type="number" step="0.01" placeholder="e.g. 8500" style={inputStyle} {...field('cost')} />
          </Field>
          <div style={{ gridColumn:'1 / -1' }}>
            <Field label="Notes">
              <input placeholder="Optional" style={inputStyle} {...field('notes')} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TyreTab