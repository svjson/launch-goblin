import { LaunchGoblinApp } from '@src/tui'
import { componentSectionAdapter } from './tui/component-section-adapter'
import { ComponentSection } from '@src/tui/component-section'
import { Backend, HeadlessBackend } from '@src/tui/framework'

export const goblinAppAdapter = (
  app: LaunchGoblinApp,
  backend: HeadlessBackend
) => {
  return {
    componentSection() {
      return componentSectionAdapter(
        app.mainCtrl.children[1] as ComponentSection,
        backend
      )
    },
  }
}

export type GoblinAppAdapter = ReturnType<typeof goblinAppAdapter>
