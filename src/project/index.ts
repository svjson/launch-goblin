import path from 'node:path'

import { spawn } from 'node:child_process'
import {
  makeWhimbrelContext,
  makeAnalyzeScaffold,
  makeRunner,
  materializePlan,
  ActorFacet,
  SourceFacet,
  ProjectFacet,
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

  const blueprint = makeAnalyzeScaffold(process.cwd())
  const plan = await materializePlan(ctx, blueprint)

  const runner = makeRunner(ctx, plan)
  await runner.run()

  const root = Object.values(ctx.sources).find((s) => s.root === process.cwd())

  const components: ProjectComponent[] = []
  for (const sm of root?.facets.project.config.subModules) {
    const actor = Object.values(ctx.sources).find((s) => s.root === sm.root)
    if (!actor) continue
    const pkgJson = await ctx.disk.readJson(path.join(sm.root, 'package.json'))
    components.push({
      id: actor.id,
      name: pkgJson.name,
      package: pkgJson.name,
      selected: true,
    } satisfies ProjectComponent)
  }

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
