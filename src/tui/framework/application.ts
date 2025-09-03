import blessed from 'neo-blessed'
import { ApplicationController, ApplicationCtrlConstructor } from './controller'
import { Store, createStore } from './store'
import { ActionMap } from './action'
import { KeyMap } from './keymap'
import { FocusEvent } from './event'

export class Application<Model, MainCtrl extends ApplicationController<Model>> {
  store: Store<Model>
  mainCtrl: MainCtrl

  actions: ActionMap = {}

  activeKeyMap: KeyMap = {}

  constructor(
    protected screen: blessed.Widgets.Screen,
    protected mainCtrlClass: ApplicationCtrlConstructor<MainCtrl, Model>,
    protected model: Model
  ) {
    this.store = createStore(model)
    this.mainCtrl = new mainCtrlClass({ screen, model, store: this.store })

    this.#bindApplicationEvents()
  }

  #bindApplicationEvents() {
    this.screen.on('keypress', (ch, key) => {
      if (this.activeKeyMap[key.full]) {
        this.activeKeyMap[key.full].handler(ch, key)
      }
    })

    this.mainCtrl.on('dirty', () => {
      this.screen.render()
    })

    this.mainCtrl.on('focus', (event: FocusEvent) => {
      this.activeKeyMap = event.component.keyMap
    })
  }
}
