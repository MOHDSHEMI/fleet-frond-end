import React, { useState, useEffect, useMemo, type FC, type CSSProperties } from 'react'
import { getAllTrips, updateTrip, deleteTrip, getVehicles } from '../../../services/Vehicleservice'
import { getParties } from '../../../services/Parties.Service'
import type {
    Vehicle,
    Party,
    VehicleTrip,
    WorkType,
    TripFilters,
    LorryTripForm,
    HitachiTripForm,
    TripForm,
    IconName,
    IconProps,
    BadgeProps,
    BtnProps,
    StatPillProps,
    FieldProps,
    ModalProps,
} from './AllTrips.types'

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (identical to TripTab)
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
} as const

/* ─────────────────────────────────────────────────────────────
   SVG ICONS  (identical set + a couple extra for filters)
───────────────────────────────────────────────────────────── */
const ICON_PATHS: Record<IconName, string> = {
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
    pencil: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z',
    filter: 'M3 4h18l-7 8v6l-4 2v-8z',
    refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
}

const Icon: FC<IconProps> = ({ name, size = 16, color = 'currentColor', style: sx }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, ...sx }}>
        <path d={ICON_PATHS[name] || ICON_PATHS.info} />
    </svg>
)

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmt = (n?: number | null): string =>
    n != null ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'

const isLorryVehicle = (vehicle?: Vehicle | null): boolean =>
    (vehicle?.type || '').toLowerCase() === 'lorry'

const EMPTY_LORRY: LorryTripForm = {
    tripDate: '', slipNo: '', leadKm: '', uChainage: '',
    kmDriven: '', rentPerKm: '', otherExpense: '', notes: '', partyId: '', site: '',
}
const EMPTY_HITACHI: HitachiTripForm = {
    tripDate: '', workType: 'bucket', startingHours: '',
    closingHours: '', income: '', bata: '', diesel: '', notes: '', partyId: '', site: '',
}

const isLorryForm = (form: TripForm): form is LorryTripForm => 'kmDriven' in form

/* ─────────────────────────────────────────────────────────────
   FORM FIELD  — reusable labeled input
───────────────────────────────────────────────────────────── */
const Field: FC<FieldProps> = ({ label, required, children, hint }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSecond, letterSpacing: '0.04em' }}>
            {label}{required && <span style={{ color: T.danger, marginLeft: 2 }}>*</span>}
        </label>
        {children}
        {hint && <span style={{ fontSize: 10, color: T.textMuted }}>{hint}</span>}
    </div>
)

const inputStyle = (readOnly: boolean): CSSProperties => ({
    width: '100%', padding: '8px 11px', borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, color: readOnly ? T.textMuted : T.textPrimary,
    background: readOnly ? T.slateLight : T.white,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.12s',
})

/* ─────────────────────────────────────────────────────────────
   STAT PILL
───────────────────────────────────────────────────────────── */
const StatPill: FC<StatPillProps> = ({ icon, label, value, accent, style: sx }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderRadius: 8, background: accent + '12',
        border: `1px solid ${accent}30`, ...sx,
    }}>
        <Icon name={icon} size={14} color={accent} />
        <span style={{ fontSize: 12, color: T.textMuted }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{value}</span>
    </div>
)

/* ─────────────────────────────────────────────────────────────
   BADGE  — work type / vehicle type pill
───────────────────────────────────────────────────────────── */
const Badge: FC<BadgeProps> = ({ label, tone = 'blue' }) => {
    const tones: Record<string, [string, string, string]> = {
        blue: [T.blueLight, T.blue, T.blueMid],
        amber: [T.amberLight, T.amber, T.amberMid],
        violet: [T.violetLight, T.violet, '#ddd6fe'],
    }
    const [bg, color, border] = tones[tone] || tones.blue
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: bg, color, border: `1px solid ${border}`,
            textTransform: 'capitalize', whiteSpace: 'nowrap',
        }}>
            {label}
        </span>
    )
}

