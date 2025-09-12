import blessed from 'neo-blessed'
import { mergeLeft } from '@whimbrel/walk'

import {
  ChildDescription,
  Controller,
  CtrlConstructor,
  CtrlCtorParams,
} from './controller'
import { KeyMap } from './keymap'

type Elem<T extends readonly unknown[]> = T[number]

/**
 *
 */
export interface CustomListBoxCtorParams<
  ItemT extends Controller,
  EmptyT extends Controller,
  EmptyM,
  Model extends Array<any>,
  StoreModel = Model,
> extends CtrlCtorParams<Model, StoreModel> {
  itemCls: CtrlConstructor<ItemT, Elem<Model>, StoreModel>
  emptyLabel?: ChildDescription<EmptyT, EmptyM, EmptyM>
}

export class CustomListBox<
  ItemT extends Controller,
  EmptyT extends Controller,
  EmptyM,
  Model extends Array<any>,
  Store,
> extends Controller<blessed.Widgets.BoxElement, Model, Store> {
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

  itemCls: CtrlConstructor<ItemT, Elem<Model>, Store>
  emptyLabel?: ChildDescription<EmptyT, EmptyM, EmptyM>

  constructor({
    parent,
    itemCls,
    emptyLabel,
    model,
    store,
    keyMap,
    options = {},
  }: CustomListBoxCtorParams<ItemT, EmptyT, EmptyM, Model, Store>) {
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
    this.itemCls = itemCls
    this.emptyLabel = emptyLabel

    this.inheritKeyMap(keyMap)
  }

  itemFocused() {
    this.receive({
      type: 'selected',
      item: this.model[this.focusedIndex],
    })
  }

  refreshItems() {
    this.removeAllChildren()
    for (let i = 0; i < this.model.length; i++) {
      const item = this.model[i]
      this.addChild(
        {
          component: this.itemCls,
          model: item,
        },
        {
          top: i + 1,
        }
      )
    }

    if (!this.children.length && this.emptyLabel) {
      this.addChild(this.emptyLabel, {
        left: 'center',
        top: 1,
        style: {
          fg: 'gray',
        },
      })
    }

    this.focusable = this.model.length > 0
    if (this.focusedIndex >= this.children.length) {
      this.nextChild(-1)
    }
  }
}

export class CustomListBoxItem<M, SM> extends Controller<
  blessed.Widgets.BlessedElement,
  M,
  SM
> {}
