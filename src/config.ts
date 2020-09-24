import {existsSync, readFileSync} from 'fs'
const dbConfigPath = `${process.cwd()}/.pgfb/current-draft/db-config.json`
let dbConfig = {
  connectionString: "NO DB CONFIG"
}

async function loadConfig() {
  const dbConfigExists = await existsSync(dbConfigPath)
  if (dbConfigExists) {
    const dbConfigContents = await readFileSync(dbConfigPath)
    dbConfig = JSON.parse(dbConfigContents.toString())
  }

  console.log(dbConfigExists, dbConfigPath, JSON.stringify(dbConfig,null,2))

  return dbConfig
}
// @ts-ignore
// import defaultSecurityProfiles from './default-security-profiles'
// @ts-ignore

export default loadConfig