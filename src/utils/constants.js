export const CATEGORY_COLORS = {
  '商業攝影風':      { bg: '#fff7ed', border: '#c2410c', text: '#9a3412', dot: '#ea580c' },
  '扁平插畫風':      { bg: '#eff6ff', border: '#1d4ed8', text: '#1e40af', dot: '#3b82f6' },
  '3D 渲染風':       { bg: '#faf5ff', border: '#7e22ce', text: '#6b21a8', dot: '#a855f7' },
  '日系動漫風':      { bg: '#fff1f2', border: '#be123c', text: '#9f1239', dot: '#f43f5e' },
  '復古風 / 膠片風': { bg: '#fffbeb', border: '#b45309', text: '#92400e', dot: '#d97706' },
  '極簡 / 北歐風':   { bg: '#f0fdf4', border: '#15803d', text: '#166534', dot: '#22c55e' },
  '品牌社群風':      { bg: '#ecfeff', border: '#0e7490', text: '#155e75', dot: '#06b6d4' },
}

export const TOOL_OPTIONS = ['Midjourney', 'ChatGPT', 'Firefly', 'Recraft', '其他']

export const SCENE_OPTIONS = [
  '電商主圖', '社群貼文', '品牌視覺', '室內設計',
  'UI配圖', 'Banner', '活動海報', '限時動態', '產品展示',
]

export const DIFFICULTY_LABELS = {
  beginner: { label: '新手友善', color: '#15803d', bg: '#f0fdf4' },
  intermediate: { label: '進階', color: '#b45309', bg: '#fffbeb' },
  advanced: { label: '高難度', color: '#be123c', bg: '#fff1f2' },
}

export const CATEGORY_OPTIONS = Object.keys(CATEGORY_COLORS)
