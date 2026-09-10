import { useState, useRef, useEffect } from 'react'
import { Music, Disc, Volume2, VolumeX } from 'lucide-react'

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)

  // Royalty-free celebratory background music URL
  const audioSrc = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=inspiring-emotional-uplifting-piano-112623.mp3"

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.log("Audio play deferred:", err)
      })
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4
    }
  }, [])

  return (
    <div className="fixed top-20 right-4 z-40 flex items-center gap-2 bg-surface-container-lowest/80 backdrop-blur-md p-1.5 pr-3 rounded-full border border-primary/30 shadow-lg shadow-black/40">
      <audio ref={audioRef} src={audioSrc} loop preload="auto" />
      
      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full border border-primary/60 flex items-center justify-center transition-all ${
          isPlaying
            ? 'bg-primary/10 text-primary shadow-md shadow-primary/30'
            : 'bg-surface-container-lowest text-primary hover:bg-primary/10'
        }`}
        title={isPlaying ? "Tạm dừng nhạc" : "Phát nhạc nền lễ tốt nghiệp"}
      >
        {isPlaying ? (
          <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
        ) : (
          <Music className="w-4 h-4" />
        )}
      </button>

      <div className="flex flex-col text-left cursor-pointer select-none" onClick={togglePlay}>
        <span className="font-label-caps text-[9px] uppercase text-primary tracking-wider leading-none">
          {isPlaying ? 'Playing BGM' : 'Graduation Music'}
        </span>
        <span className="font-body-sm text-[10px] text-on-surface-variant leading-tight truncate max-w-[90px]">
          {isPlaying ? 'Melody of Youth' : 'Bấm để nghe nhạc'}
        </span>
      </div>

      {isPlaying && (
        <button
          onClick={toggleMute}
          className="text-outline hover:text-on-surface p-1 text-xs"
          title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  )
}

