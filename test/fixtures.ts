import { applyConfig, LaunchConfig } from '@src/config'
import {
  ApplicationState,
  DockerComposeFile,
  NodePackage,
  ProjectComponent,
  ProjectParams,
} from '@src/project'
import { LaunchGoblinApp } from '@src/tui'
import { Actor, FacetScope, WhimbrelContext } from '@whimbrel/core'
import { PackageJSON } from '@whimbrel/package-json'
import { makeProject } from '@src/project'
import { applicationEnvironment } from './tui/framework/fixtures'
import { ApplicationEnvironment, HeadlessBackend } from '@src/tui/framework'
import { ActionFacade } from '@src/tui/goblin-app'
import { goblinAppAdapter, GoblinAppAdapter } from './goblin-app-adapter'

export type TestProjectId = 'dummy-project' | 'dummy-with-docker-compose'

export interface TestProject {
  project: ProjectParams
  configs: {
    local: {
      launchConfigs: Record<string, LaunchConfig>
    }
    global: {
      launchConfigs: Record<string, LaunchConfig>
    }
  }
}

export const wait = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

const TEST_SAVED_CONFIGS: Record<TestProjectId, Record<string, string[]>> = {
  'dummy-project': {
    'Full Dev Environment': [
      'backend-service',
      'frontend-portal',
      'mock-provider-a',
      'mock-provider-b',
    ],
    'Backend Dev Environment': [
      'backend-service',
      'mock-provider-a',
      'mock-provider-b',
    ],
    'No Mocks': ['backend-service', 'frontend-portal'],
  },
  'dummy-with-docker-compose': {},
}

const TEST_PROJECTS: Record<TestProjectId, TestProject> = {
  'dummy-project': {
    project: {
      id: 'dummy-project',
      root: '/tmp/somewhere',
      ctx: {
        getActor(_param: any) {
          return {
            root: '/tmp/somewhere',
          }
        },
      } as WhimbrelContext,
      launchers: [
        {
          id: 'pnpm',
          defaultTargets: ['dev'],
          features: {
            componentTargets: 'multi',
            launcherTargets: 'multi',
          },
          components: [
            'backend-service',
            'frontend-portal',
            'mock-provider-a',
            'mock-provider-b',
          ],
          launchCommand: (_env, _components) => ({
            groups: [
              {
                mode: 'parallel',
                processes: [
                  {
                    bin: 'pnpm',
                    args: [],
                  },
                ],
              },
            ],
          }),
        },
      ],
      components: [
        {
          id: 'backend-service',
          type: 'pkgjson-script',
          name: 'backend-service',
          package: '@acme-platform/backend-service',
          root: '/tmp/somewhere/packages/backend-service',
          pkgJson: new PackageJSON({ content: '{}' }),
          targets: ['dev', 'dev:local', 'test', 'typecheck'],
        } satisfies NodePackage,
        {
          id: 'frontend-portal',
          type: 'pkgjson-script',
          name: 'frontend-portal',
          package: '@acme-platform/frontend-portal',
          root: '/tmp/somewhere/packages/frontend-portal',
          pkgJson: new PackageJSON({ content: '{}' }),
          targets: ['dev'],
        } satisfies NodePackage,
        {
          id: 'mock-provider-a',
          type: 'pkgjson-script',
          name: 'mock-provider-a',
          package: '@acme-platform/mock-provider-a',
          root: '/tmp/somewhere/packages/mock-provider-a',
          pkgJson: new PackageJSON({ content: '{}' }),
          targets: ['dev'],
        } satisfies NodePackage,
        {
          id: 'mock-provider-b',
          type: 'pkgjson-script',
          name: 'mock-provider-b',
          package: '@acme-platform/mock-provider-b',
          root: '/tmp/somewhere/packages/mock-provider-b',
          pkgJson: new PackageJSON({ content: '{}' }),
          targets: ['dev'],
        } satisfies NodePackage,
      ] as ProjectComponent[],
    } as ProjectParams,
    configs: {
      local: {
        launchConfigs: {},
      },
      global: {
        launchConfigs: {},
      },
    },
  },
  'dummy-with-docker-compose': {
    project: {
      id: 'dummy-with-docker-compose',
      root: '/tmp/somewhere',
      ctx: {
        getActor(param: any) {
          if (param.root === '/tmp/somewhere') {
            return {
              root: '/tmp/somewhere',
              facets: { pnpm: { roles: ['pkg-manager'] } as FacetScope<any> },
            } as unknown as Actor
          }

          return {
            root: '/tmp/somewhere',
          }
        },
      } as WhimbrelContext,
      launchers: [],
      components: [
        {
          id: 'frontdesk-service',
          type: 'pkgjson-script',
          name: 'frontdesk-service',
          package: '@omnistay/frontdesk-service',
          root: '/tmp/somewhere/packages/frontdesk-service',
          pkgJson: new PackageJSON({ content: {} }),
          targets: ['dev', 'dev:local', 'test', 'typecheck'],
        } satisfies NodePackage,
        {
          id: 'frontdesk-app',
          type: 'pkgjson-script',
          name: 'frontend',
          package: '@omnistay/frontdesk-app',
          root: '/tmp/somewhere/packages/frontend',
          pkgJson: new PackageJSON({ content: '{}' }),
          targets: ['dev', 'test', 'typecheck'],
        } satisfies NodePackage,
        {
          id: 'docker-compose.yaml',
          type: 'docker-compose',
          name: 'docker-compose.yaml',
          path: '/tmp/somewhere',
          targets: ['sql', 'kibana', 'elasticsearch'],
        } satisfies DockerComposeFile,
      ],
    },
    configs: {
      local: {
        launchConfigs: {},
      },
      global: {
        launchConfigs: {},
      },
    },
  },
}

