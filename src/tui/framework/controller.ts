import blessed from 'neo-blessed'
import { DestroyEvent, Event, StringEvent } from './event'
import { KeyMap, KeyMapArg } from './keymap'
import { createStore, Store } from './store'
import { ControllerLayout, LayoutProperty } from './layout'

/**
 * Mixin-interface for anything that may listen to events.
 */
export interface Listener {
  receive: (event: Event) => void
}

/**
 * Parameters for constructing a Controller.
 */
export interface CtrlCtorParams<Model = any, StoreModel = Model> {
  parent: blessed.Widgets.BlessedElement
  model: Model
  store: Store<StoreModel>
  keyMap?: KeyMapArg
  options?: blessed.Widgets.ElementOptions
}

/**
 * Type for a Controller class/constructor.
 */
export type CtrlConstructor<T extends Controller, M, SM> = new (
  ctorParams: CtrlCtorParams<M, SM>,
  ...args: any[]
) => T

/**
 * Description of a child controller to be added.
 * Includes the controller class, and optionally its model and store.
 * If model or store are not provided, they will be inherited from the parent.
 */
export interface ChildDescription<T extends Controller, M, SM> {
  component: CtrlConstructor<T, M, SM>
  model?: M
  store?: Store<SM>
}

/**
 * Parameter for adding a child controller.
 * Can be either a controller class (in which case model and store are
 * inherited), or a full ChildDescription object.
 */
export type ChildParam<T extends Controller, M, SM> =
  | CtrlConstructor<T, M, SM>
  | ChildDescription<T, M, SM>

/**
 * Base class for all controllers.
 *
 * @param T The type of the blessed widget managed by this controller.
 * @param Model The type of the model data for this controller.
 * @param StoreModel The type of the data in the store.
 */
export abstract class Controller<
  T extends blessed.Widgets.BlessedElement = blessed.Widgets.BlessedElement,
  Model = any,
  StoreModel = Model,
> {
  /**
   * KeyMap describing enabled keyboard input, keybinding descriptions and
   * handler functions.
   *
   * By default, this is an empty object, meaning no key handling except
   * the keyboard input that is hard-wired into the wrapped blessed element.
   *
   * Controllers may propagate their defined keys, on a binding per binding
   * basis, enabling navigation and global or controller-global keys to
   * be registered to all children, unless explicitly declined.
   */
  keyMap: KeyMap = {}

  /**
   * Map describing handlers for events received by this controller
   */
  events: Record<string, Function> = {}

  /**
   * Currently registered listeners
   */
  listeners: Listener[] = []

  /**
   * Layout bindings for this controller
   */
  layout: ControllerLayout

  /**
   * The child controllers/components of this component
   */
  children: Controller[] = []

  /**
   * The index of the currently focused child of this controller.
   */
  focusedIndex = 0

  /**
   * Indicates whether this controller should be allowed to hold focus.
   */
  focusable = true

  /**
   * Indicates whether this controller is currently enabled or disabled.
   */
  enabled = true

  constructor(
    protected widget: T,
    protected model: Model,
    protected store: Store<StoreModel> = createStore({}) as Store<StoreModel>
  ) {
    this.layout = new ControllerLayout(this)
    this.widget.onScreenEvent('render', () => {
      this.layout.apply()
    })
  }

  addChild<T extends Controller, M = Model, SM = StoreModel>(
    childDesc: ChildParam<T, M, SM>,
    options: blessed.Widgets.ElementOptions = {},
    ...args: any[]
  ): T {
    const inheritKeys: KeyMap = Object.entries(this.keyMap).reduce(
      (km, [key, entry]) => {
        if (entry.propagate) {
          km[key] = entry
        }
        return km
      },
      {} as KeyMap
    )

    const { ctrlClass, model, store } = this.#resolveChildParams(
      childDesc,
      options
    )

    const child = new ctrlClass(
      {
        parent: this.widget,
        store: store!,
        model: model!,
        keyMap: { replace: false, keys: inheritKeys },
        options,
      },
      ...args
    )
    child.addListener(this)
    this.children.push(child)

    return child
  }

  #resolveChildParams<T extends Controller, M, SM>(
    childDesc: ChildParam<T, M, SM>,
    _options: blessed.Widgets.ElementOptions = {}
  ) {
    return {
      ctrlClass:
        typeof childDesc === 'function' ? childDesc : childDesc.component,
      model: typeof childDesc === 'function' ? undefined : childDesc.model,
      store: typeof childDesc === 'function' ? this.store : childDesc.store,
    }
  }

  addListener(listener: Listener) {
    this.listeners.push(listener)
  }

  on(eventId: string, handler: Function) {
    this.listeners.push({
      receive: (received) => {
        if (eventId === received.type || eventId === '*') {
          handler(received)
        }
      },
    })
  }

  protected inheritKeyMap(inherited?: KeyMapArg) {
    if (inherited) {
      if (inherited.replace) {
        this.keyMap = inherited.keys
      } else {
        Object.assign(this.keyMap, inherited.keys)
      }
    }
  }

  receive(event: Event) {
    const handler = this.events[event.type]

    if (handler) {
      handler(event)
    }

    if (event.type === 'destroy') {
      this.#destroyChild((event as DestroyEvent).component)
    }

    if (['dirty', 'launch', 'focus', 'log', 'action'].includes(event.type)) {
      this.emit(event)
    }
  }

  bind(fn: Function) {
    const _self = this
    return (...args: any[]) => {
      fn.apply(_self, args)
    }
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }

  isFocusable(): boolean {
    if (this.focusable && this.enabled) return true

    for (const child of this.children) {
      if (child.isFocusable()) return true
    }

    return false
  }

  nextChild(dir: number = 1): Controller | undefined {
    dir = typeof dir !== 'number' ? 1 : dir
    this.focusedIndex = (this.focusedIndex + dir) % this.children.length

    const child = this.children[this.focusedIndex]
    if (!child.isFocusable()) {
      if (this.children.some((c) => c.isFocusable())) {
        return this.nextChild()
      }
      return
    }

    child.focus()
    this.emit('dirty')
    return child
  }

  destroy() {
    this.widget.detach()
    this.widget.destroy()
    this.emit({ type: 'destroyed', component: this })
  }

  #destroyChild(component: Controller) {
    const index = this.children.findIndex((c) => c === component)
    if (index === -1) return

    component.destroy()
    this.children.splice(index, 1)
  }

  emit(event: Event | StringEvent) {
    event = typeof event === 'string' ? { type: event } : event
    this.listeners.forEach((l) => {
      l.receive(event)
    })
  }

  log(message: string) {
    this.emit({
      type: 'log',
      message,
    })
  }

  set(prop: LayoutProperty, value: string | number) {
    this[prop].call(this, value)
  }

  top(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.top = value
    }
    return this.widget.top
  }

  right(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.right = value
    }
    return this.widget.lpos.xl
  }

  bottom(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.bottom = value
    }
    return this.widget.lpos.yl
  }

  left(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.left = value
    }
    return this.widget.lpos.xi
  }

  width(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.width = value
    }
    return this.widget.width
  }

  height(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.height = value
    }
    return this.widget.height
  }

  focus() {
    let focusedChild: Controller | undefined = this.children[this.focusedIndex]
    if (focusedChild) {
      if (!focusedChild.isFocusable()) {
        focusedChild = this.nextChild()
      }

      if (focusedChild) {
        focusedChild.focus()
      }
    } else {
      this.widget.focus()
      this.emit({ type: 'focus', component: this })
    }
  }
}
