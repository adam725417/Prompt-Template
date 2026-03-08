export default function SearchBar({ value, onChange, placeholder = '搜尋 Prompt 模板、分類、工具…' }) {
  return (
    <div className="search-wrap">
      <span className="search-icon">🔍</span>
      <input
        className="search-input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')} aria-label="清除">
          ✕
        </button>
      )}
    </div>
  )
}
