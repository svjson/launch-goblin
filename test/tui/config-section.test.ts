import { describe, expect, test } from 'vitest'
import blessed from 'neo-blessed'
import { ConfigSection } from '@src/tui/config-section'
import { createStore, Store } from '@src/tui/framework'
import { ApplicationState } from '@src/project'

const makeFixture = (): [
  blessed.Widgets.Screen,
  blessed.Widgets.BlessedElement,
  Store<ApplicationState>,
  ApplicationState,
] => {
  const screen = blessed.screen({
    smartCSR: false,
    terminal: 'ansi',
    isTTY: false,
  })
  const container = blessed.box({
    parent: screen,
  })
  const state: ApplicationState = {
    config: {
      local: { launchConfigs: {} },
      global: { launchConfigs: {}, lastConfig: { components: {} } },
    },
  } as ApplicationState

  const store = createStore(state)

  return [screen, container, store, state]
}

describe('ConfigSection', () => {
  describe('focusable', () => {
    test('on construction - no configs set focusable to false', () => {
      // Given
      const [screen, container, store, state] = makeFixture()

      const configSection = new ConfigSection({
        parent: container,
        store,
        model: state.config,
      })

      expect(configSection.focusable).toBe(false)
    })

    test('on construction - one present config sets focusable to true', () => {
      // Given
      const [screen, container, store, state] = makeFixture()

      state.config.local.launchConfigs['Prutt'] = {
        components: {
          skrutt: {
            selected: true,
          },
        },
      }

      const configSection = new ConfigSection({
        parent: container,
        store,
        model: state.config,
      })

      expect(configSection.focusable).toBe(true)
    })
  })
})
