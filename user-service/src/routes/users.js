const bcrypt = require('bcryptjs')
const express = require('express')
const router = express.Router()
const User = require('../models/User')

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json({ success: true, users })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST register user
router.post('/', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body
    const user = await User.create({ username, email, password, displayName })
    const userResponse = user.toObject()
    delete userResponse.password
    res.status(201).json({ success: true, user: userResponse })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// POST login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' })
    const userResponse = user.toObject()
    delete userResponse.password
    res.json({ success: true, user: userResponse })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})  

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { username, displayName } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, displayName },
      { new: true }
    )
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router