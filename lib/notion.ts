import { Client } from "@notionhq/client"

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

export interface GalleryItem {
  src: string
  srcMobile?: string
  title: string
  description?: string
  containImage?: boolean
  hideText?: boolean
}

export interface GridItem {
  src: string
  title: string
  category: string
}

export interface AboutData {
  portrait: string
  name: string
  headline: string
  biography: string[]
  location: string
  activeSince: string
  specialization: string
  awards: string
}

export interface ProductItem {
  id: string
  title: string
  price: number
  description: string
  stripeLink: string
  src: string
  available: boolean
  category: string
  weight?: string
  ingredients?: string
  producer?: string
}

const FALLBACK_PRODUCTS: ProductItem[] = [
  { id: "1", title: "Arance", price: 2.50, description: "Arance fresche e biologiche coltivate con cura nei nostri frutteti.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/arance.jpg", available: true, category: "Frutti", producer: "Bee Coop" },
  { id: "2", title: "Limoni", price: 2.00, description: "Limoni di Sicilia freschi e profumati, ideali per ogni ricetta.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/Limoni.jpg", available: true, category: "Frutti", producer: "Bee Coop" },
  { id: "3", title: "Fichi d'India", price: 3.00, description: "I deliziosi e tipici fichi d'india della nostra terra siciliana.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/fichidindia.jpg", available: true, category: "Frutti", producer: "Bee Coop" },
  { id: "4", title: "Mandorle", price: 8.00, description: "Mandorle sgusciate ricche di nutrienti, ideali per spuntini o dolci.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/Mandorle.jpg", available: true, category: "Frutti", producer: "Bee Coop" },
  { id: "5", title: "Olio Extravergine", price: 12.00, description: "Olio extravergine di oliva di altissima qualità estratto a freddo.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/olio.jpg", available: true, category: "Olio", producer: "Bee Coop" },
  { id: "6", title: "Broccoletti", price: 1.50, description: "Broccoletti freschi coltivati biologicamente nel nostro orto.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/broccoletti.jpg", available: true, category: "Ortaggi", producer: "Bee Coop" },
  { id: "7", title: "Finocchi", price: 1.80, description: "Finocchi croccanti e profumati, ricchi di fibre e proprietà.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/finocchi.jpg", available: true, category: "Ortaggi", producer: "Bee Coop" },
  { id: "8", title: "Melanzane", price: 2.00, description: "Melanzane polpose, ideali per parmigiane o grigliate.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/melenzane.jpg", available: true, category: "Ortaggi", producer: "Bee Coop" },
  { id: "9", title: "Peperoni", price: 2.40, description: "Peperoni freschi, dolci e colorati, ricchi di vitamina C.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/peperoni.jpg", available: true, category: "Ortaggi", producer: "Bee Coop" },
  { id: "10", title: "Zucchine Verdi", price: 1.90, description: "Zucchine verdi novelle e tenere, ottime da fare al vapore o grigliate.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/zucchine_verdi.jpg", available: true, category: "Ortaggi", producer: "Bee Coop" },
  { id: "11", title: "Pomodori", price: 2.20, description: "Pomodori maturi e succosi per insalate o salse fresche.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/Pomodori.jpg", available: true, category: "Ortaggi", producer: "Bee Coop" },
  { id: "12", title: "Basilico", price: 1.00, description: "Foglie di basilico fresco e profumato per i tuoi piatti estivi.", stripeLink: "#", src: "https://www.beecoop.it/assets/img/portfolio/basilico.jpg", available: true, category: "Erbe Aromatiche", producer: "Bee Coop" }
]

// Funzione helper per interrogare un database Notion tramite le nuove API Data Sources (Notion Version 2025-09-03)
async function queryDatabase(databaseId: string, options: Omit<any, "data_source_id"> = {}): Promise<any> {
  const db = await notion.databases.retrieve({ database_id: databaseId })
  const dataSourceId = db.data_sources?.[0]?.id
  if (!dataSourceId) {
    throw new Error(`Nessuna data source trovata per il database: ${databaseId}`)
  }
  return await notion.dataSources.query({
    data_source_id: dataSourceId,
    ...options,
  })
}

