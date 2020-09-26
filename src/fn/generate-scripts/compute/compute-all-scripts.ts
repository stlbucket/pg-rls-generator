import {rmdirSync, mkdirSync} from 'fs'
import computeAllTableScripts from './compute-table-scripts'
import computeAllFunctionScripts from './compute-function-scripts'
import computeOwnershipPolicy from './compute-ownership-script'
import computeRemoveAllRls from './compute-remove-all-rls-script'
import { PgrSchema } from '../../../d'

const artifactsDir = `${process.cwd()}/.pgrlsgen/current-draft/artifacts`

async function computeAllScripts(introspection: any) {

    await computeAllTableScripts(introspection)
    await computeAllFunctionScripts(introspection)
    await computeOwnershipPolicy(introspection)
    await computeRemoveAllRls(introspection)
}

export default computeAllScripts