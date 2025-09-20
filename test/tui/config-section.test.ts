import { describe, expect, test } from 'vitest'
import blessed from 'neo-blessed'
import { ConfigSection } from '@src/tui/config-section'
import { ComponentEnvironment, createStore, Store } from '@src/tui/framework'
import { ApplicationState } from '@src/project'
import { BlessedBackend } from '@src/tui/framework/blessed'
import { TTYEnv, Widget } from '@src/tui/framework'

const makeFixture = (): [
  ComponentEnvironment,
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
  const theme = {}
  const env = { backend, theme, tty: {
    colorMode: 'truecolor',
    shell: '/bin/sh',
    TERM: '256-truecolor',
    tty: true,
    terminal: 'Terminator',
    nt: ''
  } satisfies TTYEnv}
  const container = backend.createBox({})
  const state: ApplicationState = {
    config: {
      local: { launchConfigs: {} },
      global: { launchConfigs: {}, lastConfig: { components: {} } },
    },
  } as ApplicationState

  const store = createStore(state)

  return [env, container, store, state]
}

describe('ConfigSection', () => {
  describe('focusable', () => {
    test('on construction - no configs set focusable to false', () => {
      // Given
      const [env, container, store, _state] = makeFixture()

      const configSection = new ConfigSection({
        widget: {
          env,
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
      const [env, container, store, state] = makeFixture()

      state.config.local.launchConfigs['Prutt'] = {
        components: {
          skrutt: {
            selected: true,
          },
        },
      }

      const configSection = new ConfigSection({
        widget: {
          env,
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
