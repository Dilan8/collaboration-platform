import { useState, useEffect } from 'react'
import { getAllUsers } from '../services/api'
import styles from './UsersPage.module.css'

export default function UsersPage({ user }) {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers()
        if (res.data.success) {
          setUsers(res.data.users)
        }
      } catch (err) {
        setError('Could not load users')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const formatDate = (date) =>
    new Date(date).toLocaleDateString([], {
      year:  'numeric',
      month: 'short',
      day:   'numeric'
    })

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h2>👥 Registered Users</h2>
        <span className={styles.count}>
          {users.length} {users.length === 1 ? 'user' : 'users'}
        </span>
      </div>

      <div className={styles.list}>
        {loading && (
          <div className={styles.loading}>Loading users...</div>
        )}
        {!loading && error && (
          <div className={styles.error}>{error}</div>
        )}
        {!loading && !error && users.length === 0 && (
          <div className={styles.empty}>No users found</div>
        )}
        {users.map(u => (
          <div
            key={u._id}
            className={`${styles.card} ${u._id === user?._id ? styles.currentUser : ''}`}
          >
            <div className={styles.avatar}>
              {(u.displayName || u.username)[0].toUpperCase()}
            </div>
            <div className={styles.info}>
              <div className={styles.name}>
                {u.displayName || u.username}
                {u._id === user?._id && (
                  <span className={styles.youBadge}>You</span>
                )}
              </div>
              <div className={styles.email}>{u.email}</div>
              <div className={styles.joined}>
                Joined {formatDate(u.createdAt)}
              </div>
            </div>
            <div className={styles.status}>
              <span className={styles.statusDot}>● Online</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}