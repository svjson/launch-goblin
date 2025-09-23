import { runGoblinApp } from 'test/fixtures'
import { describe, expect, it } from 'vitest'

describe('Interaction', () => {
  describe('Navigation', () => {
    it('should be possible to cycle through the user interface sections using tab', () => {
      // Given
      const { backend, app } = runGoblinApp({
        projectId: 'dummy-project',
        configs: {
          private: ['Backend Dev Environment'],
          shared: ['Full Dev Environment', 'No Mocks'],
        },
      })

      // Then - Focused item is checkbox in Component Secction
      expect(backend.getFocusedWidget()!.get('text')).toEqual('backend-service')

      // When - press tab
      backend.performKeyPress('tab')
      // Then - Focused item is Launch Button
      expect(backend.getFocusedWidget()!.get('text')).toEqual('Launch')

      // When - press tab
      backend.performKeyPress('tab')
      // Then - Focused item is row in Config Section
      expect(app.focusedComponent?.model?.label).toEqual('Full Dev Environment')

      // When - press tab
      backend.performKeyPress('tab')
      // Then - Focused item is, again, checkbox in Component Secction
      expect(backend.getFocusedWidget()!.get('text')).toEqual('backend-service')
    })

    it('should cycle past config section when there are no launch configs', () => {
      // Given
      const { backend } = runGoblinApp({
        projectId: 'dummy-project',
      })

      // Then - Focused item is checkbox in Component Secction
      expect(backend.getFocusedWidget()!.get('text')).toEqual('backend-service')

      // When - press tab
      backend.performKeyPress('tab')
      // Then - Focused item is Launch Button
      expect(backend.getFocusedWidget()!.get('text')).toEqual('Launch')

      // When - press tab
      backend.performKeyPress('tab')
      // Then - Focused item is, again, checkbox in Component Secction
      expect(backend.getFocusedWidget()!.get('text')).toEqual('backend-service')
    })
  })
})
