import { pnpmLauncher } from '@src/launch/pnpm'
import { makeAppState } from 'test/fixtures'
import { applicationEnvironment } from 'test/tui/framework/fixtures'
import { describe, expect, it } from 'vitest'

describe('pnpmLauncher', () => {
  it('should construct a pnpm launcher', () => {
    // Given
    const state = makeAppState('dummy-project')

    // When
    const launcher = pnpmLauncher(
      state.project,
      'dev',
      state.project.components
    )

    // Then
    expect(launcher).toEqual({
      id: 'pnpm',
      components: [
        'backend-service',
        'frontend-portal',
        'mock-provider-a',
        'mock-provider-b',
      ],
      launchCommand: expect.any(Function),
    })
  })

  describe('launchCommand', () => {
    it('should construct a pnpm command with all selected project components', () => {
      // Given
      const env = applicationEnvironment()
      const state = makeAppState('dummy-project')
      const launcher = pnpmLauncher(
        state.project,
        'dev',
        state.project.components
      )

      // When
      const command = launcher.launchCommand(env, state.session.components)

      // Then
      expect(command).toEqual({
        bin: 'pnpm',
        args: [
          '-r',
          '--parallel',
          '--stream',
          '--filter',
          '@acme-platform/backend-service',
          '--filter',
          '@acme-platform/frontend-portal',
          '--filter',
          '@acme-platform/mock-provider-a',
          '--filter',
          '@acme-platform/mock-provider-b',
          'run',
          'dev',
        ],
      })
    })
  })
})
