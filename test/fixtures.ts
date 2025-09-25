import { LaunchConfig } from '@src/config'
import { ApplicationState, ProjectComponent, ProjectParams } from '@src/project'
import { LaunchGoblinApp } from '@src/tui'
import { WhimbrelContext } from '@whimbrel/core'
import { PackageJSON } from '@whimbrel/package-json'
import { makeProject } from '@src/project'
import { applicationEnvironment } from './tui/framework/fixtures'
import { ApplicationEnvironment, HeadlessBackend } from '@src/tui/framework'
import { ActionFacade } from '@src/tui/goblin-app'

export type TestProjectId = 'dummy-project'

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
          components: [
            'backend-service',
            'frontend-portal',
            'mock-provider-a',
            'mock-provider-b',
          ],
          launchCommand: (_env, _components) => ({
            bin: 'pnpm',
            args: [],
          }),
        },
      ],
      components: [
        {
          id: 'backend-service',
          name: 'backend-service',
          package: '@acme-platform/backend-service',
          root: '/tmp/somewhere/packages/backend-service',
          pkgJson: new PackageJSON({ content: '{}' }),
          selected: true,
        },
        {
          id: 'frontend-portal',
          name: 'frontend-portal',
          package: '@acme-platform/frontend-portal',
          root: '/tmp/somewhere/packages/frontend-portal',
          pkgJson: new PackageJSON({ content: '{}' }),
          selected: true,
        },
        {
          id: 'mock-provider-a',
          name: 'mock-provider-a',
          package: '@acme-platform/mock-provider-a',
          root: '/tmp/somewhere/packages/mock-provider-a',
          pkgJson: new PackageJSON({ content: '{}' }),
          selected: true,
        },
        {
          id: 'mock-provider-b',
          name: 'mock-provider-b',
          package: '@acme-platform/mock-provider-b',
          root: '/tmp/somewhere/packages/mock-provider-b',
          pkgJson: new PackageJSON({ content: '{}' }),
          selected: true,
        },
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
}

const constructLaunchConfig = (
  state: ApplicationState,
  activeComponents: string[]
): LaunchConfig => {
  return state.project.components.reduce(
    (cfg, cmp) => {
      cfg.components[cmp.id] = {
        selected: activeComponents.includes(cmp.id),
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
          components: {},
        },
      },
    },
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
  return { env, app, state, backend: env.backend as HeadlessBackend }
}
