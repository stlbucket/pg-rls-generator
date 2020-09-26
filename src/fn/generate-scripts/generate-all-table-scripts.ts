const Mustache = require('mustache')
import { mkdirSync, writeFileSync } from 'fs'
import {ColumnExclusionSet, PgrRoleGrant, PgrRoleSet, PgrTable, PgrTableProfileAssignmentSet, PgrTableSecurityProfile, PgrSchema, PgrRole, PgrConfig, PgrTableSecurityProfileSet} from "../../d"
import loadConfig from '../../config'

const tpaPath = `${process.cwd()}/.pgrlsgen/current-draft/table-profile-assignments.json`
const spPath = `${process.cwd()}/.pgrlsgen/current-draft/table-security-profiles.json`
const rPath = `${process.cwd()}/.pgrlsgen/current-draft/roles.json`
const artifactsDir = `${process.cwd()}/.pgrlsgen/current-draft/artifacts`

const tablePolicyTemplate = `
----******
----******  BEGIN TABLE POLICY: {{schemaName}}.{{tableName}}
----******  TABLE SECURITY PROFILE:  {{tableSecurityProfileName}}
----******
----------  REMOVE EXISTING TABLE GRANTS
  revoke all privileges on table {{schemaName}}.{{tableName}} 
  from {{revokeRolesList}}
  ;

{{#enableRls}}
----------  ENABLE ROW LEVEL SECURITY: {{schemaName}}.{{tableName}}
  alter table {{schemaName}}.{{tableName}} enable row level security;

{{#rlsPolicies}}
  create policy {{policyname}} on {{schemaName}}.{{tableName}} as {{permissive}} for {{cmd}} to {{roles}}{{#qual}} using ({{qual}}){{/qual}}{{#with_check}}with check ({{with_check}}){{/with_check}};
{{/rlsPolicies}}
{{/enableRls}}
{{^enableRls}}
----------  DISABLE ROW LEVEL SECURITY: {{schemaName}}.{{tableName}}
  alter table {{schemaName}}.{{tableName}} disable row level security;
{{/enableRls}}

----------  CREATE NEW TABLE GRANTS: {{schemaName}}.{{tableName}}
{{#roleGrants}}

----------  {{roleName}}
  grant 
  {{#grants}}
    {{action}} {{grantColumns}}{{comma}} {{columnExclusionsText}}
  {{/grants}}
  on table {{schemaName}}.{{tableName}} to {{roleName}};

{{/roleGrants}}

----======  END TABLE POLICY: {{schemaName}}.{{tableName}}
--==
  `

function computeTablePolicy (table: PgrTable, tableSecurityProfile: PgrTableSecurityProfile, roles: PgrRoleSet) {
  const revokeRolesList = ['public', ...roles.dbUserRoles.map((r:PgrRole) => r.roleName)]

  const rlsPolicies = Object.keys(tableSecurityProfile.policies).reduce(
    (all: any, action: string) => {
      const actionPolicies = tableSecurityProfile.policies[action].map(
        (p:any) => {
          return {
            ...p
            ,roles: p.roles.join(", ")
            ,schemaName: table.schemaName
            ,tableName: table.tableName
          }
        }
      )
      return [...all, ...actionPolicies]
    }, []
  )

  const roleGrants = Object.keys(tableSecurityProfile.grants)
  .reduce(  // reduce to one item per role/action
    (all: any, action: string) => {
      const actionGrants = tableSecurityProfile.grants[action].map(
        (g:any) => {
          return {
            ...g
            ,action: action
            ,schemaName: table.schemaName
            ,tableName: table.tableName
          }
        }
      )
      return [...all, ...actionGrants]
    }, []
  )
  .reduce(  // reduce to one role with multiple actions
    (all: any, roleGrant: any) => {
      const finalGrant = all.find((g:any) => g.roleName === roleGrant.roleName) || {...roleGrant, grants: []}
      const otherGrants = all.filter((g:any) => g.roleName !== roleGrant.roleName)
      const exclusions = roleGrant.exclusions || []
      const grantColumns = (['INSERT','UPDATE'].indexOf(roleGrant.action) > -1 ? table.tableColumns : [])
        .map((tc:any) => tc.column_name)
        .filter((c:string) => exclusions.indexOf(c) === -1)
      const grantColumnsText = grantColumns.length > 0 ? `(${grantColumns.join(', ')})` : null
      const columnExclusionsText = exclusions.length > 0 ? `\n       --  excluded columns for ${roleGrant.action}: ${exclusions.join(', ')}` : null 

      return [...otherGrants, {
        ...finalGrant, 
        grants: [...finalGrant.grants.map((og:any) => { return {...og, comma: ','}}), {action: roleGrant.action, grantColumns: grantColumnsText, columnExclusionsText: columnExclusionsText}]
      }]
    }, []
  )

  const templateVariables = {
    enableRls: tableSecurityProfile.enableRls,
    schemaName: table.schemaName,
    tableName: table.tableName,
    tableSecurityProfileName: tableSecurityProfile.name,
    revokeRolesList: revokeRolesList.join(',\n       '),
    grantRolesList: roles.dbUserRoles.map((r:any) => r.roleName).join(",\n"),
    rlsPolicies: rlsPolicies,
    roleGrants: roleGrants
  }

  return Mustache.render(
    tablePolicyTemplate,
    templateVariables
  )

}

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

