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
})
