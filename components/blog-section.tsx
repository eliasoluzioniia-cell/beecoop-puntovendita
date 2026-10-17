"use client"

import { useState } from "react"
import { BlogPost } from "@/lib/notion"
import { Calendar, User, BookOpen, X, Share2, Check, Camera, Images, Maximize2, ArrowLeft, MessageCircle, Copy, ExternalLink } from "lucide-react"

function getOptimizedImageUrl(url: string | undefined, width = 640, quality = 75) {
  if (!url) return "https://www.beecoop.it/assets/img/portfolio/ulivi2.jpg"
  if (url.includes("/assets/")) {
    return url.startsWith("http") ? url.substring(url.indexOf("/assets/")) : url
  }
  if (url.startsWith("data:") || url.endsWith(".svg")) {
    return url
  }
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`
}

export function BlogSection({ posts }: { posts?: BlogPost[] }) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [activePhoto, setActivePhoto] = useState<{ url: string; caption: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedText, setCopiedText] = useState(false)

  const blogPosts = posts && posts.length > 0 ? posts : []

  const getPostUrl = (post: BlogPost) => {
    return typeof window !== "undefined"
      ? `${window.location.origin}/blog/${post.id}`
      : `https://beecoop-puntovendita.vercel.app/blog/${post.id}`
  }

  const handleShare = async (post: BlogPost) => {
    const postUrl = getPostUrl(post)
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: postUrl,
        })
      } catch (err) {
        // Ignora annullamento utente
      }
    } else {
      navigator.clipboard.writeText(`${post.title}\n\n${postUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWhatsAppShare = (post: BlogPost) => {
    const postUrl = getPostUrl(post)
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `🫒 *${post.title}*\n\n${post.excerpt}\n\n👉 Leggi la storia completa con tutte le foto:\n${postUrl}`
    )}`
    window.open(waUrl, "_blank")
  }

  const handleFacebookShare = (post: BlogPost) => {
    const postUrl = getPostUrl(post)
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
    window.open(fbUrl, "_blank")
  }

  const handleCopyText = (post: BlogPost) => {
    const postUrl = getPostUrl(post)
    const fullText = `${post.title}\n\n${post.content.join("\n\n")}\n\nLeggi l'articolo con la galleria fotografica qui: ${postUrl}`
    navigator.clipboard.writeText(fullText)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
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

                  {post.galleryImages && post.galleryImages.length > 0 && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] text-white/90 backdrop-blur-md border border-white/15">
                      <Images className="h-3 w-3 text-[#2487ce]" />
                      <span>{post.galleryImages.length} foto</span>
                    </div>
                  )}
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
                  Leggi l&apos;articolo a pagina intera
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

      {/* Visualizzatore Articolo a Pagina Intera */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950 text-white select-text transition-all duration-300 min-h-screen scrollbar-thin scrollbar-thumb-white/20"
        >
          {/* Barra di Navigazione Superiore Fissa */}
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-6 py-4 backdrop-blur-xl md:px-14">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-[#2487ce] hover:border-[#2487ce] transition-all cursor-pointer font-medium shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Torna al Blog</span>
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/70 font-semibold">
              <span className="text-white font-serif font-black">BEE</span>
              <span className="text-[#2487ce] font-serif font-black">COOP</span>
              <span className="text-white/30">•</span>
              <span>Diario di Comunità</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => handleWhatsAppShare(selectedPost)}
                className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 sm:px-4 py-2 text-xs uppercase tracking-wider text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer font-medium"
                title="Condividi solo questo post su WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare(selectedPost)}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-wider text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Copia link diretto di questo articolo"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="hidden sm:inline text-emerald-400 font-semibold">Copiato!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-[#2487ce]" />
                    <span className="hidden sm:inline">Copia Link Post</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Chiudi e torna al sito"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Contenuto Articolo a Pagina Intera */}
          <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
            {/* Tag Categoria */}
            {selectedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedPost.tags.map((tag, idx) => (
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
              {selectedPost.title}
            </h1>

            {/* Autore & Data */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/60 pb-8 border-b border-white/10">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#2487ce]" />
                <span className="font-medium text-white/90">{selectedPost.author}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-2 text-[#2487ce]">
                <Calendar className="h-4 w-4" />
                <span>{selectedPost.publishedAt}</span>
              </span>
              {selectedPost.galleryImages && selectedPost.galleryImages.length > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-white/70">
                    <Images className="h-4 w-4 text-[#2487ce]" />
                    <span>{selectedPost.galleryImages.length} fotografie</span>
                  </span>
                </>
              )}
            </div>

            {/* Box Condivisione Rapida (Solo questo post) */}
            <div className="my-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-white/60 font-light">
                Condividi <strong>solo questo post</strong> con i tuoi amici:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleWhatsAppShare(selectedPost)}
                  className="flex items-center gap-1 rounded-full bg-emerald-600/80 hover:bg-emerald-600 px-3 py-1.5 text-xs text-white transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleFacebookShare(selectedPost)}
                  className="flex items-center gap-1 rounded-full bg-blue-600/80 hover:bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors cursor-pointer"
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleShare(selectedPost)}
                  className="flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-white transition-colors cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5 text-[#2487ce]" />
                  {copied ? "Link Copiato!" : "Copia Link Post"}
                </button>
                <button
                  onClick={() => handleCopyText(selectedPost)}
                  className="flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs text-white transition-colors cursor-pointer"
                  title="Copia l'intero testo formattato pronto da incollare su Instagram o Facebook"
                >
                  <Copy className="h-3.5 w-3.5 text-amber-400" />
                  {copiedText ? "Testo Copiato!" : "Copia Testo per Social"}
                </button>
              </div>
            </div>

            {/* Grande Immagine di Copertina */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-black/50 my-10 border border-white/15 shadow-2xl">
              <img
                src={getOptimizedImageUrl(selectedPost.coverImage, 1400)}
                alt={selectedPost.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    "https://www.beecoop.it/assets/img/portfolio/ulivi2.jpg"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Testo Completo con Formattazione Editoriale TOV */}
            <div className="space-y-6 text-white/90 text-lg sm:text-xl leading-relaxed font-light">
              {selectedPost.content.map((paragraph, idx) => {
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
            {selectedPost.galleryImages && selectedPost.galleryImages.length > 0 && (
              <section className="mt-16 pt-12 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2487ce]/20 text-[#2487ce]">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl text-white font-light">
                        I Momenti della Giornata
                      </h3>
                      <p className="text-xs text-white/50 mt-0.5">
                        Clicca su ogni fotografia per ingrandirla a pieno schermo
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto rounded-full bg-white/5 border border-white/15 px-3 py-1 text-xs text-white/70">
                    {selectedPost.galleryImages.length} scatti
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {selectedPost.galleryImages.map((photo, pIdx) => {
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
                          alt={photoCaption || selectedPost.title}
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

            {/* Barra Azioni a Fondo Pagina */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5">
              <button
                onClick={() => setSelectedPost(null)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs uppercase tracking-wider font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Torna a tutte le storie
              </button>

              <button
                onClick={() => handleShare(selectedPost)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#2487ce] px-7 py-3 text-xs uppercase tracking-wider font-semibold text-white hover:bg-[#1f73b0] transition-colors cursor-pointer shadow-xl"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    Copiato negli Appunti!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Condividi questa storia
                  </>
                )}
              </button>
            </div>
          </main>
        </div>
      )}

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
    </section>
  )
}


