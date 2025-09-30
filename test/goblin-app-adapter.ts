import { LaunchGoblinApp } from '@src/tui'
import { componentSectionAdapter } from './tui/component-section-adapter'
import { ComponentSection } from '@src/tui/component-section'
import { HeadlessBackend } from '@src/tui/framework'
import { configSectionAdapter } from './tui/config-section-adapter'
import { ConfigSection } from '@src/tui/config-section'
import { saveConfigDialogAdapter } from './tui/save-config-dialog-adapter'
import { SaveConfigDialog } from '@src/tui/save-config-dialog'

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
    saveConfigDialog() {
      if (app.modals.length === 0)
        throw new Error('Save Config Dialog not present')

      return saveConfigDialogAdapter(app.modals[0] as SaveConfigDialog, backend)
    },
  }
}

export type GoblinAppAdapter = ReturnType<typeof goblinAppAdapter>
