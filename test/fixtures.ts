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

export const makeAppState = (projectId: TestProjectId): ApplicationState => {
  const testProject = TEST_PROJECTS[projectId]
  return {
    project: mergeLeft({}, testProject.project),
    config: {
      local: {
        launchConfigs: testProject.configs.local.launchConfigs,
      },

      global: {
        launchConfigs: testProject.configs.global.launchConfigs,
        lastConfig: {
          components: {},
        },
      },
    },
  }
}

export const runGoblinApp = ({
  projectId,
  launchFunction = async () => {},
}: {
  projectId: TestProjectId
  launchFunction?: () => Promise<void>
}): {
  app: LaunchGoblinApp
  env: ApplicationEnvironment
  backend: HeadlessBackend
} => {
  const env = applicationEnvironment()
  const state = makeAppState(projectId)

  const app = new LaunchGoblinApp(env, state, launchFunction)

  env.backend.render()
  return { env, app, backend: env.backend as HeadlessBackend }
}
