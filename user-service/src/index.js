require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')    

const userRoutes = require('./routes/users')

const app = express()
const PORT = process.env.PORT || 3001
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collaboration'

// Middleware
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'user-service',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.use('/users', userRoutes)

// Connect to MongoDB then start server
const connectWithRetry = () => {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected')
      app.listen(PORT, () => {
        console.log(`User Service running on port ${PORT}`)
      })
    })
    .catch(err => {
      console.error('MongoDB connection failed:', err.message)
      console.log('Retrying in 5 seconds...')
      setTimeout(connectWithRetry, 5000)
    })
}

connectWithRetry()