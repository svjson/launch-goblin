import { runGoblinApp } from 'test/fixtures'
import { describe, expect, test, it } from 'vitest'

describe('Interaction', () => {
  describe('Launch Config Selection', () => {
    describe('Only Node Packages', () => {
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

    describe('Node Packages and Docker Compose File', () => {
      it('should apply configurations when selected/focused', () => {
        const { state, backend, adapter } = runGoblinApp({
          projectId: 'dummy-with-docker-compose',
          configs: {
            shared: [
              'Full Dev Environment',
              'Frontend with Kibana/ElasticSearch',
            ],
            private: ['No Docker', 'Backend with SQL'],
          },
        })
        const cmpSection = adapter.componentSection()
        expect(cmpSection.getSelectedComponentNames()).toEqual([
          'frontdesk-service',
          'frontend',
          'docker-compose.yaml',
          'sql',
          'kibana',
          'elasticsearch',
        ])

        const configSection = adapter.configSection()
        expect(configSection.getConfigs()).toEqual([
          {
            name: 'Full Dev Environment',
            type: 'shared',
          },
          {
            name: 'Frontend with Kibana/ElasticSearch',
            type: 'shared',
          },
          {
            name: 'No Docker',
            type: 'private',
          },
          {
            name: 'Backend with SQL',
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
          'frontdesk-service',
          'frontend',
          'docker-compose.yaml',
          'sql',
          'kibana',
          'elasticsearch',
        ])

        // When
        backend.performKeyPress('down')

        // Then
        expect(configSection.getFocusedConfig()).toEqual({
          name: 'Frontend with Kibana/ElasticSearch',
          type: 'shared',
        })

        expect(cmpSection.getSelectedComponentNames()).toEqual([
          'frontend',
          'docker-compose.yaml',
          'kibana',
          'elasticsearch',
        ])

        // When
        backend.performKeyPress('down')

        // Then
        expect(configSection.getFocusedConfig()).toEqual({
          name: 'No Docker',
          type: 'private',
        })

        expect(cmpSection.getSelectedComponentNames()).toEqual([
          'frontdesk-service',
          'frontend',
        ])

        // When
        backend.performKeyPress('down')

        // Then
        expect(configSection.getFocusedConfig()).toEqual({
          name: 'Backend with SQL',
          type: 'private',
        })

        expect(cmpSection.getSelectedComponentNames()).toEqual([
          'frontdesk-service',
          'docker-compose.yaml',
          'sql',
        ])
      })
    })
  })
})
