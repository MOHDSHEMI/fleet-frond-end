import api from './api'

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const registerUser = async (email, password, role = 'user') => {
  const response = await api.post('/auth/register', { email, password, role })
  return response.data
}

export const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}