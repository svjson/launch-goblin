import { describe, expect, test } from 'vitest'
import blessed from 'neo-blessed'
import { ConfigSection } from '@src/tui/config-section'
import { createStore, Store } from '@src/tui/framework'
import { ApplicationState } from '@src/project'
import { BlessedBackend } from '@src/tui/framework/blessed'
import { Widget } from '@src/tui/framework/widget'
import { Backend } from '@src/tui/framework/backend'

const makeFixture = (): [
  Backend,
  Widget,
  Store<ApplicationState>,
  ApplicationState,
] => {
  const screen = blessed.screen({
    smartCSR: false,
    terminal: 'ansi',
    isTTY: false,
  })
  const backend = new BlessedBackend(screen)
  const container = backend.createBox({
    parent: screen,
  })
  const state: ApplicationState = {
    config: {
      local: { launchConfigs: {} },
      global: { launchConfigs: {}, lastConfig: { components: {} } },
    },
  } as ApplicationState

  const store = createStore(state)

  return [backend, container, store, state]
}

describe('ConfigSection', () => {
  describe('focusable', () => {
    test('on construction - no configs set focusable to false', () => {
      // Given
      const [backend, container, store, state] = makeFixture()

      const configSection = new ConfigSection({
        widget: {
          backend,
          parent: container,
        },
        state: {
          model: [],
          store,
        },
      })
      configSection.populateModel()

      expect(configSection.focusable).toBe(false)
    })

    test('on construction - one present config sets focusable to true', () => {
      // Given
      const [backend, container, store, state] = makeFixture()

      state.config.local.launchConfigs['Prutt'] = {
        components: {
          skrutt: {
            selected: true,
          },
        },
      }

      const configSection = new ConfigSection({
        widget: {
          backend,
          parent: container,
        },
        state: {
          store,
          model: [],
        },
      })
      configSection.populateModel()

      expect(configSection.focusable).toBe(true)
    })
  })
})
