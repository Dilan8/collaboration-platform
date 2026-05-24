import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../services/api'
import styles from './LoginPage.module.css'

export default function LoginPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' })

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: ''
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginUser(loginData)
      if (res.data.success) {
        onLogin(res.data.user)
        navigate('/chat')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await registerUser(registerData)
      if (res.data.success) {
        onLogin(res.data.user)
        navigate('/chat')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles['login-screen']}>
      <div className={styles['login-card']}>

        <div className={styles['login-header']}>
          <h1>🚀 CollabPlatform</h1>
          <p>Microservices · Kubernetes · Real-Time</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={activeTab === 'login' ? `${styles.tab} ${styles.active}` : styles.tab}
            onClick={() => { setActiveTab('login'); setError('') }}
          >
            Login
          </button>
          <button
            className={activeTab === 'register' ? `${styles.tab} ${styles.active}` : styles.tab}
            onClick={() => { setActiveTab('register'); setError('') }}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <input
              type="email"
              placeholder="Email"
              required
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
            <button type="submit" className={styles['btn-primary']} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className={styles.form}>
            <input
              type="text"
              placeholder="Username"
              required
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              required
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            />
            <input
              type="text"
              placeholder="Display Name (optional)"
              value={registerData.displayName}
              onChange={(e) => setRegisterData({ ...registerData, displayName: e.target.value })}
            />
            <button type="submit" className={styles['btn-primary']} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {error && <p className={styles.error}>{error}</p>}

      </div>
    </div>
  )
}