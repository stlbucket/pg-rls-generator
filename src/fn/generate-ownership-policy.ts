import { readFileSync, writeFileSync } from 'fs';
import Mustache from 'mustache'
import { PgrRoleSet, PgrSchema } from '../d';
import { introspectDb } from './introspect-db';

const ownershipPolicyTemplate = `
----------
----------  BEGIN OWNERSHIP SQL
----------
  

{{#schemata}}
----------  SCHEMA: {{schemaName}}
  ALTER SCHEMA {{schemaName}} OWNER TO {{dbOwnerRole}};
  -- tables
  {{#schemaTables}}
    ALTER TABLE {{schemaName}}.{{tableName}} OWNER TO {{dbOwnerRole}};
  {{/schemaTables}}
  -- functions
  {{#schemaFunctions}}
    ALTER FUNCTION {{schemaName}}.{{functionName}}({{argumentDataTypes}}) OWNER TO {{dbOwnerRole}};
  {{/schemaFunctions}}
----------  END SCHEMA: {{schemaName}}
{{/schemata}}
----------
----------  END OWNERSHIP SQL
----------
--==
`

async function computeOwnershipPolicy (introspection: any) {
  const rolesPath = `${process.cwd()}/.pgrlsgen/current-draft/roles.json`
  const roles = await readFileSync(rolesPath)
  const roleSet: PgrRoleSet = JSON.parse(roles.toString())

  const sortedSchemata = introspection.schemaTree
  .map((s:PgrSchema)=>{
    return {
      ...s,
      schemaFunctions: s.schemaFunctions.map(f=>{
        const argumentDataTypes = f.argumentDataTypes
          .split(',')
          .map(adt => adt.replace('timestamp with time zone', 'timestamptz'))
          .map(adt => adt.trim().split(' ')[1])
          .join(', ')

        return {
          ...f,
          argumentDataTypes: argumentDataTypes
        }
      })
    }
  })

  return Mustache.render(
    ownershipPolicyTemplate,
    {
      schemata: sortedSchemata,
      dbOwnerRole: roleSet.dbOwnerRole.roleName
    }
  ).split("&#39;").join("'")
}

async function generateOwnershipPolicy(introspection: any) {
  const ownershipPolicyPath = `${process.cwd()}/.pgrlsgen/current-draft/artifacts/ownership.sql`
  const ownershipPolicy = await computeOwnershipPolicy(introspection)
  await writeFileSync(ownershipPolicyPath, ownershipPolicy)
}

export default generateOwnershipPolicy