async function computeTableScript(table: PgrTable, securityProfile: PgrTableSecurityProfile, roles: PgrRoleSet) {
  return computeTablePolicy(table, securityProfile, roles)
}

async function computeSchemaTableScripts(schemaTableAssignmentSet: PgrTableProfileAssignmentSet, securityProfiles: PgrTableSecurityProfile[], roles: PgrRoleSet, introspection: any) {
  const p = Object.keys(schemaTableAssignmentSet.tableAssignments)
    // .filter(k => ['seller', 'strain'].indexOf(k) > -1)
    .map(
      async (tableName: string) => {
        const table = introspection.schemaTree
          .find((s: PgrSchema) => s.schemaName === schemaTableAssignmentSet.schemaName).schemaTables
          .find((t: PgrTable) => t.tableName === tableName)
        const securityProfile = securityProfiles.find((sp: PgrTableSecurityProfile) => sp.name === schemaTableAssignmentSet.tableAssignments[tableName])
        if (!securityProfile) throw new Error(`No securityProfile: ${schemaTableAssignmentSet.tableAssignments[tableName]}`)
        const tableScript = await computeTableScript(table, securityProfile, roles)
        return {
          tableName: tableName,
          script: tableScript
        }
      }
    )
  const results = await Promise.all(p)
  return results
}

async function generateSchemaTableScripts(schemaTableAssignmentSet: PgrTableProfileAssignmentSet, securityProfiles: PgrTableSecurityProfile[], roles: PgrRoleSet, introspection: any) {
  const schemaDir = `${artifactsDir}/${schemaTableAssignmentSet.schemaName}`
  const tablesDir = `${schemaDir}/tableScripts`
  await mkdirSync(tablesDir)
  
  const tableScripts = await computeSchemaTableScripts(schemaTableAssignmentSet, securityProfiles, roles, introspection)

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

async function generateAllTableScripts(introspection: any) {
  const config: PgrConfig = await loadConfig()

  const tableSecurityProfileSet: PgrTableSecurityProfileSet = config.tableSecurityProfileSet

  const mappedSecurityProfiles: PgrTableSecurityProfile[] = tableSecurityProfileSet.tableSecurityProfiles.map(
    (p: PgrTableSecurityProfile) => {
      return mapSecurityProfile(p, tableSecurityProfileSet.defaultInsertExclusions, tableSecurityProfileSet.defaultUpdateExclusions)
    }
  )

  const p = config.tableSecurityProfileAssignments
  .map(
    async (schemaAssignments: PgrTableProfileAssignmentSet) => {
      await generateSchemaTableScripts(schemaAssignments, mappedSecurityProfiles, config.roleSet, introspection)
    }
  );

  await Promise.all(p)
}


export default generateAllTableScripts
