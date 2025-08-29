import blessed from 'neo-blessed'

import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { createStore } from './store'

export interface ListItem {
  id: string
  label: string
}

export class ListBox extends Controller<
  blessed.Widgets.ListElement,
  ListItem[]
> {
  focusable = true

  items: ListItem[]

  constructor({
    parent,
    model = [],
    keyMap,
    options = {},
  }: CtrlCtorParams<ListItem[]>) {
    super(
      blessed.list(
        mergeLeft(
          {
            parent,
            width: 4 + Math.max(...model.map((item) => item.label.length)),
            align: 'left',
            items: model!.map((item) => item.label),
            keys: true,
            style: {
              selected: {
                bg: 'green',
                fg: 'black',
                bold: true,
              },
            },
          } as blessed.Widgets.ListOptions<blessed.Widgets.ListElementStyle>,
          options
        )
      ),
      createStore(model)
    )
    this.items = model

    if (this.items.length === 0) {
      this.disable()
    }

    this.widget.on('select item', (_item, index) => {
      this.emit({
        type: 'selected',
        item: this.items[index],
      })
    })

    this.inheritKeyMap(keyMap)
  }
}
