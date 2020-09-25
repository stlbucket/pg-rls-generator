import {Command, flags} from '@oclif/command'
import {rmdirSync, mkdirSync} from 'fs'
import {introspectDb} from '../fn/introspect-db'
import generateAllTableScripts from '../fn/generate-all-table-scripts'
import generateAllFunctionScripts from '../fn/generate-all-function-scripts'
import generateOwnershipPolicy from '../fn/generate-ownership-policy'
import { PgrSchema } from '../d'
// @ts-ignore
// import * as tableProfileAssignments from `${process.cwd()}/.pgrlsgen/table-profile-assignments.json`
// import config from '../config'
// import {doQuery} from '../pg-client'
// import buildQuery from '../pg11IntrospectionQuery'
const artifactsDir = `${process.cwd()}/.pgrlsgen/current-draft/artifacts`


export default class Generate extends Command {
  static description = 'generate all policy scripts'

  static flags = {
    help: flags.help({char: 'g'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {args, flags} = this.parse(Generate)
    
    const introspection = await introspectDb()

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
    process.exit()
  }
}
