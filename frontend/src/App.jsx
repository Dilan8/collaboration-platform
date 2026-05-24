import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import UsersPage from './pages/UsersPage'
import NotificationsPage from './pages/NotificationsPage'
import HealthPage from './pages/HealthPage'
import Layout from './components/Layout'

const SSE_URL = import.meta.env.VITE_SSE_URL || 'http://localhost:3003/notifications/stream'

export default function App() {
  const [user,        setUser]        = useState(null)
  const [notifCount,  setNotifCount]  = useState(0)
  const [liveNotifs,  setLiveNotifs]  = useState([])
  const sseRef = useRef(null)

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setNotifCount(0)
    setLiveNotifs([])
    if (sseRef.current) {
      sseRef.current.close()
      sseRef.current = null
    }
  }

  // Connect to SSE when user logs in
  useEffect(() => {
    if (!user) return

    const source = new EventSource(SSE_URL)
    sseRef.current = source

    source.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data)

        if (payload.event === 'connected') {
          console.log('SSE connected:', payload.clientId)
        }

        if (payload.event === 'notification') {
          const notif = payload.data

          // Do not notify sender of their own message
          if (notif.senderId === user._id) return

          setLiveNotifs(prev => [notif, ...prev])
          setNotifCount(prev => prev + 1)
        }
      } catch (err) {
        console.error('SSE parse error:', err)
      }
    }

    source.onerror = () => {
      console.warn('SSE connection lost, reconnecting...')
    }

    return () => {
      source.close()
    }
  }, [user])

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Layout
        user={user}
        onLogout={handleLogout}
        notifCount={notifCount}
      >
        <Routes>
          <Route path="/"      element={<Navigate to="/chat" />} />
          <Route path="/chat"  element={<ChatPage user={user} />} />
          <Route path="/users" element={<UsersPage user={user} />} />
          <Route
            path="/notifications"
            element={
              <NotificationsPage
                user={user}
                liveNotifs={liveNotifs}
                onRead={() => setNotifCount(0)}
              />
            }
          />
          <Route path="/health" element={<HealthPage />} />
          <Route path="*"       element={<Navigate to="/chat" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}