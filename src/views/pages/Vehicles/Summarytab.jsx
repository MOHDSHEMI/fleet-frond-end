import React from 'react'

const T = {
  navy:'#0f1629', blue:'#2563eb', blueLight:'#eff6ff', blueMid:'#bfdbfe',
  border:'#e2e8f0', white:'#ffffff', slateLight:'#f8fafc', slate:'#64748b',
  textPrimary:'#0f172a', textSecond:'#475569', textMuted:'#94a3b8',
  danger:'#dc2626', dangerLight:'#fef2f2', dangerBorder:'#fecaca',
  success:'#16a34a', successLight:'#f0fdf4', successMid:'#bbf7d0',
  warn:'#ea580c', warnLight:'#fff7ed', warnBorder:'#fed7aa',
}

const fmt = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

const Icon = ({ name, size = 15, color = 'currentColor' }) => {
  const paths = {
    alert: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
    tool:  'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    plus:  'M12 5v14M5 12h14',
    minus: 'M5 12h14',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <path d={paths[name] || paths.alert} />
    </svg>
  )
}

const AlertBand = ({ icon, bg, border, color, children }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
    background: bg, border:`1px solid ${border}`, borderRadius:8,
    marginBottom:12, fontSize:13, color }}>
    <Icon name={icon} size={15} color={color} />
    {children}
  </div>
)

const SectionLabel = ({ label }) => (
  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.07em',
    textTransform:'uppercase', color: T.slate, padding:'9px 14px',
    background: T.slateLight, borderBottom:`1px solid ${T.border}` }}>
    {label}
  </div>
)

const Badge = ({ icon, label, bg, text, border }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:4,
    padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:600,
    background: bg, color: text, border:`1px solid ${border}` }}>
    <Icon name={icon} size={10} color={text} /> {label}
  </span>
)

const Row = ({ label, value, bold, color, isBadge }) => (
  <tr>
    <td style={{ padding:'10px 14px', fontSize:13,
      color: bold ? T.textPrimary : T.textSecond,
      borderBottom:`1px solid ${T.border}`,
      fontWeight: bold ? 700 : 400 }}>
      {isBadge ? label : label}
    </td>
    <td style={{ padding:'10px 14px', fontSize:13, textAlign:'right',
      fontVariantNumeric:'tabular-nums', borderBottom:`1px solid ${T.border}`,
      color: color || (bold ? T.textPrimary : T.textSecond),
      fontWeight: bold ? 700 : 400 }}>
      {value}
    </td>
  </tr>
)

const SummaryTab = ({ summary, vehicleType }) => {
  if (!summary) return (
    <p style={{ color: T.textMuted, fontSize:13 }}>No summary available.</p>
  )

  const { tripSummary: ts, payments: pm, costs, alerts } = summary

  return (
    <div style={{ fontFamily:"'Geist','DM Sans',system-ui,sans-serif", maxWidth:560 }}>

      {alerts?.insuranceAlert && (
        <AlertBand icon="alert" bg={T.dangerLight} border={T.dangerBorder} color={T.danger}>
          {alerts.insuranceAlert}
        </AlertBand>
      )}
      {alerts?.nextMaintenance && (
        <AlertBand icon="tool" bg={T.warnLight} border={T.warnBorder} color={T.warn}>
          Next maintenance due:{' '}
          {new Date(alerts.nextMaintenance.date).toLocaleDateString('en-IN')}
          {alerts.nextMaintenance.km ? ` at ${alerts.nextMaintenance.km} KM` : ''}
        </AlertBand>
      )}

      <div style={{ border:`1px solid ${T.border}`, borderRadius:10, overflow:'hidden' }}>

        {/* ── Trip income ── */}
        <SectionLabel label="Trip income & expenses" />
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <tbody>
            <Row label="Total income" value={fmt(ts?.totalIncome)} color={T.success} bold />
            {vehicleType === 'hitachi' && <>
              <Row label="Total hours"  value={`${Number(ts?.totalHours||0).toFixed(2)} hrs`} />
              <Row label="Total bata"   value={fmt(ts?.totalBata)}   color={T.danger} />
              <Row label="Total diesel" value={fmt(ts?.totalDiesel)} color={T.danger} />
            </>}
            {vehicleType === 'lorry' && (
              <Row label="Total KM" value={`${Number(ts?.totalKm||0).toFixed(2)} km`} />
            )}
            {ts?.totalOtherExp > 0 && (
              <Row label="Other expenses" value={fmt(ts?.totalOtherExp)} color={T.danger} />
            )}
            <Row label="Gross balance" value={fmt(ts?.grossBalance)} bold
              style={{ background: T.slateLight }} />
          </tbody>
        </table>

        {/* ── Adjustments ── */}
        <SectionLabel label="Adjustments" />
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding:'10px 14px', borderBottom:`1px solid ${T.border}` }}>
                <Badge icon="plus"  label="Shifting charge"
                  bg={T.successLight} text={T.success} border={T.successMid} />
              </td>
              <td style={{ padding:'10px 14px', textAlign:'right', fontSize:13,
                color: T.success, fontWeight:600, borderBottom:`1px solid ${T.border}` }}>
                {fmt(pm?.shiftingCharge)}
              </td>
            </tr>
            <tr>
              <td style={{ padding:'10px 14px', borderBottom:`1px solid ${T.border}` }}>
                <Badge icon="minus" label="Auto charge"
                  bg={T.dangerLight} text={T.danger} border={T.dangerBorder} />
              </td>
              <td style={{ padding:'10px 14px', textAlign:'right', fontSize:13,
                color: T.danger, fontWeight:600, borderBottom:`1px solid ${T.border}` }}>
                {fmt(pm?.autoCharge)}
              </td>
            </tr>
            <tr>
              <td style={{ padding:'10px 14px', borderBottom:`1px solid ${T.border}` }}>
                <Badge icon="minus" label="Cash received"
                  bg={T.blueLight} text={T.blue} border={T.blueMid} />
              </td>
              <td style={{ padding:'10px 14px', textAlign:'right', fontSize:13,
                color: T.danger, fontWeight:600, borderBottom:`1px solid ${T.border}` }}>
                {fmt(pm?.cashReceived)}
              </td>
            </tr>
            <tr style={{ background: T.slateLight }}>
              <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700,
                color: T.textPrimary }}>Final balance</td>
              <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700,
                textAlign:'right', color: T.blue }}>{fmt(pm?.finalBalance)}</td>
            </tr>
          </tbody>
        </table>

        {/* ── Costs ── */}
        <SectionLabel label="Additional costs" />
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <tbody>
            <Row label="Fuel cost"        value={fmt(costs?.totalFuelCost)} />
            <Row label="Maintenance cost" value={fmt(costs?.totalMaintCost)} />
            <tr style={{ background: T.slateLight }}>
              <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700,
                color: T.textPrimary, borderBottom:'none' }}>Net profit</td>
              <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700,
                textAlign:'right', borderBottom:'none',
                color: costs?.netProfit >= 0 ? T.success : T.danger }}>
                {fmt(costs?.netProfit)}
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  )
}

export default SummaryTab