const Mustache = require('mustache')
import {PgrRoleSet, PgrTable, PgrTableSecurityProfile} from "../d"

const tablePolicyTemplate = `
----******
----******  BEGIN TABLE POLICY: {{schemaName}}.{{tableName}}
----******  TABLE SECURITY PROFILE:  {{tableSecurityProfileName}}
----******
----------  REMOVE EXISTING TABLE GRANTS
  revoke all privileges 
  on table {{schemaName}}.{{tableName}} 
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
  const revokeRolesList = ['public', ...roles.dbUserRoles.map((r:any) => r.roleName)]

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

export default computeTablePolicy
