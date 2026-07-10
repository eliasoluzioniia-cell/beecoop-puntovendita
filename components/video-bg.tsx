"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

export function VideoBg() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const video = videoRef.current
      if (!video) return

      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll))

      // Applica lo zoom 3D parallattico.
      // Usiamo una scala base di 1.35 per croppare le barre nere laterali del video (proporzione 4:3 inserita in 16:9)
      // e aggiungiamo lo zoom dello scroll fino a 1.5.
      const scaleAmount = 1.35 + scrollFraction * 0.15
      video.style.transform = `scale(${scaleAmount}) translate3d(0,0,0)`
    }

    // Aggiunge il listener per lo scroll
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Esegui subito per la posizione iniziale

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch((err) => {
        console.warn("Autoplay audio bloccato dal browser:", err)
      })
    }
  }

  return (
    <>
      {/* Sfondo Video 3D Parallattico */}
      <div className="fixed inset-0 -z-50 h-screen w-screen overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover will-change-transform scale-[1.35]"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/assets/bee%20coop.mp4" type="video/mp4" />
        </video>
        {/* Overlay a gradiente scuro per migliorare la leggibilità dei testi */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 pointer-events-none" />
      </div>

      {/* Musica di Sottofondo */}
      <audio ref={audioRef} loop>
        <source src="/assets/musica-primavera.mp3" type="audio/mpeg" />
      </audio>

      {/* Tasto Audio Fluttuante in Basso a Sinistra */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={toggleMusic}
          className={`flex h-12 w-12 items-center justify-center rounded-full border bg-white/10 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95 cursor-pointer ${
            isPlaying 
              ? "border-[#2487ce] text-[#2487ce] shadow-[0_0_15px_rgba(36,135,206,0.4)]" 
              : "border-white/20 text-white"
          }`}
          title="Attiva/Disattiva Musica"
        >
          {isPlaying ? (
            <Volume2 className="h-5 w-5 animate-pulse" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </button>
      </div>
    </>
  )
}
