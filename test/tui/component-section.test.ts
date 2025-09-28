import { describe, expect, it, test } from 'vitest'
import { applicationEnvironment } from './framework/fixtures'
import { makeAppState, TestProjectId } from 'test/fixtures'
import { ComponentSection } from '@src/tui/component-section'
import {
  ApplicationEnvironment,
  createStore,
  HeadlessBackend,
} from '@src/tui/framework'
import { ApplicationState } from '@src/project'
import { componentSectionAdapter } from './component-section-adapter'

describe('ComponentSection', () => {
  const createEnv = (
    projectId: TestProjectId
  ): [ApplicationEnvironment, ApplicationState] => {
    const env = applicationEnvironment()
    const state = makeAppState(projectId)

    return [env, state]
  }

  const createComponentSection = (
    env: ApplicationEnvironment,
    state: ApplicationState
  ) => {
    const store = createStore(state)
    const section = new ComponentSection({
      widget: { env, keyMap: { replace: false, keys: {} } },
      state: { model: state.session.components, store },
    })

    env.backend.render()

    return componentSectionAdapter(section, env.backend as HeadlessBackend)
  }

  const createCmpAndEnv = (projectId: TestProjectId) => {
    const [env, state] = createEnv(projectId)
    const section = createComponentSection(env, state)
    return { section, env, state }
  }

  describe('Initial State', () => {
    it('should contain checkboxes for all components', () => {
      // Given
      const { section } = createCmpAndEnv('dummy-project')

      // Then
      expect(section.getComponentNames()).toEqual([
        'backend-service',
        'frontend-portal',
        'mock-provider-a',
        'mock-provider-b',
      ])
    })

    test('all checkboxes should be checked by default', () => {
      // Given
      const { section } = createCmpAndEnv('dummy-project')

      // Then
      expect(section.getComponentStates().map((s) => s.checked)).toEqual([
        true,
        true,
        true,
        true,
      ])
    })
  })

  describe('Interaction', () => {
    it('should move to next line when `down` is pressed', () => {
      // Given
      const { section } = createCmpAndEnv('dummy-project')
      // When
      section.section.keyMap.down.handler()
      // Then
      expect(section.section.focusedIndex).toEqual(1)
    })
  })
})
