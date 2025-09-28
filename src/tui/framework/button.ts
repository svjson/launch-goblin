import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { Widget } from './widget'
import { resolveComponentStyle } from './theme'

export interface ButtonModel {
  text: string
}

export class Button extends Controller<Widget, ButtonModel> {
  focusable = true

  keyMap = this.defineKeys({
    enter: {
      legend: 'Press Button',
      handler: this.pressed,
    },
  })

  constructor({
    widget: { env, options = {} },
    state: { model },
  }: CtrlCtorParams) {
    super(
      env,
      env.backend.createButton(
        mergeLeft(
          {
            width: model.text.length + 4,
            height: 1,
            left: 'center',
            label: model.text,
            textAlign: 'center',
          },
          resolveComponentStyle(env.theme, 'Button', env.tty.colorMode),
          options
        )
      ),
      model
    )

    this.enable()
  }

  pressed() {
    if (this.enabled) {
      this.emit('pressed')
    }
  }
}
