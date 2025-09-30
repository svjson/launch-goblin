import blessed from 'neo-blessed'

import { describe, it, expect } from 'vitest'
import { WidgetOptions } from '@src/tui/framework/widget'
import { withParent } from '@src/tui/framework/blessed/backend'
import { toBlessedBoxOptions } from '@src/tui/framework/blessed/style'
import { BlessedBoxWidget } from '@src/tui/framework/blessed/widget'

describe('BlessedWidget', () => {
  describe('applyStyle', () => {
    it('should assign colors to widget', () => {
      // Given
      const screen = blessed.screen({
        smartCSR: false,
        terminal: 'ansi',
        isTTY: false,
      })

      const options: WidgetOptions = {
        color: 'white',
        background: 'black',
      }

      const widget = new BlessedBoxWidget(
        blessed.box(withParent(toBlessedBoxOptions(options), screen)),
        options
      )

      expect(widget.inner.style.fg).toEqual('white')
      expect(widget.inner.style.bg).toEqual('black')

      widget.applyStyle({
        color: 'black',
        background: 'white',
      })

      expect(widget.inner.style.fg).toEqual('black')
      expect(widget.inner.style.bg).toEqual('white')
    })
  })
})
