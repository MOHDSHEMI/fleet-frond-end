import api from '../services/api'

// ── Vehicles ──────────────────────────────────────────
export const getVehicles       = ()          => api.get('/vehicles').then(r => r.data)
export const getVehicle        = (id)        => api.get(`/vehicles/${id}`).then(r => r.data)
export const createVehicle     = (dto)       => api.post('/vehicles', dto).then(r => r.data)
export const updateVehicle     = (id, dto)   => api.patch(`/vehicles/${id}`, dto).then(r => r.data)
export const deleteVehicle     = (id)        => api.delete(`/vehicles/${id}`).then(r => r.data)
export const getVehicleSummary = (id, month) => api.get(`/vehicles/${id}/summary`, { params: { month } }).then(r => r.data)

// ── Trips ─────────────────────────────────────────────
export const getTrips    = (id, month) => api.get(`/vehicles/${id}/trips`, { params: { month } }).then(r => r.data)
export const addTrip     = (id, dto)   => api.post(`/vehicles/${id}/trips`, dto).then(r => r.data)
export const updateTrip  = (tripId, dto) => api.patch(`/vehicles/trips/${tripId}`, dto).then(r => r.data)
export const deleteTrip  = (tripId)    => api.delete(`/vehicles/trips/${tripId}`).then(r => r.data)

// ── Payments ──────────────────────────────────────────
export const getPayments   = (id)         => api.get(`/vehicles/${id}/payments`).then(r => r.data)
export const addPayment    = (id, dto)    => api.post(`/vehicles/${id}/payments`, dto).then(r => r.data)
export const deletePayment = (paymentId)  => api.delete(`/vehicles/payments/${paymentId}`).then(r => r.data)

// ── Fuel logs ─────────────────────────────────────────
export const getFuelLogs   = (id)      => api.get(`/vehicles/${id}/fuel`).then(r => r.data)
export const addFuelLog    = (id, dto) => api.post(`/vehicles/${id}/fuel`, dto).then(r => r.data)
export const deleteFuelLog = (logId)   => api.delete(`/vehicles/fuel/${logId}`).then(r => r.data)

// ── Maintenance ───────────────────────────────────────
export const getMaintenance   = (id)      => api.get(`/vehicles/${id}/maintenance`).then(r => r.data)
export const addMaintenance   = (id, dto) => api.post(`/vehicles/${id}/maintenance`, dto).then(r => r.data)
export const deleteMaintenance= (recId)   => api.delete(`/vehicles/maintenance/${recId}`).then(r => r.data)

// ── Tyres ─────────────────────────────────────────────
export const getTyres     = (id)               => api.get(`/vehicles/${id}/tyres`).then(r => r.data)
export const addTyre      = (id, dto)          => api.post(`/vehicles/${id}/tyres`, dto).then(r => r.data)
export const updateTyre   = (tyreId, dto)      => api.patch(`/vehicles/tyres/${tyreId}`, dto).then(r => r.data)
export const deleteTyre   = (tyreId)           => api.delete(`/vehicles/tyres/${tyreId}`).then(r => r.data)
export const replaceTyre  = (id, tyreId, dto)  => api.post(`/vehicles/${id}/tyres/${tyreId}/replace`, dto).then(r => r.data)

// ── Documents ─────────────────────────────────────────
// GET  /vehicles/:id/documents
export const getDocuments = (id) =>
  api.get(`/vehicles/${id}/documents`).then(r => r.data)
 
// DELETE /vehicles/documents/:docId
export const deleteDocument = (docId) =>
  api.delete(`/vehicles/documents/${docId}`).then(r => r.data)
 
/**
 * Upload a document with XHR so we get upload progress.
 * Uses the base URL from the axios instance and any auth headers set on it.
 *
 * @param {string}   vehicleId
 * @param {File}     file
 * @param {string}   category   — DocumentCategory enum value
 * @param {string}   label      — human-readable label
 * @param {Function} onProgress — called with 0-100 integer
 * @returns {Promise<VehicleDocument>}
 */
export function uploadDocument(vehicleId, file, category, label, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file',     file)
    formData.append('category', category)
    formData.append('label',    label || file.name)
 
    // Grab baseURL + auth token from the existing axios instance
    const baseURL    = api.defaults.baseURL ?? ''
    const authHeader = api.defaults.headers?.common?.['Authorization'] ?? ''
 
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${baseURL}/vehicles/${vehicleId}/documents`)
 
    if (authHeader) xhr.setRequestHeader('Authorization', authHeader)
 
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })
 
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        try {
          const err = JSON.parse(xhr.responseText)
          reject(new Error(err.message || `Upload failed (${xhr.status})`))
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      }
    }
 
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(formData)
  })
}