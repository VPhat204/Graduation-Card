import { useState, useEffect, useRef } from 'react'
import {
  GraduationCap,
  Share2,
  Settings,
  CheckCircle2,
  PartyPopper,
  BookOpen,
  Camera,
  Utensils,
  Sparkles,
  Car,
  Map,
  UserCheck,
  FileEdit,
  Send,
  Heart,
  X,
  Navigation,
  Trash2,
  Check,
  Palette
} from 'lucide-react'
import ConfettiCanvas from './components/ConfettiCanvas'
import AudioPlayer from './components/AudioPlayer'
import CountdownTimer from './components/CountdownTimer'
import EnvelopeModal from './components/EnvelopeModal'
import InteractiveCard from './components/InteractiveCard'
import VipTicketCard from './components/VipTicketCard'
import HostSettingsDrawer from './components/HostSettingsDrawer'
import ContactFloatingWidget from './components/ContactFloatingWidget'
import {
  getRsvps,
  saveOrUpdateRsvp,
  findGuestRsvp,
  deduplicateRsvps,
  getGraduationInfo,
  updateGraduationInfo,
  getWishes,
  addWish,
  deleteWish,
  deleteRsvp
} from './services/api'
import { THEMES, applyTheme, getCurrentTheme } from './services/themes'

const DEFAULT_HOST = {
  graduateName: 'Hồ Văn Phát',
  degree: 'Tân Cử Nhân Công Nghệ Thông Tin',
  university: 'Trường Đại Học Nguyễn Tất Thành',
  date: 'Thứ Bảy, 19 Tháng 09, 2026',
  time: '10:00 AM',
  venue: 'Đại sảnh trường Đại học Nguyễn Tất Thành',
  address: 'Đỗ Mười/331A-331B An Phú Đông 10, An Phú Đông, Hồ Chí Minh, Vietnam',
  dressCode: 'Lịch sự / Trang phục tự do / Áo Cử Nhân',
  avatarUrl: '/avatar.jpg',
  quote: 'Hành trình vạn dặm bắt đầu từ một bước chân. Cảm ơn vì đã luôn đồng hành cùng tôi!',
  phone: '0944788931',
  zaloUrl: 'https://zalo.me/0944788931',
  facebookUrl: 'https://www.facebook.com/hg.bin.52',
  theme: 'gold'
}

