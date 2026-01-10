import { describe, expect, test } from 'vitest'
import { makeProgram } from '@src/cli'
import { LGOptions, makeLGOptions } from '@src/tui'
import { exclArgString } from '@src/cli/program'

describe('CLI arguments', () => {
  let modeInvocations: { mode: string; arg?: any }[] = []

  const testModes = {
    run: async (opts: LGOptions) => {
      modeInvocations.push({ mode: 'run', arg: opts })
    },
    termInfo: () => {
      modeInvocations.push({ mode: 'termInfo' })
    },
    onError: (error: string) => {
      modeInvocations.push({ mode: 'onError', arg: error })
    },
  }

  const program = makeProgram(testModes)

  test.each([
    [
      [],
      {
        mode: 'run',
        arg: makeLGOptions({
          colorMode: undefined,
          launch: {
            autoLaunch: false,
            defaultTarget: 'dev',
            targetFilter: expect.objectContaining({ type: 'default' }),
          },
        }),
      },
    ],
    [
      ['-v'],
      {
        mode: 'run',
        arg: makeLGOptions({
          verbose: true,
          colorMode: undefined,
          launch: {
            autoLaunch: false,
            defaultTarget: 'dev',
            targetFilter: expect.objectContaining({ type: 'default' }),
          },
        }),
      },
    ],
    [
      ['dev'],
      {
        mode: 'run',
        arg: makeLGOptions({
          colorMode: undefined,
          launch: {
            autoLaunch: false,
            defaultTarget: 'dev',
            targetFilter: expect.objectContaining({ type: 'default' }),
          },
        }),
      },
    ],
    [
      ['run'],
      {
        mode: 'run',
        arg: makeLGOptions({
          colorMode: undefined,
          launch: {
            autoLaunch: false,
            defaultTarget: 'run',
            targetFilter: expect.objectContaining({ type: 'default' }),
          },
        }),
      },
    ],
    [
      ['--term-info'],
      {
        mode: 'termInfo',
      },
    ],
    [
      ['--relaunch'],
      {
        mode: 'run',
        arg: makeLGOptions({
          colorMode: undefined,
          launch: {
            autoLaunch: true,
            defaultTarget: 'dev',
            targetFilter: expect.objectContaining({ type: 'pass-through' }),
          },
        }),
      },
    ],
    [
      ['-r'],
      {
        mode: 'run',
        arg: makeLGOptions({
          colorMode: undefined,
          launch: {
            autoLaunch: true,
            defaultTarget: 'dev',
            targetFilter: expect.objectContaining({ type: 'pass-through' }),
          },
        }),
      },
    ],
    [
      ['-r', '--term-info'],
      {
        mode: 'onError',
        arg: exclArgString('--term-info', '--relaunch'),
      },
    ],
    [
      ['--relaunch', '--term-info'],
      {
        mode: 'onError',
        arg: exclArgString('--term-info', '--relaunch'),
      },
    ],
    [
      ['--term-info', '--relaunch'],
      {
        mode: 'onError',
        arg: exclArgString('--term-info', '--relaunch'),
      },
    ],
    [
      ['--term-info', '-r'],
      {
        mode: 'onError',
        arg: exclArgString('--term-info', '--relaunch'),
      },
    ],
    [
      ['dev', '-r'],
      {
        mode: 'onError',
        arg: exclArgString('A launch target (dev)', '--relaunch'),
      },
    ],
    [
      ['dev', '--term-info', '-r'],
      {
        mode: 'onError',
        arg: exclArgString('A launch target (dev)', '--term-info'),
      },
    ],
  ])('%s', async (args, expectedInvocation) => {
    // Given
    modeInvocations = []

    // When
    await program.parseAsync(args, {
      from: 'user',
    })

    // Then
    expect(modeInvocations).toEqual([expectedInvocation])
  })
})
