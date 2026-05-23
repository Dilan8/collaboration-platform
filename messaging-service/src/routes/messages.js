const express = require('express')
const router = express.Router()
const axios = require('axios')
const Message = require('../models/Message')

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003'

// Helper function to send notification
async function sendNotification(payload) {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, payload)
  } catch (err) {
    console.warn('Could not reach Notification Service:', err.message)
  }
}

// GET all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(50)
    res.json({ success: true, count: messages.length, messages })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET single message
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) return res.status(404).json({ success: false, error: 'Message not found' })
    res.json({ success: true, message })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST send message
router.post('/', async (req, res) => {
  try {
    const { senderId, senderName, receiverId, content, type } = req.body
    const message = await Message.create({
      senderId,
      senderName,
      receiverId,
      content,
      type
    })

    // Send notification after message is created
    await sendNotification({
      type: 'new_message',
      messageId: message._id,
      senderId,
      senderName,
      receiverId: receiverId || 'broadcast',
      preview: content.substring(0, 80)
    })

    res.status(201).json({ success: true, message })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// PATCH mark as read
router.patch('/:id/read', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    )
    if (!message) return res.status(404).json({ success: false, error: 'Message not found' })
    res.json({ success: true, message })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE message
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id)
    if (!message) return res.status(404).json({ success: false, error: 'Message not found' })
    res.json({ success: true, message: 'Message deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router