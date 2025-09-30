import {
  applyConfig,
  ConfigurationModule,
  ContextConfig,
  LaunchConfig,
  LGConfig,
} from '@src/config'
import {
  ApplicationState,
  DockerComposeFile,
  makeProjectFacade,
  NodePackage,
  Project,
  ProjectComponent,
  ProjectModule,
  ProjectParams,
} from '@src/project'
import { LaunchGoblinApp } from '@src/tui'
import { Actor, FacetScope, WhimbrelContext } from '@whimbrel/core'
import { PackageJSON } from '@whimbrel/package-json'
import { makeProject } from '@src/project'
import { ttyEnv } from './tui/framework/fixtures'
import {
  ApplicationEnvironment,
  HeadlessBackend,
  noBackend,
  TTYEnv,
} from '@src/tui/framework'
import { ActionFacade, LGOptions, makeLGOptions } from '@src/tui/goblin-app'
import { goblinAppAdapter, GoblinAppAdapter } from './goblin-app-adapter'
import { SystemModule } from '@src/bootstrap/facade'
import { bootstrap } from '@src/bootstrap/bootstrap'
import { PrivateConfig } from '@src/config/types'

export const defer = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

export type TestProjectId = 'dummy-project' | 'dummy-with-docker-compose'

export interface TestProject {
  project: ProjectParams
  configs: {
    shared: {
      launchConfigs: Record<string, LaunchConfig>
    }
    private: {
      launchConfigs: Record<string, LaunchConfig>
    }
  }
}

export const wait = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export type TestComponentConfig =
  | string
  | {
      name: string
      targets: string[]
    }

const TEST_SAVED_CONFIGS: Record<
  TestProjectId,
  Record<string, TestComponentConfig[]>
> = {
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
  'dummy-with-docker-compose': {
    'Full Dev Environment': [
      'frontdesk-service',
      'frontdesk-app',
      {
        name: 'docker-compose.yaml',
        targets: ['sql', 'kibana', 'elasticsearch'],
      },
    ],
    'Backend with SQL': [
      'frontdesk-service',
      {
        name: 'docker-compose.yaml',
        targets: ['sql'],
      },
    ],
    'Frontend with Kibana/ElasticSearch': [
      'frontdesk-app',
      {
        name: 'docker-compose.yaml',
        targets: ['kibana', 'elasticsearch'],
      },
    ],
    'No Docker': ['frontdesk-service', 'frontdesk-app'],
  },
}

const whimbrelCtx = (...whimFacets: string[]): WhimbrelContext => {
  const facets: Record<string, FacetScope<any>> = {}

  if (whimFacets.includes('pnpm')) {
    facets['pnpm'] = { roles: ['pkg-manager'] } as FacetScope<any>
  }

  return {
    getActor(param: any) {
      if (param.root === '/tmp/somewhere') {
        return {
          root: '/tmp/somewhere',
          facets,
        } as unknown as Actor
      }

      return {
        root: '/tmp/somewhere',
      }
    },
  } as WhimbrelContext
}

