import { Launcher } from '@src/launch'
import { identifyNpmLaunchOptions, npmLauncher } from '@src/launch/npm'
import { makeDefaultFilter, NodePackage, ProjectComponent } from '@src/project'
import { makeLGOptions } from '@src/tui'
import { makeAppState } from 'test/fixtures'
import { applicationEnvironment } from 'test/tui/framework/fixtures'
import { describe, expect, it } from 'vitest'

describe('npmLauncher', () => {
  it('should construct an npm launcher', () => {
    // Given
    const state = makeAppState('dummy-project')

    // When
    const launcher = npmLauncher(
      state.project,
      'dev',
      state.project.components as NodePackage[]
    )

    // Then
    expect(launcher).toEqual({
      id: 'npm',
      defaultTargets: ['dev'],
      components: [
        'backend-service',
        'frontend-portal',
        'mock-provider-a',
        'mock-provider-b',
      ],
      features: {
        componentTargets: 'single',
        launcherTargets: 'single',
      },
      launchCommand: expect.any(Function),
    } satisfies Launcher<NodePackage>)
  })

  describe('launchCommand', () => {
    it('should construct an npm command with all selected project components', () => {
      // Given
      const env = applicationEnvironment()
      const state = makeAppState('dummy-project')
      const launcher = npmLauncher(
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
                bin: 'npm',
                args: [
                  'run',
                  'dev',
                  '--workspace',
                  '@acme-platform/backend-service',
                ],
                critical: false,
              },
              {
                bin: 'npm',
                args: [
                  'run',
                  'dev',
                  '--workspace',
                  '@acme-platform/frontend-portal',
                ],
                critical: false,
              },
              {
                bin: 'npm',
                args: [
                  'run',
                  'dev',
                  '--workspace',
                  '@acme-platform/mock-provider-a',
                ],
                critical: false,
              },
              {
                bin: 'npm',
                args: [
                  'run',
                  'dev',
                  '--workspace',
                  '@acme-platform/mock-provider-b',
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

describe('identifyNpmLaunchOptions', () => {
  it('should not list docker-compose component as one of its launchable components', async () => {
    // Given
    const state = makeAppState('npm-dummy-with-docker-compose')

    // When
    const [launcher] = await identifyNpmLaunchOptions(
      state.project,
      makeLGOptions({
        verbose: false,
        launch: {
          autoLaunch: false,
          defaultTarget: 'dev',
          targetFilter: makeDefaultFilter('dev'),
        },
      })
    )

    // Then
    expect(launcher).toEqual({
      id: 'npm',
      defaultTargets: ['dev'],
      components: ['frontdesk-service', 'frontdesk-app'],
      features: {
        componentTargets: 'single',
        launcherTargets: 'single',
      },
      launchCommand: expect.any(Function),
    } satisfies Launcher<NodePackage>)
  })
})
