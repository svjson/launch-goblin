import { ConfigSection } from '@src/tui/config-section'
import { HeadlessBackend } from '@src/tui/framework'

export const configSectionAdapter = (
  section: ConfigSection,
  backend: HeadlessBackend
) => {
  const adapter = {
    hasNoConfigLabel() {
      return (
        section.children.length === 1 &&
        section.children.some(
          (c) => c.getWidget().get('text') === '<No Configurations>'
        )
      )
    },

    getConfigs() {
      return section.children
        .filter(
          (c) =>
            section.emptyLabel === undefined ||
            c.model.text !== section.emptyLabel?.model?.text
        )
        .map((c) => ({
          name: c.model.label,
          type: c.model.type,
        }))
    },

    getOptionLabels() {
      return section.children.map((c) => c.model.label || c.model.text)
    },

    getSelectedConfig() {
      const selected = section.children.find((c) => c.isSelected())
      if (!selected) return 'none'
      return {
        name: selected.model.label,
        type: selected.model.type,
      }
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
