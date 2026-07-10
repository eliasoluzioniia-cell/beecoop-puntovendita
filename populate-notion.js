const { Client } = require("@notionhq/client")
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env.local") })

const notion = new Client({ auth: process.env.NOTION_TOKEN })

const delay = ms => new Promise(res => setTimeout(res, ms))

// Funzione helper per interrogare un database Notion tramite le nuove API Data Sources
async function queryDatabase(databaseId, options = {}) {
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

// Funzione helper per estrarre lo schema delle proprietà del database tramite il Data Source
async function getDatabaseSchema(databaseId) {
  const db = await notion.databases.retrieve({ database_id: databaseId })
  const dataSourceId = db.data_sources?.[0]?.id
  if (!dataSourceId) {
    throw new Error(`Nessuna data source trovata per il database: ${databaseId}`)
  }
  const ds = await notion.dataSources.retrieve({ data_source_id: dataSourceId })
  return ds.properties
}

const FALLBACK_PRODUCTS = [
  { title: "Arance", price: 2.50, description: "Arance fresche e biologiche coltivate con cura nei nostri frutteti.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/arance.jpg", category: "Frutti" },
  { title: "Limoni", price: 2.00, description: "Limoni di Sicilia freschi e profumati, ideali per ogni ricetta.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/Limoni.jpg", category: "Frutti" },
  { title: "Fichi d'India", price: 3.00, description: "I deliziosi e tipici fichi d'india della nostra terra siciliana.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/fichidindia.jpg", category: "Frutti" },
  { title: "Mandorle", price: 8.00, description: "Mandorle sgusciate ricche di nutrienti, ideali per spuntini o dolci.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/Mandorle.jpg", category: "Frutti" },
  { title: "Olio Extravergine", price: 12.00, description: "Olio extravergine di oliva di altissima qualità estratto a freddo.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/olio.jpg", category: "Olio" },
  { title: "Broccoletti", price: 1.50, description: "Broccoletti freschi coltivati biologicamente nel nostro orto.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/broccoletti.jpg", category: "Ortaggi" },
  { title: "Finocchi", price: 1.80, description: "Finocchi croccanti e profumati, ricchi di fibre e proprietà.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/finocchi.jpg", category: "Ortaggi" },
  { title: "Melanzane", price: 2.00, description: "Melanzane polpose, ideali per parmigiane o grigliate.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/melenzane.jpg", category: "Ortaggi" },
  { title: "Peperoni", price: 2.40, description: "Peperoni freschi, dolci e colorati, ricchi di vitamina C.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/peperoni.jpg", category: "Ortaggi" },
  { title: "Zucchine Verdi", price: 1.90, description: "Zucchine verdi novelle e tenere, ottime da fare al vapore o grigliate.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/zucchine_verdi.jpg", category: "Ortaggi" },
  { title: "Pomodori", price: 2.20, description: "Pomodori maturi e succosi per insalate o salse fresche.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/Pomodori.jpg", category: "Ortaggi" },
  { title: "Basilico", price: 1.00, description: "Foglie di basilico fresco e profumato per i tuoi piatti estivi.", stripeLink: "https://stripe.com", src: "https://www.beecoop.it/assets/img/portfolio/basilico.jpg", category: "Erbe Aromatiche" }
]

const FALLBACK_SLIDES = [
  { src: "https://www.beecoop.it/assets/img/portfolio/arance.jpg", title: "Arance", description: "Coltivate biologiche nei nostri terreni di Enna" },
  { src: "https://www.beecoop.it/assets/img/portfolio/olio.jpg", title: "Olio EVO", description: "Puro e genuino dai nostri oliveti di Enna" },
  { src: "https://www.beecoop.it/assets/img/portfolio/fichidindia.jpg", title: "Fichi d'India", description: "I frutti selvatici e tipici della Sicilia" },
]

const FALLBACK_GRID = [
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

async function run() {
  console.log("=== POPOLAMENTO DATABASES NOTION ===")

  if (!process.env.NOTION_TOKEN) {
    console.error("Errore: NOTION_TOKEN non definito in .env.local")
    return
  }

  // 1. Popolamento Galleria
  const galleryDbId = process.env.NOTION_GALLERY_DATABASE_ID
  if (galleryDbId) {
    try {
      console.log("\n--- Controllando Database Galleria ---")
      const schema = await getDatabaseSchema(galleryDbId)
      
      const response = await queryDatabase(galleryDbId, { page_size: 1 })
      if (response.results.length === 0) {
        console.log("Il database Galleria è vuoto. Caricamento dati...")
        for (let i = 0; i < FALLBACK_SLIDES.length; i++) {
          const slide = FALLBACK_SLIDES[i]
          const props = {}
          
          // Imposta Titolo
          const titleKey = Object.keys(schema).find(k => schema[k].type === "title")
          if (titleKey) {
            props[titleKey] = { title: [{ text: { content: slide.title } }] }
          }
          
          // Imposta Immagine
          const imgKey = Object.keys(schema).find(k => k.toLowerCase() === "immagine") || Object.keys(schema).find(k => k.toLowerCase().includes("immag") || k.toLowerCase().includes("foto") || schema[k].type === "files")
          if (imgKey) {
            props[imgKey] = { files: [{ name: slide.title, type: "external", external: { url: slide.src } }] }
          }
          
          // Imposta Didascalia
          const descKey = Object.keys(schema).find(k => k.toLowerCase() === "didascalia") || Object.keys(schema).find(k => k.toLowerCase().includes("didas") || k.toLowerCase().includes("descri") || schema[k].type === "rich_text")
          if (descKey) {
            props[descKey] = { rich_text: [{ text: { content: slide.description } }] }
          }
          
          // Imposta Ordine
          const orderKey = Object.keys(schema).find(k => k.toLowerCase().includes("ord") || schema[k].type === "number")
          if (orderKey) {
            props[orderKey] = { number: i + 1 }
          }
          
          // Imposta Visibile
          const visibleKey = Object.keys(schema).find(k => k.toLowerCase() === "visibile") || Object.keys(schema).find(k => k.toLowerCase().includes("visib") || schema[k].type === "checkbox")
          if (visibleKey) {
            props[visibleKey] = { checkbox: true }
          }
          
          await notion.pages.create({ parent: { database_id: galleryDbId }, properties: props })
          console.log(`+ Slide aggiunta: ${slide.title}`)
          await delay(400) // Delay di sicurezza
        }
      } else {
        console.log("Il database Galleria contiene già elementi. Salto popolamento.")
      }
    } catch (err) {
      console.error("Errore popolamento Galleria:", err.message)
    }
  }

  // 2. Popolamento Griglia (Scatti)
  const gridDbId = process.env.NOTION_GRID_DATABASE_ID
  if (gridDbId) {
    try {
      console.log("\n--- Controllando Database Griglia Editoriale ---")
      const schema = await getDatabaseSchema(gridDbId)
      
      const response = await queryDatabase(gridDbId, { page_size: 1 })
      if (response.results.length === 0) {
        console.log("Il database Griglia è vuoto. Caricamento dati...")
        for (const item of FALLBACK_GRID) {
          const props = {}
          
          // Imposta Titolo
          const titleKey = Object.keys(schema).find(k => schema[k].type === "title")
          if (titleKey) {
            props[titleKey] = { title: [{ text: { content: item.title } }] }
          }
          
          // Imposta Copertina
          const imgKey = Object.keys(schema).find(k => k.toLowerCase() === "copertina") || Object.keys(schema).find(k => k.toLowerCase().includes("coper") || k.toLowerCase().includes("immag") || k.toLowerCase().includes("foto") || schema[k].type === "files")
          if (imgKey) {
            props[imgKey] = { files: [{ name: item.title, type: "external", external: { url: item.src } }] }
          }
          
          // Imposta Intro/Categoria
          const catKey = Object.keys(schema).find(k => k.toLowerCase() === "intro") || Object.keys(schema).find(k => k.toLowerCase().includes("intro") || k.toLowerCase().includes("categ") || schema[k].type === "rich_text")
          if (catKey) {
            props[catKey] = { rich_text: [{ text: { content: item.category } }] }
          }
          
          // Imposta Visibile
          const visibleKey = Object.keys(schema).find(k => k.toLowerCase() === "visibile") || Object.keys(schema).find(k => k.toLowerCase().includes("visib") || schema[k].type === "checkbox")
          if (visibleKey) {
            props[visibleKey] = { checkbox: true }
          }
          
          await notion.pages.create({ parent: { database_id: gridDbId }, properties: props })
          console.log(`+ Scatto aggiunto: ${item.title}`)
          await delay(400) // Delay di sicurezza
        }
      } else {
        console.log("Il database Griglia contiene già elementi. Salto popolamento.")
      }
    } catch (err) {
      console.error("Errore popolamento Griglia:", err.message)
    }
  }

  // 3. Popolamento Categorie & Prodotti
  const productsDbId = process.env.NOTION_PRODUCTS_DATABASE_ID
  const categoriesDbId = "882a7c60-6dc8-46ff-ae83-4f871c0bea6d"
  
  if (productsDbId) {
    try {
      console.log("\n--- Controllando Database Prodotti ---")
      const schema = await getDatabaseSchema(productsDbId)
      
      const response = await queryDatabase(productsDbId, { page_size: 1 })
      if (response.results.length === 0) {
        console.log("Il database Prodotti è vuoto. Caricamento dati...")
        
        // Cerca o crea le categorie nel database categorie
        let categoryMap = {}
        try {
          console.log("Recupero categorie esistenti...")
          const catSchema = await getDatabaseSchema(categoriesDbId)
          const catTitleKey = Object.keys(catSchema).find(k => catSchema[k].type === "title")
          
          const catQuery = await queryDatabase(categoriesDbId)
          catQuery.results.forEach(page => {
            const nameProp = page.properties[catTitleKey]
            const name = nameProp?.title?.map(t => t.plain_text).join("") || ""
            if (name) {
              categoryMap[name] = page.id
            }
          })
          
          // Crea le categorie mancanti
          const uniqueCats = [...new Set(FALLBACK_PRODUCTS.map(p => p.category))]
          for (const catName of uniqueCats) {
            if (!categoryMap[catName]) {
              console.log(`Categoria "${catName}" non trovata. Creazione in corso...`)
              const catProps = {}
              catProps[catTitleKey] = { title: [{ text: { content: catName } }] }
              const newCatPage = await notion.pages.create({ parent: { database_id: categoriesDbId }, properties: catProps })
              categoryMap[catName] = newCatPage.id
              console.log(`+ Categoria creata: ${catName} (ID: ${newCatPage.id})`)
              await delay(400)
            }
          }
        } catch (catErr) {
          console.error("Errore controllo/creazione categorie:", catErr.message)
        }

        // Ora crea i prodotti
        for (const item of FALLBACK_PRODUCTS) {
          const props = {}
          
          // Imposta Prodotto (Title) - Troviamo solo la colonna di tipo "title" per evitare conflitti con "Produttore"
          const titleKey = Object.keys(schema).find(k => schema[k].type === "title")
          if (titleKey) {
            props[titleKey] = { title: [{ text: { content: item.title } }] }
          }
          
          // Imposta Prezzo
          const priceKey = Object.keys(schema).find(k => k.toLowerCase() === "prezzo") || Object.keys(schema).find(k => k.toLowerCase().includes("prez") || schema[k].type === "number")
          if (priceKey) {
            props[priceKey] = { number: item.price }
          }
          
          // Imposta Descrizione
          const descKey = Object.keys(schema).find(k => k.toLowerCase() === "descrizione") || Object.keys(schema).find(k => k.toLowerCase().includes("descri") || schema[k].type === "rich_text")
          if (descKey) {
            props[descKey] = { rich_text: [{ text: { content: item.description } }] }
          }
          
          // Imposta Link Stripe
          const stripeKey = Object.keys(schema).find(k => k.toLowerCase() === "link stripe/checkout") || Object.keys(schema).find(k => k.toLowerCase().includes("stripe") || k.toLowerCase().includes("check") || schema[k].type === "url")
          if (stripeKey) {
            props[stripeKey] = { url: item.stripeLink }
          }
          
          // Imposta Immagine
          const imgKey = Object.keys(schema).find(k => k.toLowerCase() === "immagine") || Object.keys(schema).find(k => k.toLowerCase().includes("immag") || k.toLowerCase().includes("foto") || schema[k].type === "files")
          if (imgKey) {
            props[imgKey] = { files: [{ name: item.title, type: "external", external: { url: item.src } }] }
          }
          
          // Imposta Disponibile
          const availKey = Object.keys(schema).find(k => k.toLowerCase() === "disponibile") || Object.keys(schema).find(k => k.toLowerCase().includes("dispon") || schema[k].type === "checkbox")
          if (availKey) {
            props[availKey] = { checkbox: true }
          }
          
          // Imposta Visibile
          const visibleKey = Object.keys(schema).find(k => k.toLowerCase() === "visibile") || Object.keys(schema).find(k => k.toLowerCase().includes("visib") || schema[k].type === "checkbox")
          if (visibleKey) {
            props[visibleKey] = { checkbox: true }
          }
          
          // Imposta Produttore (Select: "Bee Coop")
          const prodKey = Object.keys(schema).find(k => k.toLowerCase() === "produttore" && schema[k].type === "select")
          if (prodKey) {
            props[prodKey] = { select: { name: "Bee Coop" } }
          }
          
          // Imposta Relazione Categorie
          const relKey = Object.keys(schema).find(k => k.toLowerCase().includes("categ") || schema[k].type === "relation")
          if (relKey && categoryMap[item.category]) {
            props[relKey] = { relation: [{ id: categoryMap[item.category] }] }
          }
          
          await notion.pages.create({ parent: { database_id: productsDbId }, properties: props })
          console.log(`+ Prodotto aggiunto: ${item.title}`)
          await delay(400) // Delay di sicurezza
        }
      } else {
        console.log("Il database Prodotti contiene già elementi. Salto popolamento.")
      }
    } catch (err) {
      console.error("Errore popolamento Prodotti:", err.message)
    }
  }

  console.log("\n=== OPERAZIONE COMPLETATA! ===")
}

run()