// Funzione helper ricorsiva per recuperare tutti i blocchi figli di una pagina o blocco Notion
async function getAllBlocks(blockId: string): Promise<any[]> {
  const blocks: any[] = []
  let cursor: string | undefined = undefined
  
  do {
    const response: any = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    })
    blocks.push(...response.results)
    cursor = response.next_cursor || undefined
  } while (cursor)

  for (const block of blocks) {
    if (block.has_children) {
      block.children = await getAllBlocks(block.id)
    }
  }

  return blocks
}

// Funzione helper per appiattire l'albero dei blocchi in una lista lineare
function flattenBlocks(blocks: any[]): any[] {
  const flat: any[] = []
  for (const block of blocks) {
    flat.push(block)
    if (block.children) {
      flat.push(...flattenBlocks(block.children))
    }
  }
  return flat
}

// Funzione helper per estrarre il testo da un blocco Notion
function getBlockText(block: any): string {
  const type = block.type
  const richText = block[type]?.rich_text
  if (richText && Array.isArray(richText)) {
    return richText.map((t: any) => t.plain_text).join("")
  }
  return ""
}

// Funzione helper per estrarre l'URL dell'immagine da un blocco Notion
function getBlockImageUrl(block: any): string {
  if (block.type !== "image") return ""
  const image = block.image
  if (!image) return ""
  if (image.type === "file") {
    return image.file.url
  } else if (image.type === "external") {
    return image.external.url
  }
  return ""
}

// Funzione helper per estrarre gli URL da un campo file/immagine di Notion
function getImageUrlFromProperty(prop: any): string {
  const fileProp = prop?.files?.[0]
  if (!fileProp) return ""
  if (fileProp.type === "file") {
    return fileProp.file.url
  } else if (fileProp.type === "external") {
    return fileProp.external.url
  }
  return ""
}

export async function getGallery(): Promise<GalleryItem[]> {
  const databaseId = process.env.NOTION_GALLERY_DATABASE_ID
  if (!databaseId) {
    console.warn("NOTION_GALLERY_DATABASE_ID non definito in .env.local")
    return []
  }

  try {
    const response = await queryDatabase(databaseId, {
      filter: {
        property: "Visibile",
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: "Ordine",
          direction: "ascending",
        },
      ],
    })

    return response.results.map((page: any) => {
      const title = page.properties.Titolo?.title?.map((t: any) => t.plain_text).join("") || ""
      const src = getImageUrlFromProperty(page.properties.Immagine)
      const srcMobile = getImageUrlFromProperty(page.properties["Immagine Mobile"] || page.properties["ImmagineMobile"] || page.properties["Foto Mobile"] || page.properties["Mobile"]) || undefined
      const description = page.properties.Didascalia?.rich_text?.map((t: any) => t.plain_text).join("") || ""
      const tags = page.properties.Tag?.multi_select?.map((t: any) => t.name) || []
      const containImage = tags.includes("Intera") || tags.includes("No Ritaglio") || tags.includes("Contieni") || tags.includes("Solo Immagine")
      const hideText = tags.includes("No Testo") || tags.includes("Nascondi Testo") || (tags.includes("Solo Immagine") && !tags.includes("Intera"))
      return { title, src, srcMobile, description, containImage, hideText }
    }).filter((item: GalleryItem) => item.src !== "")
  } catch (error) {
    console.error("Errore getGallery da Notion, provo query semplice senza filtri:", error)
    try {
      const response = await queryDatabase(databaseId)
      return response.results.map((page: any) => {
        const title = page.properties.Titolo?.title?.map((t: any) => t.plain_text).join("") || ""
        const src = getImageUrlFromProperty(page.properties.Immagine) || getImageUrlFromProperty(page.properties.Foto)
        const srcMobile = getImageUrlFromProperty(page.properties["Immagine Mobile"] || page.properties["ImmagineMobile"] || page.properties["Foto Mobile"] || page.properties["Mobile"]) || undefined
        const description = (page.properties.Didascalia || page.properties.Descrizione)?.rich_text?.map((t: any) => t.plain_text).join("") || ""
        const tags = page.properties.Tag?.multi_select?.map((t: any) => t.name) || []
        const containImage = tags.includes("Intera") || tags.includes("No Ritaglio") || tags.includes("Contieni") || tags.includes("Solo Immagine")
        const hideText = tags.includes("No Testo") || tags.includes("Nascondi Testo") || (tags.includes("Solo Immagine") && !tags.includes("Intera"))
        return { title, src, srcMobile, description, containImage, hideText }
      }).filter((item: GalleryItem) => item.src !== "")
    } catch (fallbackError) {
      console.error("Errore query fallback getGallery:", fallbackError)
      return []
    }
  }
}

