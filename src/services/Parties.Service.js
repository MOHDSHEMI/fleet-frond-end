import api from '../services/api'

// ── Parties ───────────────────────────────────────────
// GET /parties  or  GET /parties?search=keyword
export const getParties = (search) =>
  api.get('/parties', { params: search ? { search } : {} }).then(r => r.data)

export const getParty = (id) => api.get(`/parties/${id}`).then(r => r.data)
export const createParty = (dto) => api.post('/parties', dto).then(r => r.data)
export const updateParty = (id, dto) => api.patch(`/parties/${id}`, dto).then(r => r.data)
export const deleteParty = (id) => api.delete(`/parties/${id}`).then(r => r.data)
export const restoreParty = (id) => api.patch(`/parties/${id}/restore`).then(r => r.data)