import {Command, flags} from '@oclif/command'
import {rmdirSync, mkdirSync} from 'fs'
import {introspectDb} from '../fn/introspect-db'
import generateAllScripts from '../fn/generate-scripts/generate-all-scripts'
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

    await generateAllScripts(introspection)

    process.exit()
  }
}
