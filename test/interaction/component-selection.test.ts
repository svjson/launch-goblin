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
      const { backend, adapter } = runGoblinApp({ projectId: 'dummy-project' })
      const cmpSection = adapter.componentSection()

      // Then
      expect(cmpSection.isFocusedComponentChecked()).toBe(true)

      // When - press enter
      backend.performKeyPress('enter')
      // Then - Box has been unchecked
      expect(cmpSection.isFocusedComponentChecked()).toBe(false)

      // When - press enter
      backend.performKeyPress('enter')
      // Then - Box has been checked
      expect(cmpSection.isFocusedComponentChecked()).toBe(true)
    })
  })
})
