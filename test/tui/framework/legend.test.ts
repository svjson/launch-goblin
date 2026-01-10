import { Controller } from '@src/tui/framework'
import {
  entriesByPriority,
  generateKeystrokeLegend,
  KeystrokeLegend,
  legendGroup,
  legendKey,
  RenderedCategories,
  renderLegendCategories,
} from '@src/tui/framework/legend'
import { describe, expect, it } from 'vitest'

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
          up: legendKey('up', 'Move Up'),
          down: legendKey('down', 'Move Down'),
        },
      },
    })
  })

  it.each([
    [
      'up => ↑, down => ↓',
      {
        keySymbols: {
          down: '↓',
          up: '↑',
        },
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
        expectedLegendEntries: {
          up: legendKey('↑', 'Move Up'),
          down: legendKey('↓', 'Move Down'),
        },
      },
    ],
    [
      'up => ↑, down => ↓ - with modifiers',
      {
        keySymbols: {
          down: '↓',
          up: '↑',
        },
        keyMap: {
          'S-up': {
            legend: 'Move Up',
            handler: () => null,
          },
          'M-down': {
            legend: 'Move Down',
            handler: () => null,
          },
        },
        expectedLegendEntries: {
          'S-up': legendKey('S-↑', 'Move Up'),
          'M-down': legendKey('M-↓', 'Move Down'),
        },
      },
    ],
  ])(
    'should generate a KeystrokeLegend using keySymbols substitutions - %s',
    (_, { keySymbols, keyMap, expectedLegendEntries }) => {
      // Given
      const component = {
        keyMap,
      } as unknown as Controller

      // When
      const legend = generateKeystrokeLegend(component, { keySymbols })

      // Then
      expect(legend).toEqual({
        categories: {
          default: expectedLegendEntries,
        },
      })
    }
  )

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
            'C-c': legendKey('C-c', 'Quit'),
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
          'C-c': legendKey('C-c', 'Quit'),
        },
        default: {
          up: legendKey('arrow up', 'Move Up'),
          down: legendKey('arrow down', 'Move Down'),
        },
      },
    })
  })

  it.each([
    [
      'up+down => ↑↓',
      {
        keyMapEntries: {
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
        opts: {
          keySymbols: {
            down: '↓',
            up: '↑',
          },
        },
        expectedLegendEntries: {
          Navigate: legendGroup({
            symbol: '↑↓',
            description: 'Navigate',
            keys: [legendKey('↑', 'Move Up'), legendKey('↓', 'Move Down')],
          }),
        },
      },
    ],
    [
      'S-up+S-down => S-↑/S-↓',
      {
        keyMapEntries: {
          'S-up': {
            legend: 'Shift Up',
            group: 'Navigate',
            handler: () => null,
          },
          'S-down': {
            legend: 'Shift Down',
            group: 'Navigate',
            handler: () => null,
          },
        },
        opts: {
          grouping: {
            separator: '/',
          },
          keySymbols: {
            down: '↓',
            up: '↑',
          },
        },
        expectedLegendEntries: {
          Navigate: legendGroup({
            symbol: 'S-↑/S-↓',
            description: 'Navigate',
            keys: [
              legendKey('S-↑', 'Shift Up'),
              legendKey('S-↓', 'Shift Down'),
            ],
          }),
        },
      },
    ],
  ])(
    'should merge mappings belonging to the same group - %s',
    (_, { keyMapEntries, opts, expectedLegendEntries }) => {
      // Given
      const component = {
        keyMap: {
          tab: {
            legend: 'Next Section',
            handler: () => null,
          },
          ...keyMapEntries,
        },
      } as unknown as Controller

      // When
      const legend = generateKeystrokeLegend(component, {
        initial: {
          categories: {
            app: {
              'C-c': legendKey('C-c', 'Quit'),
            },
          },
        },
        ...opts,
      })

      // Then
      expect(legend).toEqual({
        categories: {
          app: {
            'C-c': legendKey('C-c', 'Quit'),
          },
          default: {
            tab: legendKey('tab', 'Next Section'),
            ...expectedLegendEntries,
          },
        },
      })
    }
  )

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
            'C-c': legendKey('C-c', 'Quit'),
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
          'C-c': legendKey('C-c', 'Quit'),
        },
        default: {
          up: legendKey('arrow up', 'Move Up'),
          down: legendKey('arrow down', 'Move Down'),
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
          enter: legendKey('enter', 'Toggle'),
        },
        default: {
          tab: legendKey('tab', 'Next Section'),
          'S-tab': legendKey('S-tab', 'Prev Section'),
          Navigate: legendGroup({
            symbol: '↑↓',
            description: 'Navigate',
            keys: [legendKey('↑', 'Move Up'), legendKey('↓', 'Move Down')],
          }),
        },
      },
    })
  })
})

