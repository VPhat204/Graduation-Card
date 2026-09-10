import { useState } from 'react'
import { Award, Share2, Check, CalendarPlus } from 'lucide-react'

export default function VipTicketCard({ guestInfo, hostData, wishes = [], onResetGuest, onTriggerConfetti }) {
  const [copied, setCopied] = useState(false)

  // Tìm lời chúc của khách từ "Lưu Bút & Lời Chúc Của Hội Bạn"
  const guestbookWish = wishes.find(
    (w) => w.author && guestInfo?.name &&
      w.author.trim().toLowerCase() === guestInfo.name.trim().toLowerCase()
  )
  const displayWish = guestbookWish?.text || guestInfo?.wish

  if (!guestInfo || !guestInfo.name) return null

  const shareUrl = `${window.location.origin}${window.location.pathname}?guest=${encodeURIComponent(guestInfo.name)}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    if (onTriggerConfetti) onTriggerConfetti()
    setTimeout(() => setCopied(false), 2500)
  }

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`Lễ Tốt Nghiệp của ${hostData.graduateName}`)
    const details = encodeURIComponent(`Đến tham dự & chụp ảnh chúc mừng ${hostData.graduateName} nhân dịp tốt nghiệp. Dresscode: ${hostData.dressCode}`)
    const location = encodeURIComponent(hostData.venue)
    // Date: 19/09/2026 at 10:00 AM (03:00 AM UTC)
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=20260919T030000Z/20260919T060000Z`
    window.open(gCalUrl, '_blank')
  }

  // Generate dynamic QR Code path SVG simulation for guest check-in
  const qrSeed = guestInfo.name.length + (guestInfo.phone ? guestInfo.phone.length : 5)

  return (
    <section className="bg-gradient-to-br from-surface-container-low via-surface-container-high to-surface-container-lowest rounded-2xl p-card-padding-mobile md:p-space-xl shadow-2xl border-2 border-primary/40 relative overflow-hidden my-space-lg transform transition-all hover:border-primary/60">
      {/* Decorative Gold Glow & Corner Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="absolute top-4 left-4 text-primary/60 font-headline-lg select-none">✦</div>
      <div className="absolute top-4 right-4 text-primary/60 font-headline-lg select-none">✦</div>

      <div className="relative z-10 flex flex-col gap-space-md">
        {/* Header Pass Badge */}
        <div className="flex flex-wrap items-center justify-between gap-space-xs border-b border-primary/20 pb-space-sm">
          <div className="flex items-center gap-space-xs">
            <div className="w-10 h-10 rounded-full border border-primary/60 bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-label-caps text-[9px] uppercase text-primary tracking-widest block">
                THẺ KHÁCH MỜI DỰ LỄ VIP
              </span>
              <span className="font-subheading-serif text-body-md font-semibold text-on-surface">
                Graduation VIP Invitation Pass
              </span>
            </div>
          </div>
          <span className="px-space-sm py-1 border border-primary/60 text-primary bg-surface-container-lowest font-label-caps text-[10px] font-bold uppercase rounded-full tracking-wider shadow-sm">
            {guestInfo.attendance === 'no' ? 'Vắng Mặt (Gửi Lời Chúc)' : 'CONFIRMED GUEST • CÓ MẶT'}
          </span>
        </div>

        {/* Guest Personalized Greeting */}
        <div className="bg-surface-container-lowest/80 rounded-xl p-space-md border border-primary/30 flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex flex-col text-center md:text-left">
            <span className="font-label-caps text-[10px] uppercase text-outline tracking-widest mb-1">
              Trân Trọng Kính Mời Bạn
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
              {guestInfo.name}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Đến dự Lễ Tốt Nghiệp của <strong className="text-on-surface">{hostData.graduateName}</strong>
            </p>
            {displayWish && (
              <div className="mt-3 p-space-xs bg-surface-container/80 rounded-lg border-l-2 border-primary text-left">
                <span className="font-label-caps text-[9px] uppercase text-primary block">
                  {guestbookWish ? 'Lời Chúc Từ Hội Bạn:' : 'Lời Chúc Đã Gửi:'}
                </span>
                <p className="font-body-sm text-[12px] text-on-surface-variant italic">
                  "{displayWish}"
                </p>
              </div>
            )}
          </div>

          {/* Simulated QR Code Check-in */}
          <div className="shrink-0 flex flex-col items-center bg-surface p-3 rounded-xl border border-outline-variant shadow-inner">
            <div className="w-24 h-24 bg-white p-1.5 rounded-lg flex items-center justify-center relative shadow">
              <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                <rect x="0" y="0" width="30" height="30" fill="currentColor"/>
                <rect x="5" y="5" width="20" height="20" fill="white"/>
                <rect x="10" y="10" width="10" height="10" fill="currentColor"/>
                
                <rect x="70" y="0" width="30" height="30" fill="currentColor"/>
                <rect x="75" y="5" width="20" height="20" fill="white"/>
                <rect x="80" y="10" width="10" height="10" fill="currentColor"/>

                <rect x="0" y="70" width="30" height="30" fill="currentColor"/>
                <rect x="5" y="75" width="20" height="20" fill="white"/>
                <rect x="10" y="80" width="10" height="10" fill="currentColor"/>

                {/* Random Pattern based on seed */}
                <rect x="40" y="10" width="15" height="15" fill="currentColor"/>
                <rect x="40" y="40" width="20" height="20" fill="currentColor"/>
                <rect x="10" y="40" width="15" height="15" fill="currentColor"/>
                <rect x="70" y="45" width="20" height="15" fill="currentColor"/>
                <rect x="40" y="70" width="15" height="20" fill="currentColor"/>
                <rect x="70" y="75" width="20" height="20" fill="currentColor"/>
              </svg>
            </div>
            <span className="font-label-caps text-[8px] uppercase tracking-widest text-outline mt-1.5">
              PASS: GRAD-VIP-{(qrSeed * 9871).toString().slice(0, 6)}
            </span>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs text-left">
          <div className="bg-surface-container p-space-xs rounded-lg">
            <span className="font-label-caps text-[9px] uppercase text-outline block">Thời Gian</span>
            <span className="font-body-sm text-[12px] font-bold text-primary block">{hostData.date}</span>
          </div>
          <div className="bg-surface-container p-space-xs rounded-lg">
            <span className="font-label-caps text-[9px] uppercase text-outline block">Địa Điểm</span>
            <span className="font-body-sm text-[12px] font-bold text-on-surface block truncate">{hostData.venue}</span>
          </div>
          <div className="bg-surface-container p-space-xs rounded-lg">
            <span className="font-label-caps text-[9px] uppercase text-outline block">Dress Code</span>
            <span className="font-body-sm text-[12px] font-bold text-tertiary block">{hostData.dressCode}</span>
          </div>
          <div className="bg-surface-container p-space-xs rounded-lg">
            <span className="font-label-caps text-[9px] uppercase text-outline block">Kế Hoạch</span>
            <span className="font-body-sm text-[12px] font-bold text-secondary block">{guestInfo.plan || '—'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-space-xs pt-space-xs border-t border-primary/20">
          <div className="flex flex-wrap items-center gap-space-xs">
            <button
              onClick={handleCopyLink}
              className="px-space-md py-space-xs bg-primary text-on-primary font-button-text text-[12px] rounded-lg shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Đã Sao Chép Link Vé!' : 'Sao Chép Link Vé Gửi Bạn'}
            </button>

            <button
              onClick={handleAddToCalendar}
              className="px-space-md py-space-xs bg-surface-container-high hover:bg-surface-bright text-primary font-button-text text-[12px] rounded-lg shadow transition-all flex items-center gap-1.5"
            >
              <CalendarPlus className="w-4 h-4" />
              Thêm Lịch Google
            </button>
          </div>

          <button
            onClick={onResetGuest}
            className="text-outline hover:text-primary font-body-sm text-[11px] underline transition-colors"
          >
            Đổi thông tin / Điền lại RSVP
          </button>
        </div>
      </div>
    </section>
  )
}
