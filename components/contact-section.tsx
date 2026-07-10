"use client"

import { ArrowUpRight, Globe, Heart, Sparkles } from "lucide-react"

export function ContactSection() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="relative border-t border-white/10 bg-black/60 px-6 py-24 text-white md:px-14 md:py-36 snap-start">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/50">
          <span className="h-px w-8 bg-[#2487ce]" />
          Contatti &amp; Community
        </div>

        <div className="mt-10 flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-balance font-serif text-5xl font-light leading-[0.98] tracking-tight md:text-8xl">
              Uniti nella
              <br />
              follia sociale <span className="italic text-[#2487ce]">positiva.</span>
            </h2>
          </div>
          <a
            href="mailto:elia.soluzioni.ia@gmail.com"
            className="group inline-flex items-center gap-4 self-start text-lg tracking-tight transition-all hover:text-[#2487ce] md:self-end md:text-2xl"
          >
            <span className="font-serif italic text-white/80 group-hover:text-[#2487ce]">elia.soluzioni.ia@gmail.com</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-transform duration-300 group-hover:rotate-45 group-hover:border-[#2487ce] group-hover:bg-[#2487ce] group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </a>
        </div>

        {/* Links row */}
        <div className="mt-24 grid grid-cols-1 gap-12 border-t border-white/10 pt-10 text-sm sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">Sede Negozio</div>
            <p className="mt-4 leading-relaxed text-white/70">
              Via Roma (Bassa)
              <br />
              Enna, Sicilia, Italia
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">Social &amp; Link</div>
            <ul className="mt-4 space-y-3 text-white/70">
              <li>
                <a 
                  href="https://www.beecoop.it/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 transition-all hover:text-[#2487ce]"
                >
                  <Globe className="h-4 w-4" /> Sito Ufficiale
                </a>
              </li>
              <li>
                <a 
                  href="https://www.youtube.com/@E.L.I.A-j2s" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 transition-all hover:text-[#2487ce]"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25a29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                  </svg> Canale YouTube
                </a>
              </li>
              <li>
                <a 
                  href="https://elia-soluzioni-ia.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 transition-all hover:text-[#2487ce]"
                >
                  <Sparkles className="h-4 w-4" /> ELIA Soluzioni IA
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">La Nostra Visione</div>
            <p className="mt-4 leading-relaxed text-white/70">
              Cooperativa sociale di tipo B per l&apos;indipendenza economica e la dignità del lavoro delle persone fragili.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">Sostienici</div>
            <p className="mt-4 leading-relaxed text-white/70">
              Acquista i nostri prodotti, parla del progetto e aiutaci ad accendere una vetrina di speranza nel cuore di Enna.
            </p>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 text-xs uppercase tracking-[0.25em] text-white/40 md:flex-row md:items-center md:justify-between border-t border-white/5 pt-8">
          <span className="flex items-center gap-1.5">
            © {currentYear} Bee Coop · Made with <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> by ELIA Team
          </span>
          <span>Aprire una vetrina dove troppe se ne sono spente.</span>
        </div>
      </div>
    </footer>
  )
}
