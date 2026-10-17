"use client"

import { useState } from "react"
import { BlogPost } from "@/lib/notion"
import { Calendar, User, Tag, BookOpen, X, Share2, Check } from "lucide-react"

function getOptimizedImageUrl(url: string | undefined, width: number, quality = 75) {
  if (!url) return "/placeholder.jpg"
  if (url.startsWith("data:") || url.endsWith(".svg") || url.startsWith("/assets/")) {
    return url
  }
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`
}

export function BlogSection({ posts }: { posts?: BlogPost[] }) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [copied, setCopied] = useState(false)

  const blogPosts = posts && posts.length > 0 ? posts : []

  const handleShare = async (post: BlogPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        // Ignora annullamento utente
      }
    } else {
      navigator.clipboard.writeText(`${post.title}\n\n${window.location.href}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section id="blog" className="relative border-t border-white/10 bg-slate-950/80 backdrop-blur-md snap-start py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Intestazione Sezione */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-[#2487ce] font-semibold">
            <span className="h-px w-8 bg-[#2487ce]" />
            Diario di Comunità
            <span className="h-px w-8 bg-[#2487ce]" />
          </div>
          <h2 className="mt-4 font-serif text-3xl font-light italic text-white md:text-5xl drop-shadow-sm">
            Storie dal Borgo e dalla Bottega
          </h2>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-white/60 leading-relaxed">
            I racconti, i momenti di festa e i progressi di Borgo Cascino e della bottega di Enna, 
            scritti dai nostri soci e approvati con amore dalla presidenza.
          </p>
        </div>

        {/* Griglia degli Articoli del Blog */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#2487ce]/50 hover:shadow-[0_10px_30px_rgba(36,135,206,0.15)] flex flex-col justify-between"
            >
              <div>
                {/* Copertina Immagine */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black/40">
                  <img
                    src={getOptimizedImageUrl(post.coverImage, 640)}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        "https://www.beecoop.it/assets/img/portfolio/ulivi2.jpg"
                    }}
                  />
                  <div className="absolute top-3 right-3 flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-black/60 px-2.5 py-1 text-[9px] uppercase tracking-wider text-white backdrop-blur-md border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadati (Data & Autore) */}
                <div className="mt-4 flex items-center justify-between text-[11px] text-white/50">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-[#2487ce]" />
                    {post.publishedAt}
                  </span>
                  <span className="flex items-center gap-1.5 truncate max-w-[150px]">
                    <User className="h-3 w-3 text-[#2487ce]" />
                    {post.author}
                  </span>
                </div>

                {/* Titolo */}
                <h3 className="mt-3 font-serif text-xl font-light text-white group-hover:text-[#2487ce] transition-colors leading-snug">
                  {post.title}
                </h3>

                {/* Estratto */}
                <p className="mt-2.5 text-xs text-white/70 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              {/* Azione Leggi */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#2487ce] font-medium">
                <span className="flex items-center gap-1 group-hover:gap-2 transition-all">
                  Leggi la storia completa
                  <BookOpen className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white/80">
                  Social &amp; Blog
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modale Dettaglio Articolo Completo */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 select-text transition-all duration-300"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-slate-900/95 p-6 md:p-10 shadow-2xl scrollbar-thin scrollbar-thumb-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pulsante Chiusura */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Chiudi"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Immagine Copertina Modale */}
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-black/50 mb-6">
              <img
                src={getOptimizedImageUrl(selectedPost.coverImage, 1200)}
                alt={selectedPost.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>

            {/* Tag & Metadati */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 mb-4">
              <span className="flex items-center gap-1 text-[#2487ce]">
                <Calendar className="h-3.5 w-3.5" />
                {selectedPost.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-[#2487ce]" />
                {selectedPost.author}
              </span>
              <span>•</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedPost.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-white/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Titolo Principale */}
            <h2 className="font-serif text-2xl sm:text-4xl font-light text-white leading-tight">
              {selectedPost.title}
            </h2>

            {/* Testo Completo con Formattazione TOV */}
            <div className="mt-8 space-y-4 text-white/85 text-base sm:text-lg leading-relaxed border-t border-white/10 pt-6">
              {selectedPost.content.map((paragraph, idx) => {
                const isCallout =
                  paragraph.includes("#BEECOOP") ||
                  paragraph.includes("Grazie") ||
                  paragraph.includes("Passi a") ||
                  paragraph.includes("Vi aspettiamo")

                if (isCallout) {
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[#2487ce]/30 bg-[#2487ce]/10 p-5 text-white my-6 backdrop-blur-sm"
                    >
                      <p className="font-serif italic">{paragraph}</p>
                    </div>
                  )
                }

                return <p key={idx}>{paragraph}</p>
              })}
            </div>

            {/* Barra Azioni Inferiore */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => handleShare(selectedPost)}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs uppercase tracking-wider text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    Copiato negli Appunti!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-[#2487ce]" />
                    Condividi Storia
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedPost(null)}
                className="rounded-full bg-[#2487ce] px-6 py-2 text-xs uppercase tracking-wider font-semibold text-white hover:bg-[#1f73b0] transition-colors cursor-pointer shadow-lg"
              >
                Torna al Sito
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
