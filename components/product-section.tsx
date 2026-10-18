"use client"

import { useState, useEffect } from "react"
import { ProductItem } from "@/lib/notion"
import { ShoppingCart, AlertCircle, Sparkles, Plus, Minus, Trash2, X, CheckCircle2, Loader2, Share2, Check } from "lucide-react"

function getOptimizedImageUrl(url: string | undefined, width: number, quality = 75) {
  if (!url) return "/placeholder.jpg"
  if (url.startsWith("data:") || url.endsWith(".svg") || url.startsWith("/assets/")) {
    return url
  }
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`
}

type CartItem = {
  product: ProductItem
  quantity: number
}

export function ProductSection({ products }: { products: ProductItem[] }) {
  const [activeCategory, setActiveCategory] = useState("Tutti")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  // Form contatti
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  })

  // Estrai tutte le categorie uniche dai prodotti (gestendo anche categorie multiple separate da virgola)
  const categories = ["Tutti", ...Array.from(
    new Set(
      products
        .flatMap(p => p.category.split(",").map(c => c.trim()))
        .filter(Boolean)
    )
  )]

  useEffect(() => {
    const handleFilter = (e: Event) => {
      const customEvent = e as CustomEvent<{ category: string; title: string } | string>
      const detail = customEvent.detail
      if (!detail) return

      let targetCategory = ""
      let fallbackTitle = ""

      if (typeof detail === "string") {
        targetCategory = detail
      } else if (detail && typeof detail === "object") {
        targetCategory = detail.category || ""
        fallbackTitle = detail.title || ""
      }

      const matchAndSelect = (catName: string): boolean => {
        if (!catName) return false
        const matched = categories.find(
          c => c.toLowerCase() === catName.toLowerCase()
        )
        if (matched) {
          setActiveCategory(matched)
          return true
        }
        const partial = categories.find(
          c => c.toLowerCase().includes(catName.toLowerCase()) || 
               catName.toLowerCase().includes(c.toLowerCase())
        )
        if (partial) {
          setActiveCategory(partial)
          return true
        }
        return false
      }

      // Prova a cercare la corrispondenza prima con la categoria
      let found = matchAndSelect(targetCategory)

      // Se non l'ha trovata, prova a cercare con il titolo della foto (es. "Ortaggi", "Frutti")
      if (!found && fallbackTitle) {
        found = matchAndSelect(fallbackTitle)
      }

      // Scorri alla sezione prodotti
      const el = document.getElementById("prodotti")
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }

    window.addEventListener("filter-category", handleFilter)
    return () => {
      window.removeEventListener("filter-category", handleFilter)
    }
  }, [categories])

  // Rileva se l'utente atterra direttamente con l'ancora #shop o #prodotti
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.toLowerCase()
      if (hash === "#shop" || hash === "#prodotti") {
        const el = document.getElementById("shop") || document.getElementById("prodotti")
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth" })
          }, 350)
        }
      }
    }
  }, [])

  // Condivisione della pagina Shop sui social o tramite menu di sistema
  const handleShareShop = async () => {
    const shopUrl = typeof window !== "undefined"
      ? `${window.location.origin}/shop`
      : "https://beecoop-puntovendita.vercel.app/shop"

    const shareData = {
      title: "Bee Coop - Il Nostro Shop Solidale",
      text: "Scopri i prodotti artigianali e biologici della cooperativa Bee Coop!",
      url: shopUrl,
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return
        }
      }
    }

    // Fallback: copia negli appunti
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shopUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch (err) {
        console.error("Errore durante la copia negli appunti:", err)
      }
    }
  }

  // Filtra i prodotti in base alla categoria attiva
  const filteredProducts = activeCategory === "Tutti"
    ? products
    : products.filter(p => 
        p.category.split(",").map(c => c.trim()).includes(activeCategory)
      )

  // Gestione carrello
  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    setCart((prev) => {
      if (newQty <= 0) {
        return prev.filter((item) => item.product.id !== productId)
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    })
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const getCartTotal = () => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return

    setIsSubmitting(true)

    try {
      const orderPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        total: getCartTotal().toFixed(2),
        items: cart.map(item => ({
          id: item.product.id,
          title: item.product.title,
          quantity: item.quantity,
          price: item.product.price
        }))
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderPayload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Errore durante l'invio dell'ordine.")
      }

      setIsSuccess(true)
      setIsCartOpen(false)
    } catch (err: any) {
      console.error(err)
      alert(`Si è verificato un errore durante l'invio dell'ordine: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Assegna ciclicamente le classi di fluttuazione per un look organico
  const getFloatClass = (index: number) => {
    const floatClasses = ["animate-float-1", "animate-float-2", "animate-float-3"]
    return floatClasses[index % floatClasses.length]
  }

  return (
    <section id="prodotti" className="relative px-6 py-24 md:px-14 md:py-36 snap-start min-h-screen flex flex-col justify-center">
      {/* Ancora alternativa per la condivisione diretta */}
      <div id="shop" className="absolute -top-12 left-0 pointer-events-none" />
      
      {/* CSS Animazioni e Stili Personalizzati */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}} />

      <div className="mx-auto w-full max-w-7xl">
        
        {/* Intestazione Sezione */}
        <div className="relative flex flex-col items-center text-center mb-16">
          {/* Pulsante Condividi Sezione Shop */}
          <div className="w-full flex justify-end mb-4 md:absolute md:top-0 md:right-0 md:mb-0 z-10">
            <button
              type="button"
              onClick={handleShareShop}
              className="group relative flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/90 backdrop-blur-md transition-all duration-300 hover:border-[#2487ce] hover:bg-[#2487ce]/20 hover:text-white hover:shadow-[0_0_15px_rgba(36,135,206,0.3)] active:scale-95 cursor-pointer"
              title="Condividi lo Shop sui social"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400 transition-transform duration-300 scale-110" />
                  <span className="text-emerald-300 font-semibold tracking-wider">Link Copiato!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-[#2487ce] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  <span>Condividi lo Shop</span>
                </>
              )}
            </button>
          </div>

          <span className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[#2487ce] font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            <Sparkles className="h-4 w-4" /> I Frutti della Terra e dell&apos;Inclusione
          </span>
          <h2 className="mt-4 font-serif text-4xl font-light italic leading-none tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] md:text-7xl">
            Il Nostro Shop
          </h2>
          <p className="mt-6 max-w-2xl text-pretty text-base text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] md:text-lg">
            Coltiviamo con dedizione la terra siciliana e creiamo prodotti artigianali unici. 
            Il tuo acquisto sostiene l&apos;integrazione lavorativa di persone con disabilità.
          </p>
        </div>

        {/* Filtri Categoria in Vetro Sfocato */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-black/30 p-2 backdrop-blur-md">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#2487ce] text-white shadow-[0_0_15px_rgba(36,135,206,0.3)] font-semibold"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Griglia Prodotti */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-white/60">
            <AlertCircle className="h-12 w-12 text-white/40 mb-4" />
            <p className="text-lg">Nessun prodotto disponibile in questa categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
            {filteredProducts.map((product, idx) => {
              const cartItem = cart.find(item => item.product.id === product.id)
              const quantityInCart = cartItem ? cartItem.quantity : 0

              return (
                <div
                  key={product.id}
                  className={`group relative flex flex-col justify-between w-full max-w-sm rounded-[24px] border border-white/15 bg-white/10 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-500 hover:scale-[1.03] hover:border-white/20 hover:bg-white/15 ${getFloatClass(
                    idx
                  )}`}
                >
                  {/* Immagine con Overlay di Zoom */}
                  <div className="relative h-60 w-full overflow-hidden rounded-[18px] bg-slate-900">
                    <img
                      src={getOptimizedImageUrl(product.src || "/placeholder.jpg", 640)}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%231E293B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748B' font-family='sans-serif' font-size='16'%3EImmagine non disponibile%3C/text%3E%3C/svg%3E"
                      }}
                    />
                    {/* Badge Categoria */}
                    <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-white backdrop-blur-sm select-none">
                      {product.category.split(",")[0] || "Prodotto"}
                    </span>
                    
                    {/* Badge Non Disponibile */}
                    {!product.available && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[11px] uppercase tracking-[0.3em] font-semibold text-red-400 select-none">
                        Esaurito
                      </span>
                    )}
                  </div>

                  {/* Dettagli Prodotto */}
                  <div className="mt-5 flex flex-col flex-grow">
                    <div className="flex items-start justify-between">
                      <h3 className="font-serif text-xl font-light italic leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                        {product.title}
                      </h3>
                      <div className="text-right ml-3">
                        <span className="font-sans text-lg font-semibold text-[#6ab8f3] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                          €{product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Informazioni Aggiuntive (Formato/Peso) */}
                    {product.weight && (
                      <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
                        Formato: {product.weight}
                      </span>
                    )}

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/70">
                      {product.description || "Un prodotto genuino e artigianale coltivato ed elaborato con passione a Enna dai soci della cooperativa sociale Bee Coop."}
                    </p>

                    {/* Ingredienti (se presenti) */}
                    {product.ingredients && (
                      <div className="mt-3 text-[10px] text-white/40 italic">
                        Ingredienti: {product.ingredients}
                      </div>
                    )}
                  </div>

                  {/* Azione Aggiungi al Carrello */}
                  <div className="mt-6 pt-4 border-t border-white/5">
                    {!product.available ? (
                      <button
                        disabled
                        className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-xs uppercase tracking-[0.25em] font-semibold text-white/30 cursor-not-allowed"
                      >
                        Non Disponibile
                      </button>
                    ) : quantityInCart > 0 ? (
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-1 border border-white/20 rounded-full bg-black/20 p-1 shrink-0">
                          <button
                            onClick={() => handleUpdateQuantity(product.id, quantityInCart - 1)}
                            className="p-1.5 text-white hover:text-[#6ab8f3] transition-colors cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-white">
                            {quantityInCart}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(product.id, quantityInCart + 1)}
                            className="p-1.5 text-white hover:text-[#6ab8f3] transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => setIsCartOpen(true)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#2487ce]/20 border border-[#2487ce]/40 px-3 py-3 text-[9px] uppercase tracking-[0.2em] font-bold text-white transition-all duration-300 hover:bg-[#2487ce] cursor-pointer"
                        >
                          Carrello ({cart.reduce((acc, curr) => acc + curr.quantity, 0)})
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex w-full items-center justify-center gap-3 rounded-full bg-[#2487ce] px-6 py-3.5 text-xs uppercase tracking-[0.25em] font-bold text-white shadow-[0_4px_15px_rgba(36,135,206,0.3)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#1a6fa9] active:scale-[0.98] cursor-pointer"
                      >
                        <ShoppingCart className="h-4 w-4" /> Aggiungi al Carrello
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pulsante Carrello Fluttuante (Floating Cart Button) */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center gap-3 rounded-full border border-white/20 bg-black/60 px-6 py-4 text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-[#2487ce] cursor-pointer group"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6 text-white" />
            <span className="absolute -top-2.5 -right-2.5 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-[#2487ce] group-hover:bg-white group-hover:text-[#2487ce] text-[10px] font-bold text-white transition-colors">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <span className="text-xs uppercase tracking-[0.25em] font-bold hidden sm:inline">
            Vedi Carrello
          </span>
        </button>
      )}

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
          {/* Clicca fuori per chiudere */}
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

          {/* Contenuto Drawer */}
          <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#0f172a]/95 p-6 shadow-2xl backdrop-blur-xl md:p-8 animate-slide-in">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5 shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-[#2487ce]" />
                <h3 className="font-serif text-2xl font-light text-white">Il tuo Carrello</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-2 text-white/60 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Lista Articoli (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-white/40">
                  <ShoppingCart className="h-10 w-10 mb-3" />
                  <p className="text-sm">Il carrello è vuoto.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/5 p-4"
                  >
                    <img
                      src={getOptimizedImageUrl(item.product.src || "/placeholder.jpg", 128)}
                      alt={item.product.title}
                      className="h-16 w-16 rounded-lg object-cover bg-slate-900 border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-medium text-white truncate">
                        {item.product.title}
                      </h4>
                      <p className="text-xs text-[#6ab8f3] mt-0.5">
                        €{item.product.price.toFixed(2)} / cad.
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1 border border-white/10 rounded-full bg-black/45 p-0.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="text-[9px] text-red-400 hover:underline flex items-center gap-1 cursor-pointer mt-0.5"
                      >
                        <Trash2 className="h-3 w-3" /> Rimuovi
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Riepilogo Checkout e Form */}
            {cart.length > 0 && (
              <div className="border-t border-white/10 pt-5 mt-auto shrink-0 overflow-y-auto max-h-[55vh] pr-1 scrollbar-thin">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/60">Totale Ordine</span>
                  <span className="font-sans text-2xl font-bold text-[#6ab8f3]">
                    €{getCartTotal().toFixed(2)}
                  </span>
                </div>

                {/* Form Dati Cliente */}
                <form onSubmit={handleSubmitOrder} className="space-y-4 pb-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] text-white/50 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Esempio: Fabio Rossi"
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#2487ce] focus:outline-none focus:ring-1 focus:ring-[#2487ce] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.15em] text-white/50 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Esempio: fabio@email.com"
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#2487ce] focus:outline-none focus:ring-1 focus:ring-[#2487ce] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.15em] text-white/50 mb-1">
                        Telefono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Esempio: +39 345 678910"
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#2487ce] focus:outline-none focus:ring-1 focus:ring-[#2487ce] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] text-white/50 mb-1">
                      Indirizzo di Spedizione / Consegna
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Via, Civico, Città, CAP"
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#2487ce] focus:outline-none focus:ring-1 focus:ring-[#2487ce] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] text-white/50 mb-1">
                      Note o preferenze
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Specifiche sulla consegna, orari o richieste particolari..."
                      rows={2}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-[#2487ce] focus:outline-none focus:ring-1 focus:ring-[#2487ce] transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 flex items-center justify-center gap-3 rounded-full bg-[#2487ce] px-6 py-4 text-xs uppercase tracking-[0.25em] font-bold text-white shadow-[0_4px_15px_rgba(36,135,206,0.3)] transition-all duration-300 hover:bg-[#1a6fa9] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Invio in corso...
                      </>
                    ) : (
                      "Invia l'Ordine"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal di Successo (Success Modal Overlay) */}
      {isSuccess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-6 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0f172a]/95 p-8 text-center shadow-2xl backdrop-blur-xl flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 text-green-400 mb-6">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <h3 className="font-serif text-3xl font-light text-white mb-3">Grazie per l&apos;Ordine!</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Abbiamo ricevuto correttamente la tua richiesta. L&apos;ordine è stato registrato nel nostro sistema e ti contatteremo a breve per definire il pagamento e le modalità di consegna.
            </p>
            <button
              onClick={() => {
                setIsSuccess(false)
                setCart([])
                setFormData({ name: "", email: "", phone: "", address: "", notes: "" })
              }}
              className="px-8 py-3 rounded-full bg-[#2487ce] hover:bg-[#1a6fa9] text-xs uppercase tracking-[0.25em] font-bold text-white transition-all cursor-pointer shadow-[0_4px_15px_rgba(36,135,206,0.3)]"
            >
              Torna allo Shop
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
