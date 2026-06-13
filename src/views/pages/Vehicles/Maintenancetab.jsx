import React, { useState, useEffect } from 'react'
import { getMaintenance, addMaintenance, deleteMaintenance } from '../../../services/Vehicleservice'

const T = {
  navy:         '#0f1629',
  blue:         '#2563eb',
  blueLight:    '#eff6ff',
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
  amber:        '#854f0b',
  amberLight:   '#faeeda',
  amberBorder:  '#fac775',
  violet:       '#7c3aed',
  violetLight:  '#f5f3ff',
  violetMid:    '#ddd6fe',
}

const fmt = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

const Icon = ({ name, size = 16, color = 'currentColor' }) => {
  const paths = {
    plus:    'M12 5v14M5 12h14',
    alert:   'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
    close:   'M18 6L6 18M6 6l12 12',
    trash:   'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    tool:    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    rupee:   'M6 3h12M6 8h12M15 21L9 8m0 0h1.5a4.5 4.5 0 0 1 0 9H9l6 4',
    settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
    circle:  'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z',
    oil:     'M12 2v6m0 0C8 8 5 11 5 15a7 7 0 0 0 14 0c0-4-3-7-7-7z',
    tag:     'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <path d={paths[name] || paths.alert} />
    </svg>
  )
}

/* ── Type badge config ── */
const TYPE_META = {
  service:    { label: 'Service',    icon: 'settings', bg: T.successLight, text: T.success,  border: T.successMid  },
  repair:     { label: 'Repair',     icon: 'alert',    bg: T.dangerLight,  text: T.danger,   border: T.dangerBorder },
  tyre:       { label: 'Tyre',       icon: 'circle',   bg: T.amberLight,   text: T.amber,    border: T.amberBorder  },
  oil_change: { label: 'Oil change', icon: 'oil',      bg: '#eff6ff',      text: T.blue,     border: '#bfdbfe'      },
  other:      { label: 'Other',      icon: 'tag',      bg: T.violetLight,  text: T.violet,   border: T.violetMid    },
}

const TypeBadge = ({ type }) => {
  const m = TYPE_META[type] || TYPE_META.other
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600,
      background:m.bg, color:m.text, border:`1px solid ${m.border}` }}>
      <Icon name={m.icon} size={10} color={m.text} />
      {m.label}
    </span>
  )
}

