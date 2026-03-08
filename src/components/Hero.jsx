import SearchBar from './SearchBar'
import { CATEGORY_COLORS } from '../utils/constants'

const CATEGORY_ICONS = {
  '商業攝影風': '📸',
  '扁平插畫風': '🎨',
  '3D 渲染風':  '🧊',
  '日系動漫風': '🌸',
  '復古風 / 膠片風': '🎞',
  '極簡 / 北歐風': '🪴',
  '品牌社群風': '✨',
}

export default function Hero({ totalCount, categoryCount, searchQuery, onSearchChange, activeCategories, onCategoryClick }) {
  const categories = Object.keys(CATEGORY_COLORS)

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-badge">
          <span>✦</span>
          <span>設計師實測．直接複製就能用</span>
        </div>

        <h1 className="hero-title">
          AI <span>Prompt</span> 模板庫
        </h1>

        <p className="hero-subtitle">
          {totalCount} 組設計師實測的萬用 AI 繪圖 Prompt，直接複製就能用
        </p>

        <p className="hero-desc">
          不知道怎麼寫 Prompt？這個模板庫幫你省掉大量摸索時間。
        </p>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-icon">📦</span>
            <div>
              <div className="hero-stat-text">{totalCount} 組模板</div>
              <div className="hero-stat-sub">持續更新中</div>
            </div>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-icon">🎨</span>
            <div>
              <div className="hero-stat-text">{categoryCount} 大風格</div>
              <div className="hero-stat-sub">全類型覆蓋</div>
            </div>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-icon">⚡</span>
            <div>
              <div className="hero-stat-text">一鍵複製</div>
              <div className="hero-stat-sub">即貼即用</div>
            </div>
          </div>
        </div>

        <div className="hero-search">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>

        <div className="hero-cats">
          {categories.map(cat => (
            <button
              key={cat}
              className={`hero-cat-btn${activeCategories.includes(cat) ? ' active' : ''}`}
              onClick={() => onCategoryClick(cat)}
            >
              <span>{CATEGORY_ICONS[cat] || '🏷'}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
