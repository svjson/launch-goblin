import blessed from 'neo-blessed'

import { Controller, CtrlCtorParams } from './framework/controller'
import { ApplicationState } from '@src/project'

/**
 * TUI Component for the application header.
 */
export class HeaderController extends Controller<
  blessed.Widgets.BoxElement,
  ApplicationState
> {
  focusable = false

  constructor({ parent, model, store, keyMap }: CtrlCtorParams) {
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
      model,
      store
    )
    this.inheritKeyMap(keyMap)
  }
}
