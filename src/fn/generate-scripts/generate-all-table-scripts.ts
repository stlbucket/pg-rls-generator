import computeAllTableScripts from './compute/compute-table-scripts'
import writeAllSchemaTableScripts from './write/write-table-scripts'

async function generateAllTableScripts(introspection: any) {
  const computedMasterScriptSet = await computeAllTableScripts(introspection)
  await writeAllSchemaTableScripts(computedMasterScriptSet)
}

export default generateAllTableScripts