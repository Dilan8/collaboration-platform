import { useState, useEffect } from 'react'
import { getAllNotifications, markNotificationRead } from '../services/api'
import styles from './NotificationsPage.module.css'

export default function NotificationsPage({ user, liveNotifs, onRead }) {
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')

  // Load existing notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getAllNotifications()
        if (res.data.success) {
          const filtered = res.data.notifications
            .filter(n => n.senderId !== user?._id)
            .reverse()
          setNotifications(filtered)
        }
      } catch (err) {
        setError('Could not load notifications')
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
    onRead()
  }, [])

  // Merge live notifications from SSE
  useEffect(() => {
    if (liveNotifs && liveNotifs.length > 0) {
      setNotifications(liveNotifs)
    }
  }, [liveNotifs])

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (err) {
      console.error('Could not mark as read')
    }
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const formatTime = (date) =>
    new Date(date).toLocaleString([], {
      month:  'short',
      day:    'numeric',
      hour:   '2-digit',
      minute: '2-digit'
    })

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h2>🔔 Notifications</h2>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>
              {unreadCount} unread
            </span>
          )}
          {notifications.length > 0 && (
            <button
              className={styles.clearBtn}
              onClick={handleClearAll}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className={styles.list}>
        {loading && (
          <div className={styles.loading}>Loading notifications...</div>
        )}
        {!loading && error && (
          <div className={styles.error}>{error}</div>
        )}
        {!loading && !error && notifications.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔔</div>
            <p>No notifications yet</p>
            <span>Send a message to see notifications here</span>
          </div>
        )}
        {notifications.map(n => (
          <div
            key={n.id}
            className={`${styles.card} ${!n.read ? styles.unread : ''}`}
            onClick={() => !n.read && handleMarkRead(n.id)}
          >
            <div className={styles.icon}>📩</div>
            <div className={styles.info}>
              <div className={styles.title}>
                New message from{' '}
                <strong>{n.senderName || 'Unknown'}</strong>
              </div>
              {n.preview && (
                <div className={styles.preview}>"{n.preview}"</div>
              )}
              <div className={styles.time}>{formatTime(n.createdAt)}</div>
            </div>
            {!n.read && (
              <div className={styles.unreadDot} />
            )}
          </div>
        ))}
      </div>

    </div>
  )
}