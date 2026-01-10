import { describe, expect, test, it } from 'vitest'
import { runGoblinApp } from 'test/fixtures'
import { TextInput } from '@src/tui/framework'

describe('Interaction', () => {
  describe('Launch Config Management', () => {
    describe('Updating launch configurations', () => {
      test('"enter" in config-section should open a cancellable edit dialog', async () => {
        // Given
        const { backend, app, adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            private: ['Backend Dev Environment'],
            shared: ['Full Dev Environment', 'No Mocks'],
          },
        })
        expect(app.modals.length).toEqual(0)

        // ...tab into config section and select configuration
        const configSection = await adapter.tabInto(adapter.configSection())
        await configSection.selectConfig('Backend Dev Environment')

        // When - Press enter on selected config
        await backend.performKeyPress('enter')

        // Then - Edit dialog is present
        expect(app.modals.length).toEqual(1)
        const dialog = adapter.editConfigDialog()
        expect(dialog.getTextFieldContent()).toEqual('Backend Dev Environment')

        // When - Press enter on cancel button
        dialog.tabToButton('Cancel')
        await backend.performKeyPress('enter')

        // Then - No dialogs are open
        expect(app.modals.length).toEqual(0)

        // Then - No save has been requested
        expect(adapter.applicationEvents).toEqual([])
      })

      it('should save private config when name is modified and saved', async () => {
        // Given
        const { backend, app, state, adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            private: ['Backend Dev Environment'],
            shared: ['Full Dev Environment', 'No Mocks'],
          },
        })
        expect(app.modals.length).toEqual(0)

        // ...tab into config section and select configuration
        const configSection = await adapter.tabInto(adapter.configSection())
        await configSection.selectConfig('Backend Dev Environment')

        // When - Press enter on selected config
        await backend.performKeyPress('enter')

        // Then - Edit dialog is present
        expect(app.modals.length).toEqual(1)
        const dialog = adapter.editConfigDialog()
        expect(dialog.getTextFieldContent()).toEqual('Backend Dev Environment')

        // When - Modify the config name
        expect(adapter.isFocusedComponent(TextInput)).toBe(true)
        await adapter.repeatUntil(
          'erase last word',
          () => dialog.getTextFieldContent() === 'Backend Dev',
          () => backend.performKeyPress('backspace')
        )
        await backend.typeString(' Only')
        expect(dialog.getTextFieldContent()).toEqual('Backend Dev Only')
        expect(dialog.getButton('Save')?.isDisabled()).toBe(false)

        dialog.tabToButton('Save')
        await backend.performKeyPress('enter')

        // Then - No dialogs are open
        expect(app.modals.length).toEqual(0)

        // Then - No save has been requested
        expect(adapter.applicationEvents).toEqual([['saveConfig', 'private']])
        expect(Object.keys(state.config.private.launchConfigs)).toEqual([
          'Backend Dev Only',
        ])
      })

      it('should save both private and shared configs when type is changed from private to shared', async () => {
        // Given
        const { backend, app, state, adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            private: ['Backend Dev Environment'],
            shared: ['Full Dev Environment', 'No Mocks'],
          },
        })
        expect(app.modals.length).toEqual(0)

        // ...tab into config section and select configuration
        const configSection = await adapter.tabInto(adapter.configSection())
        await configSection.selectConfig('Backend Dev Environment')

        // When - Press enter on selected config
        await backend.performKeyPress('enter')

        // Then - Edit dialog is present
        expect(app.modals.length).toEqual(1)
        const dialog = adapter.editConfigDialog()
        expect(dialog.getTextFieldContent()).toEqual('Backend Dev Environment')

        // When - Modify the type
        dialog.tabToOptionBar()
        backend.performKeyPress('right')

        // Save
        expect(dialog.getButton('Save')?.isDisabled()).toBe(false)
        dialog.tabToButton('Save')
        await backend.performKeyPress('enter')

        // Then - No dialogs are open
        expect(app.modals.length).toEqual(0)

        // Then - No save has been requested
        expect(adapter.applicationEvents).toEqual([
          ['saveConfig', 'shared'],
          ['saveConfig', 'private'],
        ])
        expect(Object.keys(state.config.private.launchConfigs)).toEqual([])
        expect(Object.keys(state.config.shared.launchConfigs)).toEqual([
          'Full Dev Environment',
          'No Mocks',
          'Backend Dev Environment',
        ])
      })

      it('should save both private and shared configs when type is changed from shared to private', async () => {
        // Given
        const { backend, app, state, adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            private: ['Backend Dev Environment'],
            shared: ['Full Dev Environment', 'No Mocks'],
          },
        })
        expect(app.modals.length).toEqual(0)

        // ...tab into config section and select configuration
        const configSection = await adapter.tabInto(adapter.configSection())
        await configSection.selectConfig('No Mocks')

        // When - Press enter on selected config
        await backend.performKeyPress('enter')

        // Then - Edit dialog is present
        expect(app.modals.length).toEqual(1)
        const dialog = adapter.editConfigDialog()
        expect(dialog.getTextFieldContent()).toEqual('No Mocks')

        // When - Modify the type
        dialog.tabToOptionBar()
        backend.performKeyPress('left')

        // Save
        expect(dialog.getButton('Save')?.isDisabled()).toBe(false)
        dialog.tabToButton('Save')
        await backend.performKeyPress('enter')

        // Then - No dialogs are open
        expect(app.modals.length).toEqual(0)

        // Then - No save has been requested
        expect(adapter.applicationEvents).toEqual([
          ['saveConfig', 'private'],
          ['saveConfig', 'shared'],
        ])
        expect(Object.keys(state.config.private.launchConfigs)).toEqual([
          'Backend Dev Environment',
          'No Mocks',
        ])
        expect(Object.keys(state.config.shared.launchConfigs)).toEqual([
          'Full Dev Environment',
        ])
      })
    })
  })
})
