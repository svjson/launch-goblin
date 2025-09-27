import {
  makeWhimbrelContext,
  ActorFacet,
  SourceFacet,
  ProjectFacet,
  analyzePath,
} from '@whimbrel/core'
import PnpmFacet from '@whimbrel/pnpm'
import NpmFacet from '@whimbrel/npm'
import TurborepoFacet from '@whimbrel/turborepo'
import PackageJsonFacet, { PackageJSON } from '@whimbrel/package-json'
import { DefaultFacetRegistry } from '@whimbrel/facet'
import { ProjectComponent, ProjectParams } from './types'

export const analyze = async (dir: string): Promise<ProjectParams> => {
  const ctx = await makeWhimbrelContext({
    facets: new DefaultFacetRegistry([
      ActorFacet,
      SourceFacet,
      PnpmFacet,
      NpmFacet,
      ProjectFacet,
      PackageJsonFacet,
      TurborepoFacet,
    ]),
  })

  await analyzePath(ctx, dir)

  const root = ctx.getActor({ root: dir })!

  const cmpActors = Object.values(ctx.sources).filter((a) => a !== root)

  const components: ProjectComponent[] = []

  for (const a of cmpActors) {
    const pkgJSON = await PackageJSON.read(ctx.disk, a.root)
    components.push({
      id: a.id,
      type: 'pkgjson-script',
      name: a.name,
      root: a.root,
      package: a.name,
      pkgJson: pkgJSON,
      targets: Object.keys(pkgJSON.get('scripts', {})),
    })
  }

  return {
    id: root.id,
    root: root.root,
    launchers: [],
    ctx,
    components,
  }
}
