import { Controller, CtrlCtorParams } from './framework/controller'
import { ApplicationState } from '@src/project'
import { Widget } from './framework/widget'

/**
 * TUI Component for the application header.
 */
export class HeaderController extends Controller<Widget, ApplicationState> {
  focusable = false

  constructor({
    widget: { backend, parent, keyMap },
    state: { model, store },
  }: CtrlCtorParams) {
    super(
      backend,
      backend.createBox({
        top: 0,
        left: 0,
        width: '100%',
        height: 1,
        background: 'green',
        color: 'black',
        bold: true,
        raw: {
          align: 'center',
          content: `Launch Goblin v${__LG_VERSION__}`,
        },
      }),
      model,
      store
    )
    this.inheritKeyMap(keyMap)
  }
}
