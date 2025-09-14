import { Controller, CtrlCtorParams } from './framework/controller'
import { ApplicationState } from '@src/project'
import { Widget } from './framework/widget'
import { Label } from './framework'

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
      }),
      model,
      store
    )

    this.addChild(
      {
        component: Label,
        model: { text: `Launch Goblin v${__LG_VERSION__}` },
      },
      {
        left: 'center',
      }
    )

    this.inheritKeyMap(keyMap)
  }
}
