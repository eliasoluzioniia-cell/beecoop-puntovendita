"use client"

import { useEffect, useState } from "react"

function getOptimizedImageUrl(url: string | undefined, width: number, quality = 75) {
  if (!url) return "/placeholder.jpg"
  if (url.startsWith("data:") || url.endsWith(".svg") || url.startsWith("/assets/") || url === "transparent") {
    return url
  }
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`
}

type Slide = {
  src: string
  srcMobile?: string
  title: string
  description?: string
  containImage?: boolean
  hideText?: boolean
}

const FALLBACK_SLIDES: Slide[] = [
  { src: "https://www.beecoop.it/assets/img/portfolio/arance.jpg", title: "Arance", description: "Coltivate biologiche nei nostri terreni di Enna" },
  { src: "https://www.beecoop.it/assets/img/portfolio/olio.jpg", title: "Olio EVO", description: "Puro e genuino dai nostri oliveti di Enna" },
  { src: "https://www.beecoop.it/assets/img/portfolio/fichidindia.jpg", title: "Fichi d'India", description: "I frutti selvatici e tipici della Sicilia" },
]

export function VerticalGallery({ slides: initialSlides }: { slides?: Slide[] }) {
  // Prepara le slide: inserisce sempre una prima slide "trasparente" che mostra unicamente lo sfondo 3D
  const baseSlides = initialSlides && initialSlides.length > 0 ? initialSlides : FALLBACK_SLIDES
  const slides = [
    { src: "transparent", title: "Bee Coop", description: "La \"Follia\" che si fa Realtà" },
    ...baseSlides
  ]

  const [active, setActive] = useState(0)
  const [showDots, setShowDots] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const height = window.innerHeight
      if (height === 0) return
      
      const index = Math.round(scrollY / height)
      if (index >= 0 && index < slides.length) {
        setActive(index)
      }
      
      // Nasconde i pallini e il suggerimento di scorrimento quando l'utente scorre oltre le slide
      const limit = height * (slides.length - 1 + 0.4)
      if (scrollY > limit) {
        setShowDots(false)
      } else {
        setShowDots(true)
      }
    }

    // Esegui all'avvio per gestire la posizione iniziale
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [slides.length])

  const handleDotClick = (index: number) => {
    window.scrollTo({
      top: index * window.innerHeight,
      behavior: "smooth",
    })
  }

  return (
    <div id="progetto">
      {/* Slides rendered in the main flow */}
      {slides.map((slide, i) => (
        <div
          key={`${slide.title}-${i}`}
          className="relative h-screen w-full snap-start snap-always flex items-center justify-center bg-transparent"
        >
          {slide.src !== "transparent" ? (
            // Slide successive: Caricate come Card arrotondate con 1 cm di margine su tutti e 4 i lati
            <div
              className={`relative h-[calc(100vh-12px)] w-[calc(100vw-12px)] rounded-[16px] md:h-[calc(100vh-2cm)] md:w-[calc(100vw-2cm)] md:rounded-[24px] overflow-hidden shadow-2xl border border-white/10 transition-all duration-700 ease-out ${
                i === active ? "scale-100 opacity-100" : "scale-[0.96] opacity-50"
              }`}
            >
              {(slide.containImage || slide.srcMobile) && (
                <picture className={`absolute inset-0 h-full w-full select-none pointer-events-none ${slide.containImage ? "block" : "block md:hidden"}`}>
                  {slide.srcMobile && (
                    <source media="(max-width: 768px)" srcSet={getOptimizedImageUrl(slide.srcMobile, 384, 40)} />
                  )}
                  <img
                    src={getOptimizedImageUrl(slide.src || "/placeholder.jpg", 384, 40)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-40 scale-105 select-none pointer-events-none"
                  />
                </picture>
              )}
              <picture className={`h-full w-full block ${(slide.containImage || slide.srcMobile) ? "relative z-10" : ""}`}>
                {slide.srcMobile && (
                  <source media="(max-width: 768px)" srcSet={getOptimizedImageUrl(slide.srcMobile, 1080)} />
                )}
                <img
                  src={getOptimizedImageUrl(slide.src || "/placeholder.jpg", 1920)}
                  alt={slide.title}
                  className={`h-full w-full ${slide.containImage ? "object-contain" : (slide.srcMobile ? "object-contain md:object-cover" : "object-cover")} brightness-[1.20] contrast-[1.08] saturate-[1.10]`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect width='1920' height='1080' fill='%231E293B'/%3E%3C/svg%3E"
                  }}
                />
              </picture>
              
              {!slide.hideText && (
                <>
                  {/* Overlay a gradiente ridotto al minimo indispensabile (solo alle estremità superiore e inferiore) per massimizzare la brillantezza dell'immagine */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25 z-10" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 z-20">
                    <h2 className="font-serif text-5xl font-light tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] md:text-8xl select-none">
                      {slide.title}
                    </h2>
                    <p className="mt-5 max-w-2xl md:max-w-3xl border-b border-white/60 pb-2 text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/95 select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-relaxed">
                      {slide.description || "Scopri di più"}
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Prima slide: completamente trasparente a tutto schermo per mostrare lo sfondo video 3D
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
              <h2 className="font-serif text-5xl font-light tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] md:text-8xl select-none">
                {slide.title}
              </h2>
              <p className="mt-5 max-w-2xl md:max-w-3xl border-b border-white/60 pb-2 text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/95 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-relaxed">
                {slide.description || "Scopri di più"}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Fixed Vertical Dot Pagination on the right */}
      {showDots && (
        <div className="fixed right-6 top-1/2 flex -translate-y-1/2 flex-col items-center justify-center gap-3 z-40">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === active ? "bg-[#2487ce] scale-125 shadow-[0_0_8px_rgba(36,135,206,0.5)]" : "bg-white/40 hover:bg-white/75"
              }`}
              aria-label={`Vai alla slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Animated scroll hint centered on first slide */}
      {showDots && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-10 flex flex-col items-center justify-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/70 transition-opacity duration-300 z-20"
          style={{ opacity: active > 0 ? 0 : 1 }}
        >
          <span>Scorri per esplorare</span>
          <svg
            width="12"
            height="24"
            viewBox="0 0 12 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="animate-bounce"
          >
            <path d="M6 1v22M1 18l5 5 5-5" />
          </svg>
        </div>
      )}
      {/* Image Prefetching per caricamento istantaneo */}
      {slides.length > 1 && (
        <div className="hidden" aria-hidden="true">
          {/* Precarica slide successiva */}
          {(() => {
            const nextIdx = (active + 1) % slides.length
            const nextSlide = slides[nextIdx]
            if (nextSlide && nextSlide.src !== "transparent") {
              return (
                <picture key={`preload-next-${nextIdx}`}>
                  {nextSlide.srcMobile && (
                    <source media="(max-width: 768px)" srcSet={getOptimizedImageUrl(nextSlide.srcMobile, 1080)} />
                  )}
                  <img src={getOptimizedImageUrl(nextSlide.src, 1920)} alt="" />
                </picture>
              )
            }
            return null
          })()}
          {/* Precarica slide precedente */}
          {(() => {
            const prevIdx = (active - 1 + slides.length) % slides.length
            const prevSlide = slides[prevIdx]
            if (prevSlide && prevSlide.src !== "transparent") {
              return (
                <picture key={`preload-prev-${prevIdx}`}>
                  {prevSlide.srcMobile && (
                    <source media="(max-width: 768px)" srcSet={getOptimizedImageUrl(prevSlide.srcMobile, 1080)} />
                  )}
                  <img src={getOptimizedImageUrl(prevSlide.src, 1920)} alt="" />
                </picture>
              )
            }
            return null
          })()}
        </div>
      )}
    </div>
  )
}
