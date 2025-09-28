import { ApplicationState, Project } from '@src/project'
import { SessionComponent } from '@src/project/state'
import { ApplicationEnvironment } from '@src/tui/framework'
import { LaunchCommand, LaunchMode } from './types'
import { launch } from './launch'

const modeOrder: Record<LaunchMode, number> = {
  sequential: 1,
  parallel: 2,
}

export const launchSession = async (
  env: ApplicationEnvironment,
  state: ApplicationState
) => {
  const selected = state.session.components.filter((c) => c.state.selected)

  const byLauncher: Record<string, SessionComponent[]> = {}
  for (const cmp of selected) {
    ;(byLauncher[state.project.launcherOf(cmp.component.id)?.id ?? ''] ??=
      []).push(cmp)
  }

  const launchCommand = state.project.launchers
    .map((launcher) => {
      const components = byLauncher[launcher.id]
      if (!components) return undefined
      return launcher.launchCommand(env, byLauncher[launcher.id])
    })
    .filter((cmd) => Boolean(cmd))
    .reduce(
      (result: LaunchCommand, cmd) => {
        result.groups.push(...cmd!.groups)
        return result
      },
      { groups: [] } as LaunchCommand
    )

  launchCommand.groups.sort((a, b) => {
    return modeOrder[a.mode] - modeOrder[b.mode]
  })

  await launch(env, launchCommand)
}
