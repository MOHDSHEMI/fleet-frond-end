import React, { useState, useEffect, useRef, useCallback } from 'react'
import { getDocuments, uploadDocument, deleteDocument } from '../../../services/Vehicleservice'

/* ─── PDF.js via CDN (loaded once) ─────────────────────────── */
let pdfjsLib = null
const loadPdfJs = () =>
  new Promise((resolve) => {
    if (pdfjsLib) return resolve(pdfjsLib)
    if (window.pdfjsLib) { pdfjsLib = window.pdfjsLib; return resolve(pdfjsLib) }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      pdfjsLib = window.pdfjsLib
      resolve(pdfjsLib)
    }
    document.head.appendChild(script)
  })

/* ─── Design tokens ─────────────────────────────────────────── */
const T = {
  navy:'#0f1629',navyMid:'#1e2a45',navyLight:'#2d3f5f',
  blue:'#2563eb',blueLight:'#eff6ff',blueMid:'#bfdbfe',
  amber:'#d97706',amberLight:'#fffbeb',amberMid:'#fde68a',
  slate:'#64748b',slateLight:'#f8fafc',border:'#e2e8f0',
  borderHover:'#cbd5e1',white:'#ffffff',textPrimary:'#0f172a',
  textSecond:'#475569',textMuted:'#94a3b8',danger:'#dc2626',
  dangerLight:'#fef2f2',dangerBorder:'#fecaca',success:'#16a34a',
  successLight:'#f0fdf4',warn:'#ea580c',warnLight:'#fff7ed',
  violet:'#7c3aed',violetLight:'#f5f3ff',
}

/* ─── Icons ─────────────────────────────────────────────────── */
const Icon = ({ name, size = 16, color = 'currentColor', style: sx }) => {
  const paths = {
    plus:     'M12 5v14M5 12h14',
    trash:    'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    alert:    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
    close:    'M18 6L6 18M6 6l12 12',
    eye:      'M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    upload:   'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
    file:     'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    folder:   'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
    permit:   'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4',
    info:     'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 9v5m0-9h.01',
    chevLeft: 'M15 18l-6-6 6-6',
    chevRight:'M9 18l6-6-6-6',
    zoomIn:   'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7',
    zoomOut:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6',
    externalLink: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...sx }}>
      <path d={paths[name] || paths.info} />
    </svg>
  )
}

/* ─── Categories ─────────────────────────────────────────────── */
const CATEGORIES = [
  { key:'insurance',        label:'Insurance',        color:'#1d4ed8', bg:'#dbeafe', border:'#bfdbfe' },
  { key:'road_tax',         label:'Road Tax',         color:'#065f46', bg:'#d1fae5', border:'#6ee7b7' },
  { key:'permit',           label:'Permit',           color:'#7c3aed', bg:'#ede9fe', border:'#c4b5fd' },
  { key:'battery_warranty', label:'Battery Warranty', color:'#b45309', bg:'#fef3c7', border:'#fde68a' },
  { key:'tyre_warranty',    label:'Tyre Warranty',    color:'#9f1239', bg:'#fce7f3', border:'#f9a8d4' },
  { key:'trip_receipt',     label:'Trip Receipt',     color:'#0e7490', bg:'#cffafe', border:'#67e8f9' },
  { key:'other',            label:'Other',            color:'#64748b', bg:'#f1f5f9', border:'#cbd5e1' },
]
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c]))

/* ─── Helpers ────────────────────────────────────────────────── */
const fmtSize = b => {
  if (!b) return ''
  if (b < 1024) return `${b} B`
  if (b < 1024*1024) return `${(b/1024).toFixed(1)} KB`
  return `${(b/(1024*1024)).toFixed(1)} MB`
}
const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'}) : '—'

/* ─── Shared UI ──────────────────────────────────────────────── */
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

const Btn = ({ onClick, disabled, variant='primary', size='md', children, style:sx }) => {
  const base = {
    display:'inline-flex', alignItems:'center', gap:6,
    padding: size==='sm' ? '5px 12px' : '8px 18px',
    borderRadius:7, fontSize: size==='sm' ? 12 : 13,
    fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer',
    border:'1px solid transparent', transition:'all 0.12s',
    fontFamily:'inherit', opacity: disabled ? 0.6 : 1, ...sx,
  }
  const variants = {
    primary:     { background:T.navy,        color:T.white,      borderColor:T.navy },
    ghost:       { background:'transparent', color:T.textSecond, borderColor:'transparent' },
    secondary:   { background:T.white,       color:T.textSecond, borderColor:T.border },
    danger:      { background:T.dangerLight, color:T.danger,     borderColor:T.dangerBorder },
    dangerSolid: { background:T.danger,      color:T.white,      borderColor:T.danger },
  }
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity='0.85' }}
      onMouseLeave={e => { e.currentTarget.style.opacity='1' }}>
      {children}
    </button>
  )
}

