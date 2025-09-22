import { Controller, CtrlCtorParams } from './framework/controller'
import { ApplicationState } from '@src/project'
import { Widget } from './framework/widget'
import { Label } from './framework'

/**
 * TUI Component for the application header.
 */
export class HeaderController extends Controller<Widget, ApplicationState> {
  focusable = false

  components = this.defineComponents({
    title: {
      component: Label,
      model: { text: `Launch Goblin v${__LG_VERSION__}` },
      style: {
        left: 'center',
      },
    },
  })

  constructor({
    widget: { env, keyMap },
    state: { model, store },
  }: CtrlCtorParams) {
    super(
      env,
      env.backend.createBox({
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

    this.inheritKeyMap(keyMap)
  }
}
