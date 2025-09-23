import { DestroyEvent, Event, EventMap, StringEvent } from './event'
import { KeyMap, KeyMapArg } from './keymap'
import { createStore, Store } from './store'
import { ControllerLayout, LayoutProperty } from './layout'
import { Backend } from './backend'
import { BaseWidgetOptions, Widget, WidgetOptions } from './widget'
import { calculateWidgetStyle } from './style'
import { Theme } from './theme'
import { TTYEnv } from './environment'
import { Action } from './action'

export interface ComponentEnvironment {
  backend: Backend
  theme: Theme
  tty: TTYEnv
}

/**
 * Mixin-interface for anything that may listen to events.
 */
export interface Listener {
  receive: (event: Event) => void
}

/**
 * Parameters for constructor an ApplicationController
 */
export interface ApplicationCtrlCtorParams<M> {
  env: ComponentEnvironment
  model: M
  store: Store<M>
}

export interface WidgetParams {
  env: ComponentEnvironment
  parent: Widget
  keyMap?: KeyMapArg
  options?: WidgetOptions
}

export interface StateParams<Model, StoreModel> {
  model: Model
  store: Store<StoreModel>
}

/**
 * Parameters for constructing a Controller.
 */
export interface CtrlCtorParams<Model = any, StoreModel = Model> {
  widget: WidgetParams
  state: StateParams<Model, StoreModel>
}

/**
 * Type for a Controller class/constructor.
 */
export type CtrlConstructor<T extends Controller, M, SM> = new (
  ctorParams: CtrlCtorParams<M, SM>,
  ...args: any[]
) => T

/**
 * Type for a Controller class/constructor.
 */
export type CtrlType<
  C extends Controller<any, any, any> = Controller<any, any, any>,
> = new (...args: any[]) => C

/**
 * Type for an ApplicationController class/constructor.
 */
export type ApplicationCtrlConstructor<
  T extends ApplicationController<M>,
  M,
> = new (ctorParams: ApplicationCtrlCtorParams<M>) => T

export interface ComponentState {
  focused?: boolean
  selected?: boolean
  disabled?: boolean
}

/**
 * Description of a child controller to be added.
 * Includes the controller class, and optionally its model and store.
 * If model or store are not provided, they will be inherited from the parent.
 */
export interface ChildDescription<T extends Controller, M, SM> {
  component: CtrlConstructor<T, M, SM>
  model?: M
  store?: Store<SM>
  style?: WidgetOptions
}

/**
 * Parameter for adding a child controller.
 * Can be either a controller class (in which case model and store are
 * inherited), or a full ChildDescription object.
 */
export type ChildParam<C extends Controller, M, SM> =
  | CtrlConstructor<C, M, SM>
  | ChildDescription<C, M, SM>

/**
 * Argument type for defineComponents
 */
export type ComponentsDeclaration = Record<string, ChildParam<any, any, any>>

type InferComponent<T> =
  T extends CtrlType<infer C>
    ? C
    : T extends { component: CtrlType<infer C> }
      ? C
      : never

type InferComponents<T extends Record<string, any>> = {
  [K in keyof T]: InferComponent<T[K]>
}

/**
 * Base class for all controllers.
 *
 * @param T The type of the blessed widget managed by this controller.
 * @param Model The type of the model data for this controller.
 * @param StoreModel The type of the data in the store.
 */
