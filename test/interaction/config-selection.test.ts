import { runGoblinApp } from 'test/fixtures'
import { describe, expect, test, it } from 'vitest'

describe('Interaction', () => {
  describe('Launch Config Selection', () => {
    it('should apply configurations when selected/focused', () => {
      const { backend, adapter } = runGoblinApp({
        projectId: 'dummy-project',
        configs: {
          private: ['Backend Dev Environment'],
          shared: ['Full Dev Environment', 'No Mocks'],
        },
      })
      const cmpSection = adapter.componentSection()
      expect(cmpSection.getSelectedComponentNames()).toEqual([
        'backend-service',
        'frontend-portal',
        'mock-provider-a',
        'mock-provider-b',
      ])

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

      // When - Tab into config section
      backend.performKeyPress('tab')
      backend.performKeyPress('tab')

      // Then
      expect(configSection.getFocusedConfig()).toEqual({
        name: 'Full Dev Environment',
        type: 'shared',
      })

      expect(cmpSection.getSelectedComponentNames()).toEqual([
        'backend-service',
        'frontend-portal',
        'mock-provider-a',
        'mock-provider-b',
      ])

      // When
      backend.performKeyPress('down')

      // Then
      expect(configSection.getFocusedConfig()).toEqual({
        name: 'No Mocks',
        type: 'shared',
      })

      expect(cmpSection.getSelectedComponentNames()).toEqual([
        'backend-service',
        'frontend-portal',
      ])

      // When
      backend.performKeyPress('down')

      // Then
      expect(configSection.getFocusedConfig()).toEqual({
        name: 'Backend Dev Environment',
        type: 'private',
      })

      expect(cmpSection.getSelectedComponentNames()).toEqual([
        'backend-service',
        'mock-provider-a',
        'mock-provider-b',
      ])
    })
  })
})