const TEST_PROJECTS: Record<TestProjectId, TestProject> = {
  'dummy-project': {
    project: {
      id: 'dummy-project',
      root: '/tmp/somewhere',
      ctx: whimbrelCtx('pnpm'),
      launchers: [
        {
          id: 'pnpm',
          defaultTargets: ['dev'],
          features: {
            componentTargets: 'multi',
            launcherTargets: 'single',
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
          pkgJson: new PackageJSON({
            content: { scripts: { dev: 'nodemon' } },
          }),
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
      shared: {
        launchConfigs: {},
      },
      private: {
        launchConfigs: {},
      },
    },
  },

  'dummy-with-docker-compose': {
    project: {
      id: 'dummy-with-docker-compose',
      root: '/tmp/somewhere',
      ctx: whimbrelCtx('pnpm'),
      launchers: [
        {
          id: 'pnpm',
          defaultTargets: ['dev'],
          features: {
            componentTargets: 'multi',
            launcherTargets: 'single',
          },
          components: ['frontdesk-service', 'frontdesk-app'],
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
        {
          id: 'docker-compose',
          defaultTargets: ['sql', 'kibana', 'elasticsearch'],
          features: {
            componentTargets: 'multi',
            launcherTargets: 'multi',
          },
          components: ['docker-compose.yaml'],
          launchCommand: (_env, _components) => ({
            groups: [
              {
                mode: 'sequential',
                processes: [
                  {
                    bin: 'docker',
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
      shared: {
        launchConfigs: {},
      },
      private: {
        launchConfigs: {},
      },
    },
  },
}

const constructLaunchConfig = (
  projectId: TestProjectId,
  activeComponents: TestComponentConfig[]
): LaunchConfig => {
  return TEST_PROJECTS[projectId].project.components.reduce(
    (cfg, cmp) => {
      const cfgEntry = activeComponents.find((cf) =>
        typeof cf === 'string' ? cf === cmp.id : cf.name === cmp.id
      )
      cfg.components[cmp.id] = {
        selected: Boolean(cfgEntry),
        targets:
          !cfgEntry || typeof cfgEntry === 'string' ? [] : cfgEntry.targets,
      }
      return cfg
    },
    {
      components: {},
    } as LaunchConfig
  )
}

export const createContextConfig = (
  projectId: TestProjectId,
  configs: {
    private?: string[]
    shared?: string[]
    lastLaunched?: string
  } = {}
): ContextConfig => {
  const config: ContextConfig = {
    shared: {
      launchConfigs: {},
    },

    private: {
      launchConfigs: {},
      lastConfig: {
        defaultTarget: 'dev',
        components: {},
      },
    },
  }

  for (const configId of configs.private ?? []) {
    const launchCfg = TEST_SAVED_CONFIGS[projectId][configId]
    if (launchCfg === undefined)
      throw new Error(`Test Config does not exist: ${configId}`)

    config.private.launchConfigs[configId] = constructLaunchConfig(
      projectId,
      launchCfg
    )
  }

  for (const configId of configs.shared ?? []) {
    const launchCfg = TEST_SAVED_CONFIGS[projectId][configId]
    if (launchCfg === undefined)
      throw new Error(`Test Config does not exist: ${configId}`)

    config.shared.launchConfigs[configId] = constructLaunchConfig(
      projectId,
      launchCfg
    )
  }

  if (configs.lastLaunched) {
    config.private.lastConfig = constructLaunchConfig(
      projectId,
      TEST_SAVED_CONFIGS[projectId][configs.lastLaunched]
    )
  }

  return config
}

const makeSystemModule = (): SystemModule => {
  return {
    userdir() {
      return '/home/klasse'
    },
    async inspectEnvironment(): Promise<TTYEnv> {
      return ttyEnv()
    },
    async findExecutable(bin: string): Promise<string | undefined> {
      switch (bin) {
        case 'docker':
          return '/usr/bin/docker'
      }

      return undefined
    },
  }
}

const makeConfigModule = (config: ContextConfig): ConfigurationModule => {
  return {
    async readConfig(_project: Project): Promise<ContextConfig> {
      return config
    },
    async saveLatestLaunch(_state: ApplicationState): Promise<void> {},
    async savePrivateConfig(
      _project: Project,
      _config: PrivateConfig
    ): Promise<void> {},
    async saveSharedConfig(
      _project: Project,
      _config: LGConfig
    ): Promise<void> {},
  }
}

export const makeAppState = (
  projectId: TestProjectId,
  configs: {
    private?: string[]
    shared?: string[]
    lastLaunched?: string
  } = {},
  options: Partial<LGOptions> = {}
): ApplicationState => {
  const testProject = TEST_PROJECTS[projectId]
  const state: ApplicationState = {
    project: makeProject(testProject.project),
    config: createContextConfig(projectId, configs),
    session: { components: [], target: 'dev' },
    options: makeLGOptions(options),
  }

  state.session = applyConfig(
    state.config.private.lastConfig,
    state.project,
    state.session
  )

  return state
}

export const runGoblinApp = async ({
  projectId,
  configs = {},
  facade = {},
}: {
  projectId: TestProjectId
  configs?: { private?: string[]; shared?: string[]; lastLaunched?: string }
  facade?: Partial<ActionFacade>
}): Promise<{
  app: LaunchGoblinApp
  adapter: GoblinAppAdapter
  env: ApplicationEnvironment
  backend: HeadlessBackend
  state: ApplicationState
}> => {
  const configModule = makeConfigModule(createContextConfig(projectId, configs))

  const systemModule = makeSystemModule()

  const projectModule: ProjectModule = makeProjectFacade(
    systemModule,
    async (_dir: string) => {
      return TEST_PROJECTS[projectId].project
    }
  )

  const { env, model: state } = await bootstrap(
    'dev',
    makeLGOptions(),
    systemModule,
    configModule,
    projectModule,
    async () => noBackend()
  )

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
