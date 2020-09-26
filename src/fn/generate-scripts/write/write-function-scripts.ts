import { mkdirSync, writeFileSync } from 'fs'
import {PgrFunctionScript, PgrSchemaFunctionScriptSet, PgrMasterFunctionScriptSet} from "../../../d"

const artifactsDir = `${process.cwd()}/.pgrlsgen/current-draft/artifacts`


async function writeSchemaFunctionScripts(functionScriptSet: PgrSchemaFunctionScriptSet) {
  const schemaDir = `${artifactsDir}/${functionScriptSet.schemaName}`
  const functionsDir = `${schemaDir}/functionScripts`
  await mkdirSync(functionsDir)

  const p = functionScriptSet.functionScripts
    .map(
      async(ts: PgrFunctionScript) => {
        const functionScriptPath = `${functionsDir}/${ts.functionName}.sql`
        await writeFileSync(functionScriptPath, ts.functionScript)
      }
    )
  await Promise.all(p)

  const fullSchemaScript = functionScriptSet.functionScripts.map(fs => fs.functionScript).join('\n')

  await writeFileSync(`${schemaDir}/all-function-policies.sql`, fullSchemaScript)
}

async function writeAllSchemaFunctionScripts(masterFunctionScriptSet: PgrMasterFunctionScriptSet) {
  const p = masterFunctionScriptSet.schemaFunctionScriptSets.map(
    async (ss:PgrSchemaFunctionScriptSet) => {
      await writeSchemaFunctionScripts(ss)
    }
  )
  await Promise.all(p)
}


export default writeAllSchemaFunctionScripts
