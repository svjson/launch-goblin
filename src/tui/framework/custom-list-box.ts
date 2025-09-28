import { mergeLeft } from '@whimbrel/walk'

import {
  ChildDescription,
  Controller,
  CtrlConstructor,
  CtrlCtorParams,
} from './controller'
import { KeyMap } from './keymap'
import { Widget } from './widget'

type Elem<T extends readonly unknown[]> = T[number]

/**
 *
 */
export interface CustomListBoxCtorParams<
  ItemT extends Controller,
  EmptyT extends Controller,
  EmptyM,
  Model extends Array<MT>,
  StoreModel = Model,
  MT extends { selected: boolean } = { selected: boolean },
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
> extends Controller<Widget, Model, Store> {
  keyMap: KeyMap = this.defineKeys({
    up: {
      propagate: true,
      legend: 'Navigate',
      group: 'nav',
      handler: this.prevChild,
    },
    down: {
      propagate: true,
      legend: 'Navigate',
      group: 'nav',
      handler: this.nextChild,
    },
  })

  events = this.defineEvents({
    focus: this.itemFocused,
  })

  focusedIndex = 0

  itemCls: CtrlConstructor<ItemT, Elem<Model>, Store>
  emptyLabel?: ChildDescription<EmptyT, EmptyM, EmptyM>

  constructor({
    widget: { env, keyMap, options = {} },
    state: { model, store },
    itemCls,
    emptyLabel,
  }: CustomListBoxCtorParams<ItemT, EmptyT, EmptyM, Model, Store>) {
    super(
      env,
      env.backend.createBox(
        mergeLeft(
          {
            keys: true,
            mouse: true,
            border: {
              type: 'line',
            },
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
    this.flushSelection()
    this.receive({
      type: 'selected',
      item: this.model[this.focusedIndex],
    })
  }

  flushSelection() {
    if (this.model.length === 0) return
    if (this.focusedIndex >= this.model.length)
      this.focusedIndex = this.model.length - 1

    this.model.forEach((item, i) => {
      item.selected = this.focusedIndex === i
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
        color: 'gray',
      })
    }

    this.setFocusable(this.model.length > 0)
    if (this.focusedIndex >= this.children.length) {
      this.prevChild
    }
    this.flushSelection()
  }
}

export class CustomListBoxItem<
  M extends { selected: boolean },
  SM,
> extends Controller<Widget, M, SM> {
  isSelected() {
    return this.model.selected
  }
}
