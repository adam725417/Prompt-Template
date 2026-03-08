import { useState, useEffect, useCallback } from 'react'
import { sanitizePrompts } from '../utils/promptHelpers'

const FAVORITES_KEY = 'pl_favorites'
const RECENT_KEY = 'pl_recent'
const MAX_RECENT = 10

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function usePrompts() {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Favorites: Set of IDs
  const [favorites, setFavorites] = useState(() => new Set(loadFromStorage(FAVORITES_KEY, [])))

  // Recent copies: array of { id, title, timestamp }
  const [recentCopies, setRecentCopies] = useState(() => loadFromStorage(RECENT_KEY, []))

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL.endsWith('/') 
      ? import.meta.env.BASE_URL 
      : import.meta.env.BASE_URL + '/'
    const url = `${baseUrl}data/prompts.json`
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        setPrompts(sanitizePrompts(data))
        setLoading(false)
      })
      .catch(err => {
        console.error('[PromptLibrary] Failed to load prompts.json:', err)
        setError('無法載入 Prompt 資料，請確認 public/data/prompts.json 存在。')
        setLoading(false)
      })
  }, [])

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveToStorage(FAVORITES_KEY, [...next])
      return next
    })
  }, [])

  const addRecentCopy = useCallback((prompt) => {
    setRecentCopies(prev => {
      const filtered = prev.filter(r => r.id !== prompt.id)
      const next = [{ id: prompt.id, title: prompt.title, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT)
      saveToStorage(RECENT_KEY, next)
      return next
    })
  }, [])

  const clearRecentCopies = useCallback(() => {
    setRecentCopies([])
    saveToStorage(RECENT_KEY, [])
  }, [])

  return {
    prompts,
    loading,
    error,
    favorites,
    toggleFavorite,
    recentCopies,
    addRecentCopy,
    clearRecentCopies,
  }
}
