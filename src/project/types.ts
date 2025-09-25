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

export interface Project extends ProjectParams {
  hasRootFacet(facetId: string): boolean
  packageManager(): string | undefined
  projectRoot(): string
}

/**
 * The common root of launchable project components
 */
export interface BaseComponent {
  id: string
  name: string
  selected?: boolean
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
    pkgJson: PackageJSON
  }

/**
 * Compound type for launchable project components
 */
export type ProjectComponent = NodePackage
