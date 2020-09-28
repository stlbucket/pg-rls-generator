import writeDirectories from './write/write-dirctories'
import generateAllTableScripts from './generate-all-table-scripts'
import generateAllFunctionScripts from './generate-all-function-scripts'
import generateOwnershipPolicy from './generate-ownership-policy'
import generateRemoveAllRls from './generate-remove-all-rls'
import generateCreateRolesSql from './generate-create-roles-sql'
import generateSchemaUsageSql from './generate-schema-usage-sql'

async function generateAllScripts(introspection: any) {
    await writeDirectories(introspection)
    await generateAllTableScripts(introspection)
    await generateAllFunctionScripts(introspection)
    await generateOwnershipPolicy(introspection)
    await generateRemoveAllRls(introspection)
    await generateCreateRolesSql()
    await generateSchemaUsageSql(introspection)
}

export default generateAllScripts