const constructLaunchConfig = (
  state: ApplicationState,
  activeComponents: string[]
): LaunchConfig => {
  return state.project.components.reduce(
    (cfg, cmp) => {
      cfg.components[cmp.id] = {
        selected: activeComponents.includes(cmp.id),
        targets: [],
      }
      return cfg
    },
    {
      components: {},
    } as LaunchConfig
  )
}

export const makeAppState = (
  projectId: TestProjectId,
  configs: { private?: string[]; shared?: string[] } = {}
): ApplicationState => {
  const testProject = TEST_PROJECTS[projectId]
  const state: ApplicationState = {
    project: makeProject(testProject.project),
    config: {
      local: {
        launchConfigs: {},
      },

      global: {
        launchConfigs: {},
        lastConfig: {
          defaultTarget: 'dev',
          components: {},
        },
      },
    },
    session: { components: [], target: 'dev' },
  }

  for (const configId of configs.private ?? []) {
    const launchCfg = TEST_SAVED_CONFIGS[projectId][configId]
    if (launchCfg === undefined)
      throw new Error(`Test Config does not exist: ${configId}`)

    state.config.global.launchConfigs[configId] = constructLaunchConfig(
      state,
      launchCfg
    )
  }

  for (const configId of configs.shared ?? []) {
    const launchCfg = TEST_SAVED_CONFIGS[projectId][configId]
    if (launchCfg === undefined)
      throw new Error(`Test Config does not exist: ${configId}`)

    state.config.local.launchConfigs[configId] = constructLaunchConfig(
      state,
      launchCfg
    )
  }

  state.session = applyConfig(
    { defaultTarget: 'dev', components: {} },
    state.project,
    state.session
  )

  return state
}

export const runGoblinApp = ({
  projectId,
  configs = {},
  facade = {},
}: {
  projectId: TestProjectId
  configs?: { private?: string[]; shared?: string[] }
  facade?: Partial<ActionFacade>
}): {
  app: LaunchGoblinApp
  adapter: GoblinAppAdapter
  env: ApplicationEnvironment
  backend: HeadlessBackend
  state: ApplicationState
} => {
  const env = applicationEnvironment()
  const state = makeAppState(projectId, configs)

  const concreteFacade: ActionFacade = {
    launch: async () => {},
    saveConfig: async (_state, _type) => {},
    ...facade,
  }

  const app = new LaunchGoblinApp(env, state, concreteFacade)

  env.backend.render()
  return {
    env,
    app,
    adapter: goblinAppAdapter(app, env.backend as HeadlessBackend),
    state,
    backend: env.backend as HeadlessBackend,
  }
}
