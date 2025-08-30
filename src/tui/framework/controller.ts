import blessed from 'neo-blessed'
import { DestroyEvent, Event, StringEvent } from './event'
import { KeyMap, KeyMapArg } from './keymap'
import { createStore, Store } from './store'

export interface CtrlCtorParams<Model = any, StoreModel = Model> {
  parent: blessed.Widgets.BlessedElement
  model: Model
  store: Store<StoreModel>
  keyMap?: KeyMapArg
  options?: blessed.Widgets.ElementOptions
}

export interface Listener {
  receive: (event: Event) => void
}

export type CtrlConstructor<T extends Controller, M, SM> = new (
  ctorParams: CtrlCtorParams<M, SM>,
  ...args: any[]
) => T

export interface ChildDescription<T extends Controller, M, SM> {
  component: CtrlConstructor<T, M, SM>
  model?: M
  store?: Store<SM>
}

export type ChildParam<T extends Controller, M, SM> =
  | CtrlConstructor<T, M, SM>
  | ChildDescription<T, M, SM>

export abstract class Controller<
  T extends blessed.Widgets.BlessedElement = blessed.Widgets.BlessedElement,
  Model = any,
  StoreModel = Model,
> {
  keyMap: KeyMap = {}
  events: Record<string, Function> = {}

  listeners: Listener[] = []
  children: Controller[] = []

  focusedIndex = 0
  focusable = true

  enabled = true

  constructor(
    protected widget: T,
    protected model: Model,
    protected store: Store<StoreModel> = createStore({}) as Store<StoreModel>
  ) {}

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
    return this.widget.right
  }

  bottom(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.bottom = value
    }
    return this.widget.bottom
  }

  left(value?: string | number): string | number {
    if (value !== undefined) {
      this.widget.left = value
    }
    return this.widget.left
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
