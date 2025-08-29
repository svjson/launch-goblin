import blessed from 'neo-blessed'

import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'

export interface ButtonModel {
  text: string
  enabled?: any
  disabled?: any
}

export class Button extends Controller<blessed.Widgets.ButtonElement> {
  item: ButtonModel

  focusable = true

  keyMap = {
    enter: {
      legend: 'Press Button',
      handler: this.bind(this.pressed),
    },
  }

  constructor(
    { parent, model, keyMap, options = {} }: CtrlCtorParams,
    item: ButtonModel
  ) {
    super(
      blessed.button(
        mergeLeft(
          {
            parent,
            content: item.text,
            height: 1,
            left: 'center',
            top: '60%',
            style: {
              fg: 'black',
              bg: '#888888',
              focus: {
                fg: 'black',
                bg: 'green',
              },
            },
            width: 10,
            align: 'center',
          },
          options
        )
      ),
      model
    )
    item.disabled = mergeLeft({ bg: 'gray', fg: 'black' }, item.disabled ?? {})
    item.enabled = mergeLeft({ bg: 'white', fg: 'black' }, item.enabled ?? {})

    this.item = item

    this.enable()

    this.inheritKeyMap(keyMap)
  }

  enable() {
    super.enable()
    mergeLeft(this.widget.style, this.item.enabled)
    this.emit('dirty')
  }

  disable() {
    super.disable()
    mergeLeft(this.widget.style, this.item.disabled)
    this.emit('dirty')
  }

  pressed() {
    if (this.enabled) {
      this.emit('pressed')
    }
  }
}
