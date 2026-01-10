import { ProjectComponent } from './types'

/**
 * Describes a filter for selecting target components within a project.
 */
export interface TargetFilter {
  /**
   * The type ID of this filter.
   */
  type: string

  /**
   * Describes the filter in a abbreviated form, suitable for output.
   *
   * @return A string description of the filter.
   */
  describe(): string

  /**
   * Filters the given components to those matching the target criteria,
   * and returns an array of modified components, with the `targets`
   * array trimmed down to contain only targets available for launch.
   *
   * @param components The components to filter.
   */
  targetComponents: <C extends ProjectComponent>(components: C[]) => C[]
}

/**
 * Create a TargetFilter that matches components with the given target.
 *
 * @param target The target name to match.
 *
 * @return A TargetFilter instance.
 */
export const makeDefaultFilter = (target: string): TargetFilter => {
  return {
    type: 'default',
    describe: () => `'${target}(:*)'`,
    targetComponents<C extends ProjectComponent>(components: C[]) {
      return components
        .filter((c) => c.targets.includes(target))
        .map((c) => ({
          ...c,
          targets: c.targets.filter(
            (t) => t === target && t.startsWith(`${target}:`)
          ),
        }))
    },
  }
}

/**
 * Create a TargetFilter that passes through all components unfiltered.
 *
 * @return A TargetFilter instance.
 */
export const makePassThroughFilter = (): TargetFilter => {
  return {
    type: 'pass-through',
    describe: () => '<any>',
    targetComponents: <C extends ProjectComponent>(components: C[]) =>
      components,
  }
}
