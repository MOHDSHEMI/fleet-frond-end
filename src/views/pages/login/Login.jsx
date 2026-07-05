import React, { useState } from 'react'
import { CForm, CFormInput, CButton, CAlert, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed, cilLockLocked, cilLockUnlocked } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../../services/authService'
import logo from '../../../assets/images/sinan-logo.png'
import './Login.scss'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginUser(email, password)
      localStorage.setItem('token', data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="st-login">
      {/* Brand panel */}
      <aside className="st-login__brand">
        <div className="st-login__route" aria-hidden="true">
          <svg viewBox="0 0 400 600" preserveAspectRatio="none">
            <path
              className="st-login__route-line"
              d="M -20 520 C 80 480, 60 380, 160 340 S 260 200, 200 120 S 340 40, 420 -20"
              fill="none"
            />
            <circle className="st-login__route-dot st-login__route-dot--start" cx="-20" cy="520" r="5" />
            <circle className="st-login__route-dot st-login__route-dot--end" cx="200" cy="120" r="5" />
          </svg>
        </div>

        <div className="st-login__brand-content">
          <img src={logo} alt="Sinan Trading" className="st-login__logo" />
          <p className="st-login__tagline">
            One dashboard for everything that matters &mdash; expenses, income, documents,
            and operations, all in one place.
          </p>
          <ul className="st-login__stats" role="list">
            <li>
              <span className="st-login__stats-label">Assets</span>
              <span className="st-login__stats-value">Details &amp; Maintenance</span>
            </li>
            <li>
              <span className="st-login__stats-label">Finance</span>
              <span className="st-login__stats-value">Expense &amp; Income Summary</span>
            </li>
            <li>
              <span className="st-login__stats-label">Documents</span>
              <span className="st-login__stats-value">Renewals &amp; Records</span>
            </li>
            <li>
              <span className="st-login__stats-label">Parties</span>
              <span className="st-login__stats-value">Manage &amp; Track</span>
            </li>
          </ul>
        </div>

        <div className="st-login__brand-footer">
          &copy; {new Date().getFullYear()} Sinan Trading &mdash; Fleet Management System
        </div>
      </aside>

      {/* Form panel */}
      <main className="st-login__form-panel">
        <div className="st-login__form-card">
          <img src={logo} alt="Sinan Trading" className="st-login__logo st-login__logo--mobile" />

          <div className="st-login__heading">
            <h1>Welcome back</h1>
            <p>Sign in to manage your fleet.</p>
          </div>

          {error && (
            <CAlert color="danger" className="st-login__alert">
              {error}
            </CAlert>
          )}

          <CForm onSubmit={handleLogin} noValidate>
            <div className="st-login__field">
              <label htmlFor="loginEmail" className="st-login__label">
                Email address
              </label>
              <div className="st-login__input-wrap">
                <CIcon icon={cilEnvelopeClosed} className="st-login__input-icon" />
                <CFormInput
                  id="loginEmail"
                  type="email"
                  placeholder="you@sinantraders.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="st-login__input"
                  required
                />
              </div>
            </div>

            <div className="st-login__field">
              <div className="st-login__label-row">
                <label htmlFor="loginPassword" className="st-login__label">
                  Password
                </label>
                <CButton color="link" className="st-login__forgot" type="button">
                  Forgot password?
                </CButton>
              </div>
              <div className="st-login__input-wrap">
                <CIcon icon={cilLockLocked} className="st-login__input-icon" />
                <CFormInput
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="st-login__input st-login__input--password"
                  required
                />
                <button
                  type="button"
                  className="st-login__toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} />
                </button>
              </div>
            </div>

            <CButton type="submit" className="st-login__submit" disabled={loading}>
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Signing in&hellip;
                </>
              ) : (
                'Login'
              )}
            </CButton>
          </CForm>

          <p className="st-login__footer-note">
            Trouble signing in? Contact your system administrator.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Login