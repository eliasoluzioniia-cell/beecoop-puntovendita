import { SiteHeader } from "@/components/site-header"
import { VerticalGallery } from "@/components/horizontal-gallery"
import { ProductSection } from "@/components/product-section"
import { EditorialGrid } from "@/components/editorial-grid"
import { BlogSection } from "@/components/blog-section"
import { AboutSection } from "@/components/about-section"
import { ContactSection } from "@/components/contact-section"
import { VideoBg } from "@/components/video-bg"
import { getGallery, getGrid, getAbout, getProducts, getBlogPosts } from "@/lib/notion"

// Forza il rendering dinamico per recuperare i dati in tempo reale ed evitare la scadenza degli URL delle immagini di Notion
export const dynamic = "force-dynamic"

export default async function Page() {
  // Eseguiamo il fetch in parallelo da Notion.
  // Se una chiamata fallisce, intercettiamo l'errore per caricare i fallback senza rompere il sito.
  const [galleryData, productsData, gridData, aboutData, blogData] = await Promise.all([
    getGallery().catch((err) => {
      console.error("Errore nel recupero della galleria Notion:", err)
      return []
    }),
    getProducts().catch((err) => {
      console.error("Errore nel recupero dei prodotti Notion:", err)
      return []
    }),
    getGrid().catch((err) => {
      console.error("Errore nel recupero della griglia Notion:", err)
      return []
    }),
    getAbout().catch((err) => {
      console.error("Errore nel recupero di about me Notion:", err)
      return null
    }),
    getBlogPosts().catch((err) => {
      console.error("Errore nel recupero del blog Notion:", err)
      return []
    }),
  ])

  return (
    <main id="top" className="relative scrollbar-none min-h-screen">
      {/* Sfondo Video 3D Parallattico e Musica di Sottofondo */}
      <VideoBg />

      {/* Navigation Bar */}
      <SiteHeader />

      {/* Slide Hero Iniziali (Galleria da Notion o fallback Bee Coop) */}
      <VerticalGallery slides={galleryData} />

      {/* Sezione Community (Griglia editoriale delle storie) */}
      <EditorialGrid images={gridData} />

      {/* Sezione Blog / Diario di Borgo Cascino & Bottega (Sincronizzato con Facebook post-approvazione Andrea) */}
      <BlogSection posts={blogData} />

      {/* Sezione E-commerce (Catalogo Prodotti da Notion con Checkout Stripe) */}
      <ProductSection products={productsData} />

      {/* Sezione Storia Cooperativa (Chi Siamo) */}
      <AboutSection data={aboutData} />

      {/* Sezione Contatti e Footer */}
      <ContactSection />
    </main>
  )
}
