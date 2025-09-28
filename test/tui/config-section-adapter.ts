import { ConfigSection } from '@src/tui/config-section'
import { HeadlessBackend } from '@src/tui/framework'

export const configSectionAdapter = (
  section: ConfigSection,
  backend: HeadlessBackend
) => {
  const adapter = {
    getConfigs() {
      return section.children.map((c) => ({
        name: c.model.label,
        type: c.model.type,
      }))
    },

    getFocusedConfig() {
      //      app.focusedComponent!.model.label
      const box = backend.getFocusedWidget()!
      return {
        name: box.children()[0].get('text'),
        type: box.children()[1].get('text'),
      }
    },
  }

  return adapter
}

export type ConfigSectionAdapter = ReturnType<typeof configSectionAdapter>