export default function App() {
  const confettiRef = useRef(null)
  const navRef = useRef(null)
  const tabRefs = useRef([])
  const manualNavLock = useRef(false)
  const interactiveCardRef = useRef(null)
  const [pillStyle, setPillStyle] = useState({ left: 4, width: 0 })

  // Host info state
  const [hostData, setHostData] = useState(() => {
    const saved = localStorage.getItem('graduation_host_data')
    const initial = saved ? JSON.parse(saved) : DEFAULT_HOST
    const theme = initial.theme || getCurrentTheme()
    applyTheme(theme)
    return { ...DEFAULT_HOST, ...initial, theme }
  })

  // Guest RSVP list state
  const [rsvpList, setRsvpList] = useState([])

  // Guestbook wishes state (Dynamic, starting empty until users submit or fetched)
  const [wishes, setWishes] = useState(() => {
    const saved = localStorage.getItem('graduation_wishes_list')
    return saved ? JSON.parse(saved) : []
  })

  // Current Guest Info (Personalized view)
  const [currentGuest, setCurrentGuest] = useState(null)

  // Form states
  const [rsvpForm, setRsvpForm] = useState({
    name: '',
    phone: '',
    plan: 'Chụp ảnh + Đi cả tiệc quẩy trưa',
    attendance: 'yes',
    wish: ''
  })

  const [wishInput, setWishInput] = useState('')
  const [wishAuthor, setWishAuthor] = useState('')

  // Drawer / Modals & Toast State
  const [isHostOpen, setIsHostOpen] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('invitation')

  // Custom Toast notification
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' // 'success' | 'info' | 'error'
  })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 2800)
  }

  // Custom Confirmation Dialog (Thay thế window.confirm mặc định)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  })

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })
  }

  // Fetch initial data from MockAPI
  useEffect(() => {
    // 1. Fetch Graduation Info (Bảng 2)
    getGraduationInfo().then(data => {
      if (data) setHostData(prev => ({ ...prev, ...data, avatarUrl: data.avatarUrl || '/avatar.jpg' }))
    })

    getRsvps().then(data => {
      if (Array.isArray(data)) {
        const cleaned = deduplicateRsvps(data.filter(item => !item.name?.toLowerCase().includes('nguyễn văn')))
        setRsvpList(cleaned)
        localStorage.setItem('graduation_rsvp_list', JSON.stringify(cleaned))
      }
    })

    getWishes().then(data => {
      if (Array.isArray(data)) {
        const cleaned = data.filter(item => !item.author?.toLowerCase().includes('nguyễn văn'))
        setWishes(cleaned)
        localStorage.setItem('graduation_wishes_list', JSON.stringify(cleaned))
      }
    })

    // 3. Check URL query parameters & populate guest personalization (KHÔNG tạo RSVP giả)
    const params = new URLSearchParams(window.location.search)
    const guestParam = (params.get('guest') || params.get('name') || '').trim()
    const themeParam = params.get('theme')

    if (themeParam) {
      applyTheme(themeParam)
    }

    if (guestParam) {
      findGuestRsvp(guestParam).then(existingGuest => {
        if (existingGuest) {
          const effectiveTheme = themeParam || existingGuest.theme || hostData.theme || 'gold'
          applyTheme(effectiveTheme)
          setCurrentGuest({ ...existingGuest, theme: effectiveTheme })
          setRsvpForm({
            name: existingGuest.name || guestParam,
            phone: existingGuest.phone || '',
            plan: existingGuest.plan || 'Chụp ảnh + Đi cả tiệc quẩy trưa',
            attendance: existingGuest.attendance || 'yes',
            wish: existingGuest.wish || '',
            theme: effectiveTheme
          })
          setWishAuthor(existingGuest.name || guestParam)
        } else {
          const effectiveTheme = themeParam || hostData.theme || 'gold'
          applyTheme(effectiveTheme)
          setCurrentGuest({ name: guestParam, theme: effectiveTheme })
          setRsvpForm({
            name: guestParam,
            phone: '',
            plan: 'Chụp ảnh + Đi cả tiệc quẩy trưa',
            attendance: 'yes',
            wish: '',
            theme: effectiveTheme
          })
          setWishAuthor(guestParam)
        }
      })
    }

    // 4. Scroll-based nav highlight (chính xác cả lướt lên & xuống)
    const NAV_SECTION_IDS = ['invitation', 'itinerary', 'map-guide', 'rsvp-section']
    const handleScroll = () => {
      if (manualNavLock.current) return
      const scrollY = window.scrollY
      const detectionLine = scrollY + window.innerHeight * 0.3
      let current = 'invitation'
      for (const id of NAV_SECTION_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top + scrollY
        if (top <= detectionLine) current = id
      }
      setActiveNav(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // chạy ngay lần đầu
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cập nhật vị trí pill khi activeNav thay đổi
  useEffect(() => {
    const NAV_ITEMS = ['invitation', 'itinerary', 'map-guide', 'rsvp-section']
    const update = () => {
      const activeIndex = NAV_ITEMS.indexOf(activeNav)
      const tabEl = tabRefs.current[activeIndex]
      const navEl = navRef.current
      if (!tabEl || !navEl) return
      const navRect = navEl.getBoundingClientRect()
      const tabRect = tabEl.getBoundingClientRect()
      setPillStyle({ left: tabRect.left - navRect.left, width: tabRect.width })
    }
    // requestAnimationFrame đảm bảo DOM đã layout xong
    const raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [activeNav])

  const triggerConfetti = (x, y) => {
    if (confettiRef.current) {
      confettiRef.current.burst(x, y)
    }
  }

  const handleUpdateHostData = async (newData) => {
    setHostData(newData)
    await updateGraduationInfo(newData)
  }

  // 1. Điểm danh / Gửi Form RSVP (Lưu hoặc Cập nhật đúng một bản ghi RSVP chuẩn xác kèm màu sắc riêng vào MockAPI)
  const handleRsvpSubmit = async (e) => {
    e.preventDefault()
    if (!rsvpForm.name || !rsvpForm.name.trim()) return

    const trimmedName = rsvpForm.name.trim()
    const isAttending = rsvpForm.attendance === 'yes'
    const selectedTheme = rsvpForm.theme || currentGuest?.theme || hostData.theme || 'gold'

    const payload = {
      ...(currentGuest?.id ? { id: currentGuest.id } : {}),
      name: trimmedName,
      phone: rsvpForm.phone?.trim() || '',
      plan: isAttending ? (rsvpForm.plan || 'Chụp ảnh + Đi cả tiệc quẩy trưa') : 'Vắng mặt (Gửi lời chúc)',
      attendance: rsvpForm.attendance || 'yes',
      wish: rsvpForm.wish?.trim() || '',
      theme: selectedTheme,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    const saved = await saveOrUpdateRsvp(payload)
    if (saved) {
      setCurrentGuest(saved)
      setRsvpList(prev => deduplicateRsvps([saved, ...prev.filter(r => r.name?.trim().toLowerCase() !== saved.name?.trim().toLowerCase())]))

      if (saved.wish) {
        const updatedWishes = await getWishes()
        setWishes(updatedWishes)
      }

      const themeQuery = selectedTheme && selectedTheme !== 'gold' ? `&theme=${encodeURIComponent(selectedTheme)}` : ''
      const newUrl = `${window.location.pathname}?guest=${encodeURIComponent(saved.name)}${themeQuery}`
      window.history.pushState({ path: newUrl }, '', newUrl)

      triggerConfetti()
      showToast(saved.attendance === 'no' ? 'Đã ghi nhận phản hồi vắng mặt & lời nhắn của bạn! 💌' : 'Đã xác nhận tham gia tiệc tốt nghiệp thành công! 🎓')
    }
  }

  // 2. Gửi lời chúc vào Lưu bút (Lưu lời chúc độc lập, không làm thay đổi hay tạo fake RSVP)
  const handleSendWish = async (e) => {
    e.preventDefault()
    if (!wishInput.trim()) return

    const authorName = wishAuthor.trim() || currentGuest?.name || 'Khách Quý'
    const newWish = await addWish({
      author: authorName,
      text: wishInput.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    })

    if (newWish) {
      setWishes(prev => [newWish, ...prev.filter(w => w.id !== newWish.id)])

      // Đồng bộ wish vào currentGuest và rsvpList nếu tác giả đã có RSVP
      const normAuthor = authorName.toLowerCase()
      if (currentGuest && currentGuest.name?.trim().toLowerCase() === normAuthor) {
        setCurrentGuest(prev => prev ? { ...prev, wish: newWish.text } : null)
        setRsvpForm(prev => ({ ...prev, wish: newWish.text }))
      }
      setRsvpList(prev => prev.map(r => r.name?.trim().toLowerCase() === normAuthor ? { ...r, wish: newWish.text } : r))
    }

    setWishInput('')
    triggerConfetti()
    showToast('Đã gửi lời chúc vào Lưu Bút thành công! 💌')
  }

  // 3. Xóa lời chúc (bình luận) với Confirm Modal chuẩn thiết kế
  const handleDeleteWish = (wishId, e) => {
    if (e) e.stopPropagation()
    const targetWish = wishes.find(w => w.id === wishId)

    setConfirmModal({
      isOpen: true,
      title: 'Xóa Lời Chúc Lưu Bút',
      message: targetWish
        ? `Cậu có chắc chắn muốn xóa lời chúc "${targetWish.text.slice(0, 35)}${targetWish.text.length > 35 ? '...' : ''}" của ${targetWish.author} không?`
        : 'Cậu có chắc chắn muốn gỡ bỏ lời chúc này khỏi sổ lưu bút không?',
      onConfirm: async () => {
        closeConfirmModal()
        setWishes(prev => prev.filter(w => w.id !== wishId))
        setRsvpList(prev => prev.map(r => r.id === wishId ? { ...r, wish: '' } : r))
        if (currentGuest && currentGuest.id === wishId) {
          setCurrentGuest(prev => prev ? { ...prev, wish: '' } : null)
          setRsvpForm(prev => ({ ...prev, wish: '' }))
        }
        await deleteWish(wishId)
        showToast('Đã xóa lời chúc thành công!')
      }
    })
  }

  // 4. Xóa hoàn toàn bản ghi RSVP với Confirm Modal
  const handleDeleteRsvp = (rsvpId) => {
    const guest = rsvpList.find(r => String(r.id) === String(rsvpId))
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Phản Hồi Khách Mời',
      message: `Bạn có chắc chắn muốn xóa phản hồi tham dự của "${guest?.name || 'khách này'}" không? Dữ liệu sẽ được gỡ bỏ vĩnh viễn.`,
      onConfirm: async () => {
        closeConfirmModal()
        setRsvpList(prev => prev.filter(r => String(r.id) !== String(rsvpId)))
        if (currentGuest && String(currentGuest.id) === String(rsvpId)) {
          setCurrentGuest(null)
        }
        await deleteRsvp(rsvpId)
        showToast(`Đã xóa phản hồi của ${guest?.name || 'khách mời'} thành công!`)
      }
    })
  }

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    triggerConfetti()
    showToast('🔗 Đã sao chép link thiệp mời! Hãy gửi cho bạn bè nhé!')
  }

  const scrollToRsvp = () => {
    const el = document.getElementById('rsvp-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleFlipCard = () => {
    if (interactiveCardRef.current) {
      interactiveCardRef.current.toggleFlip()
      // Scroll xuống card sau khi lật
      const cardEl = document.getElementById('interactive-card')
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  // 3. Mở phong bì / Nhập tên (Cá nhân hóa thiệp mà không tạo bản ghi RSVP giả)
  const handleEnvelopeOpen = async (enteredName) => {
    if (!enteredName || !enteredName.trim()) return
    const trimmed = enteredName.trim()

    const existingGuest = await findGuestRsvp(trimmed)
    if (existingGuest) {
      const guestTheme = existingGuest.theme || hostData.theme || 'gold'
      applyTheme(guestTheme)
      setCurrentGuest({ ...existingGuest, theme: guestTheme })
      setRsvpForm({
        name: existingGuest.name || trimmed,
        phone: existingGuest.phone || '',
        plan: existingGuest.plan || 'Chụp ảnh + Đi cả tiệc quẩy trưa',
        attendance: existingGuest.attendance || 'yes',
        wish: existingGuest.wish || '',
        theme: guestTheme
      })
      setWishAuthor(existingGuest.name || trimmed)
    } else {
      const currentTheme = hostData.theme || 'gold'
      applyTheme(currentTheme)
      setCurrentGuest({ name: trimmed, theme: currentTheme })
      setRsvpForm({
        name: trimmed,
        phone: '',
        plan: 'Chụp ảnh + Đi cả tiệc quẩy trưa',
        attendance: 'yes',
        wish: '',
        theme: currentTheme
      })
      setWishAuthor(trimmed)
    }

    const newUrl = `${window.location.pathname}?guest=${encodeURIComponent(trimmed)}`
    window.history.pushState({ path: newUrl }, '', newUrl)
  }

  return (
    <>
      {/* Confetti Physics Engine Canvas */}
      <ConfettiCanvas ref={confettiRef} />

      {/* Floating Audio BGM Player */}
      <AudioPlayer />

      {/* Opening Envelope 3D Modal */}
      <EnvelopeModal
        graduateName={hostData.graduateName}
        year="2026"
        initialGuestName={currentGuest ? currentGuest.name : ''}
        onOpen={handleEnvelopeOpen}
        onTriggerConfetti={triggerConfetti}
      />

      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 shadow-md">
        <div className="h-16 max-w-[860px] mx-auto px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary shadow-inner">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-label-caps text-[9px] uppercase text-primary tracking-widest leading-tight">
                Lễ Tốt Nghiệp • 2026
              </span>
              <span className="font-subheading-serif text-subheading-serif text-on-surface font-semibold leading-tight">
                {hostData.graduateName}'s Day
              </span>
            </div>
          </div>

          <nav
            ref={navRef}
            className="hidden md:flex items-center p-1 bg-surface-container-low rounded-xl relative"
          >
            {/* Sliding pill — iOS-style */}
            {pillStyle.width > 0 && (
              <span
                className="absolute top-1 bottom-1 rounded-lg bg-primary-container shadow-sm pointer-events-none"
                style={{
                  left: pillStyle.left,
                  width: pillStyle.width,
                  transition: 'left 280ms cubic-bezier(0.34,1.56,0.64,1), width 280ms cubic-bezier(0.34,1.56,0.64,1)',
                }}
              />
            )}
            {[
              { id: 'invitation',   label: 'Thiệp Mời' },
              { id: 'itinerary',    label: 'Lịch Trình' },
              { id: 'map-guide',    label: 'Sơ Đồ' },
              { id: 'rsvp-section', label: 'Xác Nhận RSVP' },
            ].map(({ id, label }, i) => (
              <a
                key={id}
                ref={el => tabRefs.current[i] = el}
                href={`#${id}`}
                onClick={() => {
                  setActiveNav(id)
                  manualNavLock.current = true
                  setTimeout(() => { manualNavLock.current = false }, 1200)
                }}
                className={`relative z-10 px-space-md py-1 font-button-text text-xs rounded-lg select-none
                  transition-colors duration-200 ${
                  activeNav === id
                    ? 'text-on-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-space-xs">
            <button
              onClick={handleCopyShareLink}
              className="px-space-sm py-1.5 bg-primary-container/20 border border-primary/40 hover:bg-primary-container/30 text-primary font-button-text text-xs rounded-full flex items-center gap-1.5 transition-all active:scale-95"
              title="Sao chép link gửi cho bạn bè"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chia Sẻ Link</span>
            </button>

            <button
              onClick={() => setIsHostOpen(true)}
              className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-primary transition-colors active:scale-95"
              title="Cài đặt thông tin cử nhân (Host)"
            >
              <Settings className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="w-full pt-20 bg-background flex-1 flex flex-col justify-center">
        <div className="flex flex-col w-full relative overflow-hidden selection:bg-primary selection:text-on-primary">
          
          {/* Ambient Glow Effects */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
          <div className="absolute top-[900px] right-0 w-[500px] h-[500px] bg-secondary-container/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          <div className="absolute top-[1800px] left-[-100px] w-[600px] h-[600px] bg-primary-container/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>

          {/* Luxury Toast Notification */}
          {toast.show && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-surface-container-lowest/95 backdrop-blur-2xl border border-primary/50 text-on-surface font-body-sm text-xs md:text-sm px-space-lg py-2.5 rounded-full shadow-[0_0_35px_rgba(212,175,55,0.35)] flex items-center gap-2.5 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-on-surface">{toast.message}</span>
            </div>
          )}

          {/* Content Max Container (Desktop 860px / Mobile responsive) */}
          <div className="w-full max-w-[860px] mx-auto px-gutter py-space-xl flex flex-col gap-space-3xl" id="invitation">
            
            {/* 1. Hero Banner */}
            <section className="flex flex-col items-center text-center relative pt-space-md">
              <div className="relative mb-space-lg group">
                <div className="w-24 h-24 rounded-full border-2 border-primary/60 bg-surface-container-lowest flex items-center justify-center p-[2px] shadow-2xl shadow-primary/20 transition-transform duration-500 hover:scale-105">
                  <div className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                    <GraduationCap className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-space-sm py-[2px] bg-surface-container-lowest border border-primary/60 text-primary font-label-caps text-label-caps uppercase rounded-full shadow-md tracking-widest whitespace-nowrap">
                  Graduation Squad Pass
                </div>
              </div>

              <span className="font-label-caps text-label-caps uppercase text-primary tracking-[0.3em] mb-space-xs">
                Lời Mời Chung Vui • Graduation Celebration with Friends
              </span>

              <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight max-w-2xl leading-none mb-space-sm">
                Tớ Chính Thức <span className="italic text-primary font-subheading-serif font-normal block sm:inline">Tốt Nghiệp</span>
              </h1>

              <p className="font-subheading-serif text-subheading-serif text-on-surface-variant max-w-xl mb-space-sm">
                Hành trình thanh xuân rực rỡ sẽ không thể trọn vẹn nếu thiếu sự có mặt của cậu!
              </p>

              <p className="font-body-sm text-body-sm text-outline max-w-lg mb-space-xl">
                Hãy cùng tớ lưu giữ khoảnh khắc tung mũ cử nhân, chụp những bức ảnh 'sống ảo' để đời và quẩy hết mình tại buổi tiệc sau lễ nhé!
              </p>

              <div className="flex flex-wrap items-center justify-center gap-space-md w-full">
                <button
                  onClick={(e) => triggerConfetti(e.clientX, e.clientY)}
                  id="confetti-btn"
                  className="px-space-xl py-space-sm bg-primary text-on-primary font-button-text text-button-text rounded-xl shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-space-xs"
                >
                  <PartyPopper className="w-4 h-4" />
                  Bắn Pháo Hoa Chúc Mừng
                </button>

                <button
                  onClick={toggleFlipCard}
                  className="px-space-xl py-space-sm bg-surface-container-high hover:bg-surface-bright text-primary font-button-text text-button-text rounded-xl shadow-md transition-all flex items-center justify-center gap-space-xs active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  Lật Mặt Thiệp / Nhắn Gửi Hội Bạn
                </button>
              </div>
            </section>

            {/* 2. Countdown Clock */}
            <CountdownTimer targetDateStr="2026-09-19T10:00:00" />

            {/* 3. Interactive 3D Graduation Envelope & Card */}
            <InteractiveCard ref={interactiveCardRef} hostData={hostData} onTriggerConfetti={triggerConfetti} />

            {/* 4. Personalized VIP Ticket Card (Renders if guest is logged or param present) */}
            {currentGuest && (
              <VipTicketCard
                guestInfo={currentGuest}
                hostData={hostData}
                wishes={wishes}
                onResetGuest={() => setCurrentGuest(null)}
                onTriggerConfetti={triggerConfetti}
              />
            )}

            {/* 5. Ceremonial Itinerary (Timeline) */}
            <section className="flex flex-col gap-space-xl" id="itinerary">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest block mb-space-2xs">
                    Friend's Schedule &amp; Party Plan
                  </span>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">
                    Lịch Trình Chung Vui Cùng Bạn Bè
                  </h3>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Có mặt đúng 10:00 để có ảnh check-in ánh sáng đẹp nhất nhé!
                </span>
              </div>

              <div className="relative pl-6 md:pl-8 space-y-space-xl before:absolute before:left-[11px] md:before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary before:via-outline-variant before:to-transparent">
                
                {/* Step 1: Lễ tốt nghiệp */}
                <div className="relative flex flex-col sm:flex-row sm:items-baseline gap-space-sm sm:gap-space-lg group">
                  <div className="absolute -left-6 md:-left-8 top-1.5 w-6 h-6 md:w-7 md:h-7 rounded-full border border-primary/60 bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="sm:w-32 shrink-0">
                    <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
                      07:30 — 10:00
                    </span>
                    <span className="block font-body-sm text-body-sm text-outline">
                      Đại Sảnh Hội Trường
                    </span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-space-md flex-1 group-hover:bg-surface-container transition-colors shadow-md">
                    <div className="flex items-center justify-between mb-space-2xs">
                      <h4 className="font-subheading-serif text-subheading-serif text-on-surface font-semibold">
                        Hồ Văn Phát Làm Lễ Tốt Nghiệp
                      </h4>
                      <span className="px-space-xs py-[2px] border border-primary/40 text-primary bg-transparent font-label-caps text-[9px] uppercase font-bold rounded">
                        Nghi Thức Trọng Thể
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Nghi lễ trao bằng tốt nghiệp trang trọng tại hội trường chính trường Đại học Nguyễn Tất Thành.
                    </p>
                  </div>
                </div>

                {/* Step 2: Check-in cùng bạn bè */}
                <div className="relative flex flex-col sm:flex-row sm:items-baseline gap-space-sm sm:gap-space-lg group">
                  <div className="absolute -left-6 md:-left-8 top-1.5 w-6 h-6 md:w-7 md:h-7 rounded-full bg-surface-container-lowest border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                  </div>
                  <div className="sm:w-32 shrink-0">
                    <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
                      10:00 — 11:00
                    </span>
                    <span className="block font-body-sm text-body-sm text-tertiary">
                      Sảnh Hoa &amp; Photo-booth
                    </span>
                  </div>
                  <div className="bg-surface-container rounded-xl p-space-md flex-1 shadow-lg shadow-surface-container-lowest/50 border border-primary/30">
                    <div className="flex items-center justify-between mb-space-2xs">
                      <h4 className="font-subheading-serif text-subheading-serif text-primary font-bold">
                        Check-in Cùng Các Bạn Nhé!
                      </h4>
                      <div className="flex items-center gap-1">
                        <Camera className="w-4 h-4 text-primary" />
                        <span className="px-space-xs py-[2px] border border-primary/60 text-primary bg-transparent font-label-caps text-[9px] uppercase font-bold rounded">
                          Khoảnh Khắc Đẹp Nhất
                        </span>
                      </div>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                      Tặng hoa, nhận quà kỷ niệm nhỏ xinh từ Phát và chụp những tấm hình sống ảo cực chất cùng hội bạn thân tại Backdrop hoa tươi.
                    </p>
                  </div>
                </div>

                {/* Step 3: Quẩy hết ga hết số */}
                <div className="relative flex flex-col sm:flex-row sm:items-baseline gap-space-sm sm:gap-space-lg group">
                  <div className="absolute -left-6 md:-left-8 top-1.5 w-6 h-6 md:w-7 md:h-7 rounded-full bg-surface-container-lowest border-2 border-primary/80 flex items-center justify-center text-primary">
                    <PartyPopper className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="sm:w-32 shrink-0">
                    <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
                      11:00 — Hết Ga Hết Số
                    </span>
                    <span className="block font-body-sm text-body-sm text-outline">
                      Tiệc Tùng Quẩy Trưa
                    </span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-space-md flex-1 group-hover:bg-surface-container transition-colors shadow-md">
                    <div className="flex items-center justify-between mb-space-2xs">
                      <h4 className="font-subheading-serif text-subheading-serif text-on-surface font-semibold">
                        After-Party &amp; Quẩy Cùng Homies
                      </h4>
                      <PartyPopper className="w-4 h-4 text-primary" />
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Ăn trưa thịnh soạn, nâng ly chúc mừng chặng đường mới, ôn lại chuyện xưa và quẩy hết ga hết số cùng cả nhóm!
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* 6. Blueprint & Hall Layout */}
            <section className="bg-surface-container-low rounded-xl p-card-padding-mobile md:p-space-xl shadow-xl flex flex-col gap-space-lg" id="map-guide">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-xs">
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest block">
                    Friend's Map &amp; Check-in Guide
                  </span>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">
                    Sơ Đồ Đón Tiếp &amp; Góc Chụp Đẹp Nhất
                  </h3>
                </div>
                <div className="flex items-center gap-space-md">
                  <div className="flex items-center gap-space-2xs font-body-sm text-body-sm text-on-surface-variant">
                    <span className="w-3 h-3 rounded bg-primary inline-block"></span> Điểm tập kết bạn bè (Booth A1)
                  </div>
                  <div className="flex items-center gap-space-2xs font-body-sm text-body-sm text-on-surface-variant">
                    <span className="w-3 h-3 rounded bg-surface-container-highest inline-block"></span> Khu vực chờ máy lạnh
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col items-center gap-space-lg relative overflow-hidden">
                <div className="w-full md:w-3/4 py-space-xs bg-surface-container-high rounded-full text-center text-primary font-label-caps text-label-caps uppercase tracking-widest shadow-inner">
                  • KHU VỰC SẢNH CHÍNH &amp; PHOTO-BOOTH HOA TƯƠI •
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md w-full max-w-2xl">
                  <div className="p-space-md bg-surface-container-low rounded-xl border border-primary/30 flex flex-col items-center text-center">
                    <Sparkles className="w-7 h-7 text-primary mb-space-2xs" />
                    <h5 className="font-subheading-serif text-on-surface font-semibold">Photo-Booth Hoa Tươi</h5>
                    <p className="font-body-sm text-body-sm text-outline">Có sẵn hoa tươi, bảng cầm tay check-in cute &amp; thợ ảnh túc trực chụp riêng cho từng người!</p>
                  </div>

                  <div 
                    onClick={() => setIsMapModalOpen(true)}
                    className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant hover:border-primary/50 transition-colors flex flex-col items-center text-center cursor-pointer group"
                    title="Bấm để xem hướng dẫn bãi đỗ xe"
                  >
                    <Car className="w-7 h-7 text-primary mb-space-2xs group-hover:scale-110 transition-transform" />
                    <h5 className="font-subheading-serif text-on-surface font-semibold flex items-center gap-1">
                      Bãi Gửi Xe <span className="text-primary text-xs">↗</span>
                    </h5>
                    <p className="font-body-sm text-body-sm text-outline">Rẽ từ Đỗ Mười (QL1) vào cổng trường NTTU vào thẳng hầm xe. Bấm xem sơ đồ.</p>
                  </div>

                  <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant flex flex-col items-center text-center">
                    <Utensils className="w-7 h-7 text-primary mb-space-2xs" />
                    <h5 className="font-subheading-serif text-on-surface font-semibold">Địa Điểm Tiệc Trưa</h5>
                    <p className="font-body-sm text-body-sm text-outline">Sau khi chụp ảnh cùng Phát, cả nhóm sẽ tập trung di chuyển sang quán tiệc.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-space-sm pt-space-xs">
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="px-space-lg py-space-xs bg-primary text-on-primary font-button-text text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Navigation className="w-4 h-4" />
                    Chỉ Đường Đến Bãi Đỗ Xe (Xem Sơ Đồ)
                  </button>

                  {hostData.address ? (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(hostData.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-space-lg py-space-xs bg-surface-container-high hover:bg-surface-bright text-primary font-button-text text-xs rounded-lg flex items-center gap-1.5 shadow"
                    >
                      <Map className="w-4 h-4" />
                      Mở Google Maps Hội Trường
                    </a>
                  ) : null}
                </div>

              </div>
            </section>

            {/* 7. RSVP & Golden Guestbook Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-space-xl" id="rsvp-section">
              
              {/* RSVP Form */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-xl border border-primary/20">
                <div>
                  <div className="flex items-center gap-space-xs mb-space-2xs">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider">
                      Điểm Danh Bạn Thân
                    </span>
                  </div>

                  <h3 className="font-headline-md text-headline-md text-on-surface mb-space-md">
                    Xác Nhận Có Mặt Chung Vui
                  </h3>

                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-lg">
                    Điểm danh sớm trước ngày 15/09 để tớ đặt bàn tiệc After-party chu đáo và chuẩn bị hoa/quà lưu niệm riêng cho cậu nhé!
                  </p>

                  <form onSubmit={handleRsvpSubmit} className="space-y-space-md">
                    <div>
                      <label className="font-label-caps text-label-caps uppercase text-on-surface-variant block mb-space-2xs">
                        Biệt Danh / Tên Của Cậu *
                      </label>
                      <input
                        type="text"
                        value={rsvpForm.name}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                        placeholder="VD: Linh Bùi / Hoàng 'Đầu Gấu'"
                        className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>

                    <div className={`grid gap-space-sm ${rsvpForm.attendance === 'no' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      <div>
                        <label className="font-label-caps text-label-caps uppercase text-on-surface-variant block mb-space-2xs">
                          Số Điện Thoại / Zalo
                        </label>
                        <input
                          type="tel"
                          value={rsvpForm.phone}
                          onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                          placeholder="09xx xxx xxx"
                          className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      {rsvpForm.attendance === 'yes' && (
                        <div>
                          <label className="font-label-caps text-label-caps uppercase text-on-surface-variant block mb-space-2xs">
                            Kế Hoạch Tham Dự
                          </label>
                          <select
                            value={rsvpForm.plan}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, plan: e.target.value })}
                            className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="Chụp ảnh + Đi cả tiệc quẩy trưa">Chụp ảnh + Đi cả tiệc quẩy trưa</option>
                            <option value="Chỉ kịp ghé chụp ảnh check-in">Chỉ kịp ghé chụp ảnh check-in</option>
                            <option value="Dẫn theo người yêu (+1)">Dẫn theo người yêu (+1)</option>
                            <option value="Mang theo bụng đói ăn sập tiệc">Mang theo bụng đói ăn sập tiệc</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-label-caps text-label-caps uppercase text-on-surface-variant block mb-space-2xs">
                        Tình Trạng Có Mặt
                      </label>
                      <div className="grid grid-cols-2 gap-space-xs">
                        <label className={`flex items-center gap-space-xs p-space-xs rounded-lg cursor-pointer transition-colors ${
                          rsvpForm.attendance === 'yes' ? 'bg-primary-container text-on-primary-container font-bold' : 'bg-surface-container hover:bg-surface-container-high'
                        }`}>
                          <input
                            type="radio"
                            name="attendance"
                            value="yes"
                            checked={rsvpForm.attendance === 'yes'}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                            className="accent-primary"
                          />
                          <span className="font-body-sm text-body-sm">Chắc chắn có mặt! 🥳</span>
                        </label>

                        <label className={`flex items-center gap-space-xs p-space-xs rounded-lg cursor-pointer transition-colors ${
                          rsvpForm.attendance === 'no' ? 'bg-primary-container text-on-primary-container font-bold' : 'bg-surface-container hover:bg-surface-container-high'
                        }`}>
                          <input
                            type="radio"
                            name="attendance"
                            value="no"
                            checked={rsvpForm.attendance === 'no'}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}
                            className="accent-primary"
                          />
                          <span className="font-body-sm text-body-sm">Tiếc quá, vắng mặt 😭</span>
                        </label>
                      </div>
                    </div>

                    {/* Lý do vắng mặt / Lời chúc tương ứng */}
                    <div>
                      <label className="font-label-caps text-label-caps uppercase text-on-surface-variant block mb-space-2xs">
                        {rsvpForm.attendance === 'no' ? 'Lý Do Không Thể Tham Gia & Lời Nhắn Gửi' : 'Lời Chúc / Nhắn Gửi Cho Tân Cử Nhân'}
                      </label>
                      <textarea
                        value={rsvpForm.wish}
                        onChange={(e) => setRsvpForm({ ...rsvpForm, wish: e.target.value })}
                        placeholder={
                          rsvpForm.attendance === 'no'
                            ? "VD: Tiếc quá đợt này tớ bận lịch thi/công tác..."
                            : "VD: Chúc mừng bro tốt nghiệp xuất sắc nhé!"
                        }
                        rows={2}
                        className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Chọn tông màu thiệp yêu thích của khách */}
                    <div>
                      <div className="flex items-center justify-between mb-space-2xs">
                        <label className="font-label-caps text-[10px] uppercase text-on-surface-variant flex items-center gap-1">
                          <Palette className="w-3 h-3 text-primary" />
                          Tông Màu Thiệp Yêu Thích Của Cậu
                        </label>
                        <span className="text-[10px] text-primary font-bold">
                          {THEMES.find(t => t.id === (rsvpForm.theme || hostData.theme || 'gold'))?.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5 p-1.5 bg-surface-container-highest rounded-lg">
                        {THEMES.map(t => {
                          const isCur = (rsvpForm.theme || hostData.theme || 'gold') === t.id
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setRsvpForm(prev => ({ ...prev, theme: t.id }))
                                applyTheme(t.id)
                                if (currentGuest) setCurrentGuest(prev => prev ? { ...prev, theme: t.id } : prev)
                              }}
                              title={t.name}
                              className={`h-7 rounded-md flex items-center justify-center transition-all cursor-pointer relative ${
                                isCur ? 'ring-2 ring-primary scale-105 shadow' : 'opacity-70 hover:opacity-100 hover:scale-105'
                              }`}
                              style={{ backgroundColor: t.primaryColor }}
                            >
                              {isCur && <Check className="w-3.5 h-3.5 text-black drop-shadow" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-space-sm bg-primary text-on-primary font-button-text text-button-text rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                      {rsvpForm.attendance === 'no' ? (
                        <>
                          <Send className="w-4 h-4" />
                          Gửi Phản Hồi Vắng Mặt &amp; Lời Chúc 💌
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Xác Nhận Giữ Chỗ &amp; Quẩy Tiệc 🎓
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Guestbook Stream */}
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-xl border border-primary/20">
                <div>
                  <div className="flex items-center gap-space-xs mb-space-2xs">
                    <FileEdit className="w-5 h-5 text-primary" />
                    <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider">
                      Bestie Guestbook
                    </span>
                  </div>

                  <h3 className="font-headline-md text-headline-md text-on-surface mb-space-md">
                    Lưu Bút &amp; Lời Chúc Của Hội Bạn
                  </h3>

                  {/* Wishes Stream */}
                  {wishes.length === 0 ? (
                    <div className="py-8 px-4 text-center text-outline font-body-sm text-xs bg-surface-container/40 rounded-lg border border-outline-variant/20 mb-space-md">
                      💌 Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc cho Tân Cử Nhân nhé!
                    </div>
                  ) : (
                    <div className="space-y-space-sm max-h-[260px] overflow-y-auto pr-space-xs mb-space-md">
                      {wishes.map((item, idx) => (
                        <div key={item.id || idx} className="p-space-sm bg-surface-container rounded-lg flex flex-col gap-[2px] border border-outline-variant/20 group hover:border-primary/40 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-label-caps text-primary font-bold text-xs">{item.author}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-body-sm text-outline text-[10px]">{item.time}</span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteWish(item.id, e)}
                                className="opacity-40 group-hover:opacity-100 text-outline hover:text-red-400 p-0.5 rounded transition-all cursor-pointer"
                                title="Xóa lời chúc này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed pr-2">
                            "{item.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Post Wish Form */}
                  <form onSubmit={handleSendWish} className="flex flex-col gap-space-xs">
                    <input
                      type="text"
                      value={wishAuthor}
                      onChange={(e) => setWishAuthor(e.target.value)}
                      placeholder="Tên hoặc biệt danh của cậu..."
                      className="w-full px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex gap-space-xs">
                      <input
                        type="text"
                        value={wishInput}
                        onChange={(e) => setWishInput(e.target.value)}
                        placeholder="Gửi lời nhắn / dặn dò tiệc tùng..."
                        className="flex-1 px-space-md py-space-xs bg-surface-container-highest rounded-lg text-on-surface font-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                      <button
                        type="submit"
                        className="px-space-md py-space-xs bg-surface-container-high hover:bg-surface-bright text-primary rounded-lg font-button-text flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

                <div className="pt-space-md flex items-center justify-between font-body-sm text-body-sm text-outline border-t border-outline-variant/20 mt-space-md">
                  <span>
                    Tổng số lời chúc: <strong className="text-primary">{wishes.length}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-tertiary">
                    <Heart className="w-3.5 h-3.5 fill-tertiary/20 text-tertiary" /> Yêu thương &amp; Tự hào
                  </span>
                </div>
              </div>

            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest py-space-2xl border-t border-outline-variant/30">
        <div className="max-w-[860px] mx-auto px-gutter flex flex-col md:flex-row items-center justify-between gap-space-lg text-center md:text-left">
          <div className="flex flex-col space-y-space-2xs">
            <span className="font-subheading-serif text-subheading-serif text-primary">
              {hostData.graduateName}'s Graduation Day 2026
            </span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Cảm ơn tất cả những người bạn tuyệt vời đã là một phần tươi đẹp trong hành trình đại học của tớ.
            </p>
          </div>

          <div className="flex flex-col md:items-end space-y-space-xs">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest">
              © 2026 {hostData.graduateName} &amp; Homies. Keep shining!
            </span>
            <div className="flex items-center space-x-space-md text-on-surface-variant">
              <a href="#map-guide" className="font-body-sm text-body-sm hover:text-primary transition-colors cursor-pointer">
                Xem Bản Đồ Đi Lại
              </a>
              <span className="text-outline">•</span>
              <button onClick={() => setIsHostOpen(true)} className="font-body-sm text-body-sm hover:text-primary transition-colors cursor-pointer">
                Cài Đặt Cử Nhân (Host)
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Quick Action Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/40 px-space-md py-space-xs shadow-2xl">
        <div className="max-w-[440px] mx-auto flex items-center gap-space-xs">
          <button
            onClick={(e) => triggerConfetti(e.clientX, e.clientY)}
            className="w-12 h-11 rounded-xl bg-surface-container-high hover:bg-surface-bright text-primary flex items-center justify-center active:scale-95 transition-transform shrink-0"
            title="Bắn pháo hoa"
          >
            <PartyPopper className="w-5 h-5" />
          </button>

          <button
            onClick={scrollToRsvp}
            className="flex-1 h-11 bg-primary text-on-primary font-button-text text-button-text rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-space-2xs active:scale-95 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            Điểm Danh Tham Gia (RSVP)
          </button>

          <button
            onClick={toggleFlipCard}
            className="w-12 h-11 rounded-xl bg-surface-container-high hover:bg-surface-bright text-primary flex items-center justify-center active:scale-95 transition-transform shrink-0"
            title="Lật thiệp"
          >
            <BookOpen className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Host Settings Drawer */}
      <HostSettingsDrawer
        isOpen={isHostOpen}
        onClose={() => setIsHostOpen(false)}
        hostData={hostData}
        onUpdateHostData={handleUpdateHostData}
        rsvpList={rsvpList}
        onDeleteRsvp={handleDeleteRsvp}
        onTriggerConfetti={triggerConfetti}
      />

      {/* Parking Map Modal Popup */}
      {isMapModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md transition-all duration-300"
          onClick={() => setIsMapModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-surface-container-lowest rounded-2xl overflow-hidden border border-primary/50 shadow-[0_0_50px_rgba(212,175,55,0.25)] flex flex-col animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="font-label-caps text-xs uppercase text-primary tracking-wider font-bold">
                  Sơ Đồ Đường Đi &amp; Bãi Đỗ Xe
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
                title="Đóng sơ đồ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Map Image Viewport */}
            <div className="relative w-full bg-black/60 overflow-auto flex items-center justify-center p-2 sm:p-4 max-h-[55vh] sm:max-h-[65vh]">
              <img
                src="/parking-map.png"
                alt="Sơ đồ chi tiết đường đi bãi đỗ xe"
                className="w-full h-auto object-contain rounded-lg max-h-[50vh] sm:max-h-[60vh]"
              />
            </div>

            {/* Instruction & Action Section below image (Never covers the map) */}
            <div className="p-3.5 sm:p-4 bg-surface-container-low border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-start sm:items-center gap-2.5">
                <span className="text-xl shrink-0 mt-0.5 sm:mt-0">📍</span>
                <div className="flex flex-col">
                  <span className="font-headline-md text-xs sm:text-sm text-on-surface font-bold">
                    Hướng dẫn đường đi:
                  </span>
                  <span className="font-body-sm text-[11.5px] sm:text-xs text-on-surface-variant font-medium leading-relaxed">
                    Rẽ từ đường Đỗ Mười (QL1) vào cổng trường đại học Nguyễn Tất Thành cơ sở 331A–331B An Phú Đông 10 để vào thẳng hầm xe của trường.
                  </span>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Đỗ+Mười%2F331A-331B+An+Phú+Đông+10%2C+An+Phú+Đông%2C+Hồ+Chí+Minh"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-gradient-to-r from-primary to-amber-500 text-on-primary text-xs font-button-text font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-lg shadow-primary/25"
              >
                <span>Mở Google Maps</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Custom Luxury Confirmation Modal */}
      {confirmModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fadeIn"
          onClick={closeConfirmModal}
        >
          <div
            className="relative max-w-sm w-full bg-surface-container-low border border-primary/40 rounded-2xl p-space-lg shadow-[0_0_50px_rgba(212,175,55,0.25)] flex flex-col items-center text-center gap-space-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center text-red-400 mb-1 shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="font-subheading-serif text-lg text-on-surface font-semibold">
              {confirmModal.title || 'Xác Nhận Xóa'}
            </h4>

            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mb-space-xs">
              {confirmModal.message || 'Bạn có chắc chắn muốn thực hiện thao tác này không?'}
            </p>

            <div className="flex items-center gap-space-xs w-full pt-space-2xs">
              <button
                type="button"
                onClick={closeConfirmModal}
                className="flex-1 py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-button-text text-xs transition-all active:scale-95 cursor-pointer border border-outline-variant/30"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm()
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-button-text text-xs font-bold transition-all shadow-lg shadow-red-500/30 active:scale-95 cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Contact Badge Widget (Bottom-Right) */}
      <ContactFloatingWidget hostData={hostData} />
    </>
  )
}
