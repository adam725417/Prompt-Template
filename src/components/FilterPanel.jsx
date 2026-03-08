import { useState } from 'react'
import { CATEGORY_OPTIONS, TOOL_OPTIONS, SCENE_OPTIONS } from '../utils/constants'

const EXTRAS = [
  { key: 'hasAr',       label: '含比例參數 --ar' },
  { key: 'hasStyleRaw', label: '含 --style raw' },
  { key: 'beginner',    label: '適合新手' },
]

export default function FilterPanel({ filters, onChange }) {
  const [collapsed, setCollapsed] = useState(true)

  const activeCount =
    filters.categories.length +
    filters.tools.length +
    filters.scenes.length +
    filters.extras.length

  const toggle = (group, value) => {
    const current = filters[group]
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ ...filters, [group]: next })
  }

  const reset = () => onChange({ categories: [], tools: [], scenes: [], extras: [] })

  const body = (
    <>
      <Section title="風格分類">
        {CATEGORY_OPTIONS.map(cat => (
          <Chip key={cat} label={cat} active={filters.categories.includes(cat)} onClick={() => toggle('categories', cat)} />
        ))}
      </Section>

      <div className="filter-divider" />

      <Section title="推薦工具">
        {TOOL_OPTIONS.map(tool => (
          <Chip key={tool} label={tool} active={filters.tools.includes(tool)} onClick={() => toggle('tools', tool)} />
        ))}
      </Section>

      <div className="filter-divider" />

      <Section title="使用場景">
        {SCENE_OPTIONS.map(scene => (
          <Chip key={scene} label={scene} active={filters.scenes.includes(scene)} onClick={() => toggle('scenes', scene)} />
        ))}
      </Section>

      <div className="filter-divider" />

      <Section title="額外條件">
        {EXTRAS.map(e => (
          <Chip key={e.key} label={e.label} active={filters.extras.includes(e.key)} onClick={() => toggle('extras', e.key)} />
        ))}
      </Section>
    </>
  )

  return (
    <aside className="filter-panel">
      {/* Mobile toggle */}
      <button
        className="filter-mobile-toggle"
        onClick={() => setCollapsed(c => !c)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🔧</span> 篩選條件
          {activeCount > 0 && <span className="filter-active-count">{activeCount}</span>}
        </span>
        <span style={{ fontSize: 12 }}>{collapsed ? '▼' : '▲'}</span>
      </button>

      {/* Desktop header */}
      <div className="filter-header" style={{ display: 'flex' }}>
        <span className="filter-title">🔧 篩選條件</span>
        {activeCount > 0 && (
          <button className="filter-reset" onClick={reset}>清除全部</button>
        )}
      </div>

      {/* Body — always shown on desktop, collapsible on mobile */}
      <div className={`filter-panel-body${collapsed ? ' collapsed' : ''}`}>
        {body}
      </div>
    </aside>
  )
}

function Section({ title, children }) {
  return (
    <div className="filter-section">
      <div className="filter-section-title">{title}</div>
      <div className="filter-chips">{children}</div>
    </div>
  )
}

function Chip({ label, active, onClick }) {
  return (
    <button
      className={`filter-chip${active ? ' active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
