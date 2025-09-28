import { Behavior } from '@src/tui/framework/behavior'
import { toBlessedBehavior } from '@src/tui/framework/blessed/backend'
import { describe, expect, test } from 'vitest'

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
