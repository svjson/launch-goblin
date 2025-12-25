import { keyHandler, KeyMap } from '@src/tui/framework/keymap'
import { describe, expect, it } from 'vitest'

describe('keyHandler', () => {
  interface KeyHandlerTestCase {
    full: string
    ch?: string
    response?: string
  }

  const keyMap: KeyMap = {
    up: {
      handler: () => 'up pressed!',
    },
    'S-up': {
      handler: () => 'Meta/Alt+up pressed!',
    },
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
    s: {
      handler: () => 's pressed!',
    },
    'C-s': {
      handler: () => 'Ctrl+S pressed!',
    },
    'M-return': {
      handler: () => 'Meta/Alt+return pressed!',
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
    ({ full, ch, response }: KeyHandlerTestCase) => {
      const handler = keyHandler(keyMap, ch, { full })
      expect(handler).toBeTypeOf('function')
      expect(handler()).toEqual(response)
    }
  )

  it.each([
    { full: 'M-up', ch: undefined },
    { full: 'down', ch: undefined },
    { full: 'F', ch: 'F' },
  ])(
    `Should not resolve handler function when no matching entry exists: %s`,
    ({ full, ch }: KeyHandlerTestCase) => {
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

  it.each([
    { full: 'C-s', ch: 's', response: 'Ctrl+S pressed!' },
    { full: 'M-return', ch: undefined, response: 'Meta/Alt+return pressed!' },
    { full: 'S-up', ch: undefined, response: 'Meta/Alt+up pressed!' },
  ])(
    `should resolve modifier mapping over bare key: %s`,
    ({ full, ch, response }: KeyHandlerTestCase) => {
      const handler = keyHandler(keyMap, ch, { full })
      expect(handler).toBeTypeOf('function')
      expect(handler()).toEqual(response)
    }
  )
})
