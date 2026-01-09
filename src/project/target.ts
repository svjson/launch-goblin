import { ProjectComponent } from './types'

/**
 *
 */
export interface TargetFilter {
  /**
   * Describes the filter in a abbreviated form, suitable for output.
   *
   * @return A string description of the filter.
   */
  describe(): string
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
    describe: () => '<any>',
    targetComponents: <C extends ProjectComponent>(components: C[]) =>
      components,
  }
}
