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
  ListItem[],
  undefined
> {
  focusable = true

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
                bg: 'white',
                fg: 'black',
                bold: true,
              },
              focus: {
                selected: {
                  bg: 'blue',
                  fg: 'white',
                },
              },
            },
          } as blessed.Widgets.ListOptions<blessed.Widgets.ListElementStyle>,
          options
        )
      ),
      model
    )

    if (this.model.length === 0) {
      this.disable()
    }

    this.widget.on('select item', (_item, index) => {
      this.emit({
        type: 'selected',
        item: this.model[index],
      })
    })

    this.inheritKeyMap(keyMap)
  }
}
