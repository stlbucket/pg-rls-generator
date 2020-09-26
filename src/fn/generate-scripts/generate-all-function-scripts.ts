const Mustache = require('mustache')
import { mkdirSync, writeFileSync } from 'fs'
import {PgrRoleSet, PgrFunction, PgrFunctionSecurityProfile, PgrSchema, PgrRole} from "../../d"
import loadConfig from '../../config'
import { PgrConfig, PgrFunctionSecurityProfileSet, PgrTableSecurityProfileSet } from '../../d'

const tpaPath = `${process.cwd()}/.pgrlsgen/current-draft/function-profile-assignments.json`
const spPath = `${process.cwd()}/.pgrlsgen/current-draft/function-security-profiles.json`
const rPath = `${process.cwd()}/.pgrlsgen/current-draft/roles.json`
const artifactsDir = `${process.cwd()}/.pgrlsgen/current-draft/artifacts`

const functionPolicyTemplate = `
----------
----------  BEGIN FUNCTION POLICY: {{schemaName}}.{{functionName}}
----------  POLICY NAME:  {{policyName}}
----------

----------  REMOVE EXISTING FUNCTION GRANTS
  revoke all privileges on function {{functionSignature}} from {{revokeRolesList}};

{{#roleGrant}}
----------  CREATE NEW FUNCTION GRANTS
----------  {{roles}}
  grant execute on function {{functionSignature}} to {{roles}};
  
{{/roleGrant}}
----------  END FUNCTION POLICY: {{schemaName}}.{{functionName}}
--==
  `

function computeFunctionPolicy (fn: PgrFunction, functionSecurityProfile: PgrFunctionSecurityProfile, roles: PgrRoleSet) {
  const revokeRolesList = ['public', ...roles.dbUserRoles.map((r:PgrRole) => r.roleName)]

  const roleGrant = {
    roles: functionSecurityProfile.grants.EXECUTE.join(', ')
    ,action: "EXECUTE"
    ,schemaName: fn.functionSchema
    ,functionName: fn.functionName
  }

  const signatureArgumentDataTypes = fn ? fn.argumentDataTypes
  .split(',')
  .map(adt => adt.replace('timestamp with time zone', 'timestamptz'))
  .map(adt => adt.trim().split(' ')[1])
  .join(',') : undefined

  const functionSignature = fn ? `${fn.functionSchema}.${fn.functionName} (${signatureArgumentDataTypes})` : `{{functionSchema}}.{{functionName}} ({{signatureArgumentDataTypes}})`


  const templateVariables = {
    schemaName: fn.functionSchema,
    functionName: fn.functionName,
    functionSecurityProfileName: functionSecurityProfile.name,
    revokeRolesList: revokeRolesList.join(',\n       '),
    grantRolesList: roles.dbUserRoles.map((r:any) => r.roleName).join(",\n"),
    roleGrant: roleGrant,
    functionSignature: functionSignature
  }

  return Mustache.render(
    functionPolicyTemplate,
    templateVariables
  )

}

async function computeFunctionScript(fn: PgrFunction, securityProfile: PgrFunctionSecurityProfile, roles: PgrRoleSet) {
  return computeFunctionPolicy(fn, securityProfile, roles)
}

async function computeSchemaFunctionScripts(schemaFunctionAssignmentSet: PgrFunctionSecurityProfileAssignmentset, securityProfiles: PgrFunctionSecurityProfile[], roles: PgrRoleSet, introspection: any) {
  const p = Object.keys(schemaFunctionAssignmentSet.functionAssignments)
    // .filter(k => ['seller', 'strain'].indexOf(k) > -1)
    .map(
      async (functionName: string) => {
        const fn = introspection.schemaTree
          .find((s: PgrSchema) => s.schemaName === schemaFunctionAssignmentSet.schemaName).schemaFunctions
          .find((t: PgrFunction) => t.functionName === functionName)
        const securityProfile = securityProfiles.find((sp: PgrFunctionSecurityProfile) => sp.name === schemaFunctionAssignmentSet.functionAssignments[functionName])
        if (!securityProfile) throw new Error(`No securityProfile: ${schemaFunctionAssignmentSet.functionAssignments[functionName]}`)
        const functionScript = await computeFunctionScript(fn, securityProfile, roles)
        return {
          functionName: functionName,
          script: functionScript
        }
      }
    )
  const results = await Promise.all(p)
  return results
}

async function generateSchemaFunctionScripts(schemaFunctionAssignmentSet: PgrFunctionSecurityProfileAssignmentset, securityProfiles: PgrFunctionSecurityProfile[], roles: PgrRoleSet, introspection: any) {
  const schemaDir = `${artifactsDir}/${schemaFunctionAssignmentSet.schemaName}`
  const functionsDir = `${schemaDir}/functionScripts`
  await mkdirSync(functionsDir)
  
  const functionScripts = await computeSchemaFunctionScripts(schemaFunctionAssignmentSet, securityProfiles, roles, introspection)

  const p = functionScripts
    .map(
      async(ts: any) => {
        const functionScriptPath = `${functionsDir}/${ts.functionName}.sql`
        await writeFileSync(functionScriptPath, ts.script)
      }
    )
  await Promise.all(p)

  const fullSchemaScript = functionScripts.map(ts => ts.script).join('\n')

  await writeFileSync(`${schemaDir}/all-function-policies.sql`, fullSchemaScript)
}

async function generateAllFunctionScripts(introspection: any) {
  const config: PgrConfig = await loadConfig()

  const functionSecurityProfileSet: PgrFunctionSecurityProfileSet = config.functionSecurityProfileSet

  const p = config.functionSecurityProfileAssignments
  .map(
    async (schemaAssignments: any) => {
      await generateSchemaFunctionScripts(schemaAssignments, functionSecurityProfileSet.functionSecurityProfiles, config.roleSet, introspection)
    }
  );

  await Promise.all(p)
}


export default generateAllFunctionScripts
