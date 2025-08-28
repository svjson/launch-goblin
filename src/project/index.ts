import { spawn } from 'node:child_process'
import {
  makeWhimbrelContext,
  ActorFacet,
  SourceFacet,
  ProjectFacet,
  analyzePath,
} from '@whimbrel/core'
import NpmFacet from '@whimbrel/npm'
import PackageJsonFacet from '@whimbrel/package-json'
import { DefaultFacetRegistry } from '@whimbrel/facet'

export interface BaseComponent {
  id: string
  name: string
  selected?: boolean
}

export interface Package {
  package: string
}

export type NodePackage = BaseComponent & Package

export type ProjectComponent = NodePackage

export interface Model {
  components: ProjectComponent[]
}

export const readProject = async (): Promise<Model> => {
  const ctx = await makeWhimbrelContext({
    facets: new DefaultFacetRegistry([
      ActorFacet,
      SourceFacet,
      NpmFacet,
      ProjectFacet,
      PackageJsonFacet,
    ]),
  })

  await analyzePath(ctx, process.cwd())

  const root = ctx.getActor({ root: process.cwd() })

  const components = Object.values(ctx.sources)
    .filter((a) => a !== root)
    .map(
      (a) =>
        ({
          id: a.id,
          name: a.name,
          package: a.name,
          selected: true,
        }) satisfies ProjectComponent
    )

  return { components }
}

export const launch = async (components: ProjectComponent[]) => {
  const child = spawn(
    'npx',
    [
      'turbo',
      'run',
      'dev',
      ...components.flatMap((c) => ['--filter', c.package]),
    ],
    {
      stdio: 'inherit',
    }
  )

  child.on('exit', () => {
    process.exit(0)
  })
}