describe('entriesByPriority', () => {
  it('should aggregate and sort all entries on priority(ASC) and count no priority as the highest', () => {
    // Given
    const categories: RenderedCategories = {
      nav: {
        entries: [
          { generated: 'a', entry: { priority: 3 } },
          { generated: 'b', entry: {} },
          { generated: 'c', entry: { priority: 3 } },
          { generated: 'd', entry: {} },
        ],
      },
      focused: {
        entries: [
          { generated: 'e', entry: { priority: 1 } },
          { generated: 'f', entry: { priority: 1 } },
        ],
      },
      global: {
        entries: [
          { generated: 'g', entry: { priority: 2 } },
          { generated: 'h', entry: { priority: 5 } },
        ],
      },
    } as unknown as RenderedCategories

    // When
    const ordered = entriesByPriority(categories)

    // Then
    expect(ordered).toEqual([
      { category: 'focused', index: 0, priority: 1 },
      { category: 'focused', index: 1, priority: 1 },
      { category: 'global', index: 0, priority: 2 },
      { category: 'nav', index: 0, priority: 3 },
      { category: 'nav', index: 2, priority: 3 },
      { category: 'global', index: 1, priority: 5 },
      { category: 'nav', index: 1, priority: undefined },
      { category: 'nav', index: 3, priority: undefined },
    ])
  })
})

describe('renderLegendCategories', () => {
  // Given
  const legend: KeystrokeLegend = {
    // Sum of category lengths: 151
    // Total width with padding=3: 157
    categories: {
      // Default rendered length: 41
      Navigate: {
        up: legendKey('up', 'Move Up', 3),
        down: legendKey('down', 'Move Down'),
        left: legendKey('left', 'Move Left', 3),
        right: legendKey('right', 'Move Right'),
      },
      // Default rendered length: 39
      focused: {
        enter: legendKey('enter', 'Toggle', 1),
        delete: legendKey('delete', 'Discard Entry', 1),
      },
      // Default rendered length: 71
      global: {
        tab: legendKey('tab', 'Next Section', 2),
        'S-tab': legendKey('S-tab', 'Prev Section', 5),
      },
    },
  }

  describe('priority culling', () => {
    describe('No maxWidth provided', () => {
      it('should render all entries', () => {
        // When
        const rendered = renderLegendCategories(legend, {
          cullingStrategy: 'priority',
        })

        // Then
        expect(rendered).toEqual({
          Navigate:
            'up = Move Up | down = Move Down | left = Move Left | right = Move Right',
          focused: 'enter = Toggle | delete = Discard Entry',
          global: 'tab = Next Section | S-tab = Prev Section',
        })
      })
    })
    describe('maxWidth provided', () => {
      it('should render all entries when total width <= max width', () => {
        // When
        const rendered = renderLegendCategories(legend, {
          maxWidth: 160,
          cullingStrategy: 'priority',
        })

        // Then
        expect(rendered).toEqual({
          Navigate:
            'up = Move Up | down = Move Down | left = Move Left | right = Move Right',
          focused: 'enter = Toggle | delete = Discard Entry',
          global: 'tab = Next Section | S-tab = Prev Section',
        })
      })

      it('should discard last unprioritized when total width > max width', () => {
        // When
        const rendered = renderLegendCategories(legend, {
          maxWidth: 150,
          cullingStrategy: 'priority',
        })

        // Then
        expect(rendered).toEqual({
          Navigate: 'up = Move Up | down = Move Down | left = Move Left',
          focused: 'enter = Toggle | delete = Discard Entry',
          global: 'tab = Next Section | S-tab = Prev Section',
        })
      })

      it('should discard entries in order of highest/no value priority to lowest when width <= maxWidth', () => {
        // When
        const rendered = renderLegendCategories(legend, {
          maxWidth: 75,
          cullingStrategy: 'priority',
        })

        // Then
        expect(rendered).toEqual({
          Navigate: '',
          focused: 'enter = Toggle | delete = Discard Entry',
          global: 'tab = Next Section',
        })
      })
    })
  })

  describe('right-to-left only culling', () => {
    describe('No maxWidth provided', () => {
      it('should render all entries', () => {
        // When
        const rendered = renderLegendCategories(legend, {
          cullingStrategy: 'right-to-left',
        })

        // Then
        expect(rendered).toEqual({
          Navigate:
            'up = Move Up | down = Move Down | left = Move Left | right = Move Right',
          focused: 'enter = Toggle | delete = Discard Entry',
          global: 'tab = Next Section | S-tab = Prev Section',
        })
      })
    })

    describe('maxWidth provided', () => {
      it('should render all entries when total width <= max width', () => {
        // When
        const rendered = renderLegendCategories(legend, {
          maxWidth: 160,
          cullingStrategy: 'right-to-left',
        })

        // Then
        expect(rendered).toEqual({
          Navigate:
            'up = Move Up | down = Move Down | left = Move Left | right = Move Right',
          focused: 'enter = Toggle | delete = Discard Entry',
          global: 'tab = Next Section | S-tab = Prev Section',
        })
      })

      it('should discard one entry from last category when total width > max width', () => {
        // When
        const rendered = renderLegendCategories(legend, {
          maxWidth: 150,
          cullingStrategy: 'right-to-left',
        })

        // Then
        expect(rendered).toEqual({
          Navigate:
            'up = Move Up | down = Move Down | left = Move Left | right = Move Right',
          focused: 'enter = Toggle | delete = Discard Entry',
          global: 'tab = Next Section',
        })
      })

      it('should discard entries from right to left across categories until width <= maxWidth', () => {
        // When
        const rendered = renderLegendCategories(legend, {
          maxWidth: 50,
          cullingStrategy: 'right-to-left',
        })

        // Then
        expect(rendered).toEqual({
          Navigate: 'up = Move Up | down = Move Down',
          focused: '',
          global: '',
        })
      })
    })
  })
})
