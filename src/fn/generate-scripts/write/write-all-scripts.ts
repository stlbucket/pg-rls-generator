import {rmdirSync, mkdirSync} from 'fs'
import writeAllTableScripts from './write-table-scripts'
import writeAllFunctionScripts from './write-function-scripts'
import writeOwnershipPolicy from './write-ownership-policy'
import writeRemoveAllRls from './write-remove-all-rls'
import { PgrSchema, PgrScriptSet } from '../../../d'

const artifactsDir = `${process.cwd()}/.pgrlsgen/current-draft/artifacts`

async function writeAllScripts(scriptSet: PgrScriptSet) {
    // @ts-ignore
    await rmdirSync(artifactsDir, {recursive: true})
    await mkdirSync(artifactsDir)

    await Promise.all(p)

    await writeAllTableScripts(scriptSet.masterTableScriptSet)
    await writeAllFunctionScripts(scriptSet.masterFunctionScriptSet)
    await writeOwnershipPolicy(scriptSet.ownershipScript)
    await writeRemoveAllRls(scriptSet.removeAllRlsScript)
}

export default writeAllScripts