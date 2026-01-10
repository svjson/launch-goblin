import { describe, expect, test } from 'vitest'
import { applicationEnvironment } from './fixtures'
import { createStore, HeadlessBackend, TextInput } from '@src/tui/framework'
import { TextInputModel } from '@src/tui/framework/text-field'
import { KeyMeta } from '@src/tui/framework/input'

describe('TextInput', () => {
  const makeTextInput = (model: TextInputModel = { value: '', cursor: 0 }) => {
    const env = applicationEnvironment()

    return {
      env,
      backend: env.backend as HeadlessBackend,
      input: new TextInput({
        widget: {
          env,
        },
        state: {
          model,
          store: createStore(model),
        },
      }),
    }
  }

  describe('Cursor movement', () => {
    test.each([
      // Right
      [0, '', 'right', 0],
      [0, 'Muffins', 'right', 1],
      [1, 'Muffins', 'right', 2],
      [3, 'ABC', 'right', 3],
      // Left
      [0, '', 'left', 0],
      [0, 'Muffins', 'left', 0],
      [1, 'Muffins', 'left', 0],
      [2, 'Muffins', 'left', 1],
      [3, 'ABC', 'left', 2],
      // Home
      [0, '', 'home', 0],
      [0, 'Muffins', 'home', 0],
      [1, 'Muffins', 'home', 0],
      [2, 'Muffins', 'home', 0],
      [3, 'ABC', 'home', 0],
      // End
      [0, '', 'end', 0],
      [0, 'Muffins', 'end', 7],
      [1, 'Muffins', 'end', 7],
      [2, 'Muffins', 'end', 7],
      [3, 'ABC', 'end', 3],
    ])(
      'From cursor pos %d in "%s", movement with key "%s" moves the cursor to %d',
      (fromPos, text, key, expectedPos) => {
        const { input } = makeTextInput({ value: text, cursor: fromPos })

        // When
        input.keyMap[key].handler()

        // Then
        expect(input.model).toEqual({
          value: text,
          cursor: expectedPos,
        })
        expect(input.getText()).toEqual(text)
      }
    )
  })

  describe('Kill', () => {
    test.each([
      // Backspace
      [0, '', 'backspace', '', 0],
      [0, 'Muffins', 'backspace', 'Muffins', 0],
      [1, 'Muffins', 'backspace', 'uffins', 0],
      [3, 'ABC', 'backspace', 'AB', 2],
      // Delete
      [0, '', 'delete', '', 0],
      [0, 'Muffins', 'delete', 'uffins', 0],
      [1, 'Muffins', 'delete', 'Mffins', 1],
      [2, 'Muffins', 'delete', 'Mufins', 2],
      [3, 'ABC', 'delete', 'ABC', 3],
    ])(
      'At cursor pos %d in "%s", killing with "%s" changes value to "%s" and places cursor at %d',
      (fromPos, text, key, newText, expectedPos) => {
        const { input } = makeTextInput({ value: text, cursor: fromPos })

        // When
        input.keyMap[key].handler()

        // Then
        expect(input.model).toEqual({
          value: newText,
          cursor: expectedPos,
        })
        expect(input.getText()).toEqual(newText)
      }
    )
  })

  describe('Char sequence input', () => {
    test.each([
      [0, '', 'tombola', 'tombola', 7],
      [0, 'Muffins', 'Cheese ', 'Cheese Muffins', 7],
      [1, 'Muffins', 'ungo-M', 'Mungo-Muffins', 7],
      [3, 'ABC', 'DEF', 'ABCDEF', 6],
    ])(
      'At cursor pos %d in "%s", killing with "%s" changes value to "%s" and places cursor at %d',
      (fromPos, text, newChars, newText, expectedPos) => {
        const { input } = makeTextInput({ value: text, cursor: fromPos })

        // When
        for (const newChar of newChars) {
          input.insertChar({ type: 'key', key: {} as KeyMeta, ch: newChar })
        }

        // Then
        expect(input.model).toEqual({
          value: newText,
          cursor: expectedPos,
        })
        expect(input.getText()).toEqual(newText)
      }
    )
  })
})
