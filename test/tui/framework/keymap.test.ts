import { keyHandler, KeyMap } from '@src/tui/framework/keymap'
import { describe, expect, it } from 'vitest'

describe('keyHandler', () => {
  const keyMap: KeyMap = {
    left: {
      handler: () => 'left pressed!',
    },
    right: {
      handler: () => 'right pressed!',
    },
    return: {
      handler: () => 'return pressed!',
    },
    P: {
      handler: () => 'P pressed!',
    },
    '/[0-9]/': {
      handler: () => 'Pattern triggered',
    },
  }

  it.each([
    { full: 'left', ch: undefined, response: 'left pressed!' },
    { full: 'return', ch: undefined, response: 'return pressed!' },
    { full: 'P', ch: undefined, response: 'P pressed!' },
  ])(
    `Should resolve handler function on literal key match '%o'`,
    ({
      full,
      ch,
      response,
    }: {
      full: string
      ch?: string
      response: string
    }) => {
      const handler = keyHandler(keyMap, ch, { full })
      expect(handler).toBeTypeOf('function')
      expect(handler()).toEqual(response)
    }
  )

  it.each([
    { full: 'up', ch: undefined },
    { full: 'down', ch: undefined },
    { full: 'F', ch: 'F' },
  ])(
    `Should not resolve handler function when no matching entry exists`,
    ({ full, ch }: { full: string; ch?: string }) => {
      const handler = keyHandler(keyMap, ch, { full })
      expect(handler).toBeUndefined()
    }
  )

  it.each([{ full: '2', ch: '2', response: 'Pattern triggered' }])(
    `Should resolve regex pattern handler function`,
    ({
      full,
      ch,
      response,
    }: {
      full: string
      ch?: string
      response: string
    }) => {
      const handler = keyHandler(keyMap, ch, { full })
      expect(handler).toBeTypeOf('function')
      expect(handler()).toEqual(response)
    }
  )
})
