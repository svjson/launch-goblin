import blessed from 'neo-blessed'

import { Controller, CtrlCtorParams } from './controller'

export class LaunchButtonController extends Controller {
  focusable = true

  keyMap = {
    enter: {
      handler: this.bind(this.launch),
    },
  }

  constructor({ parent, model, keyMap }: CtrlCtorParams) {
    super(
      blessed.button({
        parent,
        content: 'Launch',
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
      }),
      model
    )
    this.inheritKeyMap(keyMap)

    this.applyKeyMap()
  }

  launch() {
    this.emit('launch')
  }
}
