import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ── User API ──────────────────────────────────────
export const registerUser = (data) => 
  api.post('/users', data)

export const loginUser = (data) => 
  api.post('/users/login', data)

export const getAllUsers = () => 
  api.get('/users')

export const getUserById = (id) => 
  api.get(`/users/${id}`)

// ── Message API ───────────────────────────────────
export const sendMessage = (data) => 
  api.post('/messages', data)

export const getAllMessages = () => 
  api.get('/messages')

export const deleteMessage = (id) => 
  api.delete(`/messages/${id}`)

export const markMessageRead = (id) => 
  api.patch(`/messages/${id}/read`)

// ── Notification API ──────────────────────────────
export const getAllNotifications = () => 
  api.get('/notifications')

export const markNotificationRead = (id) => 
  api.patch(`/notifications/${id}/read`)

// ── Health API ────────────────────────────────────
export const checkHealth = () => 
  api.get('/health', { baseURL: 'http://localhost:3000' })

export default api