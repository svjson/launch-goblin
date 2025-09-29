import path from 'node:path'

import {
  makeWhimbrelContext,
  ActorFacet,
  SourceFacet,
  ProjectFacet,
  analyzePath,
  actorFacetConfig,
  WhimbrelContext,
  Actor,
} from '@whimbrel/core'
import PnpmFacet from '@whimbrel/pnpm'
import NpmFacet from '@whimbrel/npm'
import DockerCompose from '@whimbrel/docker-compose'
import TurborepoFacet from '@whimbrel/turborepo'
import PackageJsonFacet, { PackageJSON } from '@whimbrel/package-json'
import { DefaultFacetRegistry } from '@whimbrel/facet'
import { ProjectComponent, ProjectParams } from './types'

/**
 * Analyze project and identify launchable components using Whimbrel
 *
 * @param dir Project root directory
 * @returns Project parameters including identified components
 */
export const analyze = async (dir: string): Promise<ProjectParams> => {
  const ctx = await makeWhimbrelContext({
    facets: new DefaultFacetRegistry([
      ActorFacet,
      SourceFacet,
      PnpmFacet,
      NpmFacet,
      ProjectFacet,
      DockerCompose,
      PackageJsonFacet,
      TurborepoFacet,
    ]),
  })

  await analyzePath(ctx, dir)

  const root = ctx.getActor({ root: dir })!
  const cmpActors = Object.values(ctx.sources).filter((a) => a !== root)
  const components: ProjectComponent[] = [
    ...(await identifyNodePackages(ctx, cmpActors)),
    ...(await findDockerComposeFiles(root)),
  ]

  return {
    id: root.id,
    root: root.root,
    launchers: [],
    ctx,
    components,
  }
}

/**
 * Identify and construct NodePackage ProjectComponents from `actors`.
 *
 * Currently, all identified actors are presumed to be NodeJS projects.
 *
 * @param ctx Whimbrel context
 * @param actors List of actors to evaluate
 *
 * @returns List of identified ProjectComponents
 */
const identifyNodePackages = async (ctx: WhimbrelContext, actors: Actor[]) => {
  const components: ProjectComponent[] = []
  for (const a of actors) {
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
  return components
}

/**
 * Identify Docker Compose files in the root actor and construct
 * corresponding ProjectComponents.
 *
 * Currently, Docker Compose files are presumed to be a single instance
 * in the project root. No, that is not good enough for a lot of real-world
 * projects.
 *
 * @param root Root actor to evaluate
 * @returns List of identified ProjectComponents
 */
const findDockerComposeFiles = async (root: Actor) => {
  const components: ProjectComponent[] = []

  const dockerComposeConfig = actorFacetConfig(root, 'docker-compose')
  if (dockerComposeConfig) {
    components.push({
      id: path.basename(dockerComposeConfig.path),
      type: 'docker-compose',
      name: path.basename(dockerComposeConfig.path),
      path: path.dirname(dockerComposeConfig.path),
      targets: dockerComposeConfig.services,
    })
  }

  return components
}
