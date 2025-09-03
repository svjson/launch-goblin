import blessed from 'neo-blessed'
import { ApplicationController, ApplicationCtrlConstructor } from './controller'
import { Store, createStore } from './store'
import { ActionMap } from './action'

export class Application<Model, MainCtrl extends ApplicationController<Model>> {
  store: Store<Model>
  mainCtrl: MainCtrl

  actions: ActionMap = {}

  constructor(
    protected screen: blessed.Widgets.Screen,
    protected mainCtrlClass: ApplicationCtrlConstructor<MainCtrl, Model>,
    protected model: Model
  ) {
    this.store = createStore(model)
    this.mainCtrl = new mainCtrlClass({ screen, model, store: this.store })
  }
}
