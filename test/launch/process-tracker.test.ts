import { makeProcessTracker } from '@src/launch/process-tracker'
import { LaunchGroup } from '@src/launch/types'
import { ADDRGETNETWORKPARAMS } from 'node:dns'
import { wait } from 'test/fixtures'
import { LaunchedDummyProcess, TestSystemModule } from 'test/process-fixtures'
import { applicationEnvironment } from 'test/tui/framework/fixtures'
import { describe, expect, it } from 'vitest'

const singleParallel = (
  bin: string,
  args: string[],
  critical?: boolean
): LaunchGroup => {
  return {
    mode: 'parallel',
    processes: [
      {
        bin,
        args,
        critical,
      },
    ],
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

describe('ProcessTracker', () => {
  describe('Tracking on launch', () => {
    it('should keep a reference to a single launched process', async () => {
      // Given
      const systemModule = new TestSystemModule({
        execPaths: {
          pnpm: '/home/klasse/.nvm/versions/node/v20.19.2/bin/pnpm',
        },
      })
      const appEnv = applicationEnvironment()
      const processTracker = makeProcessTracker(systemModule)

      // When
      await processTracker.launch(appEnv, {
        groups: [singleParallel('pnpm', ['-r', 'dev'])],
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
    it('should let sequential launch group finish before launching next group', async () => {
      // Given
      const systemModule = new TestSystemModule({
        execPaths: {
          pnpm: '/home/klasse/.nvm/versions/node/v20.19.2/bin/pnpm',
          pnpx: '/home/klasse/.nvm/versions/node/v20.19.2/bin/pnpx',
          docker: '/usr/bin/docker',
        },
      })
      const appEnv = applicationEnvironment()
      const processTracker = makeProcessTracker(systemModule)

      const launchCommand = {
        groups: [
          singleSequential('docker', [
            'compose',
            'up',
            '-d',
            'sql',
            'elasticsearch',
            'kibana',
          ]),
          singleParallel('pnpx', ['turbo', 'run', 'dev']),
        ],
      }

      // When
      processTracker.launch(appEnv, launchCommand)
      expect(processTracker.getLaunchedProcesses().length).toEqual(0)

      await wait(25)

      // Then
      expect(processTracker.getLaunchedProcesses().length).toEqual(1)
      const [firstLaunched] = processTracker.getLaunchedProcesses()
      expect(firstLaunched.command).toEqual({
        bin: '/usr/bin/docker',
        args: ['compose', 'up', '-d', 'sql', 'elasticsearch', 'kibana'],
      })
      ;(processTracker.getLaunchedProcesses()[0] as LaunchedDummyProcess).die()
      expect(processTracker.getLaunchedProcesses().length).toEqual(0)

      await wait(25)
      expect(processTracker.getLaunchedProcesses().length).toEqual(1)
      const [secondLaunched] = processTracker.getLaunchedProcesses()
      expect(secondLaunched.command).toEqual({
        bin: '/home/klasse/.nvm/versions/node/v20.19.2/bin/pnpx',
        args: ['turbo', 'run', 'dev'],
      })
    })
  })
})
