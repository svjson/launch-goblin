import blessed from 'neo-blessed'

import { Controller, CtrlCtorParams } from './controller'
import { ButtonController } from './button'

export class LaunchButtonController extends ButtonController {
  focusable = true

  keyMap = {
    enter: {
      handler: this.bind(this.launch),
    },
  }

  constructor({ parent, model, keyMap, options }: CtrlCtorParams) {
    super({ parent, model, keyMap, options }, { text: 'Launch' })
    this.inheritKeyMap(keyMap)
  }

  launch() {
    this.emit('launch')
  }
}
