import {Command, flags} from '@oclif/command'
import {mkdirSync, rmdirSync, existsSync, writeFileSync} from 'fs'
import defaultSecurityProfiles from '../default-security-profiles'
import defaultPgrRoleSet from '../default-role-set'
import defaultDbConfig from '../default-db-config'
import {introspectDb} from '../fn/introspect-db'
import { PgrSchema, PgrTable, PgrTableProfileAssignmentSet } from '../d'

export default class Init extends Command {
  static description = 'initialize config and output directories'

  static flags = {
    help: flags.help({char: 'h'}),
    connectionString: flags.string({char: 'c', description: 'postgres connection string', required: true}),
    force: flags.boolean({char: 'f', description: 'will reset the current-draft to the previous version or to default if this is a new project'}),
    forceAll: flags.boolean({char: 'x', description: 'will reset the entire project'}),
  }

  static args = []

  baseDir = `${process.cwd()}/.pgfb`
  currentDraftDir = `${this.baseDir}/current-draft`

  async doBaseDir() {
    const {flags} = this.parse(Init)
    if (flags.forceAll) {
     // @ts-ignore
     await rmdirSync(this.baseDir, { recursive: true })
    }

    const baseDirExists = await existsSync(this.baseDir)
    if (!baseDirExists) {
      this.log(`creating baseDir: ${this.baseDir}`)
      await mkdirSync(this.baseDir)
    }
  }

  async doCurrentDraftDir() {
    const {flags} = this.parse(Init)
    if (flags.force) {
      // @ts-ignore
      await rmdirSync(this.currentDraftDir, { recursive: true })
    }

    const currentDraftDirExists = await existsSync(this.currentDraftDir)
    if (!currentDraftDirExists) {
      const securityProfilesPath = `${this.currentDraftDir}/security-profiles.json`
      const roleSetFilePath = `${this.currentDraftDir}/roles.json`
      const dbConfigFilePath = `${this.currentDraftDir}/db-config.json`
        await mkdirSync(this.currentDraftDir)
      await writeFileSync(securityProfilesPath, JSON.stringify(defaultSecurityProfiles,null,2))
      await writeFileSync(roleSetFilePath, JSON.stringify(defaultPgrRoleSet,null,2))
      await writeFileSync(dbConfigFilePath, JSON.stringify(defaultDbConfig,null,2))

      // const existingPolicyTemplatesFilePath = `${currentDraftDir}/existing-policy-templates.json`
      // await writeFileSync(existingPolicyTemplatesFilePath, JSON.stringify(introspection.existingPolicyTemplates,null,2))
      // const existingPoliciesFilePath = `${currentDraftDir}/existing-policies.json`
      // await writeFileSync(existingPoliciesFilePath, JSON.stringify(introspection.existingPolicies,null,2))
    }

    return {
      securityProfiles: defaultSecurityProfiles
    }
  }

  async doTableProfileAssignments() {
    const introspection = await introspectDb()
    const tableProfileAssignementsPath = `${this.currentDraftDir}/table-profile-assignments.json`
    const tableProfileAssignments: PgrTableProfileAssignmentSet[] = introspection.schemaTree.map(
      (s: PgrSchema) => {
        const tableAssignments = s.schemaTables.reduce(
          (a: any, t:PgrTable) => {
            return {
              ...a,
              [t.tableName]: defaultSecurityProfiles.defaultProfileName
            }
          }, {}
        )
        return {
          schemaName: s.schemaName,
          tableAssignments: tableAssignments
        }
      }
    )
    await writeFileSync(tableProfileAssignementsPath, JSON.stringify(tableProfileAssignments,null,2))
  }

  async run() {
    const {args, flags} = this.parse(Init)

    await this.doBaseDir()
    await this.doCurrentDraftDir()

    await this.doTableProfileAssignments()

    process.exit()
  }
}
