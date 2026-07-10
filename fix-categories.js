const { Client } = require("@notionhq/client")
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env.local") })

const notion = new Client({ auth: process.env.NOTION_TOKEN })

const delay = ms => new Promise(res => setTimeout(res, ms))

// Funzione helper per interrogare un database Notion tramite le nuove API Data Sources
async function queryDatabase(databaseId, options = {}) {
  const db = await notion.databases.retrieve({ database_id: databaseId })
  const dataSourceId = db.data_sources?.[0]?.id
  if (dataSourceId) {
    return await notion.dataSources.query({
      data_source_id: dataSourceId,
      ...options,
    })
  }
  // Fallback per database standard
  return await notion.databases.query({
    database_id: databaseId,
    ...options,
  })
}

// Funzione helper per estrarre lo schema delle proprietà del database (supporta sia standard che data source)
async function getDatabaseSchema(databaseId) {
  const db = await notion.databases.retrieve({ database_id: databaseId })
  if (db.properties) {
    return db.properties
  }
  const dataSourceId = db.data_sources?.[0]?.id
  if (!dataSourceId) {
    throw new Error(`Nessuno schema trovato per il database: ${databaseId}`)
  }
  const ds = await notion.dataSources.retrieve({ data_source_id: dataSourceId })
  return ds.properties
}

const PRODUCT_CATEGORIES = {
  "Arance": "Frutti",
  "Limoni": "Frutti",
  "Fichi d'India": "Frutti",
  "Mandorle": "Frutti",
  "Olio Extravergine": "Olio",
  "Broccoletti": "Ortaggi",
  "Finocchi": "Ortaggi",
  "Melanzane": "Ortaggi",
  "Peperoni": "Ortaggi",
  "Zucchine Verdi": "Ortaggi",
  "Pomodori": "Ortaggi",
  "Basilico": "Erbe Aromatiche"
}

async function run() {
  console.log("=== INIZIO ASSOCIAZIONE CATEGORIE PRODOTTI ===")
  
  const productsDbId = process.env.NOTION_PRODUCTS_DATABASE_ID
  const categoriesDbId = "882a7c60-6dc8-46ff-ae83-4f871c0bea6d"
  
  if (!productsDbId) {
    console.error("Errore: NOTION_PRODUCTS_DATABASE_ID non impostato.")
    return
  }

  // 1. Recupera o crea le categorie
  let categoryMap = {}
  try {
    console.log("Recupero schema e righe del database Categorie...")
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
    const requiredCategories = ["Frutti", "Olio", "Ortaggi", "Erbe Aromatiche"]
    for (const catName of requiredCategories) {
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
    console.error("Errore nel recupero delle categorie:", catErr.message)
    return
  }

  // 2. Associa le categorie ai prodotti
  try {
    const prodSchema = await getDatabaseSchema(productsDbId)
    const relKey = Object.keys(prodSchema).find(k => k.toLowerCase().includes("categ") || prodSchema[k].type === "relation")
    
    if (!relKey) {
      console.error("Errore: colonna delle Categorie non trovata nel database Prodotti.")
      return
    }

    const prodQuery = await queryDatabase(productsDbId)
    console.log(`Trovati ${prodQuery.results.length} prodotti da verificare.`);

    for (const page of prodQuery.results) {
      const title = page.properties.Prodotto?.title?.[0]?.plain_text
      const existingRelations = page.properties[relKey]?.relation || []
      
      // Se il prodotto non ha già una categoria associata
      if (existingRelations.length === 0) {
        const targetCategoryName = PRODUCT_CATEGORIES[title]
        if (targetCategoryName && categoryMap[targetCategoryName]) {
          console.log(`Associo il prodotto "${title}" alla categoria "${targetCategoryName}"...`)
          
          const updateProps = {}
          updateProps[relKey] = { relation: [{ id: categoryMap[targetCategoryName] }] }
          
          await notion.pages.update({
            page_id: page.id,
            properties: updateProps
          })
          console.log(`✓ Collegato.`);
          await delay(400)
        } else {
          console.log(`Nessuna associazione trovata per il prodotto: "${title}"`)
        }
      } else {
        console.log(`Il prodotto "${title}" ha già una categoria associata. Salto.`);
      }
    }
    console.log("\n=== ASSOCIAZIONE CATEGORIE COMPLETATA CON SUCCESSO! ===")
  } catch (err) {
    console.error("Errore durante l'associazione dei prodotti:", err.message)
  }
}

run().catch(console.error)
