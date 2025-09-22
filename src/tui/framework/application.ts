import {
  ApplicationController,
  ApplicationCtrlConstructor,
  ComponentEnvironment,
  Controller,
} from './controller'
import { Store, createStore } from './store'
import { action, Action, ActionMap, ActionsMeta } from './action'
import { keyHandler, KeyMap } from './keymap'
import { ActionEvent, FocusEvent } from './event'
import { Backend } from './backend'

export interface ApplicationEnvironment extends ComponentEnvironment {
  log: string[]
}

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
  actions: ActionMap = {}
  store: Store<Model>
  backend: Backend
  mainCtrl: MainCtrl
  modals: Controller[] = []

  activeKeyMap: KeyMap = {}

  constructor(
    protected env: ComponentEnvironment,
    protected mainCtrlClass: ApplicationCtrlConstructor<MainCtrl, Model>,
    protected model: Model
  ) {
    this.store = createStore(model)
    this.backend = env.backend
    this.mainCtrl = new mainCtrlClass({ env, model, store: this.store })

    this.#roundUpActions()
    this.#bindApplicationEvents()
  }

  #roundUpActions() {
    const merged: ActionMap = {}
    let proto: any = this.constructor
    while (proto && proto !== Object) {
      for (const [id, methodName] of Object.entries(proto[ActionsMeta] ?? {})) {
        merged[id] = (this as any)[methodName as string].bind(this)
      }
      proto = Object.getPrototypeOf(proto)
    }
    this.actions = this.defineActions(merged)
  }

  #bindApplicationEvents() {
    this.backend.onKey((ch, key) => {
      const handlerFn = keyHandler(this.activeKeyMap, ch, key)
      if (typeof handlerFn === 'function') {
        handlerFn(ch, key)
      }
    })

    this.backend.onBeforeRender(() => {
      this.mainCtrl.applyStyle({})
      this.modals.forEach((m) => m.applyStyle({}))
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

  protected defineActions(actions: ActionMap): ActionMap {
    return Object.entries({ ...this.actions, ...actions }).reduce(
      (map, [event, handler]) => {
        map[event] = /^bound /.test(handler.name) ? handler : this.bind(handler)
        return map
      },
      {} as ActionMap
    )
  }

  async performAction(action: Action) {
    await this.actions[action.type]?.(action)
  }

  @action('open-modal')
  async openModal(action: Action): Promise<void> {
    const dialog: Controller = action.details.create({
      model: this.model,
      store: this.store,
      backend: this.backend,
    })
    this.modals.push(dialog)
    dialog.on('*', (event: Event) => {
      if (event.type === 'destroyed') {
        this.modals = this.modals.filter((m) => m !== dialog)
        action.details.source.focus()
        this.backend.render()
      }
      action.details.source.receive(event)
    })

    dialog.focus()
    this.backend.render()
  }

  bind<T extends (...args: any[]) => any>(
    this: any,
    fn: T
  ): (...args: Parameters<T>) => ReturnType<T> {
    const self = this
    return (...args: Parameters<T>): ReturnType<T> => fn.apply(self, args)
  }
}
