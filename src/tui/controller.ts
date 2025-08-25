import blessed from 'neo-blessed'
import { Model } from 'src/project'
import { SelectableItem } from './checkbox'

export type CtrlCtorParams = {
  parent: blessed.Widgets.BlessedElement
  model: Model
  keyMap?: KeyMapArg
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

export interface AnyEvent {
  type: string
}

export type Event = DirtyEvent | CheckboxEvent | AnyEvent

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
        if (eventId === received.type) {
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

  protected applyKeyMap() {
    Object.entries(this.keyMap).forEach(([key, entry]) => {
      this.widget.key(
        key,
        (_ch: any, _key: blessed.Widgets.Events.IKeyEventArg) => {
          entry.handler()
        }
      )
    })
  }

  receive(event: Event) {
    const handler = this.events[event.type]

    if (handler) {
      handler(event)
    }

    if (['dirty', 'launch'].includes(event.type)) {
      this.emit(event)
    }
  }

  bind(fn: Function) {
    const _self = this
    return (...args: any[]) => {
      fn.apply(_self, args)
    }
  }

  isFocusable() {
    return this.focusable
  }

  nextChild() {
    this.focusedIndex =
      (this.focusedIndex - 1 + this.children.length) % this.children.length

    const child = this.children[this.focusedIndex]
    if (!child.isFocusable()) {
      if (this.children.some((c) => c.isFocusable())) {
        this.nextChild()
      }
      return
    }

    this.children[this.focusedIndex].focus()
    this.emit('dirty')
  }

  emit(event: Event | string) {
    event = typeof event === 'string' ? { type: event } : event
    this.listeners.forEach((l) => {
      l.receive(event)
    })
  }

  focus() {
    if (this.children && this.children[this.focusedIndex]) {
      this.children[this.focusedIndex].focus()
    } else {
      this.widget.focus()
    }
  }
}
