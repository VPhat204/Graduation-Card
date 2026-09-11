import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { Heart, Smile, Camera, MapPin, Palette, Quote, PartyPopper, X } from 'lucide-react'

const InteractiveCard = forwardRef(function InteractiveCard({ hostData, onTriggerConfetti }, ref) {
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef(null)
  const wrapperRef = useRef(null)

  const toggleFlip = () => {
    setIsFlipped(prev => !prev)
  }

  // Expose toggleFlip to parent via ref
  useImperativeHandle(ref, () => ({
    toggleFlip
  }))

  const handleMouseMove = (e) => {
    if (isFlipped || !wrapperRef.current || !cardRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateX = (-y / rect.height) * 8
    const rotateY = (x / rect.width) * 8
    cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = () => {
    if (!isFlipped && cardRef.current) {
      cardRef.current.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)'
    }
  }

  const handleWaxSealClick = (e) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    if (onTriggerConfetti) {
      onTriggerConfetti(rect.left + rect.width / 2, rect.top)
    }
  }

  return (
    <section ref={wrapperRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="w-full" style={{ perspective: '1400px' }}>
      <div
        ref={cardRef}
        id="interactive-card"
        className="relative w-full rounded-xl transition-transform duration-700"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
        }}
      >
        {/* CARD FRONT */}
        <div
          className={`w-full bg-surface-container-low rounded-xl p-card-padding-mobile md:p-card-padding-desktop shadow-2xl relative overflow-hidden border border-primary/20 ${isFlipped ? 'pointer-events-none' : ''}`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-surface-container-lowest/80 pointer-events-none"></div>
          <div className="absolute top-4 left-4 right-4 bottom-4 pointer-events-none rounded-lg bg-transparent opacity-40 shadow-[inset_0_0_0_1px_rgba(212,175,55,0.4)]"></div>
          <div className="absolute top-6 left-6 right-6 bottom-6 pointer-events-none rounded-lg bg-transparent opacity-20 shadow-[inset_0_0_0_1px_rgba(245,215,127,0.3)]"></div>

          <div className="absolute top-7 left-7 text-primary/40 select-none pointer-events-none font-headline-lg">✦</div>
          <div className="absolute top-7 right-7 text-primary/40 select-none pointer-events-none font-headline-lg">✦</div>
          <div className="absolute bottom-7 left-7 text-primary/40 select-none pointer-events-none font-headline-lg">✦</div>
          <div className="absolute bottom-7 right-7 text-primary/40 select-none pointer-events-none font-headline-lg">✦</div>

          <div className="relative z-10 flex flex-col gap-space-2xl">
            {/* Front Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md border-b-0 pb-space-sm text-center sm:text-left">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-full border border-primary/40 bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                  <Heart className="w-6 h-6 fill-primary/20 text-primary" />
                </div>
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest block">
                    Thẻ Bạn Thân Tiếp Lửa
                  </span>
                  <span className="font-subheading-serif text-subheading-serif text-on-surface">
                    Tốt Nghiệp Cùng Tri Kỷ &amp; Homies
                  </span>
                </div>
              </div>
              <div className="px-space-md py-space-2xs border border-tertiary/50 bg-transparent text-tertiary rounded-full font-label-caps text-label-caps uppercase tracking-wider">
                VIP GUEST • BESTIES ONLY
              </div>
            </div>

            {/* Graduate Profile Info */}
            <div className="flex flex-col md:flex-row items-center gap-space-xl text-center md:text-left bg-surface-container/60 rounded-xl p-space-lg backdrop-blur-sm">
              <div className="relative shrink-0">
                <div className="w-28 h-36 md:w-32 md:h-44 rounded-2xl p-1 border-2 border-primary/50 bg-surface-container-lowest shadow-2xl overflow-hidden">
                  {hostData.avatarUrl ? (
                    <img
                      className="w-full h-full object-cover object-top rounded-xl"
                      src={hostData.avatarUrl}
                      alt={hostData.graduateName}
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-high rounded-xl flex items-center justify-center">
                      <Smile className="w-14 h-14 text-outline" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-surface-container-lowest border border-primary/50 text-primary flex items-center justify-center shadow-lg">
                  <Smile className="w-5 h-5 text-on-surface-variant" />
                </div>
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-space-xs mb-space-2xs">
                  <span className="px-space-xs py-[1px] border border-primary/60 text-primary bg-transparent rounded font-label-caps text-label-caps uppercase font-bold tracking-wider">
                    {hostData.degree?.split(' ').slice(0, 3).join(' ') || 'Tân Cử Nhân'}
                  </span>
                  {hostData.university && (
                    <span className="px-space-xs py-[1px] border border-outline-variant text-secondary bg-transparent rounded font-label-caps text-label-caps uppercase">
                      {hostData.university}
                    </span>
                  )}
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface truncate">
                  {hostData.graduateName || 'Tân Cử Nhân'}
                </h2>
                <span className="font-subheading-serif text-subheading-serif text-primary italic mb-space-2xs">
                  {hostData.degree}
                </span>
                {hostData.quote && (
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    "{hostData.quote}"
                  </p>
                )}
              </div>
            </div>

            {/* 3 Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm items-stretch">
              <div className="bg-surface-container-high/80 rounded-xl p-space-md flex flex-col hover:bg-surface-bright transition-colors border border-outline-variant/20 shadow-sm">
                <div className="w-8 h-8 rounded-lg border border-primary/40 bg-surface-container-lowest flex items-center justify-center text-primary mb-space-md shrink-0">
                  <Camera className="w-4 h-4 text-primary" />
                </div>
                <span className="font-label-caps text-[10px] uppercase text-outline tracking-wider block mb-1">
                  Giờ Check-in Chụp Ảnh
                </span>
                <div className="font-headline-md text-headline-md text-on-surface leading-tight min-h-[2.5rem] flex items-center">
                  {hostData.time || '10:00 AM'}
                </div>
                <div className="mt-auto pt-2 border-t border-outline-variant/15 font-body-sm text-body-sm text-primary">
                  {hostData.date}
                </div>
              </div>

              <div className="bg-surface-container-high/80 rounded-xl p-space-md flex flex-col hover:bg-surface-bright transition-colors border border-outline-variant/20 shadow-sm">
                <div className="w-8 h-8 rounded-lg border border-primary/40 bg-surface-container-lowest flex items-center justify-center text-primary mb-space-md shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="font-label-caps text-[10px] uppercase text-outline tracking-wider block mb-1">
                  Điểm Đón Tiếp
                </span>
                <div className="font-headline-md text-headline-md text-on-surface leading-tight min-h-[2.5rem] flex items-center">
                  Sảnh Hoa &amp; Photo-booth
                </div>
                <div className="mt-auto pt-2 border-t border-outline-variant/15 font-body-sm text-body-sm text-on-surface-variant line-clamp-2" title={hostData.venue}>
                  {hostData.venue}
                </div>
              </div>

              <div className="bg-surface-container-high/80 rounded-xl p-space-md flex flex-col hover:bg-surface-bright transition-colors border border-outline-variant/20 shadow-sm">
                <div className="w-8 h-8 rounded-lg border border-primary/40 bg-surface-container-lowest flex items-center justify-center text-primary mb-space-md shrink-0">
                  <Palette className="w-4 h-4 text-primary" />
                </div>
                <span className="font-label-caps text-[10px] uppercase text-outline tracking-wider block mb-1">
                  Dress Code Gợi Ý
                </span>
                <div className="font-headline-md text-headline-md text-on-surface leading-tight min-h-[2.5rem] flex items-center">
                  {hostData.dressCode || 'Tự do thanh lịch'}
                </div>
                <div className="mt-auto pt-2 border-t border-outline-variant/15 font-body-sm text-body-sm text-tertiary">
                  Tự do thanh lịch • Lên ảnh cực xinh
                </div>
              </div>
            </div>

            {/* Quote Block */}
            {hostData.quote && (
              <div className="bg-surface-container-lowest/90 rounded-xl p-space-lg relative overflow-hidden shadow-inner border border-outline-variant/30">
                <div className="flex items-start gap-space-md">
                  <Quote className="w-8 h-8 text-primary shrink-0 opacity-80" />
                  <div className="flex flex-col gap-space-2xs">
                    <h4 className="font-subheading-serif text-subheading-serif text-primary italic">
                      Tâm Tình Gửi Hội Bạn Thân
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      "{hostData.quote}"
                    </p>
                    <span className="font-label-caps text-label-caps text-outline uppercase tracking-widest mt-space-xs">
                      — {hostData.graduateName}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Wax Seal */}
            <div className="flex items-center justify-between pt-space-xs">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
                  Ấn Ký Tình Bạn
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Chạm tay để cùng 'quẩy' pháo hoa chúc mừng
                </span>
              </div>
              <div
                onClick={handleWaxSealClick}
                className="relative cursor-pointer group"
                id="wax-seal-btn"
                title="Chạm để chúc mừng bạn thân!"
              >
                <div className="w-16 h-16 rounded-full border-2 border-primary/60 bg-surface-container-lowest flex flex-col items-center justify-center text-primary shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 active:scale-95">
                  <PartyPopper className="w-6 h-6 text-primary" />
                  <span className="font-label-caps text-[8px] uppercase tracking-widest text-primary font-bold">
                    CHEERS!
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* CARD BACK */}
        <div
          id="card-back"
          className="absolute inset-0 w-full bg-surface-container-low rounded-xl p-card-padding-mobile md:p-card-padding-desktop shadow-2xl overflow-y-auto flex flex-col justify-between border border-primary/20"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            WebkitTransform: 'rotateY(180deg)',
            minHeight: '100%',
          }}
        >
          <div className="flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest">
                Besties Graduation Memo
              </span>
              <button
                onClick={toggleFlip}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-colors"
                id="close-back-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-headline-lg text-headline-lg text-on-surface">
              Nhắn Nhủ Riêng Cho Đồng Bọn!
            </h3>

            {hostData.quote ? (
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                "{hostData.quote}"
              </p>
            ) : (
              <p className="font-body-md text-body-md text-outline leading-relaxed italic">
                Cử nhân chưa nhập lời tâm tình. Hãy vào Cài Đặt (⚙️) để thêm lời nhắn gửi hội bạn!
              </p>
            )}

            <div className="grid grid-cols-2 gap-space-sm pt-space-md border-t-0">
              {hostData.date && (
                <div className="bg-surface-container p-space-sm rounded-lg">
                  <span className="font-label-caps text-label-caps uppercase text-primary block">
                    Thời gian lễ
                  </span>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">
                    {hostData.date} {hostData.time && `• ${hostData.time}`}
                  </span>
                </div>
              )}
              {hostData.dressCode && (
                <div className="bg-surface-container p-space-sm rounded-lg">
                  <span className="font-label-caps text-label-caps uppercase text-primary block">
                    Dress Code
                  </span>
                  <span className="font-body-md text-body-md text-on-surface font-semibold">
                    {hostData.dressCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-space-md flex items-center justify-center">
            <span className="font-subheading-serif text-subheading-serif text-primary italic">
              Forever Friends • Thanh Xuân Có Nhau Là Đủ!
            </span>
          </div>
        </div>

      </div>
    </section>
  )
})

export default InteractiveCard
