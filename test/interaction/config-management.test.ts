import { runGoblinApp } from 'test/fixtures'
import { describe, expect, test, it } from 'vitest'

describe('Interaction', () => {
  describe('Launch Config Management', () => {
    test('DEL should open cancellable confirmation modal', () => {
      const { backend, app } = runGoblinApp({
        projectId: 'dummy-project',
        configs: {
          private: ['Backend Dev Environment'],
          shared: ['Full Dev Environment', 'No Mocks'],
        },
      })
      backend.performKeyPress('tab')
      backend.performKeyPress('tab')

      // When
      backend.performKeyPress('delete')
      // Then
      expect(app.modals.length === 1)
      expect(app.focusedComponent!.model.text).toEqual('Delete')

      // When
      backend.performKeyPress('tab')
      // Then
      expect(app.focusedComponent!.model.text).toEqual('Cancel')

      // When
      backend.performKeyPress('enter')
      expect(app.focusedComponent!.model.label).toEqual('Full Dev Environment')
    })
  })
})
