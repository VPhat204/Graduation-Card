export const THEMES = [
  {
    id: 'gold',
    name: 'Hoàng Gia Gold',
    tag: 'Sang trọng • Đẳng cấp',
    primaryColor: '#f2ca50',
    accentColor: '#d4af37',
    bgHex: '#131412',
    gradientClass: 'from-[#f2ca50] to-[#d4af37]',
    previewDots: ['#f2ca50', '#d4af37', '#1b1c1a']
  },
  {
    id: 'navy',
    name: 'Xanh Sapphire',
    tag: 'Trẻ trung • Tri thức',
    primaryColor: '#38bdf8',
    accentColor: '#0284c7',
    bgHex: '#0b1120',
    gradientClass: 'from-[#38bdf8] to-[#0284c7]',
    previewDots: ['#38bdf8', '#0284c7', '#0f172a']
  },
  {
    id: 'burgundy',
    name: 'Rượu Vang Đỏ',
    tag: 'Nồng nhiệt • Ấn tượng',
    primaryColor: '#fb7185',
    accentColor: '#e11d48',
    bgHex: '#15080c',
    gradientClass: 'from-[#fb7185] to-[#e11d48]',
    previewDots: ['#fb7185', '#e11d48', '#241219']
  },
  {
    id: 'emerald',
    name: 'Ngọc Lục Bảo',
    tag: 'Thanh lịch • Tươi mới',
    primaryColor: '#34d399',
    accentColor: '#059669',
    bgHex: '#061510',
    gradientClass: 'from-[#34d399] to-[#059669]',
    previewDots: ['#34d399', '#059669', '#0e271f']
  },
  {
    id: 'rose',
    name: 'Hồng Ánh Kim',
    tag: 'Ngọt ngào • Thanh xuân',
    primaryColor: '#f472b6',
    accentColor: '#db2777',
    bgHex: '#170b13',
    gradientClass: 'from-[#f472b6] to-[#db2777]',
    previewDots: ['#f472b6', '#db2777', '#271521']
  },
  {
    id: 'amethyst',
    name: 'Tím Thiên Hà',
    tag: 'Hiện đại • Cá tính',
    primaryColor: '#c084fc',
    accentColor: '#9333ea',
    bgHex: '#0f0c1b',
    gradientClass: 'from-[#c084fc] to-[#9333ea]',
    previewDots: ['#c084fc', '#9333ea', '#1c1833']
  }
]

export function applyTheme(themeId) {
  const validTheme = THEMES.some(t => t.id === themeId) ? themeId : 'gold'
  document.documentElement.setAttribute('data-theme', validTheme)
  localStorage.setItem('graduation_theme', validTheme)
  return validTheme
}

export function getCurrentTheme() {
  return localStorage.getItem('graduation_theme') || 'gold'
}
