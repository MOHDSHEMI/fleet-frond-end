import React, { useState, useEffect } from 'react'
import { getFuelLogs, addFuelLog, deleteFuelLog } from '../../../services/Vehicleservice'

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
}

const Icon = ({ name, size = 16, color = 'currentColor' }) => {
  const paths = {
    plus:    'M12 5v14M5 12h14',
    alert:   'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
    close:   'M18 6L6 18M6 6l12 12',
    trash:   'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    droplet: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z',
    rupee:   'M6 3h12M6 8h12M15 21L9 8m0 0h1.5a4.5 4.5 0 0 1 0 9H9l6 4',
    gauge:   'M12 2a10 10 0 1 0 10 10M12 12l4-4',
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

/* ── Shared primitives (same as PaymentTab) ── */
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

const EMPTY = {
  date:'', liters:'', costPerLiter:'', filledBy:'', notes:'',
  odometerKm:'', odometerHours:'',
}

/* ── FuelTab ── */
const FuelTab = ({ vehicleId, vehicleType }) => {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [modal,   setModal]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState(EMPTY)
  const [delId,   setDelId]   = useState(null)

  const load = async () => {
    try { setLoading(true); setLogs(await getFuelLogs(vehicleId)) }
    catch { setError('Failed to load fuel logs.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [vehicleId])

  const field = (k) => ({
    value: form[k],
    onChange: e => setForm(prev => ({ ...prev, [k]: e.target.value })),
  })

  const previewTotal = form.liters && form.costPerLiter
    ? (Number(form.liters) * Number(form.costPerLiter)).toFixed(2)
    : null

  const handleAdd = async () => {
    setSaving(true)
    try {
      await addFuelLog(vehicleId, {
        ...form,
        liters:        Number(form.liters),
        costPerLiter:  Number(form.costPerLiter),
        odometerKm:    form.odometerKm    ? Number(form.odometerKm)    : undefined,
        odometerHours: form.odometerHours ? Number(form.odometerHours) : undefined,
      })
      setModal(false); setForm(EMPTY); load()
    } catch { setError('Failed to add fuel log.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await deleteFuelLog(id); load() }
    catch { setError('Failed to delete fuel log.') }
    finally { setDelId(null) }
  }

  // Totals
  const totalLiters = logs.reduce((s, l) => s + Number(l.liters || 0), 0)
  const totalCost   = logs.reduce((s, l) => s + Number(l.totalCost || 0), 0)
  const avgRate     = totalLiters > 0 ? totalCost / totalLiters : 0

  const odometerLabel = vehicleType === 'hitachi' ? 'Hour meter' : 'Odometer KM'

  return (
    <div style={{ fontFamily:"'Geist','DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input:focus, select:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) }
      `}</style>

      {/* Error banner */}
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

      {/* Toolbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Icon name="droplet" size={14} color={T.textMuted} />
          <span style={{ fontSize:13, color:T.textMuted }}>
            <strong style={{ color:T.textPrimary }}>{logs.length}</strong>
            {' '}fuel log{logs.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Btn onClick={() => setModal(true)}>
          <Icon name="plus" size={13} color={T.white} /> Add fuel log
        </Btn>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
          <div style={{ width:28, height:28, border:`2.5px solid ${T.border}`,
            borderTopColor:T.blue, borderRadius:'50%',
            animation:'spin 0.7s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Table */}
          <div style={{ border:`1px solid ${T.border}`, borderRadius:10, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Date</th>
                    <th style={th}>Litres</th>
                    <th style={th}>Rate/L</th>
                    <th style={{ ...th, textAlign:'right' }}>Total cost</th>
                    <th style={th}>{odometerLabel}</th>
                    <th style={th}>Filled by</th>
                    <th style={th}>Notes</th>
                    <th style={{ ...th, width:80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding:'40px 20px', textAlign:'center' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                          <Icon name="droplet" size={28} color={T.border} />
                          <span style={{ fontSize:13, color:T.textMuted }}>No fuel logs yet</span>
                        </div>
                      </td>
                    </tr>
                  ) : logs.map((l, i) => (
                    <tr key={l.id}
                      style={{ background: i % 2 === 0 ? T.white : `${T.slateLight}80` }}
                      onMouseEnter={e => e.currentTarget.style.background = T.blueLight}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.white : `${T.slateLight}80`}>
                      <td style={td(true)}>
                        {new Date(l.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' })}
                      </td>
                      <td style={td()}>{l.liters} L</td>
                      <td style={td(true)}>{fmt(l.costPerLiter)}</td>
                      <td style={{ ...td(), textAlign:'right', fontWeight:700 }}>{fmt(l.totalCost)}</td>
                      <td style={td(true)}>
                        {vehicleType === 'hitachi' ? (l.odometerHours ?? '—') : (l.odometerKm ?? '—')}
                      </td>
                      <td style={td(true)}>{l.filledBy || '—'}</td>
                      <td style={td(true)}>{l.notes || '—'}</td>
                      <td style={{ ...td(), textAlign:'center' }}>
                        {delId === l.id ? (
                          <span style={{ display:'flex', gap:5, justifyContent:'center' }}>
                            <Btn size="sm" variant="dangerSolid" onClick={() => handleDelete(l.id)}>Yes</Btn>
                            <Btn size="sm" variant="secondary"   onClick={() => setDelId(null)}>No</Btn>
                          </span>
                        ) : (
                          <button onClick={() => setDelId(l.id)}
                            style={{ background:'none', border:'none', cursor:'pointer',
                              padding:'4px 6px', borderRadius:6, color:T.textMuted,
                              transition:'color 0.12s' }}
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

          {/* Stat pills */}
          {logs.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:14 }}>
              <StatPill icon="droplet" label="Total litres" value={`${totalLiters.toFixed(2)} L`} accent={T.success} />
              <StatPill icon="rupee"   label="Total cost"   value={fmt(totalCost)}                 accent={T.danger}  />
              <StatPill icon="gauge"   label="Avg rate/L"   value={fmt(avgRate)}                   accent={T.blue}    />
            </div>
          )}
        </>
      )}

      {/* Add Fuel Log Modal */}
      <Modal
        visible={modal}
        onClose={() => setModal(false)}
        title="Add fuel log"
        footer={<>
          <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn onClick={handleAdd}
            disabled={saving || !form.date || !form.liters || !form.costPerLiter}>
            {saving
              ? <><div style={{ width:12, height:12, border:`2px solid rgba(255,255,255,0.4)`,
                  borderTopColor:T.white, borderRadius:'50%',
                  animation:'spin 0.7s linear infinite' }} /> Saving…</>
              : <><Icon name="plus" size={13} color={T.white} /> Add log</>
            }
          </Btn>
        </>}
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, paddingBottom:20 }}>

          <Field label="Date" required>
            <input type="date" style={inputStyle} {...field('date')} />
          </Field>

          <Field label="Filled by">
            <input placeholder="e.g. Rajan" style={inputStyle} {...field('filledBy')} />
          </Field>

          <Field label="Litres" required>
            <input type="number" step="0.01" placeholder="e.g. 50.5" style={inputStyle} {...field('liters')} />
          </Field>

          <Field label="Cost per litre (₹)" required>
            <input type="number" step="0.01" placeholder="e.g. 95.50" style={inputStyle} {...field('costPerLiter')} />
          </Field>

          <Field label="Total cost" hint="Auto-calculated">
            <input readOnly
              value={previewTotal ? `₹${Number(previewTotal).toLocaleString('en-IN', { minimumFractionDigits:2 })}` : '—'}
              style={{ ...inputStyle, background:T.slateLight, color:T.textMuted, cursor:'not-allowed' }} />
          </Field>

          <Field label={odometerLabel}>
            {vehicleType === 'hitachi'
              ? <input type="number" step="0.1" style={inputStyle} {...field('odometerHours')} />
              : <input type="number"            style={inputStyle} {...field('odometerKm')} />
            }
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

export default FuelTab