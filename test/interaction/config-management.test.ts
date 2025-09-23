import { LegacyConfigType } from '@src/config'
import { ApplicationState } from '@src/project'
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
      // Tab into config section
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

    it('should save private config when a private launch configuration is deleted', async () => {
      const saved = new Promise<{
        state?: ApplicationState
        type: LegacyConfigType
      }>((resolve) => {
        const { backend, app } = runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            private: ['Backend Dev Environment'],
            shared: ['Full Dev Environment', 'No Mocks'],
          },
          facade: {
            saveConfig: async (state, type) => {
              resolve({ state, type })
            },
          },
        })

        // Tab into config section
        backend.performKeyPress('tab')
        backend.performKeyPress('tab')

        // Then - First shared config is selected
        expect(app.focusedComponent!.model.label).toEqual(
          'Full Dev Environment'
        )
        // Move to next config
        backend.performKeyPress('down')
        expect(app.focusedComponent!.model.label).toEqual('No Mocks')

        // Move to next config
        backend.performKeyPress('down')
        expect(app.focusedComponent!.model.label).toEqual(
          'Backend Dev Environment'
        )

        // When
        backend.performKeyPress('delete')
        // Then
        expect(app.modals.length === 1)
        expect(app.focusedComponent!.model.text).toEqual('Delete')

        // When
        backend.performKeyPress('enter')
        expect(app.focusedComponent!.model.label).toEqual(
          'Full Dev Environment'
        )
      })

      const { state, type } = await saved
      expect(state).toBeDefined()
      expect(Object.keys(state!.config.global.launchConfigs)).toEqual([])
      expect(type).toEqual('global')
    })

    it('should save shared config when a shared launch configuration is deleted', async () => {
      const saved = new Promise<{
        state?: ApplicationState
        type: LegacyConfigType
      }>((resolve) => {
        const { backend, app } = runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            private: ['Backend Dev Environment'],
            shared: ['Full Dev Environment', 'No Mocks'],
          },
          facade: {
            saveConfig: async (state, type) => {
              resolve({ state, type })
            },
          },
        })

        // Tab into config section
        backend.performKeyPress('tab')
        backend.performKeyPress('tab')

        // Then - First shared config is selected
        expect(app.focusedComponent!.model.label).toEqual(
          'Full Dev Environment'
        )

        // When
        backend.performKeyPress('delete')
        // Then
        expect(app.modals.length === 1)
        expect(app.focusedComponent!.model.text).toEqual('Delete')

        // When
        backend.performKeyPress('enter')
        expect(app.focusedComponent!.model.label).toEqual('No Mocks')
      })

      const { state, type } = await saved
      expect(state).toBeDefined()
      expect(Object.keys(state!.config.local.launchConfigs)).toEqual([
        'No Mocks',
      ])
      expect(type).toEqual('local')
    })
  })
})
