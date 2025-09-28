import { createStore, HeadlessBackend, OptionBar } from '@src/tui/framework'
import { describe, expect, it } from 'vitest'
import { applicationEnvironment } from './fixtures'
import { OptionItem } from '@src/tui/framework/option-bar'
import { SelectionMode } from '@src/tui/framework/widget'

describe('OptionBar', () => {
  const makeOptionBar = (model: OptionItem[], selectionMode: SelectionMode) => {
    const env = applicationEnvironment()

    return {
      env,
      backend: env.backend as HeadlessBackend,
      optionBar: new OptionBar({
        widget: {
          env,
          options: {
            selectionMode,
          },
        },
        state: {
          model: model,
          store: createStore(model),
        },
      }),
    }
  }

  describe('Single-Select mode', () => {
    const sml = (
      selSmall: boolean = false,
      selMedium: boolean = false,
      selLarge: boolean = false
    ) => [
      {
        id: 'small',
        label: 'Small',
        selected: selSmall,
      },
      {
        id: 'medium',
        label: 'Medium',
        selected: selMedium,
      },
      {
        id: 'large',
        label: 'Large',
        selected: selLarge,
      },
    ]

    describe('Initial State', () => {
      it('should auto-select the first option when given no selected options', () => {
        // When
        const { optionBar } = makeOptionBar(sml(), 'single')

        // Then
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          true,
          false,
          false,
        ])
      })
    })

    describe('Selection', () => {
      it('should cycle through options when arrow right is pressed', () => {
        // Given
        const { optionBar, backend } = makeOptionBar(sml(), 'single')

        // When
        optionBar.keyMap.right.handler()
        // Then
        expect(backend.getFocusedWidget()!.get('text')).toEqual(' Medium ')
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          false,
          true,
          false,
        ])

        // When
        optionBar.keyMap.right.handler()
        // Then
        expect(backend.getFocusedWidget()!.get('text')).toEqual(' Large ')
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          false,
          false,
          true,
        ])

        // When
        optionBar.keyMap.right.handler()
        // Then
        expect(backend.getFocusedWidget()!.get('text')).toEqual(' Small ')
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          true,
          false,
          false,
        ])
      })

      it('should cycle through options when arrow left is pressed', () => {
        // Given
        const { optionBar, backend } = makeOptionBar(sml(), 'single')

        // When
        optionBar.keyMap.left.handler()
        // Then
        expect(backend.getFocusedWidget()!.get('text')).toEqual(' Large ')
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          false,
          false,
          true,
        ])

        // When
        optionBar.keyMap.left.handler()
        // Then
        expect(backend.getFocusedWidget()!.get('text')).toEqual(' Medium ')
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          false,
          true,
          false,
        ])

        // When
        optionBar.keyMap.left.handler()
        // Then
        expect(backend.getFocusedWidget()!.get('text')).toEqual(' Small ')
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          true,
          false,
          false,
        ])
      })
    })
  })

  describe('Multi-Select Mode', () => {
    const ingredients = (
      selTomato: boolean = false,
      selCarrot: boolean = false,
      selBasil: boolean = false
    ) => [
      {
        id: 'tomato',
        label: 'Tomato',
        selected: selTomato,
      },
      {
        id: 'carrot',
        label: 'Carrot',
        selected: selCarrot,
      },
      {
        id: 'Basil',
        label: 'Basil',
        selected: selBasil,
      },
    ]

    describe('Initial State', () => {
      it('should not auto-select the first option when given no selected options', () => {
        // When
        const { optionBar } = makeOptionBar(ingredients(), 'multi')

        // Then
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          false,
          false,
          false,
        ])
      })
    })

    describe('Navigation', () => {
      it('should cycle focus through options but not change selection when arrow right is pressed', () => {
        // Given
        const { optionBar, backend } = makeOptionBar(
          ingredients(false, true, false),
          'multi'
        )

        // When
        optionBar.keyMap.right.handler()
        // Then
        expect(backend.getFocusedWidget()!.get('text')).toEqual(' Carrot ')
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          false,
          true,
          false,
        ])

        // When
        optionBar.keyMap.right.handler()
        // Then
        expect(backend.getFocusedWidget()!.get('text')).toEqual(' Basil ')
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          false,
          true,
          false,
        ])

        // When
        optionBar.keyMap.right.handler()
        // Then
        expect(backend.getFocusedWidget()!.get('text')).toEqual(' Tomato ')
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          false,
          true,
          false,
        ])
      })
    })

    describe('Selection', () => {
      it('should toggle selection with enter', () => {
        // Given
        const { optionBar } = makeOptionBar(
          ingredients(false, true, false),
          'multi'
        )

        // When
        optionBar.keyMap.enter.handler()
        // Then
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          true,
          true,
          false,
        ])

        // When
        optionBar.keyMap.enter.handler()
        // Then
        expect(optionBar.model.map((o) => o.selected)).toEqual([
          false,
          true,
          false,
        ])
      })
    })
  })
})
