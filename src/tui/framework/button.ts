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
            width: model.text.length + 4,
            height: 1,
            left: 'center',
            raw: {
              content: model.text,
              style: {
                fg: 'black',
                bg: '#888888',
                focus: {
                  fg: 'black',
                  bg: 'green',
                },
              },
              align: 'center',
            },
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
    Object.keys(this.model.enabled).forEach((k) => {
      this.widget.set(k, this.model.enabled[k])
    })
    this.emit('dirty')
  }

  disable() {
    super.disable()
    Object.keys(this.model.disabled).forEach((k) => {
      this.widget.set(k, this.model.disabled[k])
    })
    this.emit('dirty')
  }

  pressed() {
    if (this.enabled) {
      this.emit('pressed')
    }
  }
}
