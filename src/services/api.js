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
  quote: ''
}

// Helper to fetch from MockAPI
let isApiUnavailable = false

async function tryFetch(endpoint, options = {}) {
  if (isApiUnavailable || !BASE_URL) return null

  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`, options)
    if (res.ok) {
      return await res.json()
    }
    if (res.status === 404) {
      // If resource not found on MockAPI, gracefully fallback without repeated errors
      console.info(`[Graduation App] MockAPI /${endpoint} chưa được tạo trên mockapi.io. Ứng dụng tự động lưu trên LocalStorage của bạn.`)
    }
  } catch (err) {
    // Network or CORS error
    isApiUnavailable = true
    console.info(`[Graduation App] Không kết nối được MockAPI (${err.message}). Ứng dụng tự động chuyển sang chế độ LocalStorage.`)
  }
  return null
}

// ==========================================
// 1. RSVPs (Danh sách đăng ký tham gia)
// ==========================================
export async function getRsvps() {
  try {
    const data = await tryFetch('rsvps')
    if (Array.isArray(data) && data.length > 0) {
      localStorage.setItem('graduation_rsvp_list', JSON.stringify(data))
      return data
    }
  } catch (err) {
    console.warn("MockAPI getRsvps fallback to localStorage:", err)
  }
  const saved = localStorage.getItem('graduation_rsvp_list')
  return saved ? JSON.parse(saved) : []
}

export async function addRsvp(rsvpData) {
  const newItem = { ...rsvpData, id: rsvpData.id || String(Date.now()) }
  try {
    const data = await tryFetch('rsvps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    })
    if (data) {
      const currentList = JSON.parse(localStorage.getItem('graduation_rsvp_list') || '[]')
      const updated = [data, ...currentList.filter(item => item.id !== data.id)]
      localStorage.setItem('graduation_rsvp_list', JSON.stringify(updated))
      return data
    }
  } catch (err) {
    console.warn("MockAPI addRsvp fallback to localStorage:", err)
  }

  const currentList = JSON.parse(localStorage.getItem('graduation_rsvp_list') || '[]')
  const updated = [newItem, ...currentList]
  localStorage.setItem('graduation_rsvp_list', JSON.stringify(updated))
  return newItem
}

// Cập nhật theo ID hoặc tạo mới nếu chưa tồn tại (Upsert gọn gàng)
export async function saveOrUpdateRsvp(rsvpData) {
  const currentList = await getRsvps()
  
  // Tìm bản ghi theo ID hoặc theo Tên (không phân biệt hoa thường)
  const existing = rsvpData.id 
    ? currentList.find(item => item.id === rsvpData.id)
    : currentList.find(item => item.name?.trim().toLowerCase() === rsvpData.name?.trim().toLowerCase())

  if (existing) {
    const updatedItem = { ...existing, ...rsvpData, id: existing.id }
    try {
      const result = await tryFetch(`rsvps/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      })
      const finalItem = result || updatedItem
      const updatedList = currentList.map(item => item.id === existing.id ? finalItem : item)
      localStorage.setItem('graduation_rsvp_list', JSON.stringify(updatedList))
      return finalItem
    } catch (err) {
      console.warn("MockAPI updateRsvp fallback to localStorage:", err)
      const updatedList = currentList.map(item => item.id === existing.id ? updatedItem : item)
      localStorage.setItem('graduation_rsvp_list', JSON.stringify(updatedList))
      return updatedItem
    }
  } else {
    return await addRsvp(rsvpData)
  }
}

// Đăng nhập người dùng bằng tên: lấy đúng ID cũ hoặc tạo mới nếu lần đầu
export async function loginOrCreateGuest(name) {
  if (!name || !name.trim()) return null
  const trimmed = name.trim()
  const list = await getRsvps()
  const existing = list.find(r => r.name?.trim().toLowerCase() === trimmed.toLowerCase())
  if (existing) {
    return existing
  }
  const newGuest = {
    name: trimmed,
    phone: '',
    plan: 'Chụp ảnh + Đi cả tiệc quẩy trưa',
    attendance: 'yes',
    wish: '',
    timestamp: new Date().toLocaleTimeString()
  }
  return await addRsvp(newGuest)
}

// ==========================================
// 2. Wishes (Lưu bút & Lời chúc trích xuất từ RSVPs)
// ==========================================
export async function getWishes() {
  const rsvps = await getRsvps()
  const wishesFromRsvps = rsvps
    .filter(item => item.wish && item.wish.trim())
    .map(item => ({
      id: item.id,
      author: item.name,
      text: item.wish,
      time: item.timestamp || 'Vừa xong'
    }))

  localStorage.setItem('graduation_wishes_list', JSON.stringify(wishesFromRsvps))
  return wishesFromRsvps
}

export async function addWish(wishData) {
  const newWish = { ...wishData, id: String(Date.now()) }
  
  // Also post as an RSVP entry so it syncs to MockAPI /rsvps
  try {
    await addRsvp({
      name: wishData.author,
      phone: '',
      plan: 'Gửi lời chúc mừng',
      attendance: 'yes',
      wish: wishData.text,
      timestamp: new Date().toLocaleTimeString()
    })
  } catch (err) {
    console.warn("Sync wish to RSVP fallback:", err)
  }

  const currentWishes = JSON.parse(localStorage.getItem('graduation_wishes_list') || '[]')
  const updated = [newWish, ...currentWishes]
  localStorage.setItem('graduation_wishes_list', JSON.stringify(updated))
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
  const updated = currentList.filter(item => item.id !== rsvpId)
  localStorage.setItem('graduation_rsvp_list', JSON.stringify(updated))

  const currentWishes = JSON.parse(localStorage.getItem('graduation_wishes_list') || '[]')
  const newWishes = currentWishes.filter(w => w.id !== rsvpId)
  localStorage.setItem('graduation_wishes_list', JSON.stringify(newWishes))

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
