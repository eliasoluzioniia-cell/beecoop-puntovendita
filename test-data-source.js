const { Client } = require("@notionhq/client")
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env.local") })

const notion = new Client({ auth: process.env.NOTION_TOKEN })

async function check() {
  const dbId = process.env.NOTION_PRODUCTS_DATABASE_ID
  const db = await notion.databases.retrieve({ database_id: dbId })
  const dataSourceId = db.data_sources?.[0]?.id
  if (dataSourceId) {
    const response = await notion.dataSources.query({ data_source_id: dataSourceId })
    console.log(`Trovati ${response.results.length} prodotti.`);
    response.results.forEach((page, i) => {
      console.log(`\n--- Prodotto ${i+1}: ${page.properties.Prodotto?.title?.[0]?.plain_text} ---`)
      console.log("Immagine:", JSON.stringify(page.properties.Immagine));
      console.log("Galleria immagini:", JSON.stringify(page.properties["Galleria immagini"]));
      console.log("Link Stripe/Checkout:", page.properties["Link Stripe/Checkout"]?.url);
      console.log("Disponibile:", page.properties.Disponibile?.checkbox);
    })
  }
}

check().catch(console.error)
