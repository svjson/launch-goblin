import { LaunchSession, SessionComponent } from '@src/project/state'
import { ComponentLaunchConfig, LaunchConfig } from './types'
import { Project } from '@src/project'

/**
 * Sets all provided component states to selected true/false,
 * according to `selected`.
 *
 * @param components - The components to modify
 * @param selected - Whether to select (true) or deselect (false) the components
 */
export const setSelected = (
  components: SessionComponent[],
  selected: boolean = true
): void => {
  components.forEach((c) => {
    c.state.selected = selected
  })
}

/**
 * Applies the Launch Configuration 'launchConfig' to the LaunchSession 'session'
 *
 * If the configuration contains no components, it is treated as "No config"
 * and all components are enabled/selected.
 *
 * @param launchConfig - The launch configuration to apply
 * @param project - The project containing the components
 * @param session - The current launch session to modify
 */
export const applyConfig = (
  launchConfig: LaunchConfig,
  project: Project,
  session: LaunchSession
): LaunchSession => {
  project.components.forEach((cmp) => {
    const launcher = project.launcherOf(cmp.id)

    let { selected, targets } = launchConfig.components[cmp.id] ?? {
      selected: false,
      targets: [],
    }

    targets =
      !targets || (Array.isArray(targets) && targets.length === 0)
        ? launcher
          ? cmp.targets.filter((t) => launcher.defaultTargets.includes(t))
          : cmp.targets.filter((t) => t === launchConfig.defaultTarget)
        : targets

    const sessionCmp = session.components.find((c) => c.component.id === cmp.id)
    if (sessionCmp) {
      sessionCmp.state.selected = selected
      sessionCmp.state.targets = [...targets]
    } else {
      session.components.push({
        component: cmp,
        state: {
          selected,
          targets: [...targets],
        },
      })
    }
  })

  if (Object.keys(launchConfig.components).length === 0) {
    setSelected(session.components, true)
    return session
  }

  return session
}

/**
 * Transform an array of component launch options to the model used
 * by LGConfig and disk serialization.
 *
 * @param components The components to transform
 * @return The launch configuration components record
 */
export const toLaunchConfigComponents = (
  components: SessionComponent[]
): Record<string, ComponentLaunchConfig> => {
  return components.reduce(
    (launch, cmp) => {
      launch[cmp.component.id] = {
        ...cmp.state,
      }
      return launch
    },
    {} as Record<string, ComponentLaunchConfig>
  )
}
