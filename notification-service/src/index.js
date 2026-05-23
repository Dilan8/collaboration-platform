require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
const PORT = process.env.PORT || 3003

// Middleware
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// In memory notification store
let notifications = []
let nextId = 1

// SSE clients registry
const sseClients = new Map()

// Helper function to broadcast to all SSE clients
function broadcastToClients(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`
  for (const [, res] of sseClients) {
    try {
      res.write(payload)
    } catch (err) {
      console.error('Error broadcasting to client:', err.message)
    }
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'notification-service',
    notificationCount: notifications.length,
    sseClients: sseClients.size,
    timestamp: new Date().toISOString()
  })
})

// GET all notifications
app.get('/notifications', (req, res) => {
  res.json({
    success: true,
    count: notifications.length,
    notifications
  })
})

// POST create notification
// Called by Messaging Service when a new message is sent
app.post('/notifications', (req, res) => {
  const { type, messageId, senderId, senderName, receiverId, preview } = req.body

  if (!type) return res.status(400).json({ success: false, error: 'type is required' })

  const notification = {
    id: nextId++,
    type,
    messageId,
    senderId,
    senderName,
    receiverId: receiverId || 'broadcast',
    preview,
    read: false,
    createdAt: new Date().toISOString()
  }

  notifications.push(notification)

  // Keep only last 500 notifications in memory
  if (notifications.length > 500) {
    notifications = notifications.slice(-500)
  }

  console.log(`New notification #${notification.id} from ${senderName}`)

  // Broadcast to all connected SSE clients
  broadcastToClients({ event: 'notification', data: notification })

  res.status(201).json({ success: true, notification })
})

// PATCH mark notification as read
app.patch('/notifications/:id/read', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const notification = notifications.find(n => n.id === id)
  if (!notification) return res.status(404).json({ success: false, error: 'Notification not found' })
  notification.read = true
  res.json({ success: true, notification })
})

// GET SSE stream — real time connection to browser
app.get('/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const clientId = Date.now().toString()
  sseClients.set(clientId, res)

  // Send welcome event to confirm connection
  res.write(`data: ${JSON.stringify({ event: 'connected', clientId })}\n\n`)

  console.log(`SSE client connected: ${clientId} — total clients: ${sseClients.size}`)

  req.on('close', () => {
    sseClients.delete(clientId)
    console.log(`SSE client disconnected: ${clientId} — total clients: ${sseClients.size}`)
  })
})

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`)
})