export async function getGrid(): Promise<GridItem[]> {
  const databaseId = process.env.NOTION_GRID_DATABASE_ID
  if (!databaseId) {
    console.warn("NOTION_GRID_DATABASE_ID non definito in .env.local")
    return []
  }

  try {
    const response = await queryDatabase(databaseId, {
      filter: {
        property: "Visibile",
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: "Data Pubblicazione",
          direction: "descending",
        },
      ],
    })

    return response.results.map((page: any) => {
      const title = page.properties.Titolo?.title?.map((t: any) => t.plain_text).join("") || ""
      const category = page.properties.Intro?.rich_text?.map((t: any) => t.plain_text).join("") || "Progetto"
      const src = getImageUrlFromProperty(page.properties.Copertina)
      return { title, category, src }
    }).filter((item: GridItem) => item.src !== "")
  } catch (error) {
    console.error("Errore getGrid da Notion, provo query semplice senza filtri:", error)
    try {
      const response = await queryDatabase(databaseId)
      return response.results.map((page: any) => {
        const title = page.properties.Titolo?.title?.map((t: any) => t.plain_text).join("") || 
                      page.properties["Nome Progetto"]?.title?.map((t: any) => t.plain_text).join("") || ""
        const category = (page.properties.Intro || page.properties.Categoria)?.rich_text?.map((t: any) => t.plain_text).join("") || "Progetto"
        const src = getImageUrlFromProperty(page.properties.Copertina) || getImageUrlFromProperty(page.properties["Copertina Progetto"])
        return { title, category, src }
      }).filter((item: GridItem) => item.src !== "")
    } catch (fallbackError) {
      console.error("Errore query fallback getGrid:", fallbackError)
      return []
    }
  }
}

export async function getCategories(): Promise<Record<string, string>> {
  const databaseId = "882a7c60-6dc8-46ff-ae83-4f871c0bea6d"
  try {
    const response = await queryDatabase(databaseId)
    const categoriesMap: Record<string, string> = {}
    response.results.forEach((page: any) => {
      const name = page.properties.Categoria?.title?.map((t: any) => t.plain_text).join("") || ""
      if (name) {
        categoriesMap[page.id] = name
      }
    })
    return categoriesMap
  } catch (error) {
    console.error("Errore getCategories da Notion:", error)
    return {}
  }
}

export async function getProducts(): Promise<ProductItem[]> {
  const databaseId = process.env.NOTION_PRODUCTS_DATABASE_ID
  if (!databaseId) {
    console.warn("NOTION_PRODUCTS_DATABASE_ID non definito in .env.local")
    return FALLBACK_PRODUCTS
  }

  try {
    // Carica la mappatura delle categorie in parallelo
    const categoriesMap = await getCategories().catch(err => {
      console.error("Errore getCategories:", err)
      return {} as Record<string, string>
    })

    const response = await queryDatabase(databaseId, {
      filter: {
        property: "Visibile",
        checkbox: {
          equals: true,
        },
      }
    })

    if (response.results.length === 0) {
      return FALLBACK_PRODUCTS
    }

    return response.results.map((page: any) => {
      const id = page.id
      const title = page.properties.Prodotto?.title?.map((t: any) => t.plain_text).join("") || "Prodotto Senza Nome"
      const price = page.properties.Prezzo?.number || 0
      const description = page.properties.Descrizione?.rich_text?.map((t: any) => t.plain_text).join("") || ""
      const stripeLink = page.properties["Link Stripe/Checkout"]?.url || ""
      const src = getImageUrlFromProperty(page.properties.Immagine)
      const available = page.properties.Disponibile?.checkbox !== false // default true se non specificato
      
      const catRelation = page.properties.Categorie?.relation || []
      const category = catRelation.map((rel: any) => categoriesMap[rel.id]).filter(Boolean).join(", ") || "Generico"
      
      const weight = page.properties["Peso/Formato"]?.rich_text?.map((t: any) => t.plain_text).join("") || ""
      const ingredients = page.properties.Ingredienti?.rich_text?.map((t: any) => t.plain_text).join("") || ""
      const producer = page.properties.Produttore?.select?.name || "Bee Coop"

      return { id, title, price, description, stripeLink, src, available, category, weight, ingredients, producer }
    })
  } catch (error) {
    console.error("Errore getProducts da Notion, uso fallback:", error)
    return FALLBACK_PRODUCTS
  }
}

