import { useState, useMemo, useCallback, useEffect } from 'react'
import { usePrompts } from './hooks/usePrompts'
import { filterPrompts } from './utils/promptHelpers'
import { CATEGORY_COLORS, CATEGORY_OPTIONS } from './utils/constants'
import { downloadAsJson } from './utils/copyToClipboard'

import Hero from './components/Hero'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import PromptCard from './components/PromptCard'
import PromptModal from './components/PromptModal'
import { useToast, ToastContainer } from './components/Toast'

const DEFAULT_FILTERS = { categories: [], tools: [], scenes: [], extras: [] }

export default function App() {
  const { prompts, loading, error, favorites, toggleFavorite, recentCopies, addRecentCopy, clearRecentCopies } = usePrompts()
  const { toasts, show: showToast } = useToast()

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [activeView, setActiveView] = useState('home') // 'home' | 'favs' | 'about'
  const [showFavsPanel, setShowFavsPanel] = useState(false)
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('prompt_font_size') || 'md')

  /* ── Effect to apply font size class to html ── */
  useEffect(() => {
    document.documentElement.classList.remove('fs-sm', 'fs-md', 'fs-lg')
    document.documentElement.classList.add(`fs-${fontSize}`)
    localStorage.setItem('prompt_font_size', fontSize)
  }, [fontSize])

  /* ── Derived data ── */
  const favPrompts = useMemo(
    () => prompts.filter(p => favorites.has(p.id)),
    [prompts, favorites]
  )

  const displayedPrompts = useMemo(() => {
    const base = activeView === 'favs' ? favPrompts : prompts
    return filterPrompts(base, { query, ...filters })
  }, [prompts, favPrompts, activeView, query, filters])

  const categoryCount = useMemo(
    () => new Set(prompts.map(p => p.category)).size,
    [prompts]
  )

  /* ── Handlers ── */
  const handleTagClick = useCallback((type, value) => {
    if (type === 'category') {
      setFilters(f => ({
        ...f,
        categories: f.categories.includes(value)
          ? f.categories.filter(c => c !== value)
          : [...f.categories, value]
      }))
    }
  }, [])

  const handleHeroCategoryClick = useCallback((cat) => {
    setFilters(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat]
    }))
    // Scroll to results
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleCopy = useCallback((prompt) => {
    addRecentCopy(prompt)
    showToast('已複製到剪貼簿 ✓')
  }, [addRecentCopy, showToast])

  const resetFilters = () => {
    setQuery('')
    setFilters(DEFAULT_FILTERS)
  }

  const hasActiveFilters = query || filters.categories.length || filters.tools.length || filters.scenes.length || filters.extras.length

  /* ── Active filter tags ── */
  const activeFilterLabels = [
    ...filters.categories.map(v => ({ label: v, remove: () => setFilters(f => ({ ...f, categories: f.categories.filter(c => c !== v) })) })),
    ...filters.tools.map(v => ({ label: v, remove: () => setFilters(f => ({ ...f, tools: f.tools.filter(t => t !== v) })) })),
    ...filters.scenes.map(v => ({ label: v, remove: () => setFilters(f => ({ ...f, scenes: f.scenes.filter(s => s !== v) })) })),
    ...filters.extras.map(v => ({ label: v, remove: () => setFilters(f => ({ ...f, extras: f.extras.filter(e => e !== v) })) })),
  ]

  return (
    <>
      {/* ── Site Header ── */}
      <header className="site-header">
        <div className="header-logo" onClick={() => { setActiveView('home'); resetFilters() }} style={{ cursor: 'pointer' }}>
          <div className="header-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Prompt arrow — terminal ">" */}
              <path d="M4 7.5L10.5 12L4 16.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Three text lines — the "library" */}
              <line x1="13.5" y1="9"  x2="21" y2="9"  stroke="white" strokeWidth="1.9" strokeLinecap="round"/>
              <line x1="13.5" y1="12" x2="20" y2="12" stroke="white" strokeWidth="1.9" strokeLinecap="round"/>
              <line x1="13.5" y1="15" x2="17.5" y2="15" stroke="white" strokeWidth="1.9" strokeLinecap="round"/>
              {/* Small spark dot — the "AI" element */}
              <circle cx="21" cy="15" r="1.4" fill="white" opacity="0.75"/>
            </svg>
          </div>
          <span className="header-logo-text">AI Prompt 模板庫</span>
        </div>

        <nav className="header-nav">
          <button className={`header-nav-btn${activeView === 'home' ? ' active' : ''}`} onClick={() => setActiveView('home')}>
            所有模板
          </button>
          <button className={`header-nav-btn${activeView === 'favs' ? ' active' : ''}`} onClick={() => setActiveView('favs')}>
            ⭐ 收藏 {favPrompts.length > 0 && `(${favPrompts.length})`}
          </button>
          <button className={`header-nav-btn${activeView === 'about' ? ' active' : ''}`} onClick={() => setActiveView('about')}>
            使用說明
          </button>
        </nav>

        <div className="header-actions">
          <div className="font-controls">
            <button className={`font-btn${fontSize === 'sm' ? ' active' : ''}`} onClick={() => setFontSize('sm')}>小</button>
            <button className={`font-btn${fontSize === 'md' ? ' active' : ''}`} onClick={() => setFontSize('md')}>中</button>
            <button className={`font-btn${fontSize === 'lg' ? ' active' : ''}`} onClick={() => setFontSize('lg')}>大</button>
          </div>
          {recentCopies.length > 0 && (
            <button
              className="header-icon-btn"
              title="最近複製"
              onClick={() => setShowFavsPanel(v => !v)}
            >
              🕘
              <span className="fav-badge">{recentCopies.length}</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Recent Copies Panel ── */}
      {showFavsPanel && recentCopies.length > 0 && (
        <div style={{
          position: 'fixed', top: 72, right: 24, zIndex: 150,
          background: 'var(--color-surface)',
          border: '2px solid var(--color-border)',
          borderRadius: 0,
          padding: 20,
          width: 320,
          boxShadow: 'var(--shadow-xl)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>🕘 最近複製</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={clearRecentCopies}
              >
                清除
              </button>
              <button
                style={{ fontSize: 16, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowFavsPanel(false)}
              >
                ✕
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentCopies.map(r => {
              const p = prompts.find(x => x.id === r.id)
              if (!p) return null
              return (
                <div
                  key={r.id + r.timestamp}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => { setSelectedPrompt(p); setShowFavsPanel(false) }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>
                    {new Date(r.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      {activeView === 'home' && (
        <Hero
          totalCount={prompts.length}
          categoryCount={categoryCount}
          searchQuery={query}
          onSearchChange={setQuery}
          activeCategories={filters.categories}
          onCategoryClick={handleHeroCategoryClick}
        />
      )}

      {/* ── Main Content ── */}
      {activeView !== 'about' ? (
        <main className="main-layout" id="results">
          {/* Sidebar */}
          <FilterPanel filters={filters} onChange={setFilters} />

          {/* Content */}
          <div className="main-content">
            {/* Inline search bar (sticky on scroll past hero) */}
            {activeView === 'favs' && (
              <div style={{ marginBottom: 20 }}>
                <SearchBar value={query} onChange={setQuery} placeholder="搜尋收藏的模板…" />
              </div>
            )}

            {/* Results bar */}
            <div className="results-bar">
              <div className="results-count">
                {activeView === 'favs'
                  ? <><strong>{displayedPrompts.length}</strong> 個收藏模板</>
                  : <><strong>{displayedPrompts.length}</strong> / {prompts.length} 個模板</>
                }
                {loading && <span style={{ marginLeft: 10, color: 'var(--color-text-muted)' }}>載入中…</span>}
              </div>
              {activeFilterLabels.length > 0 && (
                <div className="active-filters">
                  {activeFilterLabels.map((f, i) => (
                    <span key={i} className="active-filter-tag">
                      {f.label}
                      <button onClick={f.remove}>✕</button>
                    </span>
                  ))}
                  {activeFilterLabels.length > 1 && (
                    <button
                      style={{ fontSize: 12, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                      onClick={resetFilters}
                    >
                      清除全部
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, padding: '16px 20px', color: '#be123c', fontSize: 14, marginBottom: 20 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className="loading-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skel" style={{ height: 20, width: '40%' }} />
                    <div className="skel" style={{ height: 24, width: '80%' }} />
                    <div className="skel" style={{ height: 16, width: '60%' }} />
                    <div className="skel" style={{ height: 70 }} />
                    <div className="skel" style={{ height: 36 }} />
                  </div>
                ))}
              </div>
            )}

            {/* Prompt Grid */}
            {!loading && (
              <div className="prompt-grid">
                {displayedPrompts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <div className="empty-title">
                      {activeView === 'favs' ? '還沒有收藏的模板' : '找不到符合的模板'}
                    </div>
                    <div className="empty-desc">
                      {activeView === 'favs'
                        ? '點擊模板卡片上的 ☆ 收藏你喜歡的 Prompt'
                        : '試著換個關鍵字，或清除篩選條件'}
                    </div>
                    {hasActiveFilters && (
                      <button className="btn-reset-filters" onClick={resetFilters}>
                        清除篩選條件
                      </button>
                    )}
                  </div>
                ) : (
                  displayedPrompts.map(p => (
                    <PromptCard
                      key={p.id}
                      prompt={p}
                      isFavorite={favorites.has(p.id)}
                      onToggleFavorite={toggleFavorite}
                      onOpenDetail={setSelectedPrompt}
                      onCopy={handleCopy}
                      onTagClick={handleTagClick}
                    />
                  ))
                )}
              </div>
            )}

            {/* Export favorites */}
            {activeView === 'favs' && favPrompts.length > 0 && (
              <div style={{ marginTop: 28, textAlign: 'center' }}>
                <button
                  className="btn-secondary"
                  style={{ padding: '10px 24px' }}
                  onClick={() => downloadAsJson(favPrompts, 'my-favorites.json')}
                >
                  ↓ 匯出收藏清單 (.json)
                </button>
              </div>
            )}
          </div>
        </main>
      ) : (
        /* ── About View ── */
        <AboutSection />
      )}

      {/* ── Modal ── */}
      {selectedPrompt && (
        <PromptModal
          prompt={selectedPrompt}
          isFavorite={favorites.has(selectedPrompt.id)}
          onClose={() => setSelectedPrompt(null)}
          onToggleFavorite={toggleFavorite}
          onCopy={handleCopy}
          showToast={showToast}
        />
      )}

      <ToastContainer toasts={toasts} />
    </>
  )
}

function AboutSection() {
  return (
    <main className="about-section">
      <h2 className="about-title">關於這個模板庫</h2>
      <p className="about-lead">幫助設計師、社群小編、品牌人員快速生成高品質 AI 圖像，省掉大量摸索時間。</p>

      <div className="about-cards">
        <div className="about-card">
          <div className="about-card-icon">🔤</div>
          <div className="about-card-title">什麼是 [變數]？</div>
          <div className="about-card-text">
            Prompt 中以 <code style={{ fontFamily: 'monospace', background: '#fff3cd', padding: '1px 5px', borderRadius: 3, color: '#854d0e' }}>[中括號]</code> 標示的部分就是可替換欄位。打開詳情後可以直接輸入想要的內容，系統會自動幫你替換生成新的 Prompt。
          </div>
        </div>
        <div className="about-card">
          <div className="about-card-icon">🎲</div>
          <div className="about-card-title">為何多跑幾次結果不同？</div>
          <div className="about-card-text">
            AI 圖像生成帶有隨機性。同一個 Prompt 每次生成的結果都會有微小差異。建議多跑 3–5 次，選最滿意的版本。
          </div>
        </div>
        <div className="about-card">
          <div className="about-card-icon">🎨</div>
          <div className="about-card-title">為何仍需要後製？</div>
          <div className="about-card-text">
            AI 圖像可能在細節（手指、文字、特定 Logo）上有誤差。建議搭配 Photoshop、Canva 或 Figma 進行後製修飾，讓成品更完整。
          </div>
        </div>
        <div className="about-card">
          <div className="about-card-icon">🛠</div>
          <div className="about-card-title">一鍵複製怎麼用？</div>
          <div className="about-card-text">
            點擊「複製 Prompt」後，直接貼入 Midjourney 的對話框、ChatGPT 或任何 AI 工具即可。含說明版方便與團隊分享完整資訊。
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--color-text-primary)' }}>
        維護者指南：如何新增模板
      </h3>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
        所有模板資料都在 <code style={{ fontFamily: 'monospace', background: '#f1f3fb', padding: '2px 6px', borderRadius: 4 }}>public/data/prompts.json</code>。
        只要新增一筆 JSON 物件，網站會自動顯示，不需要修改任何程式碼。
      </p>
      <div className="dev-guide">
        <div className="dev-guide-title">📄 新增一筆模板的最小結構</div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{`{
  <code>"id"</code>: <span style="color:#86efac">"26"</span>,                    <span style="color:#475569">// 唯一 ID（字串）</span>
  <code>"title"</code>: <span style="color:#86efac">"模板名稱"</span>,
  <code>"category"</code>: <span style="color:#86efac">"商業攝影風"</span>,       <span style="color:#475569">// 七大風格之一</span>
  <code>"tags"</code>: [<span style="color:#86efac">"標籤1"</span>, <span style="color:#86efac">"標籤2"</span>],
  <code>"prompt"</code>: <span style="color:#86efac">"[變數] ... --ar 1:1 --v 7"</span>,
  <code>"variables"</code>: [
    { <code>"key"</code>: <span style="color:#86efac">"變數"</span>, <code>"example"</code>: <span style="color:#86efac">"範例值"</span> }
  ],
  <code>"useCase"</code>: <span style="color:#86efac">"電商主圖"</span>,
  <code>"recommendedTools"</code>: [<span style="color:#86efac">"Midjourney"</span>],
  <code>"aspectRatio"</code>: <span style="color:#86efac">"1:1"</span>,
  <code>"hasStyleRaw"</code>: false,
  <code>"difficulty"</code>: <span style="color:#86efac">"beginner"</span>,     <span style="color:#475569">// beginner / intermediate / advanced</span>
  <code>"notes"</code>: <span style="color:#86efac">"使用說明..."</span>
}`}</pre>
      </div>
    </main>
  )
}