/* ─────────────────────────────────────────────────────────────
   MODAL  — shared container
───────────────────────────────────────────────────────────── */
const Modal: FC<ModalProps> = ({ visible, onClose, title, children, footer }) => {
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
                        onMouseEnter={e => (e.currentTarget.style.color = T.textPrimary)}
                        onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
                        <Icon name="close" size={16} />
                    </button>
                </div>
                <div style={{ padding: '22px 22px 4px', overflowY: 'auto', flex: 1 }}>
                    {children}
                </div>
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
const Btn: FC<BtnProps> = ({ onClick, disabled, variant = 'primary', size = 'md', children, style: sx }) => {
    const base: CSSProperties = {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: size === 'sm' ? '5px 12px' : '8px 18px',
        borderRadius: 7, fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px solid transparent', transition: 'all 0.12s',
        fontFamily: 'inherit', opacity: disabled ? 0.6 : 1, ...sx,
    }
    const variants: Record<string, CSSProperties> = {
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
const th: CSSProperties = {
    padding: '10px 14px', fontSize: 11, fontWeight: 700, color: T.slate,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    background: T.slateLight, borderBottom: `1px solid ${T.border}`,
    whiteSpace: 'nowrap',
}
const td = (muted?: boolean): CSSProperties => ({
    padding: '11px 14px', fontSize: 13,
    color: muted ? T.textMuted : T.textPrimary,
    borderBottom: `1px solid ${T.border}`, verticalAlign: 'middle',
})

const selectStyle: CSSProperties = {
    padding: '8px 11px', borderRadius: 7, border: `1px solid ${T.border}`,
    fontSize: 13, color: T.textPrimary, background: T.white,
    outline: 'none', fontFamily: 'inherit', cursor: 'pointer', minWidth: 150,
}

const TABLE_HEIGHT = 480
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

const stickyTh: CSSProperties = {
    ...th,
    position: 'sticky',
    top: 0,
    zIndex: 2,
}

/* ─────────────────────────────────────────────────────────────
   ALL TRIPS
───────────────────────────────────────────────────────────── */
const AllTrips: FC = () => {
    const [trips, setTrips] = useState<VehicleTrip[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [parties, setParties] = useState<Party[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')

    const [filters, setFilters] = useState<TripFilters>({ month: '', vehicleId: '', partyId: '', workType: '' })

    const [modal, setModal] = useState<boolean>(false)
    const [saving, setSaving] = useState<boolean>(false)
    const [delId, setDelId] = useState<string | null>(null)
    const [editId, setEditId] = useState<string | null>(null)
    const [editVehicle, setEditVehicle] = useState<Vehicle | null | undefined>(null)
    const [form, setForm] = useState<TripForm>(EMPTY_LORRY)
    const [page, setPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(100)

    useEffect(() => {
        getVehicles().then(setVehicles).catch(() => { })
        getParties().then(setParties).catch(() => { })
    }, [])

    const load = async (overrideFilters?: TripFilters): Promise<void> => {
        try {
            setLoading(true)
            const cleaned = Object.fromEntries(
                Object.entries(overrideFilters ?? filters).filter(([, v]) => v !== '')
            ) as Record<string, string>
            setTrips(await getAllTrips(cleaned))
            setError('')
        } catch {
            setError('Failed to load trips.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { setPage(1) }, [trips])

    const totalPages = Math.max(1, Math.ceil(trips.length / pageSize))

    useEffect(() => {
        if (page > totalPages) setPage(totalPages)
    }, [page, totalPages])

    const paginatedTrips = useMemo(() => {
        const start = (page - 1) * pageSize
        return trips.slice(start, start + pageSize)
    }, [trips, page, pageSize])

    const rangeStart = trips.length === 0 ? 0 : (page - 1) * pageSize + 1
    const rangeEnd = Math.min(page * pageSize, trips.length)

    const applyFilters = () => load()
    const clearFilters = () => {
        const empty: TripFilters = { month: '', vehicleId: '', partyId: '', workType: '' }
        setFilters(empty)
        load(empty)
    }

    type TripFormKey = keyof LorryTripForm | keyof HitachiTripForm

    const field = (k: TripFormKey) => ({
        value: String((form as Record<TripFormKey, string>)[k] ?? ''),
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm(prev => ({ ...prev, [k]: e.target.value } as TripForm)),
    })

    const closeModal = () => {
        setModal(false)
        setEditId(null)
        setEditVehicle(null)
        setForm(isLorryVehicle(editVehicle) ? EMPTY_LORRY : EMPTY_HITACHI)
    }

    const openEdit = (t: VehicleTrip) => {
        const vehicle = t.vehicle
        const lorry = isLorryVehicle(vehicle)
        setEditId(t.id)
        setEditVehicle(vehicle)
        if (lorry) {
            setForm({
                tripDate: t.tripDate?.slice(0, 10) || '',
                slipNo: t.slipNo || '',
                leadKm: t.leadKm != null ? String(t.leadKm) : '',
                uChainage: t.uChainage != null ? String(t.uChainage) : '',
                kmDriven: t.kmDriven != null ? String(t.kmDriven) : '',
                rentPerKm: t.rentPerKm != null ? String(t.rentPerKm) : '',
                otherExpense: t.otherExpense != null ? String(t.otherExpense) : '',
                notes: t.notes || '',
                partyId: t.partyId || t.party?.id || '',
                site: t.site || '',
            })
        } else {
            setForm({
                tripDate: t.tripDate?.slice(0, 10) || '',
                workType: (t.workType || 'bucket') as WorkType,
                startingHours: t.startingHours != null ? String(t.startingHours) : '',
                closingHours: t.closingHours != null ? String(t.closingHours) : '',
                income: t.income != null ? String(t.income) : '',
                bata: t.bata != null ? String(t.bata) : '',
                diesel: t.diesel != null ? String(t.diesel) : '',
                notes: t.notes || '',
                partyId: t.partyId || t.party?.id || '',
                site: t.site || '',
            })
        }
        setModal(true)
    }

    const handleSave = async () => {
        if (!editId) return
        setSaving(true)
        try {
            const payload: Record<string, string | number> = {}
            Object.entries(form).forEach(([k, v]) => {
                if (v !== '') {
                    const isDateLike = typeof v === 'string' && v.includes('-')
                    payload[k] = isNaN(Number(v)) || isDateLike ? v : Number(v)
                }
            })
            await updateTrip(editId, payload)
            closeModal()
            load()
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to update trip.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try { await deleteTrip(id); load() }
        catch { setError('Failed to delete trip.') }
        finally { setDelId(null) }
    }

    const editIsLorry = isLorryVehicle(editVehicle)

    const previewIncome = isLorryForm(form) && form.kmDriven && form.rentPerKm
        ? `₹${(Number(form.kmDriven) * Number(form.rentPerKm)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : null

    const previewHours = !isLorryForm(form) && form.startingHours && form.closingHours
        ? (Number(form.closingHours) - Number(form.startingHours)).toFixed(2)
        : null

    // ── Totals across whatever is currently loaded ──
    const totalIncome = useMemo(() => trips.reduce((s, t) => s + Number(t.income || 0), 0), [trips])
    const totalKm = useMemo(() => trips.reduce((s, t) => s + Number(t.kmDriven || 0), 0), [trips])
    const totalHours = useMemo(() => trips.reduce((s, t) => s + Number(t.hoursWorked || 0), 0), [trips])

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

            {/* ── Filter bar ── */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12,
                padding: '14px 16px', marginBottom: 16, background: T.slateLight,
                border: `1px solid ${T.border}`, borderRadius: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
                    <Icon name="filter" size={14} color={T.textMuted} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.textSecond }}>Filters</span>
                </div>

                <Field label="Month">
                    <input type="month" style={{ ...selectStyle, minWidth: 140 }}
                        value={filters.month}
                        onChange={e => setFilters(f => ({ ...f, month: e.target.value }))} />
                </Field>

                <Field label="Vehicle">
                    <select style={selectStyle} value={filters.vehicleId}
                        onChange={e => setFilters(f => ({ ...f, vehicleId: e.target.value }))}>
                        <option value="">All Vehicles</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.name || v.regNo || v.id}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Party">
                    <select style={selectStyle} value={filters.partyId}
                        onChange={e => setFilters(f => ({ ...f, partyId: e.target.value }))}>
                        <option value="">All Parties</option>
                        {parties.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Work Type">
                    <select style={selectStyle} value={filters.workType}
                        onChange={e => setFilters(f => ({ ...f, workType: e.target.value as TripFilters['workType'] }))}>
                        <option value="">All Types</option>
                        <option value="bucket">Bucket</option>
                        <option value="breaker">Breaker</option>
                    </select>
                </Field>

                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                    <Btn variant="secondary" onClick={clearFilters}>
                        <Icon name="refresh" size={13} color={T.textSecond} /> Clear
                    </Btn>
                    <Btn onClick={applyFilters}>
                        <Icon name="filter" size={13} color={T.white} /> Apply
                    </Btn>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="road" size={14} color={T.textMuted} />
                    <span style={{ fontSize: 13, color: T.textMuted }}>
                        <strong style={{ color: T.textPrimary }}>{trips.length}</strong>
                        {' '}trip{trips.length !== 1 ? 's' : ''} found
                    </span>
                </div>
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
                        <div style={{ maxHeight: TABLE_HEIGHT, overflowY: 'auto', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={stickyTh}>Date</th>
                                        <th style={stickyTh}>Vehicle</th>
                                        <th style={stickyTh}>Party</th>
                                        <th style={stickyTh}>Site</th>
                                        <th style={stickyTh}>Type</th>
                                        <th style={stickyTh}>KM / Hours</th>
                                        <th style={stickyTh}>Rate / Bata</th>
                                        <th style={stickyTh}>Other Exp / Diesel</th>
                                        <th style={{ ...stickyTh, textAlign: 'right' }}>Income</th>
                                        <th style={{ ...stickyTh, width: 80 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trips.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} style={{ padding: '40px 20px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                                    <Icon name="road" size={28} color={T.border} />
                                                    <span style={{ fontSize: 13, color: T.textMuted }}>No trips match the current filters</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedTrips.map((t, i) => {
                                        const lorry = isLorryVehicle(t.vehicle)
                                        return (
                                            <tr key={t.id}
                                                style={{ background: i % 2 === 0 ? T.white : T.slateLight + '80' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = T.blueLight)}
                                                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? T.white : T.slateLight + '80')}>
                                                <td style={td()}>
                                                    {new Date(t.tripDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                </td>
                                                <td style={td()}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <Icon name={lorry ? 'truck' : 'excavator'} size={13} color={T.textMuted} />
                                                        {t.vehicle?.name || t.vehicle?.regNo || '—'}
                                                    </span>
                                                </td>
                                                <td style={td(true)}>{t.party?.name || '—'}</td>
                                                <td style={td(true)}>{t.site || '—'}</td>
                                                <td style={td()}>
                                                    <Badge label={lorry ? 'Lorry' : (t.workType || '—')} tone={lorry ? 'violet' : (t.workType === 'bucket' ? 'blue' : 'amber')} />
                                                </td>
                                                <td style={td()}>
                                                    {lorry
                                                        ? <strong>{t.kmDriven ?? '—'} km</strong>
                                                        : <strong>{t.hoursWorked ?? '—'} hrs</strong>}
                                                </td>
                                                <td style={td(true)}>
                                                    {lorry ? fmt(t.rentPerKm) : fmt(t.bata)}
                                                </td>
                                                <td style={td(true)}>
                                                    {lorry ? (t.otherExpense ? fmt(t.otherExpense) : '—') : (t.diesel ? fmt(t.diesel) : '—')}
                                                </td>
                                                <td style={{ ...td(), textAlign: 'right', fontWeight: 700, color: T.success }}>
                                                    {fmt(t.income)}
                                                </td>
                                                <td style={{ ...td(), textAlign: 'center' }}>
                                                    <span style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                                        {delId === t.id ? (
                                                            <>
                                                                <Btn size="sm" variant="dangerSolid" onClick={() => handleDelete(t.id)}>Yes</Btn>
                                                                <Btn size="sm" variant="secondary" onClick={() => setDelId(null)}>No</Btn>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => openEdit(t)}
                                                                    style={{
                                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                                        padding: '4px 6px', borderRadius: 6, color: T.textMuted,
                                                                    }}
                                                                    onMouseEnter={e => (e.currentTarget.style.color = T.blue)}
                                                                    onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
                                                                    <Icon name="pencil" size={14} />
                                                                </button>
                                                                <button onClick={() => setDelId(t.id)}
                                                                    style={{
                                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                                        padding: '4px 6px', borderRadius: 6, color: T.textMuted,
                                                                    }}
                                                                    onMouseEnter={e => (e.currentTarget.style.color = T.danger)}
                                                                    onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}>
                                                                    <Icon name="trash" size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {trips.length > 0 && (
                            <div style={{
                                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
                                gap: 12, padding: '12px 16px', borderTop: `1px solid ${T.border}`, background: T.slateLight,
                            }}>
                                <span style={{ fontSize: 12, color: T.textMuted }}>
                                    Showing <strong style={{ color: T.textPrimary }}>{rangeStart}–{rangeEnd}</strong> of{' '}
                                    <strong style={{ color: T.textPrimary }}>{trips.length}</strong>
                                </span>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 12, color: T.textMuted }}>Rows</span>
                                    <select
                                        style={{ ...selectStyle, minWidth: 72, padding: '6px 10px' }}
                                        value={pageSize}
                                        onChange={e => {
                                            setPageSize(Number(e.target.value))
                                            setPage(1)
                                        }}
                                    >
                                        {PAGE_SIZE_OPTIONS.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Btn
                                        size="sm"
                                        variant="secondary"
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                    >
                                        Previous
                                    </Btn>
                                    <span style={{ fontSize: 12, color: T.textSecond, minWidth: 88, textAlign: 'center' }}>
                                        Page {page} of {totalPages}
                                    </span>
                                    <Btn
                                        size="sm"
                                        variant="secondary"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    >
                                        Next
                                    </Btn>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Totals strip ── */}
                    {trips.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                            <StatPill icon="road" label="Total KM" value={`${totalKm.toFixed(2)} km`} accent={T.blue} />
                            <StatPill icon="settings" label="Total Hours" value={`${totalHours.toFixed(2)} hrs`} accent={T.amber} />
                            <StatPill icon="rupee" label="Total Income" value={fmt(totalIncome)} accent={T.success}
                                style={{ marginLeft: 'auto' }} />
                        </div>
                    )}
                </>
            )}

            {/* ── Edit Trip Modal ── */}
            <Modal
                visible={modal}
                onClose={closeModal}
                title={`Edit Trip — ${editIsLorry ? 'Lorry' : 'Hitachi'}`}
                footer={<>
                    <Btn variant="secondary" onClick={closeModal}>Cancel</Btn>
                    <Btn onClick={handleSave} disabled={saving || !form.tripDate}>
                        {saving
                            ? <><div style={{
                                width: 12, height: 12, border: `2px solid rgba(255,255,255,0.4)`,
                                borderTopColor: T.white, borderRadius: '50%',
                                animation: 'spin 0.7s linear infinite'
                            }} /> Saving…</>
                            : <><Icon name="check" size={13} color={T.white} /> Save Changes</>
                        }
                    </Btn>
                </>}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingBottom: 20 }}>

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

                    <Field label="Site" hint="Optional">
                        <input placeholder="e.g. Kochi Bypass" style={inputStyle(false)} {...field('site')} />
                    </Field>

                    {!editIsLorry && !isLorryForm(form) && <>
                        <Field label="Work Type">
                            <select
                                style={{ ...inputStyle(false), cursor: 'pointer' }}
                                value={form.workType}
                                onChange={e => setForm(prev => ({ ...prev, workType: e.target.value as WorkType }))}
                            >
                                <option value="bucket">Bucket</option>
                                <option value="breaker">Breaker</option>
                            </select>
                        </Field>
                        <div />

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

                    {editIsLorry && <>
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

export default AllTrips