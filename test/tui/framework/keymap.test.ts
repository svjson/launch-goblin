import { Controller } from '@src/tui/framework'
import {
  generateKeystrokeLegend,
  keyHandler,
  KeyMap,
} from '@src/tui/framework/keymap'
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

describe('generateKeystrokeLegend', () => {
  it('should generate a KeystrokeLegend from a single isolated Controller', () => {
    // Given
    const component = {
      keyMap: {
        up: {
          legend: 'Move Up',
          handler: () => null,
        },
        down: {
          legend: 'Move Down',
          handler: () => null,
        },
      },
    } as unknown as Controller

    // When
    const legend = generateKeystrokeLegend(component)

    // Then
    expect(legend).toEqual({
      categories: {
        default: {
          up: { symbol: 'up', description: 'Move Up' },
          down: { symbol: 'down', description: 'Move Down' },
        },
      },
    })
  })

  it('should generate a KeystrokeLegend using keySymbols substitutions', () => {
    // Given
    const component = {
      keyMap: {
        up: {
          legend: 'Move Up',
          handler: () => null,
        },
        down: {
          legend: 'Move Down',
          handler: () => null,
        },
      },
    } as unknown as Controller

    // When
    const legend = generateKeystrokeLegend(component, {
      keySymbols: {
        down: '↓',
        up: '↑',
      },
    })

    // Then
    expect(legend).toEqual({
      categories: {
        default: {
          up: { symbol: '↑', description: 'Move Up' },
          down: { symbol: '↓', description: 'Move Down' },
        },
      },
    })
  })

  it('should generate a KeystrokeLegend by extending a supplied initial legend', () => {
    // Given
    const component = {
      keyMap: {
        up: {
          legend: 'Move Up',
          handler: () => null,
        },
        down: {
          legend: 'Move Down',
          handler: () => null,
        },
      },
    } as unknown as Controller

    // When
    const legend = generateKeystrokeLegend(component, {
      initial: {
        categories: {
          app: {
            'C-c': { symbol: 'C-c', description: 'Quit' },
          },
        },
      },
      keySymbols: {
        down: 'arrow down',
        up: 'arrow up',
      },
    })

    // Then
    expect(legend).toEqual({
      categories: {
        app: {
          'C-c': { symbol: 'C-c', description: 'Quit' },
        },
        default: {
          up: { symbol: 'arrow up', description: 'Move Up' },
          down: { symbol: 'arrow down', description: 'Move Down' },
        },
      },
    })
  })

  it('should merge mappings belonging to the same group', () => {
    // Given
    const component = {
      keyMap: {
        tab: {
          legend: 'Next Section',
          handler: () => null,
        },
        up: {
          legend: 'Move Up',
          group: 'Navigate',
          handler: () => null,
        },
        down: {
          legend: 'Move Down',
          group: 'Navigate',
          handler: () => null,
        },
      },
    } as unknown as Controller

    // When
    const legend = generateKeystrokeLegend(component, {
      initial: {
        categories: {
          app: {
            'C-c': { symbol: 'C-c', description: 'Quit' },
          },
        },
      },
      keySymbols: {
        down: '↓',
        up: '↑',
      },
    })

    // Then
    expect(legend).toEqual({
      categories: {
        app: {
          'C-c': { symbol: 'C-c', description: 'Quit' },
        },
        default: {
          tab: { symbol: 'tab', description: 'Next Section' },
          Navigate: { symbol: '↑↓', description: 'Navigate' },
        },
      },
    })
  })

  it('should generate a KeystrokeLegend by extending a supplied initial legend', () => {
    // Given
    const component = {
      keyMap: {
        up: {
          legend: 'Move Up',
          handler: () => null,
        },
        down: {
          legend: 'Move Down',
          handler: () => null,
        },
      },
    } as unknown as Controller

    // When
    const legend = generateKeystrokeLegend(component, {
      initial: {
        categories: {
          app: {
            'C-c': { symbol: 'C-c', description: 'Quit' },
          },
        },
      },
      keySymbols: {
        down: 'arrow down',
        up: 'arrow up',
      },
    })

    // Then
    expect(legend).toEqual({
      categories: {
        app: {
          'C-c': { symbol: 'C-c', description: 'Quit' },
        },
        default: {
          up: { symbol: 'arrow up', description: 'Move Up' },
          down: { symbol: 'arrow down', description: 'Move Down' },
        },
      },
    })
  })

  it('should limit categories to supplied list and use `default` for any others', () => {
    // Given
    const component = {
      keyMap: {
        tab: {
          legend: 'Next Section',
          category: 'global',
          handler: () => null,
        },
        'S-tab': {
          legend: 'Prev Section',
          category: 'global',
          handler: () => null,
        },
        enter: {
          legend: 'Toggle',
          category: 'focused',
          handler: () => null,
        },
        up: {
          legend: 'Move Up',
          category: 'section',
          group: 'Navigate',
          handler: () => null,
        },
        down: {
          legend: 'Move Down',
          category: 'section',
          group: 'Navigate',
          handler: () => null,
        },
      },
    } as unknown as Controller

    // When
    const legend = generateKeystrokeLegend(component, {
      categories: ['focused'],
      keySymbols: {
        down: '↓',
        up: '↑',
      },
    })

    // Then
    expect(legend).toEqual({
      categories: {
        focused: {
          enter: { symbol: 'enter', description: 'Toggle' },
        },
        default: {
          tab: { symbol: 'tab', description: 'Next Section' },
          'S-tab': { symbol: 'S-tab', description: 'Prev Section' },
          Navigate: { symbol: '↑↓', description: 'Navigate' },
        },
      },
    })
  })
})
