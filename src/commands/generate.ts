import {Command, flags} from '@oclif/command'
import {rmdirSync, mkdirSync, readFileSync, writeFileSync, rmdir, write} from 'fs'
import { ColumnExclusionSet, PgrRoleGrant, PgrRoleSet, PgrSchemaTableAssignmentSet, PgrTable, PgrTableSecurityProfile } from '../d'
import computeTablePolicy from '../fn/computeTablePolicy'
import {introspectDb} from '../fn/introspect-db'
// @ts-ignore
// import * as tableProfileAssignments from `${process.cwd()}/.pgrlsgen/table-profile-assignments.json`
// import config from '../config'
// import {doQuery} from '../pg-client'
// import buildQuery from '../pg11IntrospectionQuery'

const tpaPath = `${process.cwd()}/.pgrlsgen/current-draft/table-profile-assignments.json`
const spPath = `${process.cwd()}/.pgrlsgen/current-draft/security-profiles.json`
const rPath = `${process.cwd()}/.pgrlsgen/current-draft/roles.json`
const artifactsDir = `${process.cwd()}/.pgrlsgen/current-draft/artifacts`

function mapSecurityProfile(
  securityProfile: PgrTableSecurityProfile, 
  defaultInsertExclusions: ColumnExclusionSet, 
  defaultUpdateExclusions: ColumnExclusionSet
) {
  // here we are calculating the column exclusions for insert and update ops
  return {
    ...securityProfile,
    grants: {
      ...securityProfile.grants,
      INSERT: securityProfile.grants.INSERT.map(
        (grant: PgrRoleGrant) => {
          return {
            ...grant,
            exclusions: grant.exclusions || defaultInsertExclusions || []
          }
        }
      ),
      UPDATE: securityProfile.grants.UPDATE.map(
        (grant: PgrRoleGrant) => {
          return {
            ...grant,
            exclusions: grant.exclusions || defaultUpdateExclusions || []
          }
        }
      )
    }
  }
}

export default class Generate extends Command {
  static description = 'generate all policy scripts'

  static flags = {
    help: flags.help({char: 'g'}),
  }

  static args = [{name: 'file'}]

  async computeTableScript(table: PgrTable, securityProfile: PgrTableSecurityProfile, roles: PgrRoleSet) {
    return computeTablePolicy(table, securityProfile, roles)
  }

  async computeSchemaScripts(schemaTableAssignmentSet: PgrSchemaTableAssignmentSet, securityProfiles: PgrTableSecurityProfile[], roles: PgrRoleSet, introspection: any) {
    const p = Object.keys(schemaTableAssignmentSet.tableAssignments)
      // .filter(k => ['seller', 'strain'].indexOf(k) > -1)
      .map(
        async (tableName: string) => {
          const table = introspection.schemaTree
            .find((s: any) => s.schemaName === schemaTableAssignmentSet.schemaName).schemaTables
            .find((t: any) => t.tableName === tableName)
          const securityProfile = securityProfiles.find((sp: any) => sp.name === schemaTableAssignmentSet.tableAssignments[tableName])
          if (!securityProfile) throw new Error(`No securityProfile: ${schemaTableAssignmentSet.tableAssignments[tableName]}`)
          const tableScript = await this.computeTableScript(table, securityProfile, roles)
          return {
            tableName: tableName,
            script: tableScript
          }
        }
      )
    const results = await Promise.all(p)
    return results
  }

  async generateSchemaScripts(schemaTableAssignmentSet: PgrSchemaTableAssignmentSet, securityProfiles: PgrTableSecurityProfile[], roles: PgrRoleSet, introspection: any) {
    const schemaDir = `${artifactsDir}/${schemaTableAssignmentSet.schemaName}`
    const tablesDir = `${schemaDir}/tableScripts`
    await mkdirSync(schemaDir)
    await mkdirSync(tablesDir)
    
    const tableScripts = await this.computeSchemaScripts(schemaTableAssignmentSet, securityProfiles, roles, introspection)

    const p = tableScripts
      .map(
        async(ts: any) => {
          const tableScriptPath = `${tablesDir}/${ts.tableName}.sql`
          await writeFileSync(tableScriptPath, ts.script)
        }
      )
    await Promise.all(p)

    const fullSchemaScript = tableScripts.map(ts => ts.script).join('\n')

    await writeFileSync(`${schemaDir}/all-rls-policies.sql`, fullSchemaScript)
  }

  async run() {
    const {args, flags} = this.parse(Generate)

    const tpaFc = await readFileSync(tpaPath)
    const tableProfileAssignments: PgrSchemaTableAssignmentSet[] = JSON.parse(tpaFc.toString())

    const spFc = await readFileSync(spPath)
    const securityProfiles = JSON.parse(spFc.toString())
    
    const rFc = await readFileSync(rPath)
    const roles = JSON.parse(rFc.toString())
    
    const introspection = await introspectDb()

    const mappedSecurityProfiles: PgrTableSecurityProfile[] = securityProfiles.tableSecurityProfiles.map(
      (p: PgrTableSecurityProfile) => {
        return mapSecurityProfile(p, securityProfiles.defaultInsertExclusions, securityProfiles.defaultUpdateExclusions)
      }
    )

    // @ts-ignore
    await rmdirSync(artifactsDir, {recursive: true})
    await mkdirSync(artifactsDir)
    
    const p = tableProfileAssignments
    .map(
      async (schemaAssignments: any) => {
        await this.generateSchemaScripts(schemaAssignments, mappedSecurityProfiles, roles, introspection)
      }
    );

    await Promise.all(p)
        
    process.exit()
  }
}
