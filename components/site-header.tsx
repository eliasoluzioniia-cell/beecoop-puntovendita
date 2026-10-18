"use client"

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="flex items-center justify-between px-6 py-6 text-white md:px-14">
        {/* Brand Logo */}
        <a
          href="/"
          className="pointer-events-auto flex items-center gap-2 text-2xl font-black tracking-wider text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] transition-opacity hover:opacity-80 md:text-3xl"
        >
          <span className="text-white font-serif">BEE</span>
          <span className="text-[#2487ce] font-serif">COOP</span>
        </a>

        {/* Navigation */}
        <nav className="pointer-events-auto flex items-center gap-5 text-[10px] md:text-xs uppercase tracking-[0.25em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] md:gap-10">
          <a href="/#progetto" className="transition-opacity hover:opacity-60">
            Il Progetto
          </a>
          <a href="/#blog" className="transition-opacity hover:opacity-60">
            Blog
          </a>
          <a href="/shop" className="transition-opacity hover:opacity-60">
            Shop
          </a>
          <a href="/#about" className="hidden transition-opacity hover:opacity-60 sm:inline">
            Chi Siamo
          </a>
          <a 
            href="https://www.beecoop.it/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 transition-all hover:bg-[#2487ce] hover:text-white hover:border-[#2487ce] font-semibold"
          >
            Sito Ufficiale
          </a>
        </nav>
      </div>
    </header>
  )
}
