import {rmdirSync, mkdirSync} from 'fs'
import generateAllTableScripts from './generate-all-table-scripts'
import generateAllFunctionScripts from './generate-all-function-scripts'
import generateOwnershipPolicy from './generate-ownership-policy'
import generateRemoveAllRls from './generate-remove-all-rls'
import { PgrSchema } from '../../d'
// @ts-ignore
// import * as tableProfileAssignments from `${process.cwd()}/.pgrlsgen/table-profile-assignments.json`
// import config from '../config'
// import {doQuery} from '../pg-client'
// import buildQuery from '../pg11IntrospectionQuery'
const artifactsDir = `${process.cwd()}/.pgrlsgen/current-draft/artifacts`

async function generateAllScripts(introspection: any) {
    // @ts-ignore
    await rmdirSync(artifactsDir, {recursive: true})
    await mkdirSync(artifactsDir)

    const p = introspection.schemaTree.map(
      async (s: PgrSchema) => {
        const schemaDir = `${artifactsDir}/${s.schemaName}`
        await mkdirSync(schemaDir)
      }
    )
    await Promise.all(p)
    await generateAllTableScripts(introspection)
    await generateAllFunctionScripts(introspection)
    await generateOwnershipPolicy(introspection)
    await generateRemoveAllRls(introspection)
}

export default generateAllScripts