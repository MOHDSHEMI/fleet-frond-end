import React, { useState, useEffect } from 'react'

import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCol,
  CProgress,
  CRow,
} from '@coreui/react'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import { getMonthlyTrend } from '../../services/Vehicleservice'

const fmt = (n) =>
  n != null ? `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [trend, setTrend] = useState([])
  const [trendError, setTrendError] = useState('')

  useEffect(() => {
    getMonthlyTrend(6)
      .then(setTrend)
      .catch(() => setTrendError('Failed to load trend data'))
  }, [])

  const latest = trend[trend.length - 1] || {}
  const rangeLabel = trend.length
    ? `${trend[0].label} - ${trend[trend.length - 1].label}`
    : ''

  const footerStats = latest.totalIncome != null
    ? [
        { title: 'Income', value: fmt(latest.totalIncome), percent: 100, color: 'success' },
        {
          title: 'Expense',
          value: fmt(latest.totalExpense),
          percent: latest.totalIncome ? Math.round((latest.totalExpense / latest.totalIncome) * 100) : 0,
          color: 'info',
        },
        {
          title: 'Net Profit',
          value: fmt(latest.netProfit),
          percent: latest.totalIncome ? Math.round((latest.netProfit / latest.totalIncome) * 100) : 0,
          color: latest.netProfit >= 0 ? 'warning' : 'danger',
        },
      ]
    : []

  return (
    <>
      <style>{`
        .st-dashboard {
          --cui-success: 59, 75, 124;     /* Income  – deep indigo   */
          --cui-success-rgb: 59, 75, 124;
          --cui-info: 74, 124, 130;       /* Expense – slate teal    */
          --cui-info-rgb: 74, 124, 130;
          --cui-warning: 201, 151, 63;    /* Profit+ – warm gold     */
          --cui-warning-rgb: 201, 151, 63;
          --cui-danger: 181, 84, 74;      /* Profit- – muted brick   */
          --cui-danger-rgb: 181, 84, 74;
        }
        .st-dashboard .card { border: none; }

        @media (max-width: 575.98px) {
          .st-dashboard .card-body { padding: 0.9rem; }
          .st-dashboard .card-footer { padding: 0.9rem; }
          .st-dashboard input[type="month"] { max-width: 100% !important; width: 100%; }
        }
      `}</style>

      <div className="st-dashboard">
        <div className="d-flex justify-content-end mb-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-control form-control-sm"
            style={{ maxWidth: 160 }}
          />
        </div>

        <WidgetsDropdown month={selectedMonth} className="mb-4" />

        <CCard className="mb-4">
          <CCardBody>
            <CRow>
              <CCol sm={5}>
                <h4 id="traffic" className="card-title mb-0">
                  Income &amp; Expense
                </h4>
                <div className="small text-body-secondary">{rangeLabel}</div>
              </CCol>
              <CCol sm={7} className="d-none d-md-block">
                <CButtonGroup className="float-end me-3">
                  <CButton color="outline-secondary" className="mx-0" active>
                    Month
                  </CButton>
                </CButtonGroup>
              </CCol>
            </CRow>

            {trendError ? (
              <div className="text-danger small">{trendError}</div>
            ) : (
              <MainChart data={trend} />
            )}
          </CCardBody>

          {footerStats.length > 0 && (
            <CCardFooter>
              <CRow
                xs={{ cols: 1, gutter: 4 }}
                sm={{ cols: 2 }}
                lg={{ cols: 3 }}
                className="mb-2 text-center"
              >
                {footerStats.map((item, index) => (
                  <CCol key={index}>
                    <div className="text-body-secondary">{item.title}</div>
                    <div className="fw-semibold text-truncate">
                      {item.value} ({item.percent}%)
                    </div>
                    <CProgress
                      thin
                      className="mt-2"
                      color={item.color}
                      value={Math.min(Math.abs(item.percent), 100)}
                    />
                  </CCol>
                ))}
              </CRow>
            </CCardFooter>
          )}
        </CCard>
      </div>
    </>
  )
}

export default Dashboard