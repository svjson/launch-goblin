import blessed from 'neo-blessed'

import { describe, expect, test } from 'vitest'

import { Behavior } from '@src/tui/framework/behavior'
import {
  toBlessedBehavior,
  toBlessedBoxOptions,
  toBlessedLabelOptions,
  toBlessedStyle,
} from '@src/tui/framework/blessed/style'
import {
  BoxOptions,
  LabelOptions,
  WidgetOptions,
} from '@src/tui/framework/widget'

describe('toBlessedBehavior', () => {
  test.each([
    [{}, {}],
    [{ focusable: true }, { focusable: true }],
    [
      { focusable: true, scrollable: false },
      { focusable: true, scrollable: false },
    ],
    [
      { alwaysScroll: true, scrollable: false },
      { alwaysScroll: true, scrollable: false },
    ],
    [
      { alwaysScroll: true, scrollable: false },
      { alwaysScroll: true, scrollable: false },
    ],
    [
      { randomProp: false, alwaysScroll: true, scrollable: false },
      { alwaysScroll: true, scrollable: false },
    ],
  ] as [Behavior, any][])('input %o gives %o', (input: Behavior, result) => {
    expect(toBlessedBehavior(input)).toEqual(result)
  })
})

describe('toBlessedStyle', () => {
  test.each([[{}, { style: {} }]] as [WidgetOptions, any][])(
    'input %o gives %o',
    (input: WidgetOptions, result) => {
      expect(toBlessedStyle(input)).toEqual(result)
    }
  )
})

describe('WidgetOptions types to Blessed options', () => {
  describe('toBlessedBoxOptions', () => {
    test.each([
      [{}, { tags: true, style: {} }],
      [
        { border: { type: 'line' } },
        { border: { type: 'line' }, style: { border: {} }, tags: true },
      ],
    ] as [BoxOptions, any][])('input %o gives %o', (input, expected) => {
      const actual = toBlessedBoxOptions(input)
      expect(actual).toEqual(expected)
      expect(Object.keys(actual)).toEqual(
        expect.arrayContaining(Object.keys(expected))
      )
    })
  })

  describe('toBlessedLabelOptions', () => {
    test.each([
      [{}, { tags: true, style: {}, shrink: true }],
      [
        { right: 1, hidden: true, color: 'green' },
        {
          content: undefined,
          right: 1,
          shrink: true,
          hidden: true,
          style: { fg: 'green' },
          tags: true,
        },
      ],
      [
        { left: 1, textAlign: 'center' },
        { left: 1, align: 'center', shrink: false, tags: true, style: {} },
      ],
    ] as [LabelOptions, any][])(
      'input %o gives %o',
      (input: LabelOptions, result) => {
        const actual = toBlessedLabelOptions(input)
        expect(actual).toEqual(result)
        expect(Object.keys(actual)).toEqual(
          expect.arrayContaining(Object.keys(result))
        )
      }
    )
  })
})
