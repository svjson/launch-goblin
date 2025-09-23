import { CheckboxWidget } from '@src/tui/framework/widget'
import { runGoblinApp } from 'test/fixtures'
import { describe, expect, it, test } from 'vitest'

describe('Interaction', () => {
  describe('Component Selection', () => {
    it('should be possible to cycle through the components using arrow-down', () => {
      // Given
      const { backend } = runGoblinApp({ projectId: 'dummy-project' })

      // Then - the first component is selected
      expect(backend.getFocusedWidget()?.get('text')).toEqual('backend-service')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - the second component is selected
      expect(backend.getFocusedWidget()?.get('text')).toEqual('frontend-portal')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - the third component is selected
      expect(backend.getFocusedWidget()?.get('text')).toEqual('mock-provider-a')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - the last component is selected
      expect(backend.getFocusedWidget()?.get('text')).toEqual('mock-provider-b')

      // When - arrow down
      backend.performKeyPress('down')
      // Then - selection has cycled back to the first component
      expect(backend.getFocusedWidget()?.get('text')).toEqual('backend-service')
    })

    it('should be possible to cycle through the components using arrow-up', () => {
      // Given
      const { backend } = runGoblinApp({ projectId: 'dummy-project' })

      // Then - the first component is selected
      expect(backend.getFocusedWidget()?.get('text')).toEqual('backend-service')

      // When - arrow down
      backend.performKeyPress('up')
      // Then - the last component is selected
      expect(backend.getFocusedWidget()?.get('text')).toEqual('mock-provider-b')

      // When - arrow up
      backend.performKeyPress('up')
      // Then - the third component is selected
      expect(backend.getFocusedWidget()?.get('text')).toEqual('mock-provider-a')

      // When - arrow up
      backend.performKeyPress('up')
      // Then - the second component is selected
      expect(backend.getFocusedWidget()?.get('text')).toEqual('frontend-portal')

      // When - arrow up
      backend.performKeyPress('up')
      // Then - selection has cycled back to the first component
      expect(backend.getFocusedWidget()?.get('text')).toEqual('backend-service')
    })

    it('should be possible to toggle selection with enter', () => {
      // Given
      const { backend } = runGoblinApp({ projectId: 'dummy-project' })

      // Then
      expect(backend.getFocused<CheckboxWidget>().isChecked()).toBe(true)

      // When - press enter
      backend.performKeyPress('enter')
      // Then - Box has been unchecked
      expect(backend.getFocused<CheckboxWidget>().isChecked()).toBe(false)

      // When - press enter
      backend.performKeyPress('enter')
      // Then - Box has been checked
      expect(backend.getFocused<CheckboxWidget>().isChecked()).toBe(true)
    })
  })
})
