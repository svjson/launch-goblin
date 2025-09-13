import { ApplicationController, ApplicationCtrlConstructor } from './controller'
import { Store, createStore } from './store'
import { Action, ActionMap } from './action'
import { KeyMap } from './keymap'
import { ActionEvent, FocusEvent } from './event'
import { Backend } from './backend'

/**
 * Root wrapper for a tui application
 *
 * The Application wraps the application state in Model and maintains a tree
 * of UI controllers with MainCtrl as its root.
 *
 * @param screen - the blessed screen to render to
 * @param mainCtrlClass - the main application controller class
 * @param model - the initial application model
 */
export class Application<Model, MainCtrl extends ApplicationController<Model>> {
  store: Store<Model>
  mainCtrl: MainCtrl

  actions: ActionMap = {
    'open-modal': this.bind(this.openModal),
  }

  activeKeyMap: KeyMap = {}

  constructor(
    protected backend: Backend,
    protected mainCtrlClass: ApplicationCtrlConstructor<MainCtrl, Model>,
    protected model: Model
  ) {
    this.store = createStore(model)
    this.mainCtrl = new mainCtrlClass({ backend, model, store: this.store })

    this.#bindApplicationEvents()
  }

  #bindApplicationEvents() {
    this.backend.onKey((ch, key) => {
      if (this.activeKeyMap[key.full]) {
        this.activeKeyMap[key.full].handler(ch, key)
      }
    })

    this.mainCtrl.on('dirty', () => {
      this.backend.render()
    })

    this.mainCtrl.on('focus', (event: FocusEvent) => {
      this.activeKeyMap = event.component.keyMap
    })

    this.mainCtrl.on('action', async (event: ActionEvent) => {
      await this.performAction(event.action)
    })
  }

  protected withActions<ActionMap>(extra: ActionMap): ActionMap {
    return { ...this.actions, ...extra } as ActionMap
  }

  async performAction(action: Action) {
    await this.actions[action.type]?.(action)
  }

  async openModal(action: Action): Promise<void> {
    const dialog = action.details.create({
      model: this.model,
      store: this.store,
      backend: this.backend,
    })
    dialog.on('*', (event: Event) => {
      if (event.type === 'destroyed') {
        action.details.source.focus()
      }
      action.details.source.receive(event)
    })

    dialog.focus()
  }

  bind<T extends (...args: any[]) => any>(
    this: any,
    fn: T
  ): (...args: Parameters<T>) => ReturnType<T> {
    const self = this
    return (...args: Parameters<T>): ReturnType<T> => fn.apply(self, args)
  }
}
