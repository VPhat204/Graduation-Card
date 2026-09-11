const BASE_URL = "https://6a9d855fa1b37296ad4c098d.mockapi.io"

const DEFAULT_GRADUATION_INFO = {
  id: "1",
  graduateName: '',
  degree: '',
  university: '',
  date: '',
  time: '',
  venue: '',
  address: '',
  dressCode: '',
  avatarUrl: '',
  quote: '',
  theme: 'gold'
}

// Helper to fetch from MockAPI with retry/timeout safety
async function tryFetch(endpoint, options = {}) {
  if (!BASE_URL) return null

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    if (res.ok) {
      return await res.json()
    }
    if (res.status === 404) {
      console.info(`[Graduation App] Endpoint /${endpoint} không tìm thấy trên MockAPI (404). Sử dụng LocalStorage.`)
    }
  } catch (err) {
    clearTimeout(timeoutId)
    console.info(`[Graduation App] MockAPI kết nối không thành công (${err.message}). Tự động lưu trên LocalStorage.`)
  }
  return null
}

// Helper: Chuẩn hóa và làm sạch danh sách RSVP (loại bỏ trùng lặp theo tên)
export function deduplicateRsvps(list) {
  if (!Array.isArray(list)) return []
  const map = new Map()

  list.forEach(item => {
    if (!item || !item.name || !item.name.trim()) return
    const trimmed = item.name.trim()
    // Bỏ qua các dữ liệu mẫu tự sinh của MockAPI
    if (/^name\s*\d+$/i.test(trimmed) || trimmed.toLowerCase() === 'name') return

    const key = trimmed.toLowerCase()
    const existing = map.get(key)
    if (!existing) {
      map.set(key, item)
    } else {
      // Ưu tiên bản ghi có nhiều thông tin hơn (sđt, kế hoạch không phải mặc định, lời chúc, theme)
      const preferNew = (item.phone && !existing.phone) ||
                        (item.wish && !existing.wish) ||
                        (item.theme && item.theme !== 'gold' && (!existing.theme || existing.theme === 'gold')) ||
                        (item.plan && item.plan !== 'Gửi lời chúc mừng' && existing.plan === 'Gửi lời chúc mừng') ||
                        (item.id && !existing.id)
      if (preferNew) {
        map.set(key, { ...existing, ...item })
      } else {
        map.set(key, { ...item, ...existing })
      }
    }
  })

  return Array.from(map.values())
}

// ==========================================
// 1. RSVPs (Danh sách đăng ký tham gia chuẩn xác)
// ==========================================
export async function getRsvps() {
  try {
    const data = await tryFetch('rsvps')
    if (Array.isArray(data)) {
      const deduped = deduplicateRsvps(data)
      localStorage.setItem('graduation_rsvp_list', JSON.stringify(deduped))
      return deduped
    }
  } catch (err) {
    console.warn("MockAPI getRsvps fallback to localStorage:", err)
  }
  const saved = localStorage.getItem('graduation_rsvp_list')
  return saved ? deduplicateRsvps(JSON.parse(saved)) : []
}

// Tìm thông tin khách mời đã RSVP trước đó (chỉ tra cứu, KHÔNG tự động tạo mới RSVP)
export async function findGuestRsvp(name) {
  if (!name || !name.trim()) return null
  const trimmed = name.trim().toLowerCase()
  const list = await getRsvps()
  return list.find(r => r.name && r.name.trim().toLowerCase() === trimmed) || null
}

