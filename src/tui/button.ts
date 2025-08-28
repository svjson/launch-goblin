import blessed from 'neo-blessed'

import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'

export interface ButtonModel {
  text: string
}

export class ButtonController extends Controller<blessed.Widgets.ButtonElement> {
  item: ButtonModel

  focusable = true

  keyMap = {
    enter: {
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
              bg: 'gray',
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
    this.item = item

    this.inheritKeyMap(keyMap)

    this.applyKeyMap()
  }

  pressed() {
    this.emit('pressed')
  }
}
