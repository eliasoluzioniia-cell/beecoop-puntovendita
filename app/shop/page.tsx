import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { ProductSection } from "@/components/product-section"
import { ContactSection } from "@/components/contact-section"
import { VideoBg } from "@/components/video-bg"
import { getProducts } from "@/lib/notion"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Shop Solidale | Bee Coop - La Follia che si fa Realtà",
  description:
    "Acquista i prodotti biologici e l'artigianato della Cooperativa Sociale Bee Coop. Ogni acquisto sostiene l'integrazione e il lavoro di persone con disabilità.",
  openGraph: {
    title: "Bee Coop - Il Nostro Shop Solidale",
    description:
      "Coltiviamo con dedizione la terra siciliana e creiamo prodotti artigianali unici. Il tuo acquisto sostiene l'integrazione lavorativa di persone con disabilità.",
    url: "https://beecoop-puntovendita.vercel.app/shop",
    type: "website",
  },
}

export default async function ShopPage() {
  const productsData = await getProducts().catch((err) => {
    console.error("Errore nel recupero dei prodotti Notion per la pagina /shop:", err)
    return []
  })

  return (
    <main id="top" className="relative scrollbar-none min-h-screen">
      {/* Sfondo Video 3D Parallattico e Musica di Sottofondo */}
      <VideoBg />

      {/* Navigation Bar */}
      <SiteHeader />

      {/* Spaziatura superiore per compensare la navbar fissa */}
      <div className="pt-16 md:pt-20">
        {/* Sezione E-commerce Dedicata */}
        <ProductSection products={productsData} />
      </div>

      {/* Sezione Contatti e Footer */}
      <ContactSection />
    </main>
  )
}
