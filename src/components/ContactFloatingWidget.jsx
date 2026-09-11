import { useState, useRef, useEffect } from 'react'
import { Phone, X, Check, Copy, UserCheck, ChevronUp, QrCode, ExternalLink } from 'lucide-react'

export default function ContactFloatingWidget({
  hostData = {}
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef(null)

  const phone = hostData.phone || "0944788931"
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const zaloUrl = hostData.zaloUrl || `https://zalo.me/${cleanPhone || '0944788931'}`
  const facebookUrl = hostData.facebookUrl || "https://www.facebook.com/hg.bin.52"
  const graduateName = hostData.graduateName || "Hồ Văn Phát"
  const zaloQrImage = hostData.zaloQrUrl || "/zalo-qr.png"

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
    <>
      {/* Mobile: icon-only badge above sticky bar | Desktop: full badge at bottom-right */}
      <div ref={menuRef} className="fixed bottom-20 md:bottom-5 right-4 md:right-5 z-40 flex flex-col items-end">
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
              className="w-7 h-7 rounded-full bg-surface-container-highest/60 hover:bg-surface-container-highest flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
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
                className="p-2 rounded-lg bg-surface-container-high/60 hover:bg-primary/20 text-outline hover:text-primary transition-colors text-xs flex items-center gap-1 cursor-pointer"
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

            {/* Zalo Button + QR Code Option */}
            <div className="flex items-center justify-between p-2.5 bg-surface-container-lowest/80 rounded-xl border border-outline-variant/30 hover:border-blue-400/50 hover:bg-blue-950/20 transition-all">
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-left flex-1 group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
                  Zalo
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-outline font-medium">Zalo Cá Nhân</span>
                  <span className="text-xs font-bold text-on-surface group-hover:text-blue-300 transition-colors">
                    {phone}
                  </span>
                </div>
              </a>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  title="Quét mã QR Zalo"
                  className="px-2 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Mã QR</span>
                </button>
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mở nhắn tin Zalo"
                  className="p-1.5 rounded-lg bg-surface-container-high/60 hover:bg-blue-600/20 text-outline hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

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
                    Hồ Văn Phát
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
            Bấm để gọi điện, quét mã QR hoặc nhắn tin trực tiếp
          </p>
        </div>

        {/* Main Floating Trigger Badge Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center gap-2 rounded-full border shadow-xl transition-all duration-300 cursor-pointer
            px-3.5 py-2.5 md:px-3.5 md:py-2.5
            ${
            isOpen
              ? 'bg-gradient-to-r from-primary to-amber-500 text-on-primary border-white/40 scale-105 shadow-primary/40'
              : 'bg-surface-container-lowest/90 hover:bg-surface-container-low text-on-surface border-primary/50 hover:border-primary shadow-black/60 hover:shadow-primary/30 hover:scale-105'
          }`}
          title="Liên hệ với Tân Cử Nhân (SĐT / Zalo / Facebook)"
        >
          {/* Pulsing ring indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>

          {/* Phone Icon */}
          <div className="flex items-center text-primary group-hover:text-primary transition-colors">
            <Phone className={`w-4 h-4 group-hover:rotate-12 transition-transform`} />
          </div>

          {/* Text — hidden on mobile, visible on desktop */}
          <span className="hidden md:inline font-button-text text-xs font-bold tracking-wide">
            Liên Hệ
          </span>

          <ChevronUp className={`hidden md:inline w-3.5 h-3.5 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180 text-on-primary' : ''}`} />
        </button>
      </div>

      {/* Modal Xem Mã QR Zalo */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative max-w-sm w-full bg-gradient-to-b from-[#182647] to-[#0c1324] border border-primary/50 rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-highest/60 hover:bg-surface-container-highest flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="font-label-caps text-[11px] uppercase text-primary tracking-widest font-bold">
              Danh Thiếp Zalo
            </span>
            <h3 className="font-headline-md text-lg text-on-surface font-bold">
              {graduateName}
            </h3>

            {/* QR Image Frame */}
            <div className="p-2 bg-white rounded-2xl shadow-xl border-2 border-primary/40 my-1 max-w-[280px]">
              <img
                src={zaloQrImage}
                alt="Mã QR Zalo Hồ Văn Phát"
                className="w-full h-auto rounded-xl object-contain"
              />
            </div>

            <p className="text-xs text-outline leading-relaxed">
              Mở app Zalo trên điện thoại hoặc camera để quét mã kết bạn trực tiếp với Tân Cử Nhân.
            </p>

            <div className="flex items-center gap-2 w-full pt-1">
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-button-text text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                Mở Chat Zalo
              </a>
              <button
                onClick={() => setShowQrModal(false)}
                className="py-2.5 px-4 bg-surface-container-high hover:bg-surface-bright text-on-surface font-button-text text-xs rounded-xl border border-outline-variant/30 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
