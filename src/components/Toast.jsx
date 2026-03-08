import { useState, useEffect, useCallback, useRef } from 'react'

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success', duration = 2400) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 220)
    }, duration)
  }, [])

  return { toasts, show }
}

export function ToastContainer({ toasts }) {
  const icons = { success: '✓', error: '✕', info: 'ℹ' }
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}${t.exiting ? ' exiting' : ''}`}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{icons[t.type] || '✓'}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
