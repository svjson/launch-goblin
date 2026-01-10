import { LaunchGoblinApp } from '@src/tui'
import { componentSectionAdapter } from './tui/component-section-adapter'
import { ComponentSection } from '@src/tui/component-section'
import { Controller, HeadlessBackend, Widget } from '@src/tui/framework'
import { configSectionAdapter } from './tui/config-section-adapter'
import { ConfigSection } from '@src/tui/config-section'
import { configDialogAdapter } from './tui/config-dialog-adapter'
import { EditConfigDialog, SaveConfigDialog } from '@src/tui/config-dialog'
import { AdapterBase, makeAdapterBase, pathEntry } from './tui/adapter-base'
import { Class } from '@src/tui/framework/type-util'

export const goblinAppAdapter = (
  app: LaunchGoblinApp,
  backend: HeadlessBackend
) => {
  const adapter = {
    ...makeAdapterBase(backend, app.mainCtrl),

    applicationEvents: [] as string[],

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

      return configDialogAdapter(app.modals[0] as SaveConfigDialog, backend)
    },
    editConfigDialog() {
      if (app.modals.length === 0)
        throw new Error('Edit Config Dialog not present')
      return configDialogAdapter(app.modals[0] as EditConfigDialog, backend)
    },

    async keyPress(key: string) {
      return backend.performKeyPress(key)
    },

    isFocusedComponent(cmp: Class<Controller>) {
      const focused = app.focusedComponent
      if (!focused) return false
      return focused instanceof cmp
    },

    getFocusedWidget(): Widget | undefined {
      return backend.getFocusedWidget()
    },

    tabInto: async <Cmp extends AdapterBase<C>, C extends Controller>(
      cmp: Cmp
    ): Promise<Cmp> => {
      const targetProto = Object.getPrototypeOf(cmp.section)
      let focused = app.focusedComponent

      const tabPath = [pathEntry(app.mainCtrl, focused)]

      while (!cmp.isFocused()) {
        await backend.performKeyPress('tab')
        tabPath.push(pathEntry(app.mainCtrl, app.focusedComponent))
        if (app.focusedComponent === focused) {
          throw new Error(
            `Could not tab into ${targetProto.constructor.name}. Path taken: ${tabPath}`
          )
        }
      }
      return cmp
    },
  }
  return adapter satisfies AdapterBase
}

export type GoblinAppAdapter = ReturnType<typeof goblinAppAdapter>
