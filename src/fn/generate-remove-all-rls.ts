import { writeFileSync } from 'fs'
import Mustache from 'mustache'
import { PgrSchema } from '../d'

async function computeRemoveRls (schemaName: string) {
  return Mustache.render(
    removeAllRlsScriptTemplate,
    { schemaName: schemaName }
  )
}

async function generateRemoveAllRls (introspection: any) {
  const removeAllRlsPath = `${process.cwd()}/.pgrlsgen/current-draft/artifacts/remove-all-rls.sql`

  const p = introspection.schemaTree.map(
    (s: PgrSchema) => {
      return computeRemoveRls(s.schemaName)
    }
  )

  const allScripts = await Promise.all(p)
  await writeFileSync(removeAllRlsPath, allScripts.join(''))
}

export default generateRemoveAllRls

const removeAllRlsScriptTemplate = `
----------
----------  remove all rls policies for schema: {{schemaName}}
----------
DO
$body$
  DECLARE 
    _pol pg_policies;
    _drop_sql text;
  BEGIN

    for _pol in
      select 
        *
      from pg_policies
      where schemaname = '{{schemaName}}'
    loop
      _drop_sql := 'drop policy if exists ' || _pol.policyname || ' on ' || _pol.schemaname || '.' || _pol.tablename || ';';
      execute _drop_sql;
    end loop
    ;
  END
$body$;
`