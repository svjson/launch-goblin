import { Launcher } from '@src/launch'
import { identifyPnpmLaunchOptions, pnpmLauncher } from '@src/launch/pnpm'
import { NodePackage, ProjectComponent } from '@src/project'
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
      state.project.components as NodePackage[]
    )

    // Then
    expect(launcher).toEqual({
      id: 'pnpm',
      defaultTargets: ['dev'],
      components: [
        'backend-service',
        'frontend-portal',
        'mock-provider-a',
        'mock-provider-b',
      ],
      features: {
        componentTargets: 'multi',
        launcherTargets: 'multi',
      },
      launchCommand: expect.any(Function),
    } satisfies Launcher<NodePackage>)
  })

  describe('launchCommand', () => {
    it('should construct a pnpm command with all selected project components', () => {
      // Given
      const env = applicationEnvironment()
      const state = makeAppState('dummy-project')
      const launcher = pnpmLauncher(
        state.project,
        'dev',
        state.project.components as NodePackage[]
      ) as Launcher<ProjectComponent>

      // When
      const command = launcher.launchCommand(env, state.session.components)

      // Then
      expect(command).toEqual({
        groups: [
          {
            mode: 'parallel',
            processes: [
              {
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
                critical: false,
              },
            ],
          },
        ],
      })
    })

    it('should construct a pnpm command with two process when one component uses a different target', () => {
      // Given
      const env = applicationEnvironment()
      const state = makeAppState('dummy-project')
      const launcher = pnpmLauncher(
        state.project,
        'dev',
        state.project.components as NodePackage[]
      ) as Launcher<ProjectComponent>
      state.session.components[0].state.targets = ['dev:local']

      // When
      const command = launcher.launchCommand(env, state.session.components)

      // Then
      expect(command).toEqual({
        groups: [
          {
            mode: 'parallel',
            processes: [
              {
                bin: 'pnpm',
                args: [
                  '-r',
                  '--parallel',
                  '--stream',
                  '--filter',
                  '@acme-platform/backend-service',
                  'run',
                  'dev:local',
                ],
                critical: false,
              },
              {
                bin: 'pnpm',
                args: [
                  '-r',
                  '--parallel',
                  '--stream',
                  '--filter',
                  '@acme-platform/frontend-portal',
                  '--filter',
                  '@acme-platform/mock-provider-a',
                  '--filter',
                  '@acme-platform/mock-provider-b',
                  'run',
                  'dev',
                ],
                critical: false,
              },
            ],
          },
        ],
      })
    })
  })
})

describe('identifyPnpmLaunchOptions', () => {
  it('should not list docker-compose component as one of its launchable components', async () => {
    // Given
    const state = makeAppState('dummy-with-docker-compose')

    // When
    const [launcher] = await identifyPnpmLaunchOptions(state.project, 'dev', {
      verbose: false,
      autoLaunch: false,
    })

    // Then
    expect(launcher).toEqual({
      id: 'pnpm',
      defaultTargets: ['dev'],
      components: ['frontdesk-service', 'frontdesk-app'],
      features: {
        componentTargets: 'multi',
        launcherTargets: 'multi',
      },
      launchCommand: expect.any(Function),
    } satisfies Launcher<NodePackage>)
  })
})
