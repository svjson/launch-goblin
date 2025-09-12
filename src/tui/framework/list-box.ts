import blessed from 'neo-blessed'

import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlConstructor, CtrlCtorParams } from './controller'

export interface ListItem {
  id: string
  label: string
}

export class ListBox<ItemModel extends ListItem = ListItem> extends Controller<
  blessed.Widgets.ListElement,
  ItemModel[],
  undefined
> {
  focusable = true

  constructor({
    parent,
    model = [],
    keyMap,
    options = {},
  }: CtrlCtorParams<ItemModel[]>) {
    super(
      blessed.list(
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

    const listItems = this.children.length
      ? this.children.map((child) => child.getWidget())
      : this.model.map((item) => item.label)

    this.widget.setItems(listItems)
    if (this.model.length > 0) {
      if (this.focusedIndex >= this.model.length)
        this.focusedIndex = this.model.length - 1

      this.widget.select(this.focusedIndex)
    }
    this.widget.render()
  }
}
