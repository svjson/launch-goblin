import { ConfigType } from '@src/config'
import { ApplicationState } from '@src/project'
import { LAST_LAUNCH_LABEL, NEW_CONFIG_LABEL } from '@src/tui/config-section'
import { defer, runGoblinApp, wait } from 'test/fixtures'
import { describe, expect, test, it, should } from 'vitest'

describe('Interaction', () => {
  describe('Transient New Config-option', () => {
    describe('Not Present at startup', () => {
      describe('With Last Launch-label', () => {
        it('should not be present on startup', async () => {
          const { adapter } = await runGoblinApp({
            projectId: 'dummy-project',
            configs: {
              shared: ['Full Dev Environment'],
              private: ['Backend Dev Environment'],
              lastLaunched: 'No Mocks',
            },
          })
          const configSection = adapter.configSection()

          // Then
          expect(configSection.getOptionLabels()).toEqual([
            LAST_LAUNCH_LABEL,
            'Full Dev Environment',
            'Backend Dev Environment',
          ])
        })
      })

      describe('With Last Launch-label', () => {
        it('should not be present on startup', async () => {
          const { adapter } = await runGoblinApp({
            projectId: 'dummy-project',
            configs: {
              shared: ['Full Dev Environment', 'No Mocks'],
              private: ['Backend Dev Environment'],
            },
          })
          const configSection = adapter.configSection()

          // Then
          expect(configSection.getOptionLabels()).toEqual([
            'Full Dev Environment',
            'No Mocks',
            'Backend Dev Environment',
          ])
        })
      })
    })

    describe('Presence', () => {
      describe('With Last Launch-label', () => {
        it('should appear when initial session is modified', async () => {
          const { adapter } = await runGoblinApp({
            projectId: 'dummy-project',
            configs: {
              shared: ['Full Dev Environment'],
              private: ['Backend Dev Environment'],
              lastLaunched: 'No Mocks',
            },
          })
          const configSection = adapter.configSection()
          const componentSection = adapter.componentSection()

          // Then
          expect(configSection.getOptionLabels()).toEqual([
            LAST_LAUNCH_LABEL,
            'Full Dev Environment',
            'Backend Dev Environment',
          ])

          // When
          componentSection.toggleCurrentComponent()

          // Then
          expect(configSection.getOptionLabels()).toEqual([
            NEW_CONFIG_LABEL,
            LAST_LAUNCH_LABEL,
            'Full Dev Environment',
            'Backend Dev Environment',
          ])
          expect(configSection.getSelectedConfig()).toEqual({
            name: NEW_CONFIG_LABEL,
            type: 'unsaved',
          })
        })
      })

      describe('Without Last Launch-label', () => {
        it('should appear when initial session is modified', async () => {
          const { adapter } = await runGoblinApp({
            projectId: 'dummy-project',
            configs: {
              shared: ['Full Dev Environment'],
              private: ['Backend Dev Environment'],
            },
          })
          const configSection = adapter.configSection()
          const componentSection = adapter.componentSection()

          // Then
          expect(configSection.getOptionLabels()).toEqual([
            'Full Dev Environment',
            'Backend Dev Environment',
          ])

          // When
          componentSection.toggleCurrentComponent()

          // Then
          expect(configSection.getOptionLabels()).toEqual([
            NEW_CONFIG_LABEL,
            'Full Dev Environment',
            'Backend Dev Environment',
          ])
          expect(configSection.getSelectedConfig()).toEqual({
            name: NEW_CONFIG_LABEL,
            type: 'unsaved',
          })
        })
      })

      describe('With selectedIndex > 0', () => {
        it('should appear when initial session is modified', async () => {
          const { adapter } = await runGoblinApp({
            projectId: 'dummy-project',
            configs: {
              shared: ['Full Dev Environment'],
              private: ['Backend Dev Environment'],
              lastLaunched: 'Backend Dev Environment',
            },
          })
          const configSection = adapter.configSection()
          const componentSection = adapter.componentSection()

          // Then
          expect(configSection.getOptionLabels()).toEqual([
            'Full Dev Environment',
            'Backend Dev Environment',
          ])
          expect(configSection.getSelectedConfig()).toEqual({
            name: 'Backend Dev Environment',
            type: 'private',
          })

          // When
          componentSection.toggleCurrentComponent()

          // Then
          expect(configSection.getOptionLabels()).toEqual([
            NEW_CONFIG_LABEL,
            'Full Dev Environment',
            'Backend Dev Environment',
          ])
          expect(configSection.getSelectedConfig()).toEqual({
            name: NEW_CONFIG_LABEL,
            type: 'unsaved',
          })
        })
      })
    })
  })
})
