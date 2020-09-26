import {existsSync, readFileSync} from 'fs'
import { PgrConfig, PgrFunctionSecurityProfileAssignmentSet, PgrFunctionSecurityProfileSet, PgrRoleSet, PgrSchemaTableProfileAssignmentSet, PgrTableSecurityProfileSet } from './d'
const dbConfigPath = `${process.cwd()}/.pgrlsgen/current-draft/db-config.json`
let dbConfig = {
  connectionString: "NO DB CONFIG"
}

let config: PgrConfig | null = null;

async function loadOneConfigFile(filePath:string): Promise<any | null> {
  const fileExists = await existsSync(filePath)
  if (!fileExists) return null

  const fileContents = await readFileSync(filePath)
  return JSON.parse(fileContents.toString())
}

async function loadConfig(): Promise<PgrConfig> {
  if (config !== null) return config;

  const rPath = `${process.cwd()}/.pgrlsgen/current-draft/roles.json`
  const tpaPath = `${process.cwd()}/.pgrlsgen/current-draft/table-profile-assignments.json`
  const tspPath = `${process.cwd()}/.pgrlsgen/current-draft/table-security-profiles.json`
  const fpaPath = `${process.cwd()}/.pgrlsgen/current-draft/function-profile-assignments.json`
  const fspPath = `${process.cwd()}/.pgrlsgen/current-draft/function-security-profiles.json`
  const artifactsDir = `${process.cwd()}/.pgrlsgen/current-draft/artifacts`

  const dbConfigExists = await existsSync(dbConfigPath)
  if (dbConfigExists) {
    const dbConfigContents = await readFileSync(dbConfigPath)
    dbConfig = JSON.parse(dbConfigContents.toString())
  }

  const rFc = await readFileSync(rPath)
  const roles: PgrRoleSet = JSON.parse(rFc.toString())

  const tableSecurityProfiles: PgrTableSecurityProfileSet = await loadOneConfigFile(tspPath)
  const functionSecurityProfiles: PgrFunctionSecurityProfileSet = await loadOneConfigFile(fspPath)
  const tableSecurityProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = await loadOneConfigFile(tpaPath)
  const functionSecurityProfileAssignments: PgrFunctionSecurityProfileAssignmentSet[] = await loadOneConfigFile(fpaPath)

  config = {
    dbConfig: dbConfig,
    roleSet: roles,
    tableSecurityProfileSet: tableSecurityProfiles,
    tableSecurityProfileAssignments: tableSecurityProfileAssignments,
    functionSecurityProfileSet: functionSecurityProfiles,
    functionSecurityProfileAssignments: functionSecurityProfileAssignments
  }

  return config
}

export default loadConfig