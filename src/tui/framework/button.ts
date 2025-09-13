import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { Widget } from './widget'

export interface ButtonModel {
  text: string
  enabled?: any
  disabled?: any
}

export class Button extends Controller<Widget, ButtonModel> {
  focusable = true

  keyMap = {
    enter: {
      legend: 'Press Button',
      handler: this.bind(this.pressed),
    },
  }

  constructor({
    widget: { backend, parent, keyMap, options = {} },
    state: { model },
  }: CtrlCtorParams) {
    super(
      backend,
      backend.createButton(
        mergeLeft(
          {
            content: model.text,
            height: 1,
            left: 'center',
            style: {
              fg: 'black',
              bg: '#888888',
              focus: {
                fg: 'black',
                bg: 'green',
              },
            },
            width: model.text.length + 4,
            align: 'center',
          },
          options
        )
      ),
      model
    )
    model.disabled = mergeLeft(
      { bg: 'gray', fg: 'black' },
      model.disabled ?? {}
    )
    model.enabled = mergeLeft({ bg: 'white', fg: 'black' }, model.enabled ?? {})

    this.enable()

    this.inheritKeyMap(keyMap)
  }

  enable() {
    super.enable()
    //    mergeLeft(this.widget.style, this.model.enabled)
    this.emit('dirty')
  }

  disable() {
    super.disable()
    //    mergeLeft(this.widget.style, this.model.disabled)
    this.emit('dirty')
  }

  pressed() {
    if (this.enabled) {
      this.emit('pressed')
    }
  }
}
