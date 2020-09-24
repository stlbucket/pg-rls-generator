import {Command, flags} from '@oclif/command'
import {mkdirSync, existsSync, readdirSync} from 'fs'
const util = require('util');
const exec = util.promisify(require('child_process').exec);


export default class Release extends Command {
  static description = 'copy current-draft dir to a new release dir'

  static flags = {
    // help: flags.help({char: 'h'}),
    // // flag with a value (-n, --name=VALUE)
    // name: flags.string({char: 'n', description: 'name to print'}),
    // // flag with no value (-f, --force)
    // force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  baseDir = `${process.cwd()}/.pgrlsgen`
  currentDraftDir = `${this.baseDir}/current-draft`
  releasesDir = `${this.baseDir}/releases`

  async run() {
    const {args, flags} = this.parse(Release)

    const releasesDirExists = await existsSync(this.releasesDir)
    if (!releasesDirExists) {
      this.log(`creating releasesDir: ${this.releasesDir}`)
      await mkdirSync(this.releasesDir)
    }

    const existingReleases: number[] = (await readdirSync(this.releasesDir)).map((r:string) => parseInt(r))
    const thisReleaseNumber = existingReleases.length > 0 ? (Math.max(...existingReleases) + 1) : 1
    const thisReleaseDir = `${this.releasesDir}/${thisReleaseNumber.toString().padStart(6,'0')}/`

    // const releaseDirExists = await existsSync(thisReleaseDir)
    // if (!releaseDirExists) {
    //   this.log(`creating releaseDir: ${thisReleaseDir}`)
    //   await mkdirSync(thisReleaseDir)
    // }

    await exec(`cp -R ${this.currentDraftDir} ${thisReleaseDir}`);
  }
}
