const { Client } = require("@notionhq/client")
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env.local") })

const notion = new Client({ auth: process.env.NOTION_TOKEN })

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

function getImageUrlFromProperty(prop) {
  const fileProp = prop?.files?.[0]
  if (!fileProp) return ""
  if (fileProp.type === "file") {
    return fileProp.file.url
  } else if (fileProp.type === "external") {
    return fileProp.external.url
  }
  return ""
}

async function run() {
  const databaseId = process.env.NOTION_GRID_DATABASE_ID
  console.log("NOTION_GRID_DATABASE_ID:", databaseId)
  if (!databaseId) {
    console.error("NOTION_GRID_DATABASE_ID not found in environment")
    return
  }

  const response = await queryDatabase(databaseId)
  console.log(`Total grid pages found: ${response.results.length}`)
  response.results.forEach((page, index) => {
    const title = page.properties.Titolo?.title?.map((t) => t.plain_text).join("") || 
                  page.properties["Nome Progetto"]?.title?.map((t) => t.plain_text).join("") || ""
    const src = getImageUrlFromProperty(page.properties.Copertina) || getImageUrlFromProperty(page.properties["Copertina Progetto"])
    const category = (page.properties.Intro || page.properties.Categoria)?.rich_text?.map((t) => t.plain_text).join("") || ""
    const visible = page.properties.Visibile?.checkbox

    console.log(`\n--- Page #${index + 1} (ID: ${page.id}) ---`)
    console.log("Title:", title)
    console.log("Image URL:", src.substring(0, 100) + "...")
    console.log("Category:", category)
    console.log("Visible:", visible)
  })
}

run().catch(console.error)
