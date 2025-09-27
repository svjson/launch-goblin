import { LaunchSession, SessionComponent } from '@src/project/state'
import { ComponentLaunchConfig, LaunchConfig } from './types'
import { Project } from '@src/project'

export const setSelected = (
  components: SessionComponent[],
  selected: boolean = true
) => {
  components.forEach((c) => {
    c.state.selected = selected
  })
}

export const applyConfig = (
  launchConfig: LaunchConfig,
  project: Project,
  session: LaunchSession
): LaunchSession => {
  project.components.forEach((cmp) => {
    let { selected, targets } = launchConfig.components[cmp.id] ?? {
      selected: false,
      targets: [],
    }

    targets =
      !targets || (Array.isArray(targets) && targets.length === 0)
        ? cmp.targets.filter((t) => t === launchConfig.defaultTarget)
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
