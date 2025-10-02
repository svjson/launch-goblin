import { ContextConfig } from '@src/config'
import { launchConfigByContent, launchConfigByName } from '@src/config/query'
import { createContextConfig } from 'test/fixtures'
import { describe, expect, it } from 'vitest'

describe('launchConfigByName', () => {
  it('should return private config that matches query name', () => {
    // Given
    const config: ContextConfig = createContextConfig('dummy-project', {
      shared: ['Full Dev Environment', 'No Mocks'],
      private: ['Backend Dev Environment'],
    })

    // When
    const result = launchConfigByName('Backend Dev Environment', config)

    // Then
    expect(result?.components).toEqual({
      'backend-service': {
        selected: true,
        targets: ['dev'],
      },
      'frontend-portal': {
        selected: false,
        targets: ['dev'],
      },
      'mock-provider-a': {
        selected: true,
        targets: ['dev'],
      },
      'mock-provider-b': {
        selected: true,
        targets: ['dev'],
      },
    })
  })

  it('should return shared config that matches query name', () => {
    // Given
    const config: ContextConfig = createContextConfig('dummy-project', {
      shared: ['Full Dev Environment', 'No Mocks'],
      private: ['Backend Dev Environment'],
    })

    // When
    const result = launchConfigByName('Backend Dev Environment', config)

    // Then
    expect(result?.components).toEqual({
      'backend-service': {
        selected: true,
        targets: ['dev'],
      },
      'frontend-portal': {
        selected: false,
        targets: ['dev'],
      },
      'mock-provider-a': {
        selected: true,
        targets: ['dev'],
      },
      'mock-provider-b': {
        selected: true,
        targets: ['dev'],
      },
    })
  })
})

describe('launchConfigByContent', () => {
  it('should return shared config that exactly matches content of query', () => {
    // Given
    const config: ContextConfig = createContextConfig('dummy-project', {
      shared: ['Full Dev Environment', 'No Mocks'],
      private: ['Backend Dev Environment'],
    })

    // When
    const result = launchConfigByContent(
      {
        defaultTarget: 'dev',
        components: {
          'backend-service': {
            selected: true,
            targets: ['dev'],
          },
          'frontend-portal': {
            selected: true,
            targets: ['dev'],
          },
          'mock-provider-a': {
            selected: false,
            targets: ['dev'],
          },
          'mock-provider-b': {
            selected: false,
            targets: ['dev'],
          },
        },
      },
      config
    )

    // Then
    expect(result).toEqual({
      name: 'No Mocks',
      config: {
        defaultTarget: 'dev',
        components: {
          'backend-service': {
            selected: true,
            targets: ['dev'],
          },
          'frontend-portal': {
            selected: true,
            targets: ['dev'],
          },
          'mock-provider-a': {
            selected: false,
            targets: ['dev'],
          },
          'mock-provider-b': {
            selected: false,
            targets: ['dev'],
          },
        },
      },
    })
  })

  /**
   * This test simulates the presence of new components not present in the
   * a saved configuration
   */
  it('should return config with missing components that otherwise matches', () => {
    // Given
    const config: ContextConfig = createContextConfig('dummy-project', {
      shared: ['Full Dev Environment', 'No Mocks'],
      private: ['Backend Dev Environment'],
    })
    config.shared.launchConfigs['Full Dev Environment'] = {
      defaultTarget: 'dev',
      components: {
        'backend-service': {
          selected: true,
          targets: ['dev'],
        },
        'frontend-portal': {
          selected: true,
          targets: ['dev'],
        },
      },
    }

    // When
    const result = launchConfigByContent(
      {
        defaultTarget: 'dev',
        components: {
          'backend-service': {
            selected: true,
            targets: ['dev'],
          },
          'frontend-portal': {
            selected: true,
            targets: ['dev'],
          },
          'mock-provider-a': {
            selected: false,
            targets: ['dev'],
          },
          'mock-provider-b': {
            selected: true,
            targets: ['dev'],
          },
        },
      },
      config
    )

    // Then
    expect(result).toEqual({
      name: 'Full Dev Environment',
      config: {
        defaultTarget: 'dev',
        components: {
          'backend-service': {
            selected: true,
            targets: ['dev'],
          },
          'frontend-portal': {
            selected: true,
            targets: ['dev'],
          },
        },
      },
    })
  })

  /**
   * This test simulates components that have been removed from a project, but are still
   * present in a saved configuration.
   */
  it('should return config with additional components', () => {
    // Given
    const config: ContextConfig = createContextConfig('dummy-project', {
      shared: ['Full Dev Environment', 'No Mocks'],
      private: ['Backend Dev Environment'],
    })

    // When
    const result = launchConfigByContent(
      {
        defaultTarget: 'dev',
        components: {
          'backend-service': {
            selected: true,
            targets: ['dev'],
          },
          'frontend-portal': {
            selected: true,
            targets: ['dev'],
          },
        },
      },
      config
    )

    // Then
    expect(result).toEqual({
      name: 'Full Dev Environment',
      config: {
        defaultTarget: 'dev',
        components: {
          'backend-service': {
            selected: true,
            targets: ['dev'],
          },
          'frontend-portal': {
            selected: true,
            targets: ['dev'],
          },
          'mock-provider-a': {
            selected: true,
            targets: ['dev'],
          },
          'mock-provider-b': {
            selected: true,
            targets: ['dev'],
          },
        },
      },
    })
  })
})
