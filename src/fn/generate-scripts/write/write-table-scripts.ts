import { mkdirSync, writeFileSync } from 'fs'
import {PgrTableScript, PgrSchemaTableScriptSet, PgrMasterTableScriptSet} from "../../../d"

const artifactsDir = `${process.cwd()}/.pgrlsgen/current-draft/artifacts`


async function writeSchemaTableScripts(tableScriptSet: PgrSchemaTableScriptSet) {
  const schemaDir = `${artifactsDir}/${tableScriptSet.schemaName}`
  const tablesDir = `${schemaDir}/tableScripts`
  await mkdirSync(tablesDir)

  const p = tableScriptSet.tableScripts
    .map(
      async(ts: PgrTableScript) => {
        const tableScriptPath = `${tablesDir}/${ts.tableName}.sql`
        const fileContents = `
begin;
\\dp+ ${ts.tableSchema}.${ts.tableName};

${ts.tableScript}

\\dp+ ${ts.tableSchema}.${ts.tableName};
rollback;`
        
        await writeFileSync(tableScriptPath, fileContents)
      }
    )
  await Promise.all(p)

  const fullSchemaScript = tableScriptSet.tableScripts.map(ts => ts.tableScript).join('\n')

  await writeFileSync(`${schemaDir}/all-rls-policies.sql`, fullSchemaScript)
}

async function writeAllSchemaTableScripts(masterTableScriptSet: PgrMasterTableScriptSet) {
  const p = masterTableScriptSet.schemaTableScriptSets.map(
    async (ss:PgrSchemaTableScriptSet) => {
      await writeSchemaTableScripts(ss)
    }
  )
  await Promise.all(p)
}


export default writeAllSchemaTableScripts
