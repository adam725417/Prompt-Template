import { CATEGORY_COLORS, DIFFICULTY_LABELS } from '../utils/constants'

export function CategoryTag({ category, onClick, small }) {
  const c = CATEGORY_COLORS[category] || { bg: '#f1f3f9', border: '#dde1f0', text: '#6b7280', dot: '#9ca3af' }
  return (
    <span
      className={`tag${onClick ? ' clickable' : ''}`}
      style={{
        background: c.bg,
        borderColor: c.border,
        color: c.text,
        fontSize: small ? '11px' : undefined,
        padding: small ? '2px 8px' : undefined,
      }}
      onClick={onClick}
      title={onClick ? `篩選：${category}` : undefined}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block', flexShrink: 0 }} />
      {category}
    </span>
  )
}

export function ToolTag({ tool }) {
  return <span className="tag tag-tool">{tool}</span>
}

export function DifficultyTag({ difficulty }) {
  const d = DIFFICULTY_LABELS[difficulty] || DIFFICULTY_LABELS.beginner
  return (
    <span
      className={`tag tag-difficulty-${difficulty}`}
    >
      {d.label}
    </span>
  )
}
