import { LaunchConfig } from '@src/config'
import { ApplicationState, Project } from '@src/project'
import { LaunchGoblinApp } from '@src/tui'
import { WhimbrelContext } from '@whimbrel/core'
import { PackageJSON } from '@whimbrel/package-json'
import { mergeLeft } from '@whimbrel/walk'
import { applicationEnvironment } from './tui/framework/fixtures'
import { ApplicationEnvironment, HeadlessBackend } from '@src/tui/framework'

export type TestProjectId = 'dummy-project'

export interface TestProject {
  project: Project
  configs: {
    local: {
      launchConfigs: Record<string, LaunchConfig>
    }
    global: {
      launchConfigs: Record<string, LaunchConfig>
    }
  }
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
      ctx: {} as WhimbrelContext,
      launchers: [
        {
          id: 'pnpm',
          components: [
            'backend-service',
            'frontend-portal',
            'mock-provider-a',
            'mock-provider-b',
          ],
          launchCommand: (env, components) => ({
            bin: 'pnpm',
            args: [],
          }),
        },
      ],
      components: [
        {
          id: 'backend-service',
          name: 'backend-service',
          package: 'backend-service',
          root: '/tmp/somewhere/packages/backend-service',
          pkgJson: new PackageJSON({ content: '{}' }),
          selected: true,
        },
        {
          id: 'frontend-portal',
          name: 'frontend-portal',
          package: 'frontend-portal',
          root: '/tmp/somewhere/packages/frontend-portal',
          pkgJson: new PackageJSON({ content: '{}' }),
          selected: true,
        },
        {
          id: 'mock-provider-a',
          name: 'mock-provider-a',
          package: 'mock-provider-a',
          root: '/tmp/somewhere/packages/mock-provider-a',
          pkgJson: new PackageJSON({ content: '{}' }),
          selected: true,
        },
        {
          id: 'mock-provider-b',
          name: 'mock-provider-b',
          package: 'mock-provider-b',
          root: '/tmp/somewhere/packages/mock-provider-b',
          pkgJson: new PackageJSON({ content: '{}' }),
          selected: true,
        },
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
    project: mergeLeft({}, testProject.project),
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
  launchFunction = async () => {},
}: {
  projectId: TestProjectId
  configs?: { private?: string[]; shared?: string[] }
  launchFunction?: () => Promise<void>
}): {
  app: LaunchGoblinApp
  env: ApplicationEnvironment
  backend: HeadlessBackend
} => {
  const env = applicationEnvironment()
  const state = makeAppState(projectId, configs)

  const app = new LaunchGoblinApp(env, state, launchFunction)

  env.backend.render()
  return { env, app, backend: env.backend as HeadlessBackend }
}