// Thêm mới hoặc Cập nhật RSVP một cách chuẩn xác (Lưu màu sắc theme riêng theo từng người vào MockAPI)
export async function saveOrUpdateRsvp(rsvpData) {
  if (!rsvpData || !rsvpData.name || !rsvpData.name.trim()) return null

  const trimmedName = rsvpData.name.trim()
  const normalizedKey = trimmedName.toLowerCase()
  const currentList = await getRsvps()

  // Tìm bản ghi hiện có theo ID hoặc theo Tên
  const existing = currentList.find(item => 
    (rsvpData.id && String(item.id) === String(rsvpData.id)) ||
    (item.name && item.name.trim().toLowerCase() === normalizedKey)
  )

  const timestamp = rsvpData.timestamp || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  const guestTheme = rsvpData.theme || (existing ? existing.theme : undefined) || 'gold'

  if (existing && existing.id) {
    // Cập nhật bản ghi đã có
    const updatedItem = {
      ...existing,
      ...rsvpData,
      id: existing.id,
      name: trimmedName,
      theme: guestTheme,
      timestamp
    }

    try {
      const result = await tryFetch(`rsvps/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      })
      const finalItem = result || updatedItem
      const updatedList = deduplicateRsvps(
        currentList.map(item => String(item.id) === String(existing.id) ? finalItem : item)
      )
      localStorage.setItem('graduation_rsvp_list', JSON.stringify(updatedList))
      return finalItem
    } catch (err) {
      console.warn("MockAPI updateRsvp fallback to localStorage:", err)
      const updatedList = deduplicateRsvps(
        currentList.map(item => String(item.id) === String(existing.id) ? updatedItem : item)
      )
      localStorage.setItem('graduation_rsvp_list', JSON.stringify(updatedList))
      return updatedItem
    }
  } else {
    // Tạo bản ghi mới duy nhất
    const newItem = {
      ...rsvpData,
      id: rsvpData.id || String(Date.now()),
      name: trimmedName,
      theme: guestTheme,
      timestamp
    }

    try {
      const created = await tryFetch('rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      })
      const finalItem = created || newItem
      const updatedList = deduplicateRsvps([finalItem, ...currentList.filter(item => item.name?.trim().toLowerCase() !== normalizedKey)])
      localStorage.setItem('graduation_rsvp_list', JSON.stringify(updatedList))
      return finalItem
    } catch (err) {
      console.warn("MockAPI addRsvp fallback to localStorage:", err)
      const updatedList = deduplicateRsvps([newItem, ...currentList.filter(item => item.name?.trim().toLowerCase() !== normalizedKey)])
      localStorage.setItem('graduation_rsvp_list', JSON.stringify(updatedList))
      return newItem
    }
  }
}

// ==========================================
// 2. Wishes (Lưu bút & Lời chúc độc lập)
// ==========================================
export async function getWishes() {
  const savedWishes = JSON.parse(localStorage.getItem('graduation_wishes_list') || '[]')
  const rsvps = await getRsvps()
  
  // Tổng hợp lời chúc từ cả lưu bút lẫn trường wish trong RSVP
  const map = new Map()

  savedWishes.forEach(w => {
    if (w && w.text && w.text.trim()) {
      map.set(`${(w.author || '').trim().toLowerCase()}_${w.text.trim()}`, w)
    }
  })

  rsvps.forEach(r => {
    if (r && r.wish && r.wish.trim()) {
      const key = `${(r.name || '').trim().toLowerCase()}_${r.wish.trim()}`
      if (!map.has(key)) {
        map.set(key, {
          id: r.id || String(Date.now()),
          author: r.name,
          text: r.wish,
          time: r.timestamp || 'Vừa xong'
        })
      }
    }
  })

  const merged = Array.from(map.values())
  localStorage.setItem('graduation_wishes_list', JSON.stringify(merged))
  return merged
}

export async function addWish(wishData) {
  if (!wishData || !wishData.text || !wishData.text.trim()) return null

  const newWish = {
    id: wishData.id || String(Date.now()),
    author: (wishData.author && wishData.author.trim()) ? wishData.author.trim() : 'Khách Quý',
    text: wishData.text.trim(),
    time: wishData.time || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  // Nếu người gửi đã có bản ghi RSVP thì đồng bộ lời chúc vào RSVP của người đó mà không làm đổi kế hoạch tham dự
  const currentRsvps = await getRsvps()
  const existingRsvp = currentRsvps.find(r => r.name && r.name.trim().toLowerCase() === newWish.author.toLowerCase())
  if (existingRsvp && existingRsvp.id) {
    try {
      await tryFetch(`rsvps/${existingRsvp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...existingRsvp, wish: newWish.text })
      })
    } catch (err) {
      console.warn("Sync wish to existing RSVP failed:", err)
    }
  }

  const currentWishes = JSON.parse(localStorage.getItem('graduation_wishes_list') || '[]')
  const updatedWishes = [newWish, ...currentWishes.filter(w => w.id !== newWish.id)]
  localStorage.setItem('graduation_wishes_list', JSON.stringify(updatedWishes))
  return newWish
}

// Xóa một lời chúc
export async function deleteWish(wishId) {
  const currentList = await getRsvps()
  const target = currentList.find(item => item.id === wishId)
  if (target) {
    const updated = { ...target, wish: '' }
    try {
      await tryFetch(`rsvps/${wishId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
    } catch (err) {
      console.warn("MockAPI deleteWish fallback to localStorage:", err)
    }
    const updatedList = currentList.map(item => item.id === wishId ? updated : item)
    localStorage.setItem('graduation_rsvp_list', JSON.stringify(updatedList))
  }
  
  const currentWishes = JSON.parse(localStorage.getItem('graduation_wishes_list') || '[]')
  const newWishes = currentWishes.filter(w => w.id !== wishId)
  localStorage.setItem('graduation_wishes_list', JSON.stringify(newWishes))
  return newWishes
}

// Xóa hẳn bản ghi phản hồi RSVP
export async function deleteRsvp(rsvpId) {
  try {
    await tryFetch(`rsvps/${rsvpId}`, {
      method: 'DELETE'
    })
  } catch (err) {
    console.warn("MockAPI deleteRsvp fallback to localStorage:", err)
  }
  const currentList = JSON.parse(localStorage.getItem('graduation_rsvp_list') || '[]')
  const updated = currentList.filter(item => String(item.id) !== String(rsvpId))
  localStorage.setItem('graduation_rsvp_list', JSON.stringify(updated))

  return updated
}

// ==========================================
// 3. Graduation Info (Thông tin Cử nhân & Buổi lễ)
// ==========================================
export async function getGraduationInfo() {
  try {
    const data = await tryFetch('graduation')
    if (Array.isArray(data) && data.length > 0) {
      localStorage.setItem('graduation_host_data', JSON.stringify(data[0]))
      return data[0]
    } else if (data && typeof data === 'object' && data.graduateName) {
      localStorage.setItem('graduation_host_data', JSON.stringify(data))
      return data
    }
  } catch (err) {
    console.warn("MockAPI getGraduationInfo fallback to localStorage:", err)
  }
  const saved = localStorage.getItem('graduation_host_data')
  return saved ? JSON.parse(saved) : DEFAULT_GRADUATION_INFO
}

export async function updateGraduationInfo(infoData) {
  try {
    const putData = await tryFetch('graduation/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(infoData)
    })
    if (putData) {
      localStorage.setItem('graduation_host_data', JSON.stringify(putData))
      return putData
    }

    const postData = await tryFetch('graduation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(infoData)
    })
    if (postData) {
      localStorage.setItem('graduation_host_data', JSON.stringify(postData))
      return postData
    }
  } catch (err) {
    console.warn("MockAPI updateGraduationInfo fallback to localStorage:", err)
  }

  localStorage.setItem('graduation_host_data', JSON.stringify(infoData))
  return infoData
}
