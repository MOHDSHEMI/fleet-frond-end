import React, { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
  CCard,
  CCardBody,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilOptions } from '@coreui/icons'
import { getOverallSummary } from '../../services/Vehicleservice'
import { useNavigate } from 'react-router-dom'

const fmt = (n) =>
  n != null ? `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'

const cardChartOptions = {
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false, drawTicks: false }, ticks: { display: false } },
    y: {
      border: { display: false },
      grid: { display: false, drawBorder: false, drawTicks: false },
      ticks: { display: false },
    },
  },
}

/* ── Skeleton placeholder, sized to match CWidgetStatsA + chart ── */
const SkeletonCard = () => (
  <CCard style={{ height: 132 }}>
    <CCardBody>
      <div
        className="skeleton-shimmer"
        style={{ width: '60%', height: 14, borderRadius: 4, marginBottom: 10 }}
      />
      <div
        className="skeleton-shimmer"
        style={{ width: '40%', height: 22, borderRadius: 4, marginBottom: 16 }}
      />
      <div
        className="skeleton-shimmer"
        style={{ width: '100%', height: 40, borderRadius: 6 }}
      />
    </CCardBody>
  </CCard>
)

const WidgetsDropdown = ({ className, month }) => {
  const incomeChartRef = useRef(null)
  const expenseChartRef = useRef(null)
  const profitChartRef = useRef(null)
  const fleetChartRef = useRef(null)

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const load = useCallback(() => {
    setLoading(true)
    getOverallSummary(month)
      .then(setSummary)
      .catch(() => setError('Failed to load fleet summary'))
      .finally(() => setLoading(false))
  }, [month])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const handler = () => {
      ;[incomeChartRef, expenseChartRef, profitChartRef, fleetChartRef].forEach((ref) => {
        if (ref.current) {
          setTimeout(() => {
            ref.current.data.datasets[0].borderColor = getStyle('--cui-body-color')
            ref.current.update()
          })
        }
      })
    }
    document.documentElement.addEventListener('ColorSchemeChange', handler)
    return () => document.documentElement.removeEventListener('ColorSchemeChange', handler)
  }, [])

  /* ── Scoped palette + responsive overrides (structure unchanged) ── */
  const themeStyles = (
    <style>{`
      .st-widgets {
        --cui-primary: 59, 75, 124;      /* Income  – deep indigo */
        --cui-primary-rgb: 59, 75, 124;
        --cui-info: 74, 124, 130;        /* Expense – slate teal  */
        --cui-info-rgb: 74, 124, 130;
        --cui-warning: 201, 151, 63;     /* Profit+ – warm gold   */
        --cui-warning-rgb: 201, 151, 63;
        --cui-danger: 181, 84, 74;       /* Profit- – muted brick */
        --cui-danger-rgb: 181, 84, 74;
        --cui-dark: 46, 54, 72;          /* Fleet   – charcoal navy */
        --cui-dark-rgb: 46, 54, 72;
      }
      .st-widgets .card { border: none; }

      .skeleton-shimmer {
        background: linear-gradient(
          90deg,
          rgba(0,0,0,0.06) 25%,
          rgba(0,0,0,0.12) 37%,
          rgba(0,0,0,0.06) 63%
        );
        background-size: 400% 100%;
        animation: skeleton-shimmer 1.4s ease infinite;
      }
      @keyframes skeleton-shimmer {
        0% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      /* ── Mobile tightening ── */
      @media (max-width: 575.98px) {
        .st-widgets .card { height: auto !important; }
        .st-widgets .card-body { padding: 0.85rem; }
        .st-widgets .widget-chart-wrap { height: 52px !important; }
      }
    `}</style>
  )

  /* ── Skeleton state ── */
  if (loading) {
    return (
      <>
        {themeStyles}
        <CRow className={`st-widgets ${className || ''}`} xs={{ gutter: 3 }} md={{ gutter: 4 }}>
          {[0, 1, 2, 3].map((i) => (
            <CCol xs={12} sm={6} xl={4} xxl={3} key={i}>
              <SkeletonCard />
            </CCol>
          ))}
        </CRow>
      </>
    )
  }

  if (error) return <div className="text-danger small mb-3">{error}</div>
  if (!summary) return null

  const { totals, vehicleCount, vehicles } = summary

  const labels = vehicles.map(v => v.registrationNumber || v.name)
  const incomeData = vehicles.map(v => v.totalIncome)
  const profitData = vehicles.map(v => v.netProfit)
  // Expense isn't broken out per-vehicle by the API yet — approximated as income minus profit.
  const expenseData = vehicles.map(v => v.totalIncome - v.netProfit)

  const cardAction = (
    <CDropdown alignment="end">
      <CDropdownToggle color="transparent" caret={false} className="text-white p-0" onClick={(e) => e.stopPropagation()}>
        <CIcon icon={cilOptions} />
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem onClick={load}>Refresh</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )

  return (
    <>
      {themeStyles}
      <CRow className={`st-widgets ${className || ''}`} xs={{ gutter: 3 }} md={{ gutter: 4 }}>
        {/* ── Total Income ── */}
        <CCol xs={12} sm={6} xl={4} xxl={3}>
          <CWidgetStatsA
            color="primary"
            value={<>{fmt(totals.totalIncome)}</>}
            title="Total Income"
            action={cardAction}
            chart={
              <CChartBar
                ref={incomeChartRef}
                className="mt-3 mx-3 widget-chart-wrap"
                style={{ height: '70px' }}
                data={{
                  labels,
                  datasets: [{
                    label: 'Income',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: incomeData,
                    barPercentage: 0.6,
                  }],
                }}
                options={cardChartOptions}
              />
            }
          />
        </CCol>

        {/* ── Total Expense ── */}
        <CCol xs={12} sm={6} xl={4} xxl={3}>
          <CWidgetStatsA
            color="info"
            value={<>{fmt(totals.totalExpense)}</>}
            title="Total Expense"
            action={cardAction}
            chart={
              <CChartBar
                ref={expenseChartRef}
                className="mt-3 mx-3 widget-chart-wrap"
                style={{ height: '70px' }}
                data={{
                  labels,
                  datasets: [{
                    label: 'Expense',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: expenseData,
                    barPercentage: 0.6,
                  }],
                }}
                options={cardChartOptions}
              />
            }
          />
        </CCol>

        {/* ── Net Profit ── */}
        <CCol xs={12} sm={6} xl={4} xxl={3}>
          <CWidgetStatsA
            color={totals.netProfit >= 0 ? 'warning' : 'danger'}
            value={<>{fmt(totals.netProfit)}</>}
            title="Net Profit"
            action={cardAction}
            chart={
              <CChartBar
                ref={profitChartRef}
                className="mt-3 mx-3 widget-chart-wrap"
                style={{ height: '70px' }}
                data={{
                  labels,
                  datasets: [{
                    label: 'Profit',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: profitData,
                    barPercentage: 0.6,
                  }],
                }}
                options={cardChartOptions}
              />
            }
          />
        </CCol>

        {/* ── Fleet size + income-by-vehicle chart ── */}
        <CCol xs={12} sm={6} xl={4} xxl={3}>
          <div
            onClick={() => navigate('/vehicles')}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/vehicles') }}
          >
            <CWidgetStatsA
              color="dark"
              value={<>{vehicleCount} {vehicleCount === 1 ? 'Vehicle' : 'Vehicles'}</>}
              title="Active Fleet"
              action={cardAction}
              chart={
                <CChartBar
                  ref={fleetChartRef}
                  className="mt-3 mx-3 widget-chart-wrap"
                  style={{ height: '70px' }}
                  data={{
                    labels,
                    datasets: [{
                      label: 'Income',
                      backgroundColor: 'rgba(255,255,255,.2)',
                      borderColor: 'rgba(255,255,255,.55)',
                      data: incomeData,
                      barPercentage: 0.6,
                    }],
                  }}
                  options={cardChartOptions}
                />
              }
            />
          </div>
        </CCol>
      </CRow>
    </>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  month: PropTypes.string,
}

export default WidgetsDropdown