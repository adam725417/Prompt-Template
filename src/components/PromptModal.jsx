import { useState, useEffect, useRef, useCallback } from 'react'
import { CategoryTag, ToolTag, DifficultyTag } from './Tag'
import { copyToClipboard, downloadAsText } from '../utils/copyToClipboard'
import { parseVariableKeys, applyVariables, buildRichCopy } from '../utils/promptHelpers'

export default function PromptModal({ prompt, isFavorite, onClose, onToggleFavorite, onCopy, showToast }) {
  const [varValues, setVarValues] = useState({})
  const [activeVar, setActiveVar] = useState(null)
  const [copiedState, setCopiedState] = useState('') // '' | 'plain' | 'rich'
  const overlayRef = useRef(null)

  // Reset state when prompt changes
  useEffect(() => {
    setVarValues({})
    setActiveVar(null)
    setCopiedState('')
  }, [prompt?.id])

  // ESC key to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    // Prevent body scroll while modal open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!prompt) return null

  const varKeys = parseVariableKeys(prompt.prompt)
  const hasReplacements = Object.values(varValues).some(v => v && v.trim())
  const replacedPrompt = applyVariables(prompt.prompt, varValues)
  const showPreview = hasReplacements

  const handleCopyPlain = async () => {
    const ok = await copyToClipboard(replacedPrompt)
    if (ok) {
      setCopiedState('plain')
      onCopy(prompt)
      showToast('已複製純文字 Prompt ✓')
      setTimeout(() => setCopiedState(''), 2000)
    }
  }

  const handleCopyRich = async () => {
    const ok = await copyToClipboard(buildRichCopy(prompt, varValues))
    if (ok) {
      setCopiedState('rich')
      onCopy(prompt)
      showToast('已複製含說明版 Prompt ✓')
      setTimeout(() => setCopiedState(''), 2000)
    }
  }

  const handleExport = () => {
    downloadAsText(buildRichCopy(prompt, varValues), `prompt-${prompt.id}.txt`)
    showToast('已匯出 .txt 檔案')
  }

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  // Render prompt text with highlighted variables
  const renderHighlightedPrompt = (text, isPreview = false) => {
    const parts = text.split(/(\[[^\]]+\])/g)
    return parts.map((part, i) => {
      const match = part.match(/^\[([^\]]+)\]$/)
      if (!match) return <span key={i}>{part}</span>
      const key = match[1]
      const isActive = activeVar === key
      const replacement = varValues[key]
      const replaced = replacement && replacement.trim()

      if (isPreview && replaced) {
        return (
          <span key={i} className="var-highlight replaced">
            {replaced}
          </span>
        )
      }

      return (
        <span
          key={i}
          className={`var-highlight${isActive ? ' active' : ''}`}
          onClick={() => setActiveVar(activeVar === key ? null : key)}
          title={`點擊聚焦：[${key}]`}
        >
          {part}
        </span>
      )
    })
  }

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick} aria-modal="true" role="dialog">
      <div className="modal">
        {/* ── Header ── */}
        <div className="modal-header">
          <div className="modal-header-main">
            <div className="modal-num">#{prompt.id}</div>
            <h2 className="modal-title">{prompt.title}</h2>
            <div className="modal-meta-row">
              <CategoryTag category={prompt.category} />
              <DifficultyTag difficulty={prompt.difficulty || 'beginner'} />
              {prompt.recommendedTools?.map(t => <ToolTag key={t} tool={t} />)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'flex-start' }}>
            <button
              style={{
                width: 36, height: 36, borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                background: isFavorite ? '#fff9f0' : 'var(--color-surface-2)',
                fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isFavorite ? 'var(--color-warning)' : 'var(--color-text-muted)',
                transition: 'all 0.15s',
              }}
              onClick={() => onToggleFavorite(prompt.id)}
              title={isFavorite ? '取消收藏' : '加入收藏'}
            >
              {isFavorite ? '⭐' : '☆'}
            </button>
            <button className="modal-close" onClick={onClose} aria-label="關閉">✕</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="modal-body">

          {/* Complete Prompt */}
          <div>
            <div className="modal-section-title">完整 Prompt</div>
            <div className="prompt-block">
              {renderHighlightedPrompt(prompt.prompt)}
            </div>
          </div>

          {/* Variable Replacement */}
          {varKeys.length > 0 && (
            <div>
              <div className="modal-section-title">替換變數 — 自訂你的 Prompt</div>
              <div className="var-form">
                {varKeys.map(key => {
                  const varDef = prompt.variables?.find(v => v.key === key)
                  return (
                    <div key={key} className="var-field">
                      <label className="var-field-label">
                        <code>[{key}]</code>
                        {varDef?.example && (
                          <span>例：{varDef.example}</span>
                        )}
                      </label>
                      <input
                        className="var-input"
                        type="text"
                        placeholder={varDef?.example ? `例：${varDef.example}` : `填入 [${key}]`}
                        value={varValues[key] || ''}
                        onChange={e => setVarValues(v => ({ ...v, [key]: e.target.value }))}
                        onFocus={() => setActiveVar(key)}
                        onBlur={() => setActiveVar(null)}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Preview */}
              {showPreview && (
                <div style={{ marginTop: 14 }}>
                  <div className="preview-label">預覽：客製化後的 Prompt</div>
                  <div className="preview-block">
                    {renderHighlightedPrompt(prompt.prompt, true)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Grid */}
          <div>
            <div className="modal-section-title">模板資訊</div>
            <div className="info-grid">
              {prompt.useCase && (
                <div className="info-item">
                  <div className="info-item-label">使用場景</div>
                  <div className="info-item-value">📍 {prompt.useCase}</div>
                </div>
              )}
              {prompt.aspectRatio && (
                <div className="info-item">
                  <div className="info-item-label">推薦比例</div>
                  <div className="info-item-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    📐 {prompt.aspectRatio}
                  </div>
                </div>
              )}
              {prompt.hasStyleRaw !== undefined && (
                <div className="info-item">
                  <div className="info-item-label">--style raw</div>
                  <div className="info-item-value">
                    {prompt.hasStyleRaw ? '✅ 已包含' : '⬜ 未包含'}
                  </div>
                </div>
              )}
              {prompt.recommendedTools?.length > 0 && (
                <div className="info-item" style={{ gridColumn: prompt.aspectRatio ? 'auto' : '1 / -1' }}>
                  <div className="info-item-label">推薦工具</div>
                  <div className="info-item-value" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {prompt.recommendedTools.map(t => (
                      <span key={t} style={{
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        padding: '2px 10px',
                        borderRadius: 99,
                        fontSize: 12.5,
                        fontWeight: 600,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {prompt.tags?.length > 0 && (
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="info-item-label">標籤</div>
                  <div className="info-item-value" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontWeight: 400, fontSize: 13 }}>
                    {prompt.tags.map(tag => (
                      <span key={tag} style={{ color: 'var(--color-text-secondary)' }}># {tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {prompt.notes && (
            <div>
              <div className="modal-section-title">使用說明 & 小技巧</div>
              <div className="notes-block">
                💡 {prompt.notes}
              </div>
            </div>
          )}

          {/* Tips */}
          <div style={{ background: '#fafbff', border: '1px solid var(--color-border-light)', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--color-text-secondary)' }}>📌 使用小提醒</strong>
            <ul style={{ paddingLeft: 18, marginTop: 6 }}>
              <li>同一個 Prompt 多跑幾次，每次結果都不同 — 多試幾次挑最好的</li>
              <li>AI 生成圖仍可能需要後製微調，搭配 Canva / Photoshop 更完美</li>
              <li>替換 <code style={{ fontFamily: 'var(--font-mono)', background: '#fff3cd', padding: '1px 4px', borderRadius: 3, color: '#854d0e' }}>[變數]</code> 欄位後，Prompt 效果更精準</li>
            </ul>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          <button
            className={`btn-primary${copiedState === 'plain' ? ' copied' : ''}`}
            onClick={handleCopyPlain}
          >
            {copiedState === 'plain' ? '✓ 已複製！' : '⎘ 複製純文字版'}
          </button>
          <button
            className={`btn-secondary${copiedState === 'rich' ? ' copied' : ''}`}
            onClick={handleCopyRich}
            style={copiedState === 'rich' ? { background: 'var(--color-success-light)', color: 'var(--color-success)', borderColor: 'var(--color-success)' } : {}}
          >
            {copiedState === 'rich' ? '✓ 已複製！' : '📋 複製含說明版'}
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            ↓ 匯出 .txt
          </button>
        </div>
      </div>
    </div>
  )
}
