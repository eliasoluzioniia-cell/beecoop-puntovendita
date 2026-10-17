"use client"

import { useState } from "react"
import Link from "next/link"
import { BlogPost } from "@/lib/notion"
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Check,
  Camera,
  Maximize2,
  X,
  MessageCircle,
  Copy,
  ExternalLink,
} from "lucide-react"

function getOptimizedImageUrl(url: string | undefined, width = 1200, quality = 80) {
  if (!url) return "https://www.beecoop.it/assets/img/portfolio/ulivi2.jpg"
  if (url.includes("/assets/")) {
    return url.startsWith("http") ? url.substring(url.indexOf("/assets/")) : url
  }
  if (url.startsWith("data:") || url.endsWith(".svg")) {
    return url
  }
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`
}

export function BlogArticleView({ post }: { post: BlogPost }) {
  const [activePhoto, setActivePhoto] = useState<{ url: string; caption: string } | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedText, setCopiedText] = useState(false)

  const postUrl = typeof window !== "undefined"
    ? `${window.location.origin}/blog/${post.id}`
    : `https://beecoop-puntovendita.vercel.app/blog/${post.id}`

  const fullTextToShare = `${post.title}\n\n${post.content.join("\n\n")}\n\nLeggi l'articolo con la galleria fotografica completa qui: ${postUrl}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullTextToShare)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2500)
  }

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `🫒 *${post.title}*\n\n${post.excerpt}\n\n👉 Leggi la storia completa e guarda le foto:\n${postUrl}`
    )}`
    window.open(waUrl, "_blank")
  }

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
    window.open(fbUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-400 selection:text-black">
      {/* Top Header con Navigazione e Condivisione */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-6 py-4 backdrop-blur-xl md:px-14">
        <Link
          href="/#blog"
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-[#2487ce] hover:border-[#2487ce] transition-all cursor-pointer font-medium shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Torna al Sito</span>
        </Link>

        <Link href="/" className="flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-white font-semibold">
          <span className="text-white font-serif font-black">BEE</span>
          <span className="text-[#2487ce] font-serif font-black">COOP</span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="text-white/60 text-xs hidden sm:inline">Diario di Comunità</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 sm:px-4 py-2 text-xs uppercase tracking-wider text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer font-medium"
            title="Condividi su WhatsApp"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 sm:px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-white/15 transition-all cursor-pointer"
            title="Copia link diretto del post"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-emerald-400 font-semibold">Link Copiato!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-[#2487ce]" />
                <span className="hidden sm:inline">Copia Link</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Contenitore Principale Articolo */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        {/* Categoria Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full border border-[#2487ce]/40 bg-[#2487ce]/10 px-3.5 py-1 text-xs uppercase tracking-wider text-[#2487ce] font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Titolo Editoriale Grande */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-white leading-[1.15] tracking-tight">
          {post.title}
        </h1>

        {/* Metadati (Autore, Data, Conteggio Foto) */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/60 pb-8 border-b border-white/10">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#2487ce]" />
            <span className="font-medium text-white/90">{post.author}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-2 text-[#2487ce]">
            <Calendar className="h-4 w-4" />
            <span>{post.publishedAt}</span>
          </span>
          {post.galleryImages && post.galleryImages.length > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-white/70">
                <Camera className="h-4 w-4 text-[#2487ce]" />
                <span>{post.galleryImages.length} fotografie</span>
              </span>
            </>
          )}
        </div>

        {/* Box Condivisione Rapida Social */}
        <div className="my-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-white/60 font-light">
            Condividi <strong>solo questo post</strong> con i tuoi amici:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1 rounded-full bg-emerald-600/80 hover:bg-emerald-600 px-3 py-1.5 text-xs text-white transition-colors cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </button>
            <button
              onClick={handleFacebookShare}
              className="flex items-center gap-1 rounded-full bg-blue-600/80 hover:bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors cursor-pointer"
            >
              Facebook
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-white transition-colors cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-[#2487ce]" />
              {copiedLink ? "Link Copiato!" : "Copia Link Post"}
            </button>
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-white transition-colors cursor-pointer"
              title="Copia l'intero testo formattato pronto da incollare su Instagram o Facebook"
            >
              <Copy className="h-3.5 w-3.5 text-amber-400" />
              {copiedText ? "Testo Copiato!" : "Copia Testo per Social"}
            </button>
          </div>
        </div>

        {/* Copertina Panoramica */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-black/50 my-10 border border-white/15 shadow-2xl">
          <img
            src={getOptimizedImageUrl(post.coverImage, 1400)}
            alt={post.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                "https://www.beecoop.it/assets/img/portfolio/ulivi2.jpg"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Corpo del Testo Formattato */}
        <div className="space-y-6 text-white/90 text-lg sm:text-xl leading-relaxed font-light">
          {post.content.map((paragraph, idx) => {
            const isUnwantedPhrase =
              paragraph.includes("Sei mai stato a raccogliere") ||
              paragraph.includes("assaggiare l'olio nuovo") ||
              paragraph.includes("purezza dell'olio nuovo")

            if (isUnwantedPhrase) return null

            const isCallout =
              paragraph.includes("#BEECOOP") ||
              paragraph.includes("Grazie") ||
              paragraph.includes("Vi aspettiamo")

            if (isCallout) {
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-[#2487ce]/40 bg-gradient-to-br from-[#2487ce]/15 to-transparent p-6 sm:p-8 text-white my-8 backdrop-blur-md shadow-xl"
                >
                  <p className="font-serif italic text-amber-200/95 leading-relaxed text-base sm:text-lg">
                    {paragraph}
                  </p>
                </div>
              )
            }

            return (
              <p key={idx} className="whitespace-pre-line leading-relaxed">
                {paragraph}
              </p>
            )
          })}
        </div>

        {/* Galleria Fotografica dell'Articolo */}
        {post.galleryImages && post.galleryImages.length > 0 && (
          <section className="mt-16 pt-12 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2487ce]/20 text-[#2487ce]">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-white font-light">
                    I Momenti della Giornata
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Clicca su ogni fotografia per ingrandirla a schermo intero
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto rounded-full bg-white/5 border border-white/15 px-3 py-1 text-xs text-white/70">
                {post.galleryImages.length} scatti
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {post.galleryImages.map((photo, pIdx) => {
                const photoUrl = typeof photo === "string" ? photo : photo.url
                const photoCaption = typeof photo === "string" ? "" : photo.caption
                return (
                  <div
                    key={pIdx}
                    onClick={() => setActivePhoto({ url: photoUrl, caption: photoCaption })}
                    className="group/photo relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-white/10 cursor-pointer hover:border-[#2487ce]/60 transition-all hover:scale-[1.02] shadow-lg"
                  >
                    <img
                      src={getOptimizedImageUrl(photoUrl, 700)}
                      alt={photoCaption || post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover/photo:opacity-100">
                      <span className="flex items-center gap-1.5 rounded-full bg-black/75 px-3.5 py-1.5 text-xs text-white backdrop-blur-md border border-white/20">
                        <Maximize2 className="h-3.5 w-3.5 text-[#2487ce]" />
                        Ingrandisci
                      </span>
                    </div>
                    {photoCaption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3.5 pt-8 text-xs text-white/90 font-light leading-snug">
                        {photoCaption}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Sezione di Chiusura / Call To Action */}
        <div className="mt-16 pt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/#blog"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-xs uppercase tracking-wider font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna a tutte le storie
          </Link>

          <Link
            href="/#prodotti"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#2487ce] px-7 py-3.5 text-xs uppercase tracking-wider font-semibold text-white hover:bg-[#1f73b0] transition-colors shadow-xl"
          >
            <span>Scopri i nostri prodotti</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </main>

      {/* Lightbox Visualizzatore Foto Ingrandita */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Chiudi ingrandimento"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={getOptimizedImageUrl(activePhoto.url, 1600)}
              alt={activePhoto.caption}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            {activePhoto.caption && (
              <p className="mt-4 text-center text-sm md:text-base text-white/90 font-light bg-black/60 px-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
                {activePhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
