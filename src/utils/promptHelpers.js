/**
 * Validate a single prompt entry.
 * Returns true if valid, false (with console warning) if invalid.
 */
export function validatePrompt(item) {
  if (!item || typeof item !== 'object') {
    console.warn('[PromptLibrary] Invalid entry (not an object):', item)
    return false
  }
  if (!item.id) {
    console.warn('[PromptLibrary] Entry missing required field "id":', item)
    return false
  }
  if (!item.title) {
    console.warn(`[PromptLibrary] Entry #${item.id} missing required field "title"`)
    return false
  }
  if (!item.prompt) {
    console.warn(`[PromptLibrary] Entry #${item.id} missing required field "prompt"`)
    return false
  }
  if (item.variables !== undefined && !Array.isArray(item.variables)) {
    console.warn(`[PromptLibrary] Entry #${item.id}: "variables" must be an array`)
    return false
  }
  if (item.recommendedTools !== undefined && !Array.isArray(item.recommendedTools)) {
    console.warn(`[PromptLibrary] Entry #${item.id}: "recommendedTools" must be an array`)
    return false
  }
  return true
}

/**
 * Filter and validate a raw prompts array.
 * Invalid entries are skipped and logged to console.
 */
export function sanitizePrompts(raw) {
  if (!Array.isArray(raw)) {
    console.error('[PromptLibrary] prompts.json root must be an array')
    return []
  }
  return raw.filter(validatePrompt)
}

/**
 * Parse all unique variable keys from a prompt string.
 * e.g. "[產品名稱], [場景描述]" → ["產品名稱", "場景描述"]
 */
export function parseVariableKeys(promptText) {
  const regex = /\[([^\]]+)\]/g
  const keys = []
  let match
  while ((match = regex.exec(promptText)) !== null) {
    if (!keys.includes(match[1])) keys.push(match[1])
  }
  return keys
}

/**
 * Replace all variable placeholders with user-provided values.
 * Unreplaced variables stay as-is.
 */
export function applyVariables(promptText, values = {}) {
  let result = promptText
  Object.entries(values).forEach(([key, val]) => {
    if (val && val.trim()) {
      result = result.replaceAll(`[${key}]`, val.trim())
    }
  })
  return result
}

/**
 * Build a plain-text copy string (prompt only).
 */
export function buildPlainCopy(item, values = {}) {
  return applyVariables(item.prompt, values)
}

/**
 * Build a rich copy string (includes metadata).
 */
export function buildRichCopy(item, values = {}) {
  const lines = [
    `【${item.title}】`,
    `分類：${item.category}`,
    `適用場景：${item.useCase || '—'}`,
    `推薦工具：${(item.recommendedTools || []).join('、') || '—'}`,
    '',
    '--- Prompt ---',
    applyVariables(item.prompt, values),
    '',
  ]
  if (item.variables && item.variables.length > 0) {
    lines.push('--- 可替換欄位 ---')
    item.variables.forEach(v => {
      lines.push(`[${v.key}]  例：${v.example || '—'}`)
    })
    lines.push('')
  }
  if (item.notes) {
    lines.push('--- 使用說明 ---')
    lines.push(item.notes)
  }
  return lines.join('\n')
}

/**
 * Filter prompts by search query and active filter sets.
 */
export function filterPrompts(prompts, { query = '', categories = [], tools = [], scenes = [], extras = [] }) {
  const q = query.toLowerCase().trim()

  return prompts.filter(p => {
    // Text search
    if (q) {
      const searchable = [
        p.title, p.category, p.prompt, p.useCase,
        ...(p.tags || []),
        ...(p.recommendedTools || []),
      ].join(' ').toLowerCase()
      if (!searchable.includes(q)) return false
    }

    // Category filter
    if (categories.length > 0 && !categories.includes(p.category)) return false

    // Tool filter
    if (tools.length > 0) {
      const hasMatch = (p.recommendedTools || []).some(t => tools.includes(t))
      if (!hasMatch) return false
    }

    // Scene filter
    if (scenes.length > 0 && !scenes.includes(p.useCase)) return false

    // Extras
    if (extras.includes('hasAr') && !p.aspectRatio) return false
    if (extras.includes('hasStyleRaw') && !p.hasStyleRaw) return false
    if (extras.includes('beginner') && p.difficulty !== 'beginner') return false

    return true
  })
}
