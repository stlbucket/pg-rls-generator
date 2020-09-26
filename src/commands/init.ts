import {Command, flags} from '@oclif/command'
import {mkdirSync, rmdirSync, existsSync, writeFileSync} from 'fs'
import defaultTableSecurityProfiles from '../default-table-security-profiles'
import defaultFunctionSecurityProfiles from '../default-function-security-profiles'
import defaultPgrRoleSet from '../default-role-set'
import {introspectDb} from '../fn/introspect-db'
import { PgrSchema, PgrTable, PgrSchemaTableProfileAssignmentSet } from '../d'
import { ConnectionConfig } from 'pg'

export default class Init extends Command {
  static description = 'initialize config and output directories'

  static flags = {
    help: flags.help({char: 'h'}),
    connectionString: flags.string({char: 'c', description: 'postgres connection string', required: true}),
    force: flags.boolean({char: 'f', description: 'will reset the current-draft to the previous version or to default if this is a new project'}),
    forceAll: flags.boolean({char: 'x', description: 'will reset the entire project'}),
  }

  static args = []

  baseDir = `${process.cwd()}/.pgrlsgen`
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

  async doCurrentDraftDir(connectionString: string) {
    const {flags} = this.parse(Init)
    if (flags.force) {
      // @ts-ignore
      await rmdirSync(this.currentDraftDir, { recursive: true })
    }

    const currentDraftDirExists = await existsSync(this.currentDraftDir)
    if (!currentDraftDirExists) {
      const defaultDbConfig: ConnectionConfig = {
        connectionString: connectionString
      }
      const tableSecurityProfilesPath = `${this.currentDraftDir}/table-security-profiles.json`
      const functionSecurityProfilesPath = `${this.currentDraftDir}/function-security-profiles.json`
      const roleSetFilePath = `${this.currentDraftDir}/roles.json`
      const dbConfigFilePath = `${this.currentDraftDir}/db-config.json`
      await mkdirSync(this.currentDraftDir)
      await writeFileSync(tableSecurityProfilesPath, JSON.stringify(defaultTableSecurityProfiles,null,2))
      await writeFileSync(functionSecurityProfilesPath, JSON.stringify(defaultFunctionSecurityProfiles,null,2))
      await writeFileSync(roleSetFilePath, JSON.stringify(defaultPgrRoleSet,null,2))
      await writeFileSync(dbConfigFilePath, JSON.stringify(defaultDbConfig,null,2))

      // const existingPolicyTemplatesFilePath = `${currentDraftDir}/existing-policy-templates.json`
      // await writeFileSync(existingPolicyTemplatesFilePath, JSON.stringify(introspection.existingPolicyTemplates,null,2))
      // const existingPoliciesFilePath = `${currentDraftDir}/existing-policies.json`
      // await writeFileSync(existingPoliciesFilePath, JSON.stringify(introspection.existingPolicies,null,2))
    }

    return {
      securityProfiles: defaultTableSecurityProfiles
    }
  }

  async doTableProfileAssignments(introspection:any) {
    const tableProfileAssignmentsPath = `${this.currentDraftDir}/table-profile-assignments.json`
    const tableProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = introspection.schemaTree.map(
      (s: PgrSchema) => {
        const tableAssignments = s.schemaTables.reduce(
          (a: any, t:PgrTable) => {
            return {
              ...a,
              [t.tableName]: defaultTableSecurityProfiles.defaultProfileName
            }
          }, {}
        )
        const viewAssignments = s.schemaViews.reduce(
          (a: any, t:PgrTable) => {
            return {
              ...a,
              [t.tableName]: defaultTableSecurityProfiles.defaultProfileName
            }
          }, {}
        )
        return {
          schemaName: s.schemaName,
          tableAssignments: tableAssignments,
          viewAssignments: viewAssignments
        }
      }
    )
    await writeFileSync(tableProfileAssignmentsPath, JSON.stringify(tableProfileAssignments,null,2))
  }

  async doFunctionSecurityProfileAssignments(introspection:any) {
    const functionSecurityProfileAssignmentsPath = `${this.currentDraftDir}/function-profile-assignments.json`
    const functionSecurityProfileAssignments: PgrSchemaTableProfileAssignmentSet[] = introspection.schemaTree.map(
      (s: PgrSchema) => {
        const functionAssignments = s.schemaFunctions.reduce(
          (a: any, f:any) => {
            return {
              ...a,
              [f.functionName]: defaultFunctionSecurityProfiles.defaultProfileName
            }
          }, {}
        )
        return {
          schemaName: s.schemaName,
          functionAssignments: functionAssignments
        }
      }
    )
    await writeFileSync(functionSecurityProfileAssignmentsPath, JSON.stringify(functionSecurityProfileAssignments,null,2))
  }

  async run() {
    const {args, flags} = this.parse(Init)

    const connectionString = flags.connectionString

    await this.doBaseDir()
    await this.doCurrentDraftDir(connectionString)

    const introspection = await introspectDb()
    await this.doTableProfileAssignments(introspection)
    await this.doFunctionSecurityProfileAssignments(introspection)

    process.exit()
  }
}
