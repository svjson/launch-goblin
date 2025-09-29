import { runGoblinApp } from 'test/fixtures'
import { describe, expect, it } from 'vitest'

describe('Interaction', () => {
  describe('Navigation', () => {
    it('should be possible to cycle through the user interface sections using tab', async () => {
      // Given
      const { backend, app, adapter } = await runGoblinApp({
        projectId: 'dummy-project',
        configs: {
          private: ['Backend Dev Environment'],
          shared: ['Full Dev Environment', 'No Mocks'],
        },
      })
      const cmpSection = adapter.componentSection()

      // Then - Focused item is checkbox in Component Secction
      expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')

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
      expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')
    })

    it('should cycle past config section when there are no launch configs', async () => {
      // Given
      const { backend, adapter } = await runGoblinApp({
        projectId: 'dummy-project',
      })
      const cmpSection = adapter.componentSection()

      // Then - Focused item is checkbox in Component Secction
      expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')

      // When - press tab
      backend.performKeyPress('tab')
      // Then - Focused item is Launch Button
      expect(backend.getFocusedWidget()!.get('text')).toEqual('Launch')

      // When - press tab
      backend.performKeyPress('tab')
      // Then - Focused item is, again, checkbox in Component Secction
      expect(cmpSection.getFocusedComponentName()).toEqual('backend-service')
    })
  })
})