/* ── Shared primitives ── */
const Field = ({ label, required, children }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
    <label style={{ fontSize:11, fontWeight:700, color:T.textSecond, letterSpacing:'0.04em' }}>
      {label}{required && <span style={{ color:T.danger, marginLeft:2 }}>*</span>}
    </label>
    {children}
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
      <div style={{ background:T.white, borderRadius:14, width:'100%', maxWidth:620,
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
  type:'service', date:'', description:'', cost:'',
  serviceCenter:'', odometerKm:'', odometerHours:'',
  nextServiceDate:'', nextServiceKm:'', notes:'',
}

/* ── MaintenanceTab ── */
const MaintenanceTab = ({ vehicleId, vehicleType }) => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [modal,   setModal]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState(EMPTY)
  const [delId,   setDelId]   = useState(null)

  const load = async () => {
    try { setLoading(true); setRecords(await getMaintenance(vehicleId)) }
    catch { setError('Failed to load maintenance records.') }
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
      await addMaintenance(vehicleId, {
        ...form,
        cost:          Number(form.cost),
        odometerKm:    form.odometerKm    ? Number(form.odometerKm)    : undefined,
        odometerHours: form.odometerHours ? Number(form.odometerHours) : undefined,
        nextServiceKm: form.nextServiceKm ? Number(form.nextServiceKm) : undefined,
        nextServiceDate: form.nextServiceDate || undefined,
      })
      setModal(false); setForm(EMPTY); load()
    } catch { setError('Failed to add maintenance record.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await deleteMaintenance(id); load() }
    catch { setError('Failed to delete record.') }
    finally { setDelId(null) }
  }

  const totalCost = records.reduce((s, r) => s + Number(r.cost || 0), 0)

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
          <Icon name="tool" size={14} color={T.textMuted} />
          <span style={{ fontSize:13, color:T.textMuted }}>
            <strong style={{ color:T.textPrimary }}>{records.length}</strong>
            {' '}record{records.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Btn onClick={() => setModal(true)}>
          <Icon name="plus" size={13} color={T.white} /> Add record
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
                    <th style={th}>Type</th>
                    <th style={th}>Description</th>
                    <th style={{ ...th, textAlign:'right' }}>Cost</th>
                    <th style={th}>Service centre</th>
                    <th style={th}>Next service</th>
                    <th style={{ ...th, width:80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding:'40px 20px', textAlign:'center' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                          <Icon name="tool" size={28} color={T.border} />
                          <span style={{ fontSize:13, color:T.textMuted }}>No maintenance records yet</span>
                        </div>
                      </td>
                    </tr>
                  ) : records.map((r, i) => (
                    <tr key={r.id}
                      style={{ background: i % 2 === 0 ? T.white : `${T.slateLight}80` }}
                      onMouseEnter={e => e.currentTarget.style.background = T.blueLight}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.white : `${T.slateLight}80`}>
                      <td style={td(true)}>
                        {new Date(r.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' })}
                      </td>
                      <td style={td()}><TypeBadge type={r.type} /></td>
                      <td style={td()}>{r.description}</td>
                      <td style={{ ...td(), textAlign:'right', fontWeight:700 }}>{fmt(r.cost)}</td>
                      <td style={td(true)}>{r.serviceCenter || '—'}</td>
                      <td style={td(true)}>
                        {r.nextServiceDate
                          ? new Date(r.nextServiceDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' })
                          : '—'}
                        {r.nextServiceKm ? ` / ${r.nextServiceKm} KM` : ''}
                      </td>
                      <td style={{ ...td(), textAlign:'center' }}>
                        {delId === r.id ? (
                          <span style={{ display:'flex', gap:5, justifyContent:'center' }}>
                            <Btn size="sm" variant="dangerSolid" onClick={() => handleDelete(r.id)}>Yes</Btn>
                            <Btn size="sm" variant="secondary"   onClick={() => setDelId(null)}>No</Btn>
                          </span>
                        ) : (
                          <button onClick={() => setDelId(r.id)}
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
          {records.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:14 }}>
              <StatPill icon="tool"  label="Total records" value={records.length}  accent={T.success} />
              <StatPill icon="rupee" label="Total cost"    value={fmt(totalCost)}  accent={T.danger}  />
            </div>
          )}
        </>
      )}

      {/* Add Maintenance Modal */}
      <Modal
        visible={modal}
        onClose={() => setModal(false)}
        title="Add maintenance record"
        footer={<>
          <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn onClick={handleAdd}
            disabled={saving || !form.date || !form.description || !form.cost}>
            {saving
              ? <><div style={{ width:12, height:12, border:`2px solid rgba(255,255,255,0.4)`,
                  borderTopColor:T.white, borderRadius:'50%',
                  animation:'spin 0.7s linear infinite' }} /> Saving…</>
              : <><Icon name="plus" size={13} color={T.white} /> Add record</>
            }
          </Btn>
        </>}
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, paddingBottom:20 }}>

          <Field label="Type">
            <select style={{ ...inputStyle, cursor:'pointer' }} {...field('type')}>
              <option value="service">Service</option>
              <option value="repair">Repair</option>
              <option value="tyre">Tyre</option>
              <option value="oil_change">Oil change</option>
              <option value="other">Other</option>
            </select>
          </Field>

          <Field label="Date" required>
            <input type="date" style={inputStyle} {...field('date')} />
          </Field>

          <Field label="Cost (₹)" required>
            <input type="number" placeholder="e.g. 5000" style={inputStyle} {...field('cost')} />
          </Field>

          <div style={{ gridColumn:'1 / 3' }}>
            <Field label="Description" required>
              <input placeholder="e.g. Engine oil change + filter" style={inputStyle} {...field('description')} />
            </Field>
          </div>

          <Field label="Service centre">
            <input placeholder="Garage name" style={inputStyle} {...field('serviceCenter')} />
          </Field>

          <Field label={vehicleType === 'hitachi' ? 'Hour meter' : 'Odometer KM'}>
            {vehicleType === 'hitachi'
              ? <input type="number" step="0.1" style={inputStyle} {...field('odometerHours')} />
              : <input type="number"            style={inputStyle} {...field('odometerKm')} />
            }
          </Field>

          <Field label="Next service date">
            <input type="date" style={inputStyle} {...field('nextServiceDate')} />
          </Field>

          {vehicleType === 'lorry' && (
            <Field label="Next service KM">
              <input type="number" style={inputStyle} {...field('nextServiceKm')} />
            </Field>
          )}

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

export default MaintenanceTab