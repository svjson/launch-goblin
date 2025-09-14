import { describe, it, expect } from 'vitest'

import { calculateWidgetStyle } from '@src/tui/framework/style'

describe('calculateWidgetStyle', () => {
  it('resolves color attribute from parent when not defined on the child', () => {
    const parent = { color: 'white', background: '#808080' }
    const widget = { background: '#444444' }
    const state = { focused: false, selected: false, disabled: false }

    const style = calculateWidgetStyle(widget, state, parent)

    expect(style.color).toBe('white')
    expect(style.background).toBe('#444444')
  })

  it('uses :selected colors when state is `selected` but not focused', () => {
    const parent = { color: 'default', background: 'default' }
    const widget = {
      background: 'default',
      color: 'white',
      ':focused': {
        background: 'blue',
      },
      ':selected': {
        color: 'black',
        background: 'white',
      },
    }

    const state = { focused: false, selected: true, disabled: false }

    // When
    const style = calculateWidgetStyle(widget, state, parent)

    // Then
    expect(style).toEqual({
      background: 'white',
      color: 'black',
    })
  })
})
