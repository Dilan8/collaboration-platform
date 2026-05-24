import { useState, useEffect, useRef } from 'react'
import { getAllMessages, sendMessage } from '../services/api'
import { IoSend } from 'react-icons/io5'
import { BsEmojiSmile } from 'react-icons/bs'
import EmojiPicker from 'emoji-picker-react'
import styles from './ChatPage.module.css'

export default function ChatPage({ user }) {
  const [messages,     setMessages]     = useState([])
  const [content,      setContent]      = useState('')
  const [loading,      setLoading]      = useState(true)
  const [sending,      setSending]      = useState(false)
  const [error,        setError]        = useState('')
  const [showEmoji,    setShowEmoji]    = useState(false)
  const bottomRef   = useRef(null)
  const emojiRef    = useRef(null)

  const fetchMessages = async () => {
    try {
      const res = await getAllMessages()
      if (res.data.success) {
        setMessages(res.data.messages.reverse())
      }
    } catch (err) {
      setError('Could not load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEmojiClick = (emojiData) => {
    setContent(prev => prev + emojiData.emoji)
    setShowEmoji(false)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim() || !user) return
    setSending(true)
    try {
      const res = await sendMessage({
        senderId:   user._id,
        senderName: user.displayName || user.username,
        content:    content.trim()
      })
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.message])
        setContent('')
      }
    } catch (err) {
      setError('Could not send message')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour:   '2-digit',
      minute: '2-digit'
    })

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h2>💬 Global Chat</h2>
        <span className={styles.live}>● LIVE</span>
      </div>

      <div className={styles.messagesList}>
        {loading && (
          <div className={styles.loading}>Loading messages...</div>
        )}
        {!loading && messages.length === 0 && (
          <div className={styles.empty}>
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map(msg => {
          const isOwn = msg.senderId === user?._id
          return (
            <div
              key={msg._id}
              className={`${styles.bubble} ${isOwn ? styles.own : styles.other}`}
            >
              {!isOwn && (
                <div className={styles.sender}>{msg.senderName}</div>
              )}
              <div className={styles.content}>{msg.content}</div>
              <div className={styles.time}>{formatTime(msg.createdAt)}</div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.formWrapper}>
        {showEmoji && (
          <div className={styles.emojiPicker} ref={emojiRef}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              height={380}
              width={320}
            />
          </div>
        )}

        <form onSubmit={handleSend} className={styles.form}>
          <button
            type="button"
            className={styles.emojiBtn}
            onClick={() => setShowEmoji(prev => !prev)}
          >
            <BsEmojiSmile size={20} />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoComplete="off"
            required
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={sending}
          >
            <IoSend size={18} />
          </button>
        </form>
      </div>

    </div>
  )
}