import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { Widget } from './widget'

export interface ButtonModel {
  text: string
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
            color: 'black',
            background: '#888888',
            ':focused': {
              color: 'black',
              background: 'green',
            },
            ':disabled': {
              background: 'gray',
              color: 'black',
            },
            raw: {
              content: model.text,
              align: 'center',
            },
          },
          options
        )
      ),
      model
    )

    this.enable()

    this.inheritKeyMap(keyMap)
  }

  pressed() {
    if (this.enabled) {
      this.emit('pressed')
    }
  }
}
