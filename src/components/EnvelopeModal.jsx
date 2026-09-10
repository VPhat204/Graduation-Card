import { useState } from 'react'
import { GraduationCap, MailOpen } from 'lucide-react'

export default function EnvelopeModal({
  graduateName = "Hồ Văn Phát",
  year = "2026",
  initialGuestName = "",
  onOpen,
  onTriggerConfetti
}) {
  const [guestNameInput, setGuestNameInput] = useState(initialGuestName)
  const [isOpen, setIsOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  const handleSubmitName = (e) => {
    if (e) e.preventDefault()
    const finalName = guestNameInput.trim() || "Khách Quý"
    
    setIsOpen(true)
    if (onTriggerConfetti) onTriggerConfetti()

    setTimeout(() => {
      setIsHidden(true)
      if (onOpen) onOpen(finalName)
    }, 1000)
  }

  if (isHidden) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-700 ${
      isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <div
        className={`relative w-full max-w-lg bg-gradient-to-b from-[#1c2541] to-[#0b132b] rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-primary/40 text-center transform transition-all duration-700 overflow-hidden ${
          isOpen ? 'scale-110 -translate-y-12' : 'scale-100'
        }`}
      >
        {/* Decorative Gold Foil Pattern Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-primary/60 bg-surface-container-lowest/50 flex items-center justify-center text-primary shadow-xl shadow-primary/20 hover:rotate-12 transition-transform duration-500">
            <GraduationCap className="w-11 h-11" strokeWidth={1.75} />
          </div>

          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps uppercase text-primary tracking-[0.3em]">
              TRÂN TRỌNG KÍNH MỜI DỰ
            </span>
            <h2 className="font-headline-lg text-3xl md:text-4xl text-on-surface font-bold tracking-tight mt-1">
              Lễ Tốt Nghiệp {year}
            </h2>
            <span className="font-subheading-serif text-lg text-primary italic mt-1">
              Tân Cử Nhân {graduateName || "Hồ Văn Phát"}
            </span>
          </div>

          {/* Form Điền Tên Trước */}
          <form onSubmit={handleSubmitName} className="w-full max-w-md flex flex-col gap-3 my-2 bg-surface-container-lowest/80 p-4 rounded-xl border border-primary/30 shadow-inner">
            <label className="font-label-caps text-[11px] uppercase text-primary tracking-wider font-bold block text-center">
              ✍️ Vui Lòng Nhập Tên Hoặc Biệt Danh Của Bạn:
            </label>

            <input
              type="text"
              value={guestNameInput}
              onChange={(e) => setGuestNameInput(e.target.value)}
              placeholder="Ví dụ: Linh Bùi / Tuấn Anh..."
              className="w-full px-4 py-2.5 bg-surface-container-highest rounded-lg text-on-surface font-body-md text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/40"
              autoFocus
              required
            />

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary via-primary-container to-tertiary text-on-primary font-button-text text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <MailOpen className="w-5 h-5" />
              MỞ THIỆP MỜI CÁ NHÂN HÓA
            </button>
          </form>

          <p className="font-body-sm text-[11px] text-outline italic">
            Điền tên của bạn để tạo Tấm Vé VIP danh dự &amp; xem thiệp dành riêng cho bạn!
          </p>
        </div>
      </div>
    </div>
  )
}
