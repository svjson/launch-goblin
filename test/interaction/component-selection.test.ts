import { CheckboxWidget } from '@src/tui/framework/widget'
import { runGoblinApp } from 'test/fixtures'
import { describe, expect, it, test } from 'vitest'

describe('Interaction', () => {
  describe('Component Selection', () => {
    it('should be possible to cycle through the components using arrow-down', () => {
      // Given
      const { adapter, backend } = runGoblinApp({ projectId: 'dummy-project' })
      const cmpSection = adapter.componentSection()

      // Then - the first component is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - the second component is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('frontend-portal')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - the third component is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('mock-provider-a')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - the last component is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('mock-provider-b')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - selection has cycled back to the first component
      expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')
    })

    it('should be possible to cycle through the components using arrow-up', () => {
      // Given
      const { backend, adapter } = runGoblinApp({ projectId: 'dummy-project' })
      const cmpSection = adapter.componentSection()

      // Then - the first component is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')

      // When - arrow down
      backend.performKeyPress('up')
      // Then - the last component is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('mock-provider-b')

      // When - arrow up
      backend.performKeyPress('up')
      // Then - the third component is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('mock-provider-a')

      // When - arrow up
      backend.performKeyPress('up')
      // Then - the second component is selected
      expect(cmpSection.getFocusedComponentName()).toEqual('frontend-portal')

      // When - arrow up
      backend.performKeyPress('up')
      // Then - selection has cycled back to the first component
      expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')
    })

    it('should be possible to toggle selection with enter', () => {
      // Given
      const { state, backend, adapter } = runGoblinApp({
        projectId: 'dummy-project',
      })
      const cmpSection = adapter.componentSection()

      // Then
      expect(cmpSection.isFocusedComponentChecked()).toBe(true)
      expect(state.session.components.map((c) => c.state.selected)).toEqual([
        true,
        true,
        true,
        true,
      ])

      // When - press enter
      backend.performKeyPress('enter')
      // Then - Box has been unchecked
      expect(cmpSection.isFocusedComponentChecked()).toBe(false)
      expect(state.session.components.map((c) => c.state.selected)).toEqual([
        false,
        true,
        true,
        true,
      ])

      // When - press enter
      backend.performKeyPress('enter')
      // Then - Box has been checked
      expect(cmpSection.isFocusedComponentChecked()).toBe(true)
      expect(state.session.components.map((c) => c.state.selected)).toEqual([
        true,
        true,
        true,
        true,
      ])
    })

    it('should be possible to cycle through script targets with arrow right', () => {
      // Given
      const { state, backend, adapter } = runGoblinApp({
        projectId: 'dummy-project',
      })
      const cmpSection = adapter.componentSection()

      // Then
      expect(cmpSection.isFocusedComponentChecked()).toBe(true)
      expect(state.session.components.map((c) => c.state.targets)).toEqual([
        ['dev'],
        ['dev'],
        ['dev'],
        ['dev'],
      ])

      // When - press arrow right
      backend.performKeyPress('right')
      // Then - The next script has been selected
      expect(cmpSection.isFocusedComponentChecked()).toBe(true)
      expect(state.session.components.map((c) => c.state.targets)).toEqual([
        ['dev:local'],
        ['dev'],
        ['dev'],
        ['dev'],
      ])

      // When - press arrow right
      backend.performKeyPress('right')
      // Then - The next script has been selected
      expect(cmpSection.isFocusedComponentChecked()).toBe(true)
      expect(state.session.components.map((c) => c.state.targets)).toEqual([
        ['test'],
        ['dev'],
        ['dev'],
        ['dev'],
      ])

      // When - press arrow right
      backend.performKeyPress('right')
      // Then - The next script has been selected
      expect(cmpSection.isFocusedComponentChecked()).toBe(true)
      expect(state.session.components.map((c) => c.state.targets)).toEqual([
        ['typecheck'],
        ['dev'],
        ['dev'],
        ['dev'],
      ])

      // When - press arrow right
      backend.performKeyPress('right')
      // Then - The selected script has cycled back to 'dev'
      expect(cmpSection.isFocusedComponentChecked()).toBe(true)
      expect(state.session.components.map((c) => c.state.targets)).toEqual([
        ['dev'],
        ['dev'],
        ['dev'],
        ['dev'],
      ])
    })
  })
})
