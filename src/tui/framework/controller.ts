import {
  DestroyEvent,
  TUIEvent,
  EventMap,
  StringEvent,
  ScopedEventMap,
} from './event'
import { keyHandler, KeyMap } from './keymap'
import { createStore, Store } from './store'
import { ControllerLayout, LayoutProperty } from './layout'
import { Backend } from './backend'
import {
  BaseWidgetOptions,
  InferWidgetOptions,
  Widget,
  WidgetOptions,
} from './widget'
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
 * Type used for inferring the Widget type used by Controller type.
 */
type InferWidget<C> = C extends Controller<infer W, any, any> ? W : Widget

/**
 * Mixin-interface for anything that may listen to events.
 */
export interface Listener {
  receive: (event: TUIEvent) => void
}

export interface WidgetParams<T extends Widget<any> = Widget<any>> {
  env: ComponentEnvironment
  options?: InferWidgetOptions<T>
}

export interface StateParams<Model, StoreModel> {
  model: Model
  store: Store<StoreModel>
}

/**
 * Parameters for constructing a Controller.
 */
export interface CtrlCtorParams<
  Model = any,
  StoreModel = Model,
  W extends Widget<any> = Widget<WidgetOptions>,
> {
  widget: WidgetParams<W>
  state: StateParams<Model, StoreModel>
}

/**
 * Type for a Controller class/constructor.
 */
export type CtrlConstructor<T extends Controller, M, SM> = new (
  ctorParams: CtrlCtorParams<
    M,
    SM,
    T extends Controller<infer W> ? W : Widget<WidgetOptions>
  >,
  ...args: any[]
) => T

/**
 * Type for a Controller class/constructor.
 */
export type CtrlType<
  C extends Controller<any, any, any> = Controller<any, any, any>,
> = new (...args: any[]) => C

/**
 * Parameters for constructor an ApplicationController
 */
