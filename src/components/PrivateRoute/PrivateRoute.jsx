import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token')
  const location = useLocation()

  if (!token) {
    // remember where they were headed, so login can send them back after
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute