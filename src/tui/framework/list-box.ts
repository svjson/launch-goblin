import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlConstructor, CtrlCtorParams } from './controller'
import { ListWidget, Widget } from './widget'

export interface ListItem {
  id: string
  label: string
}

export class ListBox<ItemModel extends ListItem = ListItem> extends Controller<
  ListWidget,
  ItemModel[],
  undefined
> {
  focusable = true

  constructor({
    widget: { backend, parent, keyMap, options = {} },
    state: { model = [] },
  }: CtrlCtorParams<ItemModel[]>) {
    super(
      backend,
      backend.createList(
        mergeLeft(
          {
            parent,
            width: 4 + Math.max(...model.map((item) => item.label.length)),
            align: 'left',
            items: [],
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
          },
          options
        )
      ),
      model
    )

    if (this.model.length === 0) {
      this.disable()
    }

    this.widget.onItemSelected((_item, index) => {
      this.focusedIndex = index
      this.emit({
        type: 'selected',
        item: this.model[index],
      })
    })

    this.inheritKeyMap(keyMap)
  }

  getSelectedItem() {
    return this.model[this.focusedIndex]
  }

  clearItems() {
    this.widget.clearItems()
    this.children = []
  }

  setItems(
    items: ItemModel[],
    component?: CtrlConstructor<any, ItemModel, any>
  ) {
    this.model = items
    if (component) {
      this.children = []
      items.forEach((item) => {
        this.addChild({
          component: component,
          model: item,
        })
      })
    }

    const listItems = this.model.map((item) => item.label)

    this.widget.setItems(listItems)
    if (this.model.length > 0) {
      if (this.focusedIndex >= this.model.length)
        this.focusedIndex = this.model.length - 1

      this.widget.select(this.focusedIndex)
    }
    this.widget.render()
  }
}
