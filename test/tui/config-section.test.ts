import { describe, expect, test } from 'vitest'
import { ConfigSection } from '@src/tui/config-section'
import {
  ComponentEnvironment,
  createStore,
  DefaultTheme,
  noBackend,
  Store,
} from '@src/tui/framework'
import { ApplicationState } from '@src/project'
import { ttyEnv } from './framework/fixtures'

const makeFixture = (): [
  ComponentEnvironment,
  Store<ApplicationState>,
  ApplicationState,
] => {
  const backend = noBackend()
  const theme = DefaultTheme
  const env = {
    backend,
    theme,
    tty: ttyEnv(),
  }
  const state: ApplicationState = {
    config: {
      shared: { launchConfigs: {} },
      private: { launchConfigs: {}, lastConfig: { components: {} } },
    },
  } as ApplicationState

  const store = createStore(state)

  return [env, store, state]
}

describe('ConfigSection', () => {
  describe('focusable', () => {
    test('on construction - no configs set focusable to false', () => {
      // Given
      const [env, store, _state] = makeFixture()

      const configSection = new ConfigSection({
        widget: {
          env,
        },
        state: {
          model: [],
          store,
        },
      })
      configSection.populateModel()

      expect(configSection.isFocusable()).toBe(false)
      expect(configSection.focusable).toBe(false)
    })

    test('on construction - one present config sets focusable to true', () => {
      // Given
      const [env, store, state] = makeFixture()

      state.config.shared.launchConfigs['Prutt'] = {
        defaultTarget: 'dev',
        components: {
          skrutt: {
            selected: true,
            targets: [],
          },
        },
      }

      const configSection = new ConfigSection({
        widget: {
          env,
        },
        state: {
          store,
          model: [],
        },
      })
      configSection.populateModel()

      expect(configSection.isFocusable()).toBe(true)
      expect(configSection.focusable).toBe(true)
    })
  })
})
