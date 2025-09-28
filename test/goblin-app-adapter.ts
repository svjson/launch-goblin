import { LaunchGoblinApp } from '@src/tui'
import { componentSectionAdapter } from './tui/component-section-adapter'
import { ComponentSection } from '@src/tui/component-section'
import { HeadlessBackend } from '@src/tui/framework'
import { configSectionAdapter } from './tui/config-section-adapter'
import { ConfigSection } from '@src/tui/config-section'

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
    configSection() {
      return configSectionAdapter(
        app.mainCtrl.children[3] as ConfigSection,
        backend
      )
    },
  }
}

export type GoblinAppAdapter = ReturnType<typeof goblinAppAdapter>