export async function getAbout(): Promise<AboutData | null> {
  const pageId = process.env.NOTION_ABOUT_PAGE_ID
  if (!pageId) {
    console.warn("NOTION_ABOUT_PAGE_ID non definito in .env.local")
    return null
  }

  try {
    const rawBlocks = await getAllBlocks(pageId)
    const blocks = flattenBlocks(rawBlocks)

    const portraitBlock = blocks.find(b => b.type === "image")
    const portrait = portraitBlock ? getBlockImageUrl(portraitBlock) : ""

    let startIndex = blocks.findIndex(b => {
      const text = getBlockText(b).toLowerCase()
      return b.type === "heading_2" && (
        text.includes("chi siamo") || 
        text.includes("about") || 
        text.includes("l'artista") ||
        text.includes("storia")
      )
    })

    if (startIndex === -1) {
      startIndex = 0
    }

    const aboutBlocks = blocks.slice(startIndex + 1)
    
    let headline = ""
    const biography: string[] = []
    
    for (const block of aboutBlocks) {
      const text = getBlockText(block).trim()
      if (!text) continue

      if (text.toLowerCase().includes("sezione shop") || text.toLowerCase().includes("istruzioni operative")) {
        break
      }

      if (!headline) {
        headline = text
      } else {
        biography.push(text)
      }
    }

    return {
      portrait: portrait || "/assets/soci.png", // Fallback al ritratto dei soci se manca l'immagine di copertina
      name: "Bee Coop",
      headline: headline || "La 'Follia' che si fa Realtà nel Cuore di Enna",
      biography: biography.length > 0 ? biography : [
        "In un’epoca segnata da incertezza e rassegnazione, la città di Enna ha un disperato bisogno di 'visionari'. Persone capaci di guardare oltre l’ostacolo, non con il peso della fatica, ma con il sorriso di chi crede fermamente nel futuro.",
        "La Bee Coop è una cooperativa sociale di tipo B che non si accontenta del semplice volontariato: punta all'indipendenza economica e alla dignità del lavoro, con il 75% di soci con disabilità.",
        "Aprire un negozio nella via Roma bassa significa accendere una vetrina dove troppe se ne sono spente; significa dire alla città che non tutto è perduto e che la rinascita è possibile se fondata su valori solidi."
      ],
      location: "Enna, Italia",
      activeSince: "2026",
      specialization: "Cooperativa Sociale · Agricoltura Biologica · Artigianato Locale",
      awards: "75% Soci con Disabilità",
    }
  } catch (error) {
    console.error("Errore getAbout da Notion, uso i dati di fallback:", error)
    return {
      portrait: "/assets/soci.png",
      name: "Bee Coop",
      headline: "La 'Follia' che si fa Realtà nel Cuore di Enna",
      biography: [
        "In un’epoca segnata da incertezza e rassegnazione, la città di Enna ha un disperato bisogno di 'visionari'. Persone capaci di guardare oltre l’ostacolo, non con il peso della fatica, ma con il sorriso di chi crede fermamente nel futuro.",
        "La Bee Coop è una cooperativa sociale di tipo B che non si accontenta del semplice volontariato: punta all'indipendenza economica e alla dignità del lavoro, con il 75% di soci con disabilità.",
        "Aprire un negozio nella via Roma bassa significa accendere una vetrina dove troppe se ne sono spente; significa dire alla città che non tutto è perduto e che la rinascita è possibile se fondata su valori solidi."
      ],
      location: "Enna, Italia",
      activeSince: "2026",
      specialization: "Cooperativa Sociale · Agricoltura Biologica · Artigianato Locale",
      awards: "75% Soci con Disabilità",
    }
  }
}