export abstract class Controller<
  W extends Widget = Widget,
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
    protected env: ComponentEnvironment,
    protected widget: W,
    public model: Model,
    protected store: Store<StoreModel> = createStore({}) as Store<StoreModel>
  ) {
    this.layout = new ControllerLayout(this)
    this.widget.onBeforeRender(() => {
      this.layout.apply()
    })
  }

  addChild<T extends Controller<W, M, SM>, M, SM>(child: T): T
  addChild<T extends Controller, M = Model, SM = StoreModel>(
    childDesc: ChildParam<T, M, SM>,
    options?: WidgetOptions | StateParams<M, SM>,
    ...args: any[]
  ): T
  addChild<T extends Controller, M = Model, SM = StoreModel>(
    childDesc: ChildParam<T, M, SM> | T,
    options?: WidgetOptions | StateParams<M, SM>,
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

    const child = this.#resolveChildInstance(
      childDesc,
      options,
      inheritKeys,
      args
    )

    child.setParent(this.widget)
    child.addListener(this)
    this.children.push(child)

    return child
  }

  #resolveChildInstance<T extends Controller, M, SM>(
    childDesc: ChildParam<T, M, SM> | T,
    options: WidgetOptions | StateParams<M, SM> = {},
    inheritKeys: KeyMap,
    ...args: any[]
  ): T {
    if (childDesc instanceof Controller) {
      childDesc.inheritKeyMap({ replace: false, keys: inheritKeys })
      return childDesc
    }

    const { ctrlClass, model, store, style } = this.#resolveChildParams(
      childDesc,
      options
    )

    const child = new ctrlClass(
      {
        widget: {
          env: this.env,
          parent: this.widget,
          keyMap: { replace: false, keys: inheritKeys },
          options: style as WidgetOptions,
        },
        state: {
          store: store!,
          model: model!,
        },
      },
      ...args
    )

    return child
  }

  #resolveChildParams<T extends Controller, M, SM>(
    childDesc: ChildParam<T, M, SM>,
    options: WidgetOptions | StateParams<M, SM> = {}
  ) {
    const ctrlClass =
      typeof childDesc === 'function' ? childDesc : childDesc.component

    if (
      Object.keys(options).includes('model') ||
      Object.keys(options).includes('store')
    ) {
      return {
        ctrlClass,
        ...(options as StateParams<M, SM>),
        style: typeof childDesc !== 'function' ? (childDesc.style ?? {}) : {},
      }
    }

    const opts = { ...options }
    if (typeof childDesc !== 'function' && childDesc.style) {
      Object.assign(opts, childDesc.style)
    }

    return {
      ctrlClass,
      model: typeof childDesc === 'function' ? undefined : childDesc.model,
      store: typeof childDesc === 'function' ? this.store : childDesc.store,
      style: opts,
    }
  }

  setParent(widget: Widget) {
    this.widget.setParent(widget)
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

  setEnabled(enabledp: boolean) {
    const curr = this.enabled
    this.enabled = enabledp
    if (curr !== enabledp) {
      this.emit('dirty')
    }
  }

  enable() {
    this.setEnabled(true)
  }

  disable() {
    this.setEnabled(false)
  }

  isFocusable(): boolean {
    if (this.focusable && this.enabled) return true

    for (const child of this.children) {
      if (child.isFocusable()) return true
    }

    return false
  }

  getWidget() {
    return this.widget
  }

  nextChild(dir: number = 1): Controller | undefined {
    dir = typeof dir !== 'number' ? 1 : dir
    this.focusedIndex =
      (this.focusedIndex + dir + this.children.length) % this.children.length
    if (isNaN(this.focusedIndex)) this.focusedIndex = 0
    const child = this.children[this.focusedIndex]
    if (!child || !child.isFocusable()) {
      if (this.children.some((c) => c.isFocusable())) {
        return this.nextChild(dir)
      }
      return
    }

    child.focus()
    this.emit('dirty')
    return child
  }

  destroy() {
    this.widget.destroy()
    this.emit({ type: 'destroyed', component: this })
  }

  #destroyChild(component: Controller) {
    const index = this.children.findIndex((c) => c === component)
    if (index === -1) return

    component.destroy()
    this.children.splice(index, 1)
  }

  dispatch(action: Action) {
    this.emit({ type: 'action', action })
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

  removeAllChildren() {
    while (this.children.length) {
      const child = this.children.shift()
      if (child) {
        child.destroy()
      }
    }
  }

  defineComponents<T extends ComponentsDeclaration>(
    components: T
  ): InferComponents<T> {
    const cmps: any = {}

    for (const [name, spec] of Object.entries(components)) {
      const ctrl = this.addChild(spec)
      cmps[name] = ctrl
    }

    return cmps
  }

  defineEvents(events: EventMap): Record<string, Function> {
    return Object.entries({ ...this.events, ...events }).reduce(
      (map, [event, handler]) => {
        map[event] = /^bound /.test(handler.name) ? handler : handler.bind(this)
        return map
      },
      {} as EventMap
    )
  }

  defineKeys(keyMap: KeyMap): KeyMap {
    const keys = Object.entries(keyMap).reduce((map, [key, handler]) => {
      map[key] = {
        ...handler,
        handler: /^bound /.test(handler.handler.name)
          ? handler.handler
          : handler.handler.bind(this),
      }
      return map
    }, {} as KeyMap)

    this.inheritKeyMap({ replace: false, keys })
    return this.keyMap
  }

  set(prop: LayoutProperty, value: string | number | undefined) {
    this.widget.set(prop, value)
  }

  top(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('top', value)
    }
    return this.widget.get('top')!
  }

  right(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('right', value)
    }
    return this.widget.get('right')!
  }

  bottom(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('bottom', value)
    }
    return this.widget.get('bottom')!
  }

  left(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('left', value)
    }
    return this.widget.get('left')!
  }

  width(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('width', value)
    }
    return this.widget.get('width')!
  }

  height(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('height', value)
    }
    return this.widget.get('height')!
  }

  getComponentState(): ComponentState {
    return {
      focused: this.isFocused(),
      selected: this.isSelected(),
      disabled: this.isDisabled(),
    }
  }

  isFocused(): boolean {
    return this.widget.isFocused()
  }

  isSelected(): boolean {
    return false
  }

  isDisabled(): boolean {
    return !this.enabled
  }

  focus() {
    let focusedChild: Controller | undefined = this.children[this.focusedIndex]
    if (focusedChild) {
      if (!focusedChild.isFocusable()) {
        focusedChild = this.nextChild()
      }

      if (focusedChild) {
        focusedChild.focus()
        return
      }
    }

    if (this.isFocusable()) {
      this.widget.focus()
      this.emit({ type: 'focus', component: this })
    }
  }

  applyStyle(parentStyle: BaseWidgetOptions) {
    const cmpState = this.getComponentState()

    const style = calculateWidgetStyle(
      this.widget.widgetOptions,
      cmpState,
      parentStyle
    )

    this.widget.applyStyle(style)
    for (const child of this.children) {
      child.applyStyle(style)
    }
  }
}

export class ApplicationController<M> extends Controller<Widget, M, Store<M>> {
  constructor({ env, model, store }: ApplicationCtrlCtorParams<M>) {
    super(
      env,
      env.backend.createBox({
        width: '100%',
        height: '100%',
        color: 'default',
      }),
      model,
      store
    )
  }
}
