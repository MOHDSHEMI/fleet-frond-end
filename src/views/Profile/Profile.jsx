import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed, cilShieldAlt, cilUser, cilStar } from '@coreui/icons'
import { getProfile } from '../../services/Vehicleservice'

const roleTheme = (role) => {
  switch (role) {
    case 'admin':
      return {
        grad: 'linear-gradient(135deg,#8b5cf6 0%,#6366f1 45%,#4338ca 100%)',
        soft: '#f3f0ff', text: '#6d28d9', ring: 'rgba(139,92,246,0.35)', badge: 'Admin',
      }
    case 'user':
      return {
        grad: 'linear-gradient(135deg,#f59e0b 0%,#ea580c 100%)',
        soft: '#fff7ed', text: '#c2410c', ring: 'rgba(245,158,11,0.35)', badge: 'Manager',
      }
    default:
      return {
        grad: 'linear-gradient(135deg,#38bdf8 0%,#2563eb 55%,#1d4ed8 100%)',
        soft: '#eff6ff', text: '#1d4ed8', ring: 'rgba(37,99,235,0.32)', badge: 'User',
      }
  }
}

const Profile = () => {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getProfile()
      .then(setUser)
      .catch(() => setError('Failed to load profile'))
  }, [])

  if (error) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
        <div className="text-danger text-center">
          <div className="fw-semibold mb-1">Couldn't load profile</div>
          <div className="small text-body-secondary">{error}</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  const displayName = user.name || user.email.split('@')[0]
  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('')
  const theme = roleTheme(user.role)

  const rows = [
    { icon: cilUser, label: 'Name', value: displayName },
    { icon: cilEnvelopeClosed, label: 'Email', value: user.email },
    { icon: cilShieldAlt, label: 'Role', value: user.role, chip: true },
  ]

  return (
    <div className="d-flex justify-content-center px-3">
      <style>{`
        @keyframes profileFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ringPulse {
          0%   { box-shadow: 0 0 0 0 ${theme.ring}; }
          70%  { box-shadow: 0 0 0 14px rgba(0,0,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
        }
        .profile-card {
          max-width: 480px; width: 100%; border: none; border-radius: 22px;
          overflow: hidden; box-shadow: 0 20px 50px -12px rgba(15,23,42,0.22), 0 2px 8px rgba(15,23,42,0.06);
          animation: profileFadeUp 0.45s ease;
        }
        .profile-cover {
          height: 128px; background: ${theme.grad}; position: relative; overflow: hidden;
        }
        .profile-cover::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.16) 1.4px, transparent 1.4px);
          background-size: 16px 16px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
        }
        .profile-cover::after {
          content: ''; position: absolute; width: 220px; height: 220px; border-radius: 50%;
          background: rgba(255,255,255,0.14); top: -120px; right: -60px;
        }
        .profile-badge-pill {
          position: absolute; top: 14px; right: 16px; display: flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.22); backdrop-filter: blur(6px);
          color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
          padding: 5px 11px; border-radius: 20px; text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .profile-avatar-wrap { display: flex; justify-content: center; margin-top: -58px; position: relative; z-index: 2; }
        .profile-avatar {
          width: 112px; height: 112px; border-radius: 50%; background: ${theme.grad};
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 38px; font-weight: 700; border: 5px solid var(--cui-card-bg, #fff);
          letter-spacing: 0.5px; animation: ringPulse 2.2s ease-out 0.5s 1;
        }
        .profile-name {
          font-size: 1.5rem; font-weight: 800; letter-spacing: -0.01em;
          background: ${theme.grad}; -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .profile-row {
          display: flex; align-items: center; gap: 14px; padding: 14px 8px;
          border-radius: 12px; transition: background 0.15s ease;
        }
        .profile-row:hover { background: var(--cui-tertiary-bg, #f8fafc); }
        .profile-row + .profile-row { margin-top: 2px; }
        .profile-row-icon {
          width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: ${theme.soft}; color: ${theme.text};
        }
        .profile-role-chip {
          display: inline-flex; align-items: center; gap: 5px; padding: 4px 13px; border-radius: 20px;
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
          background: ${theme.soft}; color: ${theme.text}; margin-top: 2px;
        }
        @media (max-width: 420px) {
          .profile-card { border-radius: 16px; }
          .profile-cover { height: 104px; }
          .profile-avatar { width: 92px; height: 92px; font-size: 30px; margin-top: -46px; }
        }
      `}</style>

      <CCard className="profile-card mb-4">
        <div className="profile-cover">
          <div className="profile-badge-pill">
            <CIcon icon={cilStar} size="sm" />
            {theme.badge}
          </div>
        </div>

        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{initials || <CIcon icon={cilUser} size="xl" />}</div>
        </div>

        <CCardBody className="pt-3 pb-4 px-4">
          <div className="text-center mb-4">
            <div className="profile-name mb-1">{displayName}</div>
            <div className="text-body-secondary small">{user.email}</div>
          </div>

          <div>
            {rows.map((r, i) => (
              <div className="profile-row" key={i}>
                <div className="profile-row-icon">
                  <CIcon icon={r.icon} size="lg" />
                </div>
                <div className="flex-grow-1 text-truncate">
                  <div
                    className="text-body-secondary"
                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                  >
                    {r.label}
                  </div>
                  {r.chip ? (
                    <span className="profile-role-chip">{r.value}</span>
                  ) : (
                    <div className="fw-medium text-truncate">{r.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Profile