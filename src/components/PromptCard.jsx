import { useState } from 'react'
import { CategoryTag, ToolTag, DifficultyTag } from './Tag'
import { copyToClipboard } from '../utils/copyToClipboard'
import { buildPlainCopy } from '../utils/promptHelpers'
import { CATEGORY_COLORS } from '../utils/constants'

export default function PromptCard({ prompt, isFavorite, onToggleFavorite, onOpenDetail, onCopy, onTagClick }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    const text = buildPlainCopy(prompt)
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      onCopy(prompt)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  const catColor = CATEGORY_COLORS[prompt.category]?.dot || '#6366f1'

  return (
    <article
      className={`prompt-card${isFavorite ? ' favorited' : ''}`}
      style={{ '--cat-color': catColor }}
      onClick={() => onOpenDetail(prompt)}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpenDetail(prompt)}
    >
      {/* Header */}
      <div className="card-header">
        <span className="card-num">#{prompt.id}</span>
        <h2 className="card-title">{prompt.title}</h2>
        <button
          className={`card-fav-btn${isFavorite ? ' is-fav' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleFavorite(prompt.id) }}
          title={isFavorite ? '取消收藏' : '加入收藏'}
          aria-label={isFavorite ? '取消收藏' : '加入收藏'}
        >
          {isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      {/* Meta */}
      <div className="card-meta">
        <CategoryTag
          category={prompt.category}
          onClick={e => { e.stopPropagation(); onTagClick && onTagClick('category', prompt.category) }}
        />
        <DifficultyTag difficulty={prompt.difficulty || 'beginner'} />
        {prompt.recommendedTools?.map(t => <ToolTag key={t} tool={t} />)}
      </div>

      {/* Prompt preview */}
      <div className="card-prompt-preview">{prompt.prompt}</div>

      {/* Variables */}
      {prompt.variables?.length > 0 && (
        <div className="card-var-pills">
          {prompt.variables.map(v => (
            <span key={v.key} className="var-pill">[{v.key}]</span>
          ))}
        </div>
      )}

      {/* Scene tag */}
      {prompt.useCase && (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          📍 {prompt.useCase}
          {prompt.aspectRatio && <span style={{ marginLeft: 10 }}>📐 {prompt.aspectRatio}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="card-footer">
        <button
          className={`btn-copy-card${copied ? ' copied' : ''}`}
          onClick={handleCopy}
          aria-label="複製 Prompt"
        >
          {copied ? '✓ 已複製！' : '⎘ 複製 Prompt'}
        </button>
        <button
          className="btn-detail"
          onClick={e => { e.stopPropagation(); onOpenDetail(prompt) }}
          aria-label="查看詳情"
        >
          詳情 ↗
        </button>
      </div>
    </article>
  )
}
