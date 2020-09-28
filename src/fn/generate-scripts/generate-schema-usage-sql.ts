import { writeFileSync } from 'fs';
import computeSchemaUsageSql from './compute/compute-schema-usage-sql'
import writeSchemaUsageSql from './write/write-schema-usage-sql'

async function generateSchemaUsageSql(introspection: any) {
  const schemaUsageSql = await computeSchemaUsageSql(introspection)
  await writeSchemaUsageSql(schemaUsageSql)
}

export default generateSchemaUsageSql