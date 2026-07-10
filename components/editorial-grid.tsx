"use client"

import { useEffect, useRef, useState } from "react"

type GridImage = {
  src: string
  title: string
  category: string
}

const FALLBACK_IMAGES: GridImage[] = [
  { src: "https://www.beecoop.it/assets/img/portfolio/Mandorle.jpg", title: "Mandorle", category: "Frutti" },
  { src: "https://www.beecoop.it/assets/img/portfolio/ulivi2.jpg", title: "Gli Oliveti", category: "Produzione" },
  { src: "https://www.beecoop.it/assets/img/portfolio/broccoletti.jpg", title: "Broccoletti", category: "Ortaggi" },
  { src: "https://www.beecoop.it/assets/img/portfolio/finocchi.jpg", title: "Finocchi", category: "Ortaggi" },
  { src: "https://www.beecoop.it/assets/img/portfolio/melenzane.jpg", title: "Melanzane", category: "Ortaggi" },
  { src: "https://www.beecoop.it/assets/img/portfolio/peperoni.jpg", title: "Peperoni", category: "Ortaggi" },
  { src: "https://www.beecoop.it/assets/img/portfolio/sedano.jpg", title: "Sedano", category: "Ortaggi" },
  { src: "https://www.beecoop.it/assets/img/portfolio/basilico.jpg", title: "Basilico", category: "Erbe Aromatiche" },
  { src: "https://www.beecoop.it/assets/img/portfolio/Rosmarino.jpg", title: "Rosmarino", category: "Erbe Aromatiche" },
  { src: "https://www.beecoop.it/assets/img/portfolio/salvia.jpg", title: "Salvia", category: "Erbe Aromatiche" },
]

// Classi CSS per la griglia asimmetrica, applicate in modo ciclico
const TILE_PATTERNS = [
  "col-span-7 row-span-2", // rows 1-2
  "col-span-5 row-span-1", // row 1
  "col-span-5 row-span-1", // row 2
  "col-span-4 row-span-2", // rows 3-4
  "col-span-8 row-span-1", // row 3
  "col-span-4 row-span-1", // row 4
  "col-span-4 row-span-1", // row 4
  "col-span-3 row-span-2", // rows 5-6
  "col-span-5 row-span-1", // row 5
  "col-span-4 row-span-2", // rows 5-6
]

function Tile({
  item,
  className = "",
  onClick,
}: {
  item: GridImage
  className?: string
  onClick?: () => void
}) {
  return (
    <figure 
      className={`group relative overflow-hidden cursor-pointer border border-white/5 ${className}`}
      onClick={onClick}
    >
      <img
        src={item.src || "/placeholder.jpg"}
        alt={`${item.title} — ${item.category}`}
        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%231E293B'/%3E%3C/svg%3E"
        }}
      />
      {/* Lightbox hint overlay */}
      <figcaption className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-6">
        <h3 className="font-serif text-lg font-light italic leading-none text-white md:text-2xl">{item.title}</h3>
        <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-[#2487ce] md:mt-2 md:text-[0.65rem]">{item.category}</p>
      </figcaption>
    </figure>
  )
}

export function EditorialGrid({ images: initialImages }: { images?: GridImage[] }) {
  const images = initialImages && initialImages.length > 0 ? initialImages : FALLBACK_IMAGES
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const touchStartRef = useRef<number>(0)

  // Genera dinamicamente le tiles mappandole sui pattern CSS asimmetrici
  const gridTiles = images.map((_, idx) => {
    const area = TILE_PATTERNS[idx % TILE_PATTERNS.length]
    return {
      i: idx,
      area,
    }
  })

  const handlePrev = () => {
    if (activeIdx !== null) {
      setActiveIdx((activeIdx - 1 + images.length) % images.length)
    }
  }

  const handleNext = () => {
    if (activeIdx !== null) {
      setActiveIdx((activeIdx + 1) % images.length)
    }
  }

  const handleClose = () => {
    setActiveIdx(null)
  }

  useEffect(() => {
    if (activeIdx === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeIdx])

  return (
    <section id="comunita" className="relative bg-black/40 backdrop-blur-md snap-start">
      
      {/* Intestazione Sezione */}
      <div className="flex flex-col items-center text-center py-16 px-6">
        <span className="text-xs uppercase tracking-[0.35em] text-[#2487ce] font-semibold drop-shadow-sm">
          Foto dal nostro orto
        </span>
        <h2 className="mt-3 font-serif text-3xl font-light italic text-white md:text-5xl drop-shadow-sm">
          Galleria Prodotti
        </h2>
      </div>

      {/* 10-column asymmetric mosaic grid on both mobile and desktop */}
      <div className="grid auto-rows-[35vw] grid-cols-12 gap-1 sm:auto-rows-[28vw] md:auto-rows-[19vw] md:gap-1.5">
        {gridTiles.map((tile, idx) => (
          <Tile
            key={idx}
            item={images[tile.i]}
            className={tile.area}
            onClick={() => setActiveIdx(tile.i)}
          />
        ))}
      </div>

      {/* Lightbox / Zoom Modal Overlay */}
      {activeIdx !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md select-none transition-all duration-300"
          onClick={handleClose}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-white hover:text-white/70 p-3 rounded-full transition-colors z-50 cursor-pointer bg-black/30 md:bg-transparent"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            aria-label="Chiudi"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Prev button */}
          <button 
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-white/70 p-4 rounded-full transition-colors z-50 cursor-pointer hidden md:flex items-center justify-center bg-white/5 hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            aria-label="Precedente"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button 
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-white/70 p-4 rounded-full transition-colors z-50 cursor-pointer hidden md:flex items-center justify-center bg-white/5 hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            aria-label="Successiva"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image Container with Swipe Support */}
          <div 
            className="relative flex flex-col items-center justify-between w-full h-[85vh] max-h-[90vh] px-6"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => { touchStartRef.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const diff = touchStartRef.current - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 50) {
                if (diff > 0) handleNext();
                else handlePrev();
              }
            }}
          >
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <img
                src={images[activeIdx].src}
                alt={images[activeIdx].title}
                className="max-h-full max-w-full object-contain select-none transition-all duration-300 rounded-lg shadow-2xl"
              />
            </div>
            {/* Metadata Info */}
            <div className="mt-5 text-center text-white flex flex-col items-center gap-3 shrink-0">
              <h4 className="font-serif text-xl font-light italic md:text-3xl">{images[activeIdx].title}</h4>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#2487ce] md:text-[0.65rem]">{images[activeIdx].category}</p>
              
              {images[activeIdx].category && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const event = new CustomEvent("filter-category", { 
                      detail: { 
                        category: images[activeIdx].category, 
                        title: images[activeIdx].title 
                      } 
                    })
                    window.dispatchEvent(event)
                    setActiveIdx(null) // Chiudi la modale
                  }}
                  className="mt-2 px-6 py-2 rounded-full border border-[#2487ce]/30 hover:border-[#2487ce] bg-black/40 hover:bg-[#2487ce] text-white text-[10px] uppercase tracking-[0.25em] transition-all duration-300 cursor-pointer"
                >
                  Vedi nello Shop
                </button>
              )}
            </div>
          </div>

          {/* Image counter indicator (bottom right) */}
          <div className="absolute bottom-6 right-6 text-white/40 text-[9px] uppercase tracking-[0.25em] select-none md:text-[10px]">
            {activeIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  )
}
