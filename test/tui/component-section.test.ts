import { describe, expect, it, test } from 'vitest'
import { applicationEnvironment } from './framework/fixtures'
import { makeAppState, TestProjectId } from 'test/fixtures'
import { ComponentSection } from '@src/tui/component-section'
import {
  ApplicationEnvironment,
  Checkbox,
  createStore,
} from '@src/tui/framework'
import { ApplicationState } from '@src/project'

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
    const parent = env.backend.createBox({})

    const store = createStore(state.project)
    const section = new ComponentSection({
      widget: { env, parent, keyMap: { replace: false, keys: {} } },
      state: { model: state.project.components, store },
    })

    env.backend.render()

    return section
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
      const expectedComponents = [
        'backend-service',
        'frontend-portal',
        'mock-provider-a',
        'mock-provider-b',
      ]
      const checkboxes = section.getWidget().children()
      expect(checkboxes.length).toBe(expectedComponents.length)

      expectedComponents.forEach((cmpName, i) => {
        expect(checkboxes[i].get('text')).toEqual(cmpName)
      })
    })

    test('all checkboxes should be checked by default', () => {
      // Given
      const { section } = createCmpAndEnv('dummy-project')

      // Then
      const checkboxes = section.children

      checkboxes.forEach((cb) => {
        expect((cb as Checkbox).isSelected()).toBe(true)
      })
    })
  })

  describe('Interaction', () => {
    it('should move to next line when `down` is pressed', () => {
      // Given
      const { section } = createCmpAndEnv('dummy-project')
      // When
      section.keyMap.down.handler()
      // Then
      expect(section.focusedIndex).toEqual(1)
    })
  })
})
