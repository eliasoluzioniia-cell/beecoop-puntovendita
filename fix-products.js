const { Client } = require("@notionhq/client")
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env.local") })

const notion = new Client({ auth: process.env.NOTION_TOKEN })

async function run() {
  console.log("=== INIZIO CORREZIONE PRODOTTI SU NOTION ===")
  const dbId = process.env.NOTION_PRODUCTS_DATABASE_ID
  const db = await notion.databases.retrieve({ database_id: dbId })
  const dataSourceId = db.data_sources?.[0]?.id
  
  if (dataSourceId) {
    const response = await notion.dataSources.query({ data_source_id: dataSourceId })
    console.log(`Trovati ${response.results.length} prodotti da correggere.`);
    
    for (const page of response.results) {
      const title = page.properties.Prodotto?.title?.[0]?.plain_text
      const galleriaFiles = page.properties["Galleria immagini"]?.files || []
      
      const updateProps = {}
      
      // 1. Sposta le immagini da "Galleria immagini" al campo corretto "Immagine"
      if (galleriaFiles.length > 0) {
        updateProps["Immagine"] = { files: galleriaFiles }
      }
      
      // 2. Imposta "Disponibile" su true per attivare il pulsante "Acquista"
      updateProps["Disponibile"] = { checkbox: true }
      
      await notion.pages.update({
        page_id: page.id,
        properties: updateProps
      })
      
      console.log(`✓ Prodotto "${title}" allineato con successo.`);
      await new Promise(res => setTimeout(res, 400)) // Throttling
    }
    console.log("\n=== CORREZIONE COMPLETATA CON SUCCESSO! ===")
  }
}

run().catch(console.error)
