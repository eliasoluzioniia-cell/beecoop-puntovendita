const { Client } = require("@notionhq/client")
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env.local") })

const notion = new Client({ auth: process.env.NOTION_TOKEN })

async function run() {
  const databaseId = "26bf5763-cbe0-40e2-a976-b98ab73c38b0"
  const db = await notion.databases.retrieve({ database_id: databaseId })
  const dataSourceId = db.data_sources?.[0]?.id
  if (!dataSourceId) {
    console.error("No data source found")
    return
  }
  const ds = await notion.dataSources.retrieve({ data_source_id: dataSourceId })
  console.log("Bee Coop — Ordini properties schema:")
  for (const [name, prop] of Object.entries(ds.properties)) {
    console.log(`- ${name}: type=${prop.type}`)
  }
}

run().catch(console.error)
