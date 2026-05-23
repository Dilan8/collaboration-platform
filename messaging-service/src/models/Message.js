const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
      trim: true
    },
    senderName: {
      type: String,
      trim: true,
      default: 'Anonymous'
    },
    receiverId: {
      type: String,
      default: null
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    type: {
      type: String,
      enum: ['text', 'system', 'notification'],
      default: 'text'
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Message', messageSchema)