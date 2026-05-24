import { useState, useEffect } from 'react'
import styles from './HealthPage.module.css'

const SERVICES = [
  { name: 'API Gateway',         url: 'http://localhost:3000/health' },
  { name: 'User Service',        url: 'http://localhost:3001/health' },
  { name: 'Messaging Service',   url: 'http://localhost:3002/health' },
  { name: 'Notification Service',url: 'http://localhost:3003/health' },
]

export default function HealthPage() {
  const [statuses, setStatuses] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [lastChecked, setLastChecked] = useState(null)

  const checkHealth = async () => {
    setLoading(true)
    const results = await Promise.allSettled(
      SERVICES.map(async (service) => {
        const start = Date.now()
        const res = await fetch(service.url, {
          signal: AbortSignal.timeout(3000)
        })
        const data = await res.json()
        return {
          ...service,
          status:      'online',
          db:          data.db || null,
          responseTime: Date.now() - start,
          timestamp:   data.timestamp
        }
      })
    )

    setStatuses(
      results.map((result, i) =>
        result.status === 'fulfilled'
          ? result.value
          : { ...SERVICES[i], status: 'offline', db: null, responseTime: null }
      )
    )
    setLastChecked(new Date().toLocaleTimeString())
    setLoading(false)
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const onlineCount = statuses.filter(s => s.status === 'online').length

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h2>⚙️ Service Health</h2>
        <div className={styles.headerRight}>
          {lastChecked && (
            <span className={styles.lastChecked}>
              Last checked: {lastChecked}
            </span>
          )}
          <button
            className={styles.refreshBtn}
            onClick={checkHealth}
            disabled={loading}
          >
            {loading ? 'Checking...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={`${styles.summaryCard} ${onlineCount === SERVICES.length ? styles.allOnline : styles.someOffline}`}>
          <span className={styles.summaryCount}>
            {onlineCount}/{SERVICES.length}
          </span>
          <span className={styles.summaryLabel}>
            Services Online
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        {loading && statuses.length === 0 && (
          <div className={styles.loading}>Checking services...</div>
        )}
        {statuses.map(service => (
          <div
            key={service.name}
            className={`${styles.card} ${service.status === 'online' ? styles.online : styles.offline}`}
          >
            <div className={styles.cardHeader}>
              <span className={styles.serviceName}>{service.name}</span>
              <span className={`${styles.statusBadge} ${service.status === 'online' ? styles.badgeOnline : styles.badgeOffline}`}>
                {service.status === 'online' ? '● Online' : '● Offline'}
              </span>
            </div>

            <div className={styles.cardDetails}>
              {service.responseTime !== null && (
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Response</span>
                  <span className={styles.detailValue}>
                    {service.responseTime}ms
                  </span>
                </div>
              )}
              {service.db && (
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Database</span>
                  <span className={`${styles.detailValue} ${service.db === 'connected' ? styles.dbConnected : styles.dbDisconnected}`}>
                    {service.db}
                  </span>
                </div>
              )}
              {service.timestamp && (
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Last ping</span>
                  <span className={styles.detailValue}>
                    {new Date(service.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
              {service.status === 'offline' && (
                <div className={styles.offlineMsg}>
                  Service is not responding
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}