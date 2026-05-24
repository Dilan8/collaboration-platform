require('dotenv').config()

const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
const PORT = process.env.PORT || 3000

const USER_SERVICE_URL         = process.env.USER_SERVICE_URL         || 'http://localhost:3001'
const MESSAGING_SERVICE_URL    = process.env.MESSAGING_SERVICE_URL    || 'http://localhost:3002'
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003'

// Middleware
app.use(cors())
app.use(morgan('dev'))

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    routes: {
      users:         `${USER_SERVICE_URL}/users`,
      messages:      `${MESSAGING_SERVICE_URL}/messages`,
      notifications: `${NOTIFICATION_SERVICE_URL}/notifications`
    }
  })
})

// Proxy routes
app.use('/api/users', createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/users' }
}))

app.use('/api/messages', createProxyMiddleware({
  target: MESSAGING_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/messages': '/messages' }
}))

app.use('/api/notifications', createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '/notifications' }
}))

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err.message)
  res.status(502).json({ error: 'Service unavailable' })
})

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`)
  console.log(`  /api/users         → ${USER_SERVICE_URL}`)
  console.log(`  /api/messages      → ${MESSAGING_SERVICE_URL}`)
  console.log(`  /api/notifications → ${NOTIFICATION_SERVICE_URL}`)
})