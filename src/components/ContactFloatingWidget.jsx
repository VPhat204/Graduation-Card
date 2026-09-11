import { useState, useRef, useEffect } from 'react'
import { Phone, MessageCircle, X, Check, Copy, UserCheck, ChevronUp } from 'lucide-react'

export default function ContactFloatingWidget({
  hostData = {}
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef(null)

  const phone = hostData.phone || "0901234567"
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const zaloUrl = hostData.zaloUrl || `https://zalo.me/${cleanPhone || '0901234567'}`
  const facebookUrl = hostData.facebookUrl || "https://facebook.com"
  const graduateName = hostData.graduateName || "Hồ Văn Phát"

  const handleCopyPhone = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={menuRef} className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Contact Popover Card */}
      <div
        className={`mb-3 w-72 sm:w-80 bg-gradient-to-b from-[#182647]/95 via-[#0e172e]/98 to-[#090e1c]/98 backdrop-blur-xl border border-primary/50 rounded-2xl shadow-2xl shadow-black/80 p-4 transition-all duration-300 origin-bottom-right transform ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto'
            : 'scale-90 opacity-0 translate-y-4 pointer-events-none absolute bottom-12 right-0'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-primary/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-label-caps text-[10px] uppercase text-primary tracking-widest block">
                Liên Hệ Trực Tiếp
              </span>
              <h4 className="font-headline-md text-sm font-bold text-on-surface">
                {graduateName}
              </h4>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-full bg-surface-container-highest/60 hover:bg-surface-container-highest flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contact List */}
        <div className="flex flex-col gap-2.5 mt-3">
          {/* Phone / Hotline */}
          <div className="flex items-center justify-between p-2.5 bg-surface-container-lowest/80 rounded-xl border border-outline-variant/30 hover:border-primary/40 transition-colors">
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 flex-1 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-outline font-medium">Gọi điện thoại</span>
                <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors tracking-wide">
                  {phone}
                </span>
              </div>
            </a>

            <button
              onClick={handleCopyPhone}
              title="Sao chép số điện thoại"
              className="p-2 rounded-lg bg-surface-container-high/60 hover:bg-primary/20 text-outline hover:text-primary transition-colors text-xs flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-semibold">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Chép</span>
                </>
              )}
            </button>
          </div>

          {/* Zalo Button */}
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 bg-surface-container-lowest/80 rounded-xl border border-outline-variant/30 hover:border-blue-400/50 hover:bg-blue-950/20 transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
                Zalo
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-outline font-medium">Nhắn tin Zalo</span>
                <span className="text-xs font-bold text-on-surface group-hover:text-blue-300 transition-colors">
                  Chat qua Zalo
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
              Mở app ❯
            </span>
          </a>

          {/* Facebook Button */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 bg-surface-container-lowest/80 rounded-xl border border-outline-variant/30 hover:border-sky-400/50 hover:bg-sky-950/20 transition-all group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-700/30 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-outline font-medium">Facebook Cá Nhân</span>
                <span className="text-xs font-bold text-on-surface group-hover:text-sky-300 transition-colors">
                  Kết nối Facebook
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-md">
              Truy cập ❯
            </span>
          </a>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-outline text-center mt-3 pt-2 border-t border-outline-variant/20 italic">
          Bấm để gọi điện hoặc nhắn tin trực tiếp cho Tân Cử Nhân
        </p>
      </div>

      {/* Main Floating Trigger Badge Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full border shadow-xl transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-gradient-to-r from-primary to-amber-500 text-on-primary border-white/40 scale-105 shadow-primary/40'
            : 'bg-surface-container-lowest/90 hover:bg-surface-container-low text-on-surface border-primary/50 hover:border-primary shadow-black/60 hover:shadow-primary/30 hover:scale-105'
        }`}
        title="Liên hệ với Tân Cử Nhân (SĐT / Zalo / Facebook)"
      >
        {/* Pulsing ring indicator */}
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>

        {/* Icons */}
        <div className="flex items-center gap-1 text-primary group-hover:text-primary transition-colors">
          <Phone className="w-4 h-4" />
          <MessageCircle className="w-4 h-4" />
        </div>

        <span className="font-button-text text-xs font-bold tracking-wide">
          Liên Hệ
        </span>

        <ChevronUp className={`w-3.5 h-3.5 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180 text-on-primary' : ''}`} />
      </button>
    </div>
  )
}
