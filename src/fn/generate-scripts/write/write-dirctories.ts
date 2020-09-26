import {rmdirSync, mkdirSync} from 'fs'
import { PgrSchema } from '../../../d'

const artifactsDir = `${process.cwd()}/.pgrlsgen/current-draft/artifacts`

async function writeDirectories(introspection: any) {
  // @ts-ignore
  await rmdirSync(artifactsDir, {recursive: true})
  await mkdirSync(artifactsDir)

  const p = introspection.schemaTree.map(
    async (s: PgrSchema) => {
      const schemaDir = `${artifactsDir}/${s.schemaName}`
      await mkdirSync(schemaDir)
    }
  )
  await Promise.all(p)

}

export default writeDirectories