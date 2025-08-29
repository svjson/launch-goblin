import { ComponentLaunchConfig, LaunchConfig } from './types'
import { Project, ProjectComponent } from '@src/project'

export const setSelected = (
  components: ProjectComponent[],
  selected: boolean = true
) => {
  components.forEach((c) => {
    c.selected = selected
  })
}

export const applyConfig = (launchConfig: LaunchConfig, project: Project) => {
  if (Object.keys(launchConfig.components).length === 0) {
    setSelected(project.components, true)
    return
  }

  setSelected(project.components, false)

  for (const cmp of project.components) {
    cmp.selected = launchConfig.components[cmp.id]?.selected ?? false
  }
}

export const toLaunchConfigComponents = (
  components: ProjectComponent[]
): Record<string, ComponentLaunchConfig> => {
  return components.reduce(
    (launch, cmp) => {
      launch[cmp.id] = {
        selected: cmp.selected,
      }
      return launch
    },
    {} as Record<string, ComponentLaunchConfig>
  )
}
