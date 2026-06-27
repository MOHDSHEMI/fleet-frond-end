import React, { useState, useEffect, useMemo } from 'react'
import {
  getParties, createParty, updateParty, deleteParty, restoreParty,
} from '../../../services/Parties.Service'
import PartyModal, { STEPS } from './PartiesModal'

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (identical to VehicleList)
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

const Icon = ({ name, size = 16, color = 'currentColor', style: sx }) => {
  const paths = {
    plus: 'M12 5v14M5 12h14',
    edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    search: 'M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z',
    close: 'M18 6L6 18M6 6l12 12',
    alert: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
    check: 'M20 6L9 17l-5-5',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    hash: 'M4 9h16M4 15h16M10 3L8 21M16 3l-2 18',
    phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
    mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
    folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
    info: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 9v5m0-9h.01',
    undo: 'M3 7v6h6M3 13a9 9 0 1 0 3-7',
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
   EMPTY FORM STATE
───────────────────────────────────────────────────────────── */
const EMPTY_FORM = { name: '', location: '', gstNumber: '', phone: '', email: '', notes: '' }

/* GSTIN pattern, same as backend validation */
const GST_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ─────────────────────────────────────────────────────────────
   TABLE CELL STYLES  (identical to TripTab pattern)
───────────────────────────────────────────────────────────── */
const th = {
  padding: '10px 14px', fontSize: 11, fontWeight: 700, color: T.slate,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  background: T.slateLight, borderBottom: `1px solid ${T.border}`,
  whiteSpace: 'nowrap', textAlign: 'left',
}
const td = (muted) => ({
  padding: '12px 14px', fontSize: 13,
  color: muted ? T.textMuted : T.textPrimary,
  borderBottom: `1px solid ${T.border}`, verticalAlign: 'middle',
})

/* ─────────────────────────────────────────────────────────────
   DELETE CONFIRM MODAL
───────────────────────────────────────────────────────────── */
const DeleteConfirm = ({ party, onConfirm, onCancel, deleting }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 1100,
    background: 'rgba(15,22,41,0.55)', backdropFilter: 'blur(3px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
  }}>
    <div style={{
      background: T.white, borderRadius: 14, padding: '28px 28px 24px',
      maxWidth: 400, width: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.16)'
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: T.dangerLight,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14
      }}>
        <Icon name="trash" size={20} color={T.danger} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, color: T.textPrimary, marginBottom: 6 }}>
        Delete Party?
      </div>
      <div style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.6, marginBottom: 20 }}>
        "<strong>{party.name}</strong>" will be removed from the active list. You can restore it later if needed.
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} disabled={deleting}
          style={{
            flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${T.border}`,
            background: T.white, fontSize: 13, fontWeight: 600, color: T.textSecond,
            cursor: deleting ? 'not-allowed' : 'pointer'
          }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={deleting}
          style={{
            flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
            background: deleting ? '#fca5a5' : T.danger, color: T.white,
            fontSize: 13, fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
          {deleting
            ? <><span style={{
              width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)',
              borderTopColor: '#fff', borderRadius: '50%',
              animation: 'spin 0.7s linear infinite', display: 'inline-block'
            }} />Deleting…</>
            : <><Icon name="trash" size={13} color="#fff" />Delete</>
          }
        </button>
      </div>
    </div>
  </div>
)

/* ─────────────────────────────────────────────────────────────
   MAIN: PartiesList
───────────────────────────────────────────────────────────── */
const PartiesList = () => {
  const [parties, setParties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  /* ── Load parties ── */
  const load = async () => {
    try {
      setLoading(true); setError('')
      const data = await getParties()
      setParties(data)
    } catch {
      setError('Failed to load parties.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  /* ── Debounced server search (falls back to client filter while typing) ── */
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const data = await getParties(search.trim() || undefined)
        setParties(data)
      } catch {
        setError('Search failed.')
      }
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  /* ── Form field setter ── */
  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const canNext0 = useMemo(() => {
    if (!form.name || !form.name.trim()) return false
    if (form.gstNumber && form.gstNumber.length === 15 && !GST_REGEX.test(form.gstNumber)) {
      return false
    }
    return true
  }, [form.name, form.gstNumber])

  /* ── Open modal: Add ── */
  const openAdd = () => {
    setIsEdit(false); setEditingId(null)
    setForm(EMPTY_FORM); setStep(0); setErrors({})
    setModalOpen(true)
  }

  /* ── Open modal: Edit ── */
  const openEdit = (party) => {
    setIsEdit(true); setEditingId(party.id)
    setForm({
      name: party.name || '',
      location: party.location || '',
      gstNumber: party.gstNumber || '',
      phone: party.phone || '',
      email: party.email || '',
      notes: party.notes || '',
    })
    setStep(0); setErrors({})
    setModalOpen(true)
  }

  const closeModal = () => { if (!saving) setModalOpen(false) }

  /* ── Submit (create or update) ── */
  const handleSubmit = async () => {
    // Final validation pass
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Party name is required'
    if (form.gstNumber && !GST_REGEX.test(form.gstNumber)) {
      newErrors.gstNumber = 'Must be a valid 15-character GSTIN'
    }
    if (form.email && !EMAIL_REGEX.test(form.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // jump back to the step containing the error
      if (newErrors.name || newErrors.gstNumber) setStep(0)
      else setStep(1)
      return
    }

    const payload = {
      name: form.name.trim(),
      location: form.location.trim() || undefined,
      gstNumber: form.gstNumber.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }

    try {
      setSaving(true); setError('')
      if (isEdit) {
        await updateParty(editingId, payload)
      } else {
        await createParty(payload)
      }
      setModalOpen(false)
      load()
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to save party.'
      setError(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await deleteParty(deleteTarget.id)
      setParties(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      setError('Failed to delete party.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f5f9',
      fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif"
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input:focus, select:focus, textarea:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: '20px 28px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9, background: T.blueLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon name="folder" size={18} color={T.blue} />
            </div>
            <div>
              <h1 style={{
                margin: 0, fontSize: 20, fontWeight: 800,
                color: T.textPrimary, letterSpacing: '-0.02em'
              }}>Parties</h1>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: T.textMuted }}>
                Customers, vendors and contractors
              </p>
            </div>
          </div>

          <button onClick={openAdd}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 8, border: 'none',
              background: T.navy, color: T.white,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.12s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Icon name="plus" size={14} color="#fff" /> Add Party
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 28 }}>

        {/* ── Error banner ── */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
            background: T.dangerLight, border: `1px solid ${T.dangerBorder}`,
            borderRadius: 8, marginBottom: 20
          }}>
            <Icon name="alert" size={16} color={T.danger} />
            <span style={{ fontSize: 14, color: T.danger, flex: 1 }}>{error}</span>
            <button onClick={() => setError('')} style={{
              background: 'none', border: 'none',
              cursor: 'pointer', padding: 4, display: 'flex'
            }}>
              <Icon name="close" size={14} color={T.danger} />
            </button>
          </div>
        )}

        {/* ── Search bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <div style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: T.textMuted, display: 'flex'
            }}>
              <Icon name="search" size={15} color={T.textMuted} />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, location, or GST…"
              style={{
                width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8,
                border: `1px solid ${T.border}`, fontSize: 13, color: T.textPrimary,
                background: T.white, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
              }}
            />
          </div>
          <span style={{ fontSize: 13, color: T.textMuted }}>
            <strong style={{ color: T.textPrimary }}>{parties.length}</strong>{' '}
            part{parties.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: 30, height: 30, border: `3px solid ${T.border}`,
              borderTopColor: T.blue, borderRadius: '50%',
              animation: 'spin 0.7s linear infinite'
            }} />
          </div>
        ) : (
          <div style={{
            background: T.white, border: `1px solid ${T.border}`,
            borderRadius: 10, overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Name</th>
                    <th style={th}>Location</th>
                    <th style={th}>GST Number</th>
                    <th style={th}>Phone</th>
                    <th style={th}>Email</th>
                    <th style={{ ...th, width: 90, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <Icon name="folder" size={28} color={T.border} />
                          <span style={{ fontSize: 13, color: T.textMuted }}>
                            {search ? 'No parties match your search' : 'No parties added yet'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : parties.map((p, i) => (
                    <tr key={p.id}
                      style={{ background: i % 2 === 0 ? T.white : T.slateLight + '80' }}
                      onMouseEnter={e => e.currentTarget.style.background = T.blueLight}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.white : T.slateLight + '80'}>
                      <td style={td()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 7, background: T.blueLight,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            <Icon name="user" size={13} color={T.blue} />
                          </div>
                          <strong>{p.name}</strong>
                        </div>
                      </td>
                      <td style={td(!p.location)}>{p.location || '—'}</td>
                      <td style={td(!p.gstNumber)}>
                        {p.gstNumber
                          ? <span style={{
                            fontFamily: 'monospace', fontSize: 12,
                            background: T.slateLight, padding: '2px 7px', borderRadius: 5
                          }}>
                            {p.gstNumber}
                          </span>
                          : '—'}
                      </td>
                      <td style={td(!p.phone)}>{p.phone || '—'}</td>
                      <td style={td(!p.email)}>{p.email || '—'}</td>
                      <td style={{ ...td(), textAlign: 'center' }}>
                        <span style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button onClick={() => openEdit(p)} title="Edit"
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              padding: '4px 6px', borderRadius: 6, color: T.textMuted,
                              display: 'flex', transition: 'color 0.12s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = T.violet}
                            onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
                            <Icon name="edit" size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(p)} title="Delete"
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              padding: '4px 6px', borderRadius: 6, color: T.textMuted,
                              display: 'flex', transition: 'color 0.12s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = T.danger}
                            onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
                            <Icon name="trash" size={14} />
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <PartyModal
        visible={modalOpen}
        onClose={closeModal}
        title={isEdit ? 'Edit Party' : 'Add New Party'}
        subtitle={isEdit ? 'Update party details' : `Step ${step + 1} of ${STEPS.length}`}
        step={step}
        setStep={setStep}
        form={form}
        set={set}
        canNext0={canNext0}
        onSubmit={handleSubmit}
        saving={saving}
        isEdit={isEdit}
        errors={errors}
      />

      {/* ── Delete confirmation ── */}
      {deleteTarget && (
        <DeleteConfirm
          party={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  )
}

export default PartiesList