import { ConfigType } from '@src/config'
import { ApplicationState } from '@src/project'
import { defer, runGoblinApp, wait } from 'test/fixtures'
import { describe, expect, test, it } from 'vitest'

describe('Interaction', () => {
  describe('Launch Config Management', () => {
    describe('Deleting launch configurations', () => {
      test('DEL should open cancellable confirmation modal', async () => {
        const { backend, app } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            shared: ['Full Dev Environment', 'No Mocks'],
            private: ['Backend Dev Environment'],
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
        expect(app.focusedComponent!.model.label).toEqual(
          'Full Dev Environment'
        )
      })

      it('should save private config when a private launch configuration is deleted', async () => {
        const saved = defer<{
          state?: ApplicationState
          type: ConfigType
        }>()

        const { backend, app, adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            shared: ['Full Dev Environment', 'No Mocks'],
            private: ['Backend Dev Environment'],
          },
          facade: {
            saveConfig: async (state, type) => {
              saved.resolve({ state, type })
            },
          },
        })
        const configSection = adapter.configSection()
        expect(configSection.getConfigs()).toEqual([
          {
            name: 'Full Dev Environment',
            type: 'shared',
          },
          {
            name: 'No Mocks',
            type: 'shared',
          },
          {
            name: 'Backend Dev Environment',
            type: 'private',
          },
        ])

        // Tab into config section
        backend.performKeyPress('tab')
        backend.performKeyPress('tab')

        // Then - First shared config is selected
        expect(configSection.getFocusedConfig()).toEqual({
          name: 'Full Dev Environment',
          type: 'shared',
        })
        // Move to next config
        backend.performKeyPress('down')
        expect(configSection.getFocusedConfig().name).toEqual('No Mocks')

        // Move to next config
        backend.performKeyPress('down')
        expect(configSection.getFocusedConfig()).toEqual({
          name: 'Backend Dev Environment',
          type: 'private',
        })

        // When
        backend.performKeyPress('delete')
        // Then
        expect(app.modals.length === 1)
        expect(app.focusedComponent!.model.text).toEqual('Delete')

        // When
        backend.performKeyPress('enter')
        // Then - previous config is selected
        expect(configSection.getFocusedConfig()).toEqual({
          name: 'No Mocks',
          type: 'shared',
        })

        const { state, type } = await saved.promise
        expect(state).toBeDefined()
        expect(Object.keys(state!.config.private.launchConfigs)).toEqual([])
        expect(type).toEqual('private')
      })

      it('should save shared config when a shared launch configuration is deleted', async () => {
        const saved = defer<{
          state?: ApplicationState
          type: ConfigType
        }>()

        const { backend, app, adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            private: ['Backend Dev Environment'],
            shared: ['Full Dev Environment', 'No Mocks'],
          },
          facade: {
            saveConfig: async (state, type) => {
              saved.resolve({ state, type })
            },
          },
        })
        const configSection = adapter.configSection()

        expect(configSection.getConfigs()).toEqual([
          {
            name: 'Full Dev Environment',
            type: 'shared',
          },
          {
            name: 'No Mocks',
            type: 'shared',
          },
          {
            name: 'Backend Dev Environment',
            type: 'private',
          },
        ])

        // Tab into config section
        backend.performKeyPress('tab')
        backend.performKeyPress('tab')

        // Then - First shared config is selected
        expect(configSection.getFocusedConfig().name).toEqual(
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

        const { state, type } = await saved.promise
        expect(state).toBeDefined()
        expect(Object.keys(state!.config.shared.launchConfigs)).toEqual([
          'No Mocks',
        ])
        expect(type).toEqual('shared')
      })

      it('should return focus to component section when the only launch config is deleted', async () => {
        const saved = defer<{
          state?: ApplicationState
          type: ConfigType
        }>()

        const { backend, app, adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            private: ['Backend Dev Environment'],
          },
          facade: {
            saveConfig: async (state, type) => {
              saved.resolve({ state, type })
            },
          },
        })

        // Tab into config section
        backend.performKeyPress('tab')
        backend.performKeyPress('tab')

        // Then - The one and only config is selected
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
        await wait(100)
        expect(adapter.componentSection().hasFocus()).toBe(true)

        expect(adapter.configSection().hasNoConfigLabel()).toBe(true)

        const { state } = await saved.promise

        expect(Object.keys(state!.config.shared.launchConfigs)).toEqual([])
        expect(Object.keys(state!.config.private.launchConfigs)).toEqual([])

        expect(adapter.componentSection().getFocusedComponentName()).toEqual(
          'backend-service'
        )
      })
    })

    describe('Creating launch configurations', () => {
      test('C-s should open a cancellable save dialog', async () => {
        let saved = false
        const { backend, app, state, adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          facade: {
            saveConfig: async (_s, _t) => {
              saved = true
            },
          },
        })

        expect(app.modals.length).toEqual(0)

        // When
        backend.performKeyPress('C-s')
        // Then - Save config dialog opens
        const dialog = adapter.saveConfigDialog()
        expect(dialog.getTextFieldContent()).toEqual('')

        // When - Tab to Cancel-button
        dialog.tabToButton('Cancel')

        // When - Press button
        backend.performKeyPress('enter')
        // Then - Modal has been closed
        expect(app.modals.length).toEqual(0)

        // Then - focused item is the first project component
        expect(adapter.componentSection().getFocusedComponentName()).toEqual(
          'backend-service'
        )

        // Then - No config save has been triggered
        await wait(100)
        expect(saved).toBe(false)

        expect(Object.keys(state!.config.shared.launchConfigs)).toEqual([])
        expect(Object.keys(state!.config.private.launchConfigs)).toEqual([])
      })

      it('Should save private config when a private launch configuration is created', async () => {
        const saved = defer<{
          state?: ApplicationState
          type: ConfigType
        }>()

        const { backend, app, adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            private: ['Backend Dev Environment'],
            shared: ['Full Dev Environment', 'No Mocks'],
          },
          facade: {
            saveConfig: async (state, type) => {
              saved.resolve({ state, type })
            },
          },
        })

        expect(app.modals.length).toEqual(0)

        // When
        backend.performKeyPress('C-s')
        // Then - Save config dialog opens
        const dialog = adapter.saveConfigDialog()
        expect(dialog.getTextFieldContent()).toEqual('')

        // When - Type config name
        backend.typeString('New Config')
        await wait(100)
        expect(dialog.getTextFieldContent()).toEqual('New Config')

        // When - Tab to Save-button
        dialog.tabToButton('Save')

        // When - Press button
        backend.performKeyPress('enter')
        // Then - Modal has been closed
        expect(app.modals.length).toEqual(0)

        // Then - focused item is the first project component
        expect(adapter.componentSection().getFocusedComponentName()).toEqual(
          'backend-service'
        )

        const { state, type } = await saved.promise

        expect(type).toEqual('private')
        expect(Object.keys(state!.config.private.launchConfigs)).toEqual([
          'Backend Dev Environment',
          'New Config',
        ])
      })

      it('Should save shared config when a shared launch configuration is created', async () => {
        const saved = defer<{
          state?: ApplicationState
          type: ConfigType
        }>()
        const { backend, app, adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            private: ['Backend Dev Environment'],
            shared: ['Full Dev Environment', 'No Mocks'],
          },
          facade: {
            saveConfig: async (state, type) => {
              saved.resolve({ state, type })
            },
          },
        })
        const configSection = adapter.configSection()
        expect(configSection.getConfigs()).toEqual([
          {
            name: 'Full Dev Environment',
            type: 'shared',
          },
          {
            name: 'No Mocks',
            type: 'shared',
          },
          {
            name: 'Backend Dev Environment',
            type: 'private',
          },
        ])

        expect(app.modals.length).toEqual(0)

        // When
        backend.performKeyPress('C-s')
        // Then - Save config dialog opens
        const dialog = adapter.saveConfigDialog()
        expect(dialog.getTextFieldContent()).toEqual('')

        // When - Type config name
        backend.typeString('Cheese Muffins')
        await wait(100)
        expect(dialog.getTextFieldContent()).toEqual('Cheese Muffins')

        // When - Tab to config type option
        backend.performKeyPress('tab')
        expect(app.focusedComponent!.model.label).toEqual('Private')

        backend.performKeyPress('right')
        expect(app.focusedComponent!.model.label).toEqual('Shared')

        // When - Tab to Save-button
        dialog.tabToButton('Save')

        // When - Press button
        backend.performKeyPress('enter')
        // Then - Modal has been closed
        expect(app.modals.length).toEqual(0)

        // Then - focused item is the first project component
        expect(adapter.componentSection().getFocusedComponentName()).toEqual(
          'backend-service'
        )

        const { state, type } = await saved.promise

        expect(type).toEqual('shared')
        expect(Object.keys(state!.config.shared.launchConfigs)).toEqual([
          'Full Dev Environment',
          'No Mocks',
          'Cheese Muffins',
        ])
      })
    })
  })
})
