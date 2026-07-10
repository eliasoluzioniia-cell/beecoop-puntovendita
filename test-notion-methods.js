const { Client } = require("@notionhq/client")
const notion = new Client({ auth: "test" })
console.log("notion keys:", Object.keys(notion))
console.log("databases keys:", Object.keys(notion.databases || {}))
