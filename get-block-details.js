const { Client } = require("@notionhq/client")
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env.local") })

const notion = new Client({ auth: process.env.NOTION_TOKEN })

async function run() {
  const blockId = "398eda44-6673-80c6-8731-ed5eb8e05dee"
  const block = await notion.blocks.retrieve({ block_id: blockId })
  console.log("Block Details:")
  console.log(JSON.stringify(block, null, 2))
}

run().catch(console.error)
