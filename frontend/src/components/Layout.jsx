import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout({ user, onLogout, children, notifCount }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/chat',          label: '💬 Chat'             },
    { path: '/users',         label: '👥 Users'            },
    { path: '/notifications', label: '🔔 Notifications'    },
    { path: '/health',        label: '⚙️ Service Health'   },
  ]

  return (
    <div className={styles.layout}>

      {/* Sidebar */}
      <aside className={styles.sidebar}>

        <div className={styles.logo}>
          💬 CollabPlatform
        </div>

        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {(user?.displayName || user?.username || '?')[0].toUpperCase()}
          </div>
          <div>
            <div className={styles.username}>
              {user?.displayName || user?.username}
            </div>
            <div className={styles.email}>
              {user?.email}
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.path}
              className={
                location.pathname === item.path
                  ? `${styles.navBtn} ${styles.active}`
                  : styles.navBtn
              }
              onClick={() => navigate(item.path)}
            >
              {item.label}
              {item.path === '/notifications' && notifCount > 0 && (
                <span className={styles.badge}>{notifCount}</span>
              )}
            </button>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={onLogout}>
          Logout
        </button>

      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>

    </div>
  )
}