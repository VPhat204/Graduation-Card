import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

const ConfettiCanvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animIdRef = useRef(null)

  const goldColors = ['#f2ca50', '#d4af37', '#eacc75', '#ffffff', '#bac7e1', '#f5d77f']

  const createConfetti = (x, y) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const targetX = x !== undefined ? x : canvas.width / 2
    const targetY = y !== undefined ? y : canvas.height * 0.35

    for (let i = 0; i < 90; i++) {
      particlesRef.current.push({
        x: targetX,
        y: targetY,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 4,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.015 + 0.008
      })
    }

    if (!animIdRef.current) {
      animate()
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const particles = particlesRef.current

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.35 // gravity
      p.rotation += p.rotationSpeed
      p.opacity -= p.decay

      if (p.opacity <= 0 || p.y > canvas.height) {
        particles.splice(i, 1)
        continue
      }

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.globalAlpha = p.opacity
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }

    if (particles.length > 0) {
      animIdRef.current = requestAnimationFrame(animate)
    } else {
      animIdRef.current = null
    }
  }

  useImperativeHandle(ref, () => ({
    burst: (x, y) => createConfetti(x, y)
  }))

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="ceremony-confetti"
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  )
})

ConfettiCanvas.displayName = 'ConfettiCanvas'

export default ConfettiCanvas
