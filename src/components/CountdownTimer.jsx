import { useState, useEffect } from 'react'

export default function CountdownTimer({ targetDateStr = "2026-09-19T10:00:00" }) {
  const calculateTimeLeft = () => {
    const target = new Date(targetDateStr).getTime()
    const now = new Date().getTime()
    const difference = target - now

    if (difference <= 0) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00' }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    }
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDateStr])

  return (
    <section className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-full p-space-md shadow-2xl shadow-surface-container-lowest/40 border border-outline-variant/30">
      <div className="grid grid-cols-4 gap-space-2xs text-center">
        <div className="flex flex-col py-space-xs px-space-2xs bg-surface-container-low/70 rounded-lg">
          <span className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
            {timeLeft.days}
          </span>
          <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
            Ngày
          </span>
        </div>

        <div className="flex flex-col py-space-xs px-space-2xs bg-surface-container-low/70 rounded-lg">
          <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            {timeLeft.hours}
          </span>
          <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
            Giờ
          </span>
        </div>

        <div className="flex flex-col py-space-xs px-space-2xs bg-surface-container-low/70 rounded-lg">
          <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            {timeLeft.minutes}
          </span>
          <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
            Phút
          </span>
        </div>

        <div className="flex flex-col py-space-xs px-space-2xs bg-surface-container-low/70 rounded-lg">
          <span className="font-headline-lg text-headline-lg text-primary-fixed-dim font-bold tracking-tight animate-pulse">
            {timeLeft.seconds}
          </span>
          <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
            Giây
          </span>
        </div>
      </div>
    </section>
  )
}
