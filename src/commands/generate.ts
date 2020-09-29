import {Command, flags} from '@oclif/command'
import {introspectDb} from '../fn/introspect-db'
import generateAllScripts from '../fn/generate-scripts/generate-all-scripts'

export default class Generate extends Command {
  static description = 'generate all policy scripts'

  static flags = {
    help: flags.help({char: 'g'}),
  }

  static args = [{name: 'file'}]

  async run() {
    
    const introspection = await introspectDb()

    await generateAllScripts(introspection)

    process.exit()
  }
}
