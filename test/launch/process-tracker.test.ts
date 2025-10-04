import { makeProcessTracker } from '@src/launch/process-tracker'
import { LaunchGroup } from '@src/launch/types'
import { wait } from 'test/fixtures'
import { LaunchedDummyProcess, TestSystemModule } from 'test/process-fixtures'
import { applicationEnvironment } from 'test/tui/framework/fixtures'
import { describe, expect, it } from 'vitest'

const parallel = (
  ...commands: [bin: string, args: string[], critical?: boolean][]
): LaunchGroup => {
  return {
    mode: 'parallel',
    processes: commands.map(([bin, args, critical]) => ({
      bin,
      args,
      critical,
    })),
  }
}

const singleSequential = (bin: string, args: string[]): LaunchGroup => {
  return {
    mode: 'sequential',
    processes: [
      {
        bin,
        args,
      },
    ],
  }
}

const makeFixture = (execPaths: Record<string, string>) => {
  const systemModule = new TestSystemModule({ execPaths })
  const appEnv = applicationEnvironment()
  const processTracker = makeProcessTracker(systemModule)
  return { systemModule, appEnv, processTracker }
}

describe('ProcessTracker', () => {
  describe('Tracking on launch', () => {
    it('should keep a reference to a single launched process', async () => {
      // Given
      const { processTracker, systemModule, appEnv } = makeFixture({
        pnpm: '/home/klasse/.nvm/versions/node/v20.19.2/bin/pnpm',
      })

      // When
      await processTracker.launch(appEnv, {
        groups: [parallel(['pnpm', ['-r', 'dev']])],
      })

      // Then
      expect(processTracker.getLaunchedProcesses().length).toEqual(1)
      const [child] = processTracker.getLaunchedProcesses()
      expect(child.command).toEqual({
        bin: '/home/klasse/.nvm/versions/node/v20.19.2/bin/pnpm',
        args: ['-r', 'dev'],
      })
      expect(systemModule.exitCalls).toEqual([])
    })
  })

  describe('Launch Groups', () => {
    it('should launch parallel launch group processes immediately', async () => {
      // Given
      const { processTracker, systemModule, appEnv } = makeFixture({
        pnpm: '/home/klasse/.nvm/versions/node/v20.19.2/bin/pnpm',
      })

      // When
      processTracker.launch(appEnv, {
        groups: [
          parallel(
            ['pnpm', ['--filter', '@acme-platform/service', 'dev:local']],
            ['pnpm', ['--filter', '@acme-platform/app', 'dev']]
          ),
        ],
      })

      // Then
      expect(processTracker.getLaunchedProcesses().length).toEqual(0)

      // When
      await wait(25)

      // Then
      expect(processTracker.getLaunchedProcesses().length).toEqual(2)
      expect(systemModule.exitCalls).toEqual([])
    })

    it('should let sequential launch group finish before launching next group', async () => {
      // Given
      const { processTracker, systemModule, appEnv } = makeFixture({
        pnpm: '/home/klasse/.nvm/versions/node/v20.19.2/bin/pnpm',
        pnpx: '/home/klasse/.nvm/versions/node/v20.19.2/bin/pnpx',
        docker: '/usr/bin/docker',
      })

      // When
      processTracker.launch(appEnv, {
        groups: [
          singleSequential('docker', [
            'compose',
            'up',
            '-d',
            'sql',
            'elasticsearch',
            'kibana',
          ]),
          parallel(['pnpx', ['turbo', 'run', 'dev']]),
        ],
      })

      // Then
      expect(processTracker.getLaunchedProcesses().length).toEqual(0)

      // When
      await wait(25)

      // Then
      expect(processTracker.getLaunchedProcesses().length).toEqual(1)
      const [firstLaunched] = processTracker.getLaunchedProcesses()
      expect(firstLaunched.command).toEqual({
        bin: '/usr/bin/docker',
        args: ['compose', 'up', '-d', 'sql', 'elasticsearch', 'kibana'],
      })

      // When
      ;(processTracker.getLaunchedProcesses()[0] as LaunchedDummyProcess).die()

      // Then
      expect(processTracker.getLaunchedProcesses().length).toEqual(0)

      // When
      await wait(25)

      // Then
      expect(processTracker.getLaunchedProcesses().length).toEqual(1)
      const [secondLaunched] = processTracker.getLaunchedProcesses()
      expect(secondLaunched.command).toEqual({
        bin: '/home/klasse/.nvm/versions/node/v20.19.2/bin/pnpx',
        args: ['turbo', 'run', 'dev'],
      })
      expect(systemModule.exitCalls).toEqual([])
    })
  })
})
