import blessed from 'neo-blessed'

import { Controller, CtrlCtorParams } from './controller'

export class FooterController extends Controller {
  focusable = false

  constructor({ parent, model, keyMap }: CtrlCtorParams) {
    super(
      blessed.box({
        parent: parent,
        bottom: 0,
        left: 0,
        width: '100%',
        height: 1,
        content: ' q = quit • ↑↓ = nav • space = toggle',
        style: { fg: 'white', bg: 'gray' },
      }),
      model
    )
    this.inheritKeyMap(keyMap)
  }
}
