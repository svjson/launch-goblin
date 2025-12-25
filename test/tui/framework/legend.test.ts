import { Controller } from '@src/tui/framework'
import {
  entriesByPriority,
  generateKeystrokeLegend,
  KeystrokeLegend,
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
        up: {
          symbol: 'up',
          description: 'Move Up',
          priority: 3,
        },
        down: {
          symbol: 'down',
          description: 'Move Down',
        },
        left: {
          symbol: 'left',
          description: 'Move Left',
          priority: 3,
        },
        right: {
          symbol: 'right',
          description: 'Move Right',
        },
      },
      // Default rendered length: 39
      focused: {
        enter: {
          symbol: 'enter',
          description: 'Toggle',
          priority: 1,
        },
        delete: {
          symbol: 'delete',
          description: 'Discard Entry',
          priority: 1,
        },
      },
      // Default rendered length: 71
      global: {
        tab: {
          symbol: 'tab',
          description: 'Next Section',
          priority: 2,
        },
        'S-tab': {
          symbol: 'S-tab',
          description: 'Prev Section',
          priority: 5,
        },
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
