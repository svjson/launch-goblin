import { runGoblinApp } from 'test/fixtures'
import { describe, expect, it } from 'vitest'

describe('Interaction', () => {
  describe('Last Launched Configuration', () => {
    describe('Matching existing', () => {
      it('should not insert a last launch-entry when the first configuration in the list matches the last launched config', () => {
        // Given
        const { adapter } = runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            shared: ['Backend Dev Environment', 'Full Dev Environment'],
            lastLaunched: 'Backend Dev Environment',
          },
        })
        const configSection = adapter.configSection()

        // Then
        expect(configSection.getSelectedConfig()).toEqual({
          name: 'Backend Dev Environment',
          type: 'shared',
        })
      })

      it('should not insert a last launch-entry when the second configuration in the list matches the last launched config', () => {
        // Given
        const { adapter } = runGoblinApp({
          projectId: 'dummy-project',
          configs: {
            shared: ['Backend Dev Environment', 'Full Dev Environment'],
            lastLaunched: 'Full Dev Environment',
          },
        })
        const configSection = adapter.configSection()

        // Then
        expect(configSection.getSelectedConfig()).toEqual({
          name: 'Full Dev Environment',
          type: 'shared',
        })
      })
    })
  })
})
