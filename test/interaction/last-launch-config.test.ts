import { LAST_LAUNCH_LABEL } from '@src/tui/config-section'
import { runGoblinApp } from 'test/fixtures'
import { describe, expect, it } from 'vitest'

describe('Interaction', () => {
  describe('Last Launched Configuration', () => {
    describe('Matching existing', () => {
      it('should not insert a last launch-entry when the first configuration in the list matches the last launched config', async () => {
        // Given
        const { adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            shared: ['Backend Dev Environment', 'Full Dev Environment'],
            lastLaunched: 'Backend Dev Environment',
          },
        })
        const configSection = adapter.configSection()

        // Then
        expect(configSection.getOptionLabels()).toEqual([
          'Backend Dev Environment',
          'Full Dev Environment',
        ])
        expect(configSection.getSelectedConfig()).toEqual({
          name: 'Backend Dev Environment',
          type: 'shared',
        })
      })

      it('should not insert a last launch-entry when the second configuration in the list matches the last launched config', async () => {
        // Given
        const { adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            shared: ['Backend Dev Environment', 'Full Dev Environment'],
            lastLaunched: 'Full Dev Environment',
          },
        })
        const configSection = adapter.configSection()

        // Then
        expect(configSection.getOptionLabels()).toEqual([
          'Backend Dev Environment',
          'Full Dev Environment',
        ])
        expect(configSection.getSelectedConfig()).toEqual({
          name: 'Full Dev Environment',
          type: 'shared',
        })
      })
    })

    describe('No existing match', () => {
      it('should insert and select a last launch-entry when no existing configuration matches last launched config', async () => {
        // Given
        const { adapter } = await runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            shared: ['Backend Dev Environment', 'Full Dev Environment'],
            lastLaunched: 'No Mocks',
          },
        })
        const configSection = adapter.configSection()

        // Then
        expect(configSection.getOptionLabels()).toEqual([
          LAST_LAUNCH_LABEL,
          'Backend Dev Environment',
          'Full Dev Environment',
        ])
        expect(configSection.getSelectedConfig()).toEqual({
          name: LAST_LAUNCH_LABEL,
          type: 'recent',
        })
      })
    })
  })
})
