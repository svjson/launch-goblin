import blessed from 'neo-blessed'
import { Model } from 'src/project'
import { SelectableItem } from './checkbox'

export type CtrlCtorParams = {
  parent: blessed.Widgets.BlessedElement
  model: Model
  keyMap?: KeyMapArg
  options?: blessed.Widgets.ElementOptions
}

export interface KeyMapArg {
  replace: boolean
  keys: KeyMap
}

export type KeyMap = Record<string, KeyHandler>

export type KeyIdentifier = string | string[]
export interface KeyHandler {
  propagate?: boolean
  handler: Function
}

export interface Listener {
  receive: (event: Event) => void
}

export interface DirtyEvent {
  type: 'dirty'
}

export interface CheckboxEvent {
  type: 'checkbox'
  item: SelectableItem
  checked: boolean
}

export interface FocusEvent {
  type: 'focus'
  component: Controller
}

export interface DestroyedEvent {
  type: 'destroyed'
  component: Controller
}

export interface LogEvent {
  type: 'log'
  message: string
}

export interface AnyEvent {
  type: string
}

export type Event =
  | DirtyEvent
  | CheckboxEvent
  | DestroyedEvent
  | FocusEvent
  | LogEvent
  | AnyEvent

export abstract class Controller<
  T extends blessed.Widgets.BlessedElement = blessed.Widgets.BlessedElement,
> {
  keyMap: KeyMap = {}
  events: Record<string, Function> = {}

  listeners: Listener[] = []
  children: Controller[] = []

  focusedIndex = 0
  focusable = true

  constructor(
    protected widget: T,
    protected model: Model
  ) {}

  addChild<T extends Controller>(
    ctrlClass: new (ctorParams: CtrlCtorParams, ...args: any[]) => T,
    options: blessed.Widgets.ElementOptions = {},
    ...args: any[]
  ): void {
    const inheritKeys: KeyMap = Object.entries(this.keyMap).reduce(
      (km, [key, entry]) => {
        if (entry.propagate) {
          km[key] = entry
        }
        return km
      },
      {} as KeyMap
    )

    const child = new ctrlClass(
      {
        parent: this.widget,
        model: this.model,
        keyMap: { replace: false, keys: inheritKeys },
        options: options,
      },
      ...args
    )
    child.addListener(this)
    this.children.push(child)
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

    for (const l of this.listeners) {
      l.receive(event)
    }

    if (event.type === 'destroy') {
      this.#destroyChild((event as DestroyEvent).component)
    }

    if (['dirty', 'launch', 'focus', 'log'].includes(event.type)) {
      this.emit(event)
    }
  }

  bind(fn: Function) {
    const _self = this
    return (...args: any[]) => {
      fn.apply(_self, args)
    }
  }

  isFocusable(): boolean {
    if (this.focusable) return true

    for (const child of this.children) {
      if (child.isFocusable()) return true
    }

    return false
  }

  nextChild(): Controller | undefined {
    this.focusedIndex = (this.focusedIndex + 1) % this.children.length

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

  emit(event: Event | string) {
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