const Modal = ({ visible, onClose, title, children, footer, maxWidth=560 }) => {
  useEffect(() => {
    if (!visible) return
    const h = e => { if (e.key==='Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [visible, onClose])
  if (!visible) return null
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(15,22,41,0.6)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }} onClick={e => { if (e.target===e.currentTarget) onClose() }}>
      <div style={{
        background:T.white, borderRadius:14, width:'100%', maxWidth,
        boxShadow:'0 24px 64px rgba(15,22,41,0.25)',
        display:'flex', flexDirection:'column', maxHeight:'94vh',
        animation:'modalIn 0.16s ease',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 20px', borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          <span style={{ fontSize:15, fontWeight:800, color:T.textPrimary }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer',
            padding:4, borderRadius:5, display:'flex', color:T.textMuted }}
            onMouseEnter={e => e.currentTarget.style.color=T.textPrimary}
            onMouseLeave={e => e.currentTarget.style.color=T.textMuted}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>{children}</div>
        {footer && (
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10,
            padding:'14px 20px', borderTop:`1px solid ${T.border}`, flexShrink:0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PDF VIEWER COMPONENT
   Uses pdf.js to render pages onto canvas elements inline.
───────────────────────────────────────────────────────────── */
const PdfViewer = ({ url, fileName }) => {
  const [pdf,        setPdf]        = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [page,       setPage]       = useState(1)
  const [scale,      setScale]      = useState(1.2)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const canvasRef = useRef(null)
  const renderTask = useRef(null)

  // Load PDF document
  useEffect(() => {
    let cancelled = false
    setLoading(true); setError(''); setPdf(null); setPage(1)
    loadPdfJs().then(lib => {
      lib.getDocument({ url, withCredentials: false }).promise.then(doc => {
        if (cancelled) return
        setPdf(doc); setTotalPages(doc.numPages); setLoading(false)
      }).catch(() => {
        if (!cancelled) { setError('Failed to load PDF. Try downloading it.'); setLoading(false) }
      })
    })
    return () => { cancelled = true }
  }, [url])

  // Render current page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return
    let cancelled = false

    if (renderTask.current) { renderTask.current.cancel(); renderTask.current = null }

    pdf.getPage(page).then(p => {
      if (cancelled) return
      const viewport = p.getViewport({ scale })
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width  = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      const task = p.render({ canvasContext: ctx, viewport })
      renderTask.current = task
      task.promise.catch(() => {})
    })
    return () => {
      cancelled = true
      if (renderTask.current) { renderTask.current.cancel(); renderTask.current = null }
    }
  }, [pdf, page, scale])

  const SCALE_STEPS = [0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 2.0]
  const zoomIn  = () => { const i = SCALE_STEPS.indexOf(scale); if (i < SCALE_STEPS.length-1) setScale(SCALE_STEPS[i+1]) }
  const zoomOut = () => { const i = SCALE_STEPS.indexOf(scale); if (i > 0) setScale(SCALE_STEPS[i-1]) }
  const scaleIdx = SCALE_STEPS.indexOf(scale)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px',
        borderBottom:`1px solid ${T.border}`, background:T.slateLight, flexShrink:0, flexWrap:'wrap' }}>
        {/* Page nav */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page<=1 || loading}
            style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:6, padding:'3px 7px',
              cursor:page<=1?'not-allowed':'pointer', opacity:page<=1?0.4:1, display:'flex' }}>
            <Icon name="chevLeft" size={13} color={T.textSecond} />
          </button>
          <span style={{ fontSize:12, color:T.textSecond, minWidth:70, textAlign:'center' }}>
            {loading ? '…' : `${page} / ${totalPages}`}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page>=totalPages || loading}
            style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:6, padding:'3px 7px',
              cursor:page>=totalPages?'not-allowed':'pointer', opacity:page>=totalPages?0.4:1, display:'flex' }}>
            <Icon name="chevRight" size={13} color={T.textSecond} />
          </button>
        </div>
        <div style={{ width:1, height:18, background:T.border, margin:'0 2px' }} />
        {/* Zoom */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <button onClick={zoomOut} disabled={scaleIdx<=0}
            style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:6, padding:'3px 7px',
              cursor:scaleIdx<=0?'not-allowed':'pointer', opacity:scaleIdx<=0?0.4:1, display:'flex' }}>
            <Icon name="zoomOut" size={13} color={T.textSecond} />
          </button>
          <span style={{ fontSize:11, fontWeight:700, color:T.textSecond, minWidth:36, textAlign:'center' }}>
            {Math.round(scale*100)}%
          </span>
          <button onClick={zoomIn} disabled={scaleIdx>=SCALE_STEPS.length-1}
            style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:6, padding:'3px 7px',
              cursor:scaleIdx>=SCALE_STEPS.length-1?'not-allowed':'pointer',
              opacity:scaleIdx>=SCALE_STEPS.length-1?0.4:1, display:'flex' }}>
            <Icon name="zoomIn" size={13} color={T.textSecond} />
          </button>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          <a href={url} target="_blank" rel="noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600,
              color:T.blue, textDecoration:'none', padding:'3px 9px', borderRadius:6,
              border:`1px solid ${T.blueMid}`, background:T.blueLight }}>
            <Icon name="externalLink" size={11} color={T.blue} /> Open tab
          </a>
          <a href={url} download={fileName}
            style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600,
              color:T.textSecond, textDecoration:'none', padding:'3px 9px', borderRadius:6,
              border:`1px solid ${T.border}`, background:T.white }}>
            <Icon name="download" size={11} color={T.textSecond} /> Download
          </a>
        </div>
      </div>

      {/* Canvas area */}
      <div style={{ flex:1, overflowY:'auto', overflowX:'auto',
        background:'#525659', display:'flex', justifyContent:'center',
        alignItems:loading?'center':'flex-start', padding:16, minHeight:0 }}>
        {loading && !error && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, border:`3px solid rgba(255,255,255,0.2)`,
              borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>Loading PDF…</span>
          </div>
        )}
        {error && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10,
            background:'rgba(220,38,38,0.1)', borderRadius:10, padding:'24px 32px' }}>
            <Icon name="alert" size={24} color='#fca5a5' />
            <span style={{ fontSize:13, color:'#fca5a5', textAlign:'center' }}>{error}</span>
            <a href={url} target="_blank" rel="noreferrer"
              style={{ fontSize:12, color:'#93c5fd', fontWeight:600 }}>
              Open in new tab instead →
            </a>
          </div>
        )}
        {!error && (
          <canvas ref={canvasRef}
            style={{ display:loading?'none':'block', boxShadow:'0 4px 24px rgba(0,0,0,0.4)',
              borderRadius:2, maxWidth:'100%' }} />
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   IMAGE VIEWER COMPONENT
   Full lightbox with zoom and pan.
───────────────────────────────────────────────────────────── */
const ImageViewer = ({ url, fileName }) => {
  const [scale, setScale] = useState(1)
  const [loaded, setLoaded] = useState(false)

  const SCALE_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3]
  const si = SCALE_STEPS.findIndex(s => s >= scale)
  const zoomIn  = () => { const i = SCALE_STEPS.indexOf(scale); setScale(SCALE_STEPS[Math.min(SCALE_STEPS.length-1, i<0?3:i+1)]) }
  const zoomOut = () => { const i = SCALE_STEPS.indexOf(scale); setScale(SCALE_STEPS[Math.max(0, i<0?3:i-1)]) }
  const reset   = () => setScale(1)

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px',
        borderBottom:`1px solid ${T.border}`, background:T.slateLight, flexShrink:0, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <button onClick={zoomOut}
            style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:6,
              padding:'3px 7px', cursor:'pointer', display:'flex' }}>
            <Icon name="zoomOut" size={13} color={T.textSecond} />
          </button>
          <button onClick={reset}
            style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:6,
              padding:'3px 9px', cursor:'pointer', fontSize:11, fontWeight:700, color:T.textSecond }}>
            {Math.round(scale*100)}%
          </button>
          <button onClick={zoomIn}
            style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:6,
              padding:'3px 7px', cursor:'pointer', display:'flex' }}>
            <Icon name="zoomIn" size={13} color={T.textSecond} />
          </button>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          <a href={url} target="_blank" rel="noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600,
              color:T.blue, textDecoration:'none', padding:'3px 9px', borderRadius:6,
              border:`1px solid ${T.blueMid}`, background:T.blueLight }}>
            <Icon name="externalLink" size={11} color={T.blue} /> Open tab
          </a>
          <a href={url} download={fileName}
            style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600,
              color:T.textSecond, textDecoration:'none', padding:'3px 9px', borderRadius:6,
              border:`1px solid ${T.border}`, background:T.white }}>
            <Icon name="download" size={11} color={T.textSecond} /> Download
          </a>
        </div>
      </div>
      {/* Image area */}
      <div style={{ flex:1, overflow:'auto', background:'#1a1a2e', display:'flex',
        justifyContent:'center', alignItems:'center', padding:20, minHeight:0 }}>
        {!loaded && (
          <div style={{ position:'absolute', display:'flex', flexDirection:'column', gap:8, alignItems:'center' }}>
            <div style={{ width:28, height:28, border:'2.5px solid rgba(255,255,255,0.15)',
              borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
          </div>
        )}
        <img src={url} alt={fileName}
          onLoad={() => setLoaded(true)}
          style={{ maxWidth:'none', width:`${scale*100}%`, maxHeight:'none',
            transition:'width 0.15s', boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
            borderRadius:4, display:loaded?'block':'none', cursor:'zoom-in' }}
          onClick={zoomIn}
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   DOCUMENT VIEWER MODAL
   Wraps PDF or Image viewer in a large modal.
───────────────────────────────────────────────────────────── */
const DocumentViewerModal = ({ doc, onClose }) => {
  if (!doc) return null
  // Use viewUrl if available (fl_attachment:false), else fall back to url
  const url = doc.viewUrl || doc.url
  const isPdf = doc.fileType === 'pdf'

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1100,
      background:'rgba(10,14,30,0.88)', backdropFilter:'blur(6px)',
      display:'flex', flexDirection:'column',
      animation:'modalIn 0.18s ease',
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px',
        background:T.navy, borderBottom:`1px solid ${T.navyLight}`, flexShrink:0 }}>
        <span style={{ display:'inline-flex', alignItems:'center', gap:5,
          padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
          background: isPdf ? '#fee2e2' : T.blueLight,
          color:      isPdf ? T.danger  : T.blue }}>
          {isPdf ? 'PDF' : 'IMG'}
        </span>
        <span style={{ fontSize:14, fontWeight:700, color:T.white, flex:1,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {doc.label}
        </span>
        {doc.originalName && doc.originalName !== doc.label && (
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:200 }}>
            {doc.originalName}
          </span>
        )}
        <button onClick={onClose}
          style={{ background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer',
            padding:'5px 7px', borderRadius:6, display:'flex', color:'rgba(255,255,255,0.7)',
            marginLeft:8, transition:'background 0.12s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}>
          <Icon name="close" size={16} color='rgba(255,255,255,0.8)' />
        </button>
      </div>
      {/* Viewer */}
      <div style={{ flex:1, minHeight:0 }}>
        {isPdf
          ? <PdfViewer url={url} fileName={doc.originalName || doc.label} />
          : <ImageViewer url={url} fileName={doc.originalName || doc.label} />
        }
      </div>
    </div>
  )
}

/* ─── Badges ─────────────────────────────────────────────────── */
const CatBadge = ({ catKey }) => {
  const c = CAT_MAP[catKey] || CAT_MAP.other
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4,
      padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:600,
      background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}
const FileBadge = ({ fileType }) => (
  <span style={{ display:'inline-flex', alignItems:'center',
    padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:700,
    background: fileType==='pdf' ? '#fee2e2' : T.blueLight,
    color:      fileType==='pdf' ? T.danger  : T.blue,
    border:     `1px solid ${fileType==='pdf' ? T.dangerBorder : T.blueMid}`,
    textTransform:'uppercase', letterSpacing:'0.05em' }}>
    {fileType==='pdf' ? 'PDF' : 'IMG'}
  </span>
)

/* ─── Drop Zone ──────────────────────────────────────────────── */
const DropZone = ({ file, onFile, disabled }) => {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const ALLOWED = ['application/pdf','image/jpeg','image/jpg','image/png','image/webp']
  const handle = useCallback(f => {
    if (!f || !ALLOWED.includes(f.type) || f.size > 10*1024*1024) return
    onFile(f)
  }, [onFile])
  const preview = file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]) }}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{ border:`2px dashed ${dragging ? T.blue : file ? T.success : T.border}`,
        borderRadius:10, padding:'20px 16px',
        background: dragging ? T.blueLight : file ? T.successLight : T.slateLight,
        cursor: disabled ? 'default' : 'pointer', textAlign:'center',
        transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={e => handle(e.target.files[0])}
        style={{ display:'none' }} disabled={disabled} />
      {file ? (
        <>
          {preview
            ? <img src={preview} alt="preview" style={{ width:64, height:64, objectFit:'cover',
                borderRadius:6, border:`1px solid ${T.border}` }} />
            : <div style={{ width:48, height:48, borderRadius:8, background:'#fee2e2',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="file" size={22} color={T.danger} />
              </div>
          }
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.textPrimary }}>{file.name}</div>
            <div style={{ fontSize:11, color:T.textMuted }}>{fmtSize(file.size)}</div>
          </div>
          {!disabled && <span style={{ fontSize:11, color:T.blue, fontWeight:600 }}>Click to change</span>}
        </>
      ) : (
        <>
          <div style={{ width:40, height:40, borderRadius:8, background:T.blueMid,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="upload" size={18} color={T.blue} />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:T.textPrimary }}>
              Drop file here or <span style={{ color:T.blue }}>browse</span>
            </div>
            <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>PDF, JPG, PNG, WEBP · Max 10 MB</div>
          </div>
        </>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   TABLE styles
───────────────────────────────────────────────────────────── */
const th = {
  padding:'10px 14px', fontSize:11, fontWeight:700, color:T.slate,
  textTransform:'uppercase', letterSpacing:'0.06em',
  background:T.slateLight, borderBottom:`1px solid ${T.border}`,
  whiteSpace:'nowrap', textAlign:'left',
}
const tdStyle = (muted) => ({
  padding:'11px 14px', fontSize:13,
  color: muted ? T.textMuted : T.textPrimary,
  borderBottom:`1px solid ${T.border}`, verticalAlign:'middle',
})

/* ─────────────────────────────────────────────────────────────
   DOCUMENTS TAB  — main export
───────────────────────────────────────────────────────────── */
const DocumentsTab = ({ vehicleId }) => {
  const [docs,      setDocs]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [filter,    setFilter]    = useState('all')
  const [modal,     setModal]     = useState(false)
  const [delId,     setDelId]     = useState(null)
  const [viewDoc,   setViewDoc]   = useState(null)  // ← viewer state

  // upload form
  const [file,      setFile]      = useState(null)
  const [category,  setCategory]  = useState('')
  const [label,     setLabel]     = useState('')
  const [progress,  setProgress]  = useState(0)
  const [saving,    setSaving]    = useState(false)
  const [formErr,   setFormErr]   = useState('')

  const load = async () => {
    try { setLoading(true); setError(''); setDocs(await getDocuments(vehicleId)) }
    catch { setError('Failed to load documents.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [vehicleId])

  // Close viewer on Escape
  useEffect(() => {
    if (!viewDoc) return
    const h = e => { if (e.key === 'Escape') setViewDoc(null) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [viewDoc])

  const resetForm = () => { setFile(null); setCategory(''); setLabel(''); setProgress(0); setFormErr('') }
  const openModal  = () => { resetForm(); setModal(true) }
  const closeModal = () => { if (!saving) { setModal(false); resetForm() } }

  const handleFile = f => {
    const ALLOWED = ['application/pdf','image/jpeg','image/jpg','image/png','image/webp']
    if (!ALLOWED.includes(f.type)) { setFormErr('Only PDF, JPG, PNG, WEBP allowed.'); return }
    if (f.size > 10*1024*1024) { setFormErr('File must be under 10 MB.'); return }
    setFormErr(''); setFile(f)
    if (!label) setLabel(f.name.replace(/\.[^.]+$/, ''))
  }

  const handleUpload = async () => {
    if (!file)         { setFormErr('Please select a file.'); return }
    if (!category)     { setFormErr('Please select a category.'); return }
    if (!label.trim()) { setFormErr('Please enter a label.'); return }
    try {
      setSaving(true); setFormErr('')
      const doc = await uploadDocument(vehicleId, file, category, label.trim(), setProgress)
      setDocs(prev => [doc, ...prev])
      setModal(false); resetForm()
    } catch (e) {
      setFormErr(e.message || 'Upload failed. Please try again.')
    } finally { setSaving(false); setProgress(0) }
  }

  const handleDelete = async id => {
    try { await deleteDocument(id); setDocs(prev => prev.filter(d => d.id !== id)) }
    catch { setError('Failed to delete document.') }
    finally { setDelId(null) }
  }

  const filtered = filter === 'all' ? docs : docs.filter(d => d.category === filter)
  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.key] = docs.filter(d => d.category === c.key).length; return acc
  }, {})

  return (
    <div style={{ fontFamily:"'Geist','DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.97) translateY(6px) } to { opacity:1; transform:none } }
        input:focus, select:focus { border-color:#2563eb !important; box-shadow:0 0 0 3px rgba(37,99,235,0.1) }
      `}</style>

      {/* ── Inline Document Viewer (full-screen overlay) ── */}
      {viewDoc && <DocumentViewerModal doc={viewDoc} onClose={() => setViewDoc(null)} />}

      {/* ── Upload Modal ── */}
      <Modal visible={modal} onClose={closeModal} title="Upload Document"
        footer={<>
          <Btn variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Btn>
          <Btn onClick={handleUpload} disabled={saving||!file||!category||!label.trim()}>
            {saving
              ? <><div style={{ width:12, height:12, border:'2px solid rgba(255,255,255,0.4)',
                  borderTopColor:T.white, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Uploading…</>
              : <><Icon name="upload" size={13} color={T.white} /> Upload</>
            }
          </Btn>
        </>}>
        <div style={{ display:'flex', flexDirection:'column', gap:16, padding:'22px 20px 8px' }}>
          {formErr && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px',
              background:T.dangerLight, border:`1px solid ${T.dangerBorder}`, borderRadius:7 }}>
              <Icon name="alert" size={13} color={T.danger} />
              <span style={{ fontSize:12, color:T.danger }}>{formErr}</span>
            </div>
          )}
          <Field label="File" required hint="PDF, JPG, PNG, WEBP · Max 10 MB">
            <DropZone file={file} onFile={handleFile} disabled={saving} />
          </Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Field label="Category" required>
              <select value={category} onChange={e => setCategory(e.target.value)} disabled={saving}
                style={{ ...inputStyle, cursor:'pointer', appearance:'none',
                  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center',
                  color: category ? T.textPrimary : T.textMuted }}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Label / Description" required>
              <input type="text" value={label} onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Insurance 2025" disabled={saving} maxLength={255}
                style={inputStyle} />
            </Field>
          </div>
          {saving && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between',
                marginBottom:5, fontSize:11, color:T.textMuted }}>
                <span style={{ fontWeight:600, color:T.blue }}>Uploading to Cloudinary…</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height:5, background:T.blueMid, borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', background:T.blue, borderRadius:99,
                  width:`${progress}%`, transition:'width 0.2s ease' }} />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Error banner ── */}
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

      {/* ── Toolbar ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Icon name="permit" size={14} color={T.textMuted} />
          <span style={{ fontSize:13, color:T.textMuted }}>
            <strong style={{ color:T.textPrimary }}>{docs.length}</strong>
            {' '}document{docs.length !== 1 ? 's' : ''} stored
          </span>
        </div>
        <Btn onClick={openModal}>
          <Icon name="plus" size={13} color={T.white} /> Add record
        </Btn>
      </div>

      {/* ── Category filter pills ── */}
      {docs.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
          <button onClick={() => setFilter('all')}
            style={{ display:'inline-flex', alignItems:'center', gap:4,
              padding:'4px 12px', borderRadius:99, fontSize:12,
              fontWeight: filter==='all' ? 700 : 500,
              background: filter==='all' ? T.navy : T.white,
              color:      filter==='all' ? T.white : T.textSecond,
              border:`1px solid ${filter==='all' ? T.navy : T.border}`,
              cursor:'pointer', transition:'all 0.12s' }}>
            All
            <span style={{ fontSize:10, fontWeight:700, padding:'1px 5px', borderRadius:99,
              background: filter==='all' ? 'rgba(255,255,255,0.2)' : T.slateLight,
              color:      filter==='all' ? T.white : T.textMuted }}>
              {docs.length}
            </span>
          </button>
          {CATEGORIES.filter(c => counts[c.key] > 0).map(c => {
            const active = filter === c.key
            return (
              <button key={c.key} onClick={() => setFilter(c.key)}
                style={{ display:'inline-flex', alignItems:'center', gap:4,
                  padding:'4px 12px', borderRadius:99, fontSize:12,
                  fontWeight: active ? 700 : 500,
                  background: active ? c.bg    : T.white,
                  color:      active ? c.color : T.textSecond,
                  border:`1px solid ${active ? c.border : T.border}`,
                  cursor:'pointer', transition:'all 0.12s' }}>
                {c.label}
                <span style={{ fontSize:10, fontWeight:700, padding:'1px 5px', borderRadius:99,
                  background: active ? c.color+'22' : T.slateLight,
                  color:      active ? c.color       : T.textMuted }}>
                  {counts[c.key]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Loading spinner ── */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
          <div style={{ width:28, height:28, border:`2.5px solid ${T.border}`,
            borderTopColor:T.blue, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
        </div>
      ) : (
        <div style={{ border:`1px solid ${T.border}`, borderRadius:10, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Date</th>
                  <th style={th}>Category</th>
                  <th style={th}>Label / Description</th>
                  <th style={th}>Type</th>
                  <th style={th}>Size</th>
                  <th style={{ ...th, textAlign:'center', width:110 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding:'40px 20px', textAlign:'center' }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                        <Icon name="folder" size={28} color={T.border} />
                        <span style={{ fontSize:13, color:T.textMuted }}>
                          {filter==='all' ? 'No documents uploaded yet' : `No ${CAT_MAP[filter]?.label||''} documents`}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((doc, i) => (
                  <tr key={doc.id}
                    style={{ background: i%2===0 ? T.white : T.slateLight+'80' }}
                    onMouseEnter={e => e.currentTarget.style.background=T.blueLight}
                    onMouseLeave={e => e.currentTarget.style.background=i%2===0?T.white:T.slateLight+'80'}>
                    <td style={tdStyle(true)}>{fmtDate(doc.uploadedAt)}</td>
                    <td style={tdStyle()}><CatBadge catKey={doc.category} /></td>
                    <td style={tdStyle()}>
                      <span style={{ fontWeight:600 }}>{doc.label}</span>
                      {doc.originalName && doc.originalName !== doc.label && (
                        <div style={{ fontSize:11, color:T.textMuted, marginTop:1 }}>{doc.originalName}</div>
                      )}
                    </td>
                    <td style={tdStyle()}><FileBadge fileType={doc.fileType} /></td>
                    <td style={tdStyle(true)}>{fmtSize(doc.fileSize)||'—'}</td>
                    <td style={{ ...tdStyle(), textAlign:'center' }}>
                      {delId === doc.id ? (
                        <span style={{ display:'flex', gap:5, justifyContent:'center' }}>
                          <Btn size="sm" variant="dangerSolid" onClick={() => handleDelete(doc.id)}>Yes</Btn>
                          <Btn size="sm" variant="secondary"   onClick={() => setDelId(null)}>No</Btn>
                        </span>
                      ) : (
                        <span style={{ display:'flex', gap:4, justifyContent:'center', alignItems:'center' }}>
                          {/* ── View button → opens inline viewer ── */}
                          <button
                            onClick={() => setViewDoc(doc)}
                            title="View inline"
                            style={{ background:'none', border:'none', cursor:'pointer',
                              padding:'4px 6px', borderRadius:6, color:T.blue,
                              transition:'background 0.1s', display:'flex' }}
                            onMouseEnter={e => e.currentTarget.style.background=T.blueLight}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                            <Icon name="eye" size={14} color={T.blue} />
                          </button>
                          {/* ── Download ── */}
                          <a href={doc.viewUrl || doc.url} download={doc.originalName} title="Download"
                            style={{ display:'flex', padding:'4px 6px', borderRadius:6,
                              color:T.textSecond, textDecoration:'none', transition:'background 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.background=T.slateLight}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                            <Icon name="download" size={14} color={T.textSecond} />
                          </a>
                          {/* ── Delete ── */}
                          <button onClick={() => setDelId(doc.id)} title="Delete"
                            style={{ background:'none', border:'none', cursor:'pointer',
                              padding:'4px 6px', borderRadius:6, color:T.textMuted,
                              transition:'color 0.12s', display:'flex' }}
                            onMouseEnter={e => e.currentTarget.style.color=T.danger}
                            onMouseLeave={e => e.currentTarget.style.color=T.textMuted}>
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
      )}
    </div>
  )
}

export default DocumentsTab