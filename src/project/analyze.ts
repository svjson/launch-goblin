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
import { Project, ProjectComponent } from './types'

export const analyze = async (dir: string): Promise<Project> => {
  const ctx = await makeWhimbrelContext({
    facets: new DefaultFacetRegistry([
      ActorFacet,
      SourceFacet,
      NpmFacet,
      ProjectFacet,
      PackageJsonFacet,
    ]),
  })

  await analyzePath(ctx, dir)

  const root = ctx.getActor({ root: dir })!

  return {
    id: root.id,
    root: root.root,
    components: Object.values(ctx.sources)
      .filter((a) => a !== root)
      .map(
        (a) =>
          ({
            id: a.id,
            name: a.name,
            package: a.name,
            selected: true,
          }) satisfies ProjectComponent
      ),
  }
}
