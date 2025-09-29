import { Launcher } from '@src/launch/types'
import { WhimbrelContext } from '@whimbrel/core'
import { PackageJSON } from '@whimbrel/package-json'

/**
 * Describes the structure, shape and identified launch options of a target
 * project.
 */
export interface ProjectParams {
  id: string
  root: string
  ctx: WhimbrelContext
  launchers: Launcher[]
  components: ProjectComponent[]
}

/**
 * The common root of launchable project components
 */
export interface BaseComponent {
  id: string
  name: string
  targets: string[]
}

export interface Package {
  package: string
  root: string
}

/**
 * NodeJS package component type
 */
export type NodePackage = BaseComponent &
  Package & {
    type: 'pkgjson-script'
    pkgJson: PackageJSON
  }

/**
 * Docker Compose-file component tye
 */
export type DockerComposeFile = BaseComponent & {
  type: 'docker-compose'
  path: string
}

/**
 * Compound type for launchable project components
 */
export type ProjectComponent = NodePackage | DockerComposeFile