export interface ApplicationCtrlCtorParams<M> {
  env: ComponentEnvironment
  model: M
  store: Store<M>
}

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
   * The parent component of this component.
   *
   * If this component has not been mounted or is detached, this field will
   * be undefined.
   */
  parent?: Controller

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

  /**
   * Component name
   */
  name?: string

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
    childDesc: ChildParam<T, M, SM>
  ): T
  addChild<T extends Controller, M = Model, SM = StoreModel>(
    childDesc: ChildParam<T, M, SM> | T
  ): T {
    const child = this.#resolveChildInstance(childDesc)

    this.#mount(child)

    return child
  }

  #mount(child: Controller) {
    child.setParent(this)
    child.addListener(this)
    this.children.push(child)
  }

  #resolveChildInstance<T extends Controller, M, SM>(
    childDesc: ChildParam<T, M, SM> | T
  ): T {
    if (childDesc instanceof Controller) {
      return childDesc
    }

    const { ctrlClass, model, store, style } =
      this.#resolveChildParams(childDesc)

    const child = new ctrlClass({
      widget: {
        env: this.env,
        options: style,
      },
      state: {
        store: store!,
        model: model!,
      },
    })

    return child
  }

  #resolveChildParams<T extends Controller, M, SM, W = InferWidget<T>>(
    childDesc: ChildParam<T, M, SM>
  ): {
    ctrlClass: CtrlConstructor<T, M, SM>
    model: M
    store: Store<SM>
    style: InferWidgetOptions<W>
  } {
    const ctrlClass =
      typeof childDesc === 'function' ? childDesc : childDesc.component

    const opts = {}
    if (typeof childDesc !== 'function' && childDesc.style) {
      Object.assign(opts, childDesc.style)
    }

    return {
      ctrlClass,
      model: (typeof childDesc === 'function'
        ? undefined
        : childDesc.model) as M,
      store: (typeof childDesc === 'function'
        ? this.store
        : childDesc.store) as Store<SM>,
      style: opts as InferWidgetOptions<W>,
    }
  }

  setParent(controller: Controller) {
    if (controller === this) {
      throw new Error('Component cannot be its own parent')
    }

    this.parent = controller
    this.widget.setParent(controller.widget)
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

  receive(event: TUIEvent) {
    const eventType = event.type === 'custom' ? event.name : event.type

    const eventKeys = [
      event.source?.name ? `${event.source.name}:${eventType}` : '',
      eventType,
    ].filter(Boolean)

    for (const eventKey of eventKeys) {
      const handler = this.events[eventKey]
      if (handler) {
        const handleResult = handler(event)
        if (handleResult === true) {
          return
        }
      }
    }

    if (event.type === 'key') {
      const kHandler = keyHandler(this.keyMap, event.ch, event.key)
      if (kHandler) {
        kHandler(event)
        return
      }
    }

    if (event.type === 'destroy') {
      this.#destroyChild((event as DestroyEvent).source)
    }

    if (
      ['dirty', 'launch', 'focus', 'log', 'action', 'key'].includes(event.type)
    ) {
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
    if (this.focusable && this.enabled && this.widget.isFocusable()) return true

    for (const child of this.children) {
      if (child.isFocusable()) return true
    }

    return false
  }

  getWidget() {
    return this.widget
  }

  #nextChild(dir: number): Controller | undefined {
    dir = typeof dir !== 'number' ? 1 : dir
    this.focusedIndex =
      (this.focusedIndex + dir + this.children.length) % this.children.length
    if (isNaN(this.focusedIndex)) this.focusedIndex = 0
    const child = this.children[this.focusedIndex]
    if (!child || !child.isFocusable()) {
      if (this.children.some((c) => c.isFocusable())) {
        return this.#nextChild(dir)
      }
      return
    }

    child.focus()
    this.emit('dirty')
    return child
  }

  nextChild(): Controller | undefined {
    return this.#nextChild(1)
  }

  prevChild(): Controller | undefined {
    return this.#nextChild(-1)
  }

  destroy() {
    this.widget.destroy()
    this.emit({ type: 'destroyed', source: this })
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

  emit(event: TUIEvent | StringEvent) {
    const concreteEvent: TUIEvent =
      typeof event === 'string' ? { type: event, source: this } : event
    if (!concreteEvent.source) {
      concreteEvent.source = this
    }
    this.listeners.forEach((l) => {
      l.receive(concreteEvent)
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
      ctrl.name = name
      cmps[name] = ctrl
    }

    return cmps
  }

  defineEvents(events: ScopedEventMap): EventMap {
    const flatEvents = Object.entries({ ...this.events, ...events }).reduce(
      (flat, [key, entry]) => {
        if (typeof entry === 'function') {
          flat[key] = entry
        } else {
          Object.entries(entry).forEach(([eventName, handler]) => {
            flat[`${key}:${eventName}`] = handler
          })
        }

        return flat
      },
      {} as EventMap
    )

    return Object.entries(flatEvents).reduce((map, [event, handler]) => {
      map[event] = /^bound /.test(handler.name) ? handler : handler.bind(this)
      return map
    }, {} as EventMap)
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

    Object.assign(this.keyMap, keys)

    return this.keyMap
  }

  set(prop: LayoutProperty, value: string | number | undefined) {
    this.widget.set(prop, value)
  }

  top(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('top', value)
    }
    return this.widget.get('top')! as string | number
  }

  right(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('right', value)
    }
    return this.widget.get('right')! as string | number
  }

  bottom(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('bottom', value)
    }
    return this.widget.get('bottom')! as string | number
  }

  left(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('left', value)
    }
    return this.widget.get('left')! as string | number
  }

  width(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('width', value)
    }
    return this.widget.get('width')! as string | number
  }

  height(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.set('height', value)
    }
    return this.widget.get('height')! as string | number
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

  setFocusable(focusable: boolean) {
    this.focusable = focusable
    this.widget.set('focusable', String(focusable))
  }

  isSelected(): boolean {
    return false
  }

  isDisabled(): boolean {
    return !this.enabled
  }

  hide(): void {
    this.set('hidden', String(true))
  }

  show(): void {
    this.set('hidden', String(false))
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
      this.emit({ type: 'focus', source: this })
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
