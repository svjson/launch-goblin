import blessed from 'neo-blessed'

import { Controller, CtrlCtorParams } from './framework/controller'

export class HeaderController extends Controller {
  focusable = false

  constructor({ parent, model, keyMap }: CtrlCtorParams) {
    super(
      blessed.box({
        parent: parent,
        top: 0,
        left: 0,
        width: '100%',
        height: 1,
        align: 'center',
        content: `Launch Goblin v${__LG_VERSION__}`,
        style: { bg: 'green', fg: 'black', bold: true },
      }),
      model
    )
    this.inheritKeyMap(keyMap)
  }
}
