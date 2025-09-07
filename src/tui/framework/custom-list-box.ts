import blessed from 'neo-blessed'
import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { KeyMap } from './keymap'

export class CustomListBox<Model extends Array<any>, Store> extends Controller<
  blessed.Widgets.BoxElement,
  Model,
  Store
> {
  keyMap: KeyMap = {
    up: {
      propagate: true,
      legend: 'Navigate',
      group: 'nav',
      handler: this.bind(() => this.nextChild(-1)),
    },
    down: {
      propagate: true,
      legend: 'Navigate',
      group: 'nav',
      handler: this.bind(this.nextChild),
    },
  }

  events: Record<string, Function> = {
    focus: this.bind(this.itemFocused),
  }

  focusedIndex = 0

  constructor({
    parent,
    model,
    store,
    keyMap,
    options = {},
  }: CtrlCtorParams<Model, Store>) {
    super(
      blessed.box(
        mergeLeft(
          {
            parent,
            border: 'line',
            keys: true,
            mouse: true,
            scrollable: true,
            alwaysScroll: true,
          },
          options
        )
      ),
      model,
      store
    )

    this.inheritKeyMap(keyMap)
  }

  itemFocused() {
    this.receive({
      type: 'selected',
      item: this.model[this.focusedIndex],
    })
  }
}
