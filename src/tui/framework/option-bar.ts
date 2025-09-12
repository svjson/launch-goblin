import blessed from 'neo-blessed'
import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { ListItem } from './list-box'
import { LabelItem } from './label'

export class OptionBar<
  ItemModel extends ListItem = ListItem,
> extends Controller<blessed.Widgets.BoxElement, ItemModel[], undefined> {
  keyMap = this.extendKeyMap({
    left: {
      propagate: true,
      legend: 'Select Previous',
      group: 'nav',
      handler: this.bind(() => this.nextChild(-1)),
    },
    right: {
      propagate: true,
      legend: 'Select Next',
      group: 'nav',
      handler: this.bind(this.nextChild),
    },
  })

  focusable = true

  constructor({
    parent,
    model = [],
    keyMap,
    options = {},
  }: CtrlCtorParams<ItemModel[]>) {
    super(
      blessed.box(
        mergeLeft(
          {
            parent,
            width: '100%-2',
            height: 1,
            focusable: true,
            keys: true,
          },
          options
        )
      ),
      model
    )
    this.inheritKeyMap(keyMap)

    let left = 2
    for (let i = 0; i < this.model.length; i++) {
      const opt = this.model[i]
      const child = this.addChild(
        {
          component: Option,
          model: { text: opt.label },
        },
        {
          left,
        }
      )
      left += opt.label.length + 2
      child.layout.bind('bg', () =>
        this.widget.screen.focused === child.getWidget()
          ? 'blue'
          : this.focusedIndex === i
            ? 'white'
            : ''
      )

      child.layout.bind('fg', () =>
        this.focusedIndex === i ? 'black' : 'white'
      )
    }
  }

  getSelectedItemId() {
    return this.model[this.focusedIndex].id
  }
}

export class Option<Model extends LabelItem> extends Controller<
  blessed.Widgets.TextElement,
  Model
> {
  focusable = true

  constructor({
    parent,
    model = { text: '' },
    keyMap,
    options,
  }: CtrlCtorParams) {
    super(
      blessed.text(
        mergeLeft(
          {
            parent: parent,
            content: ` ${model.text ?? ''} `,
            transparent: true,
            tags: true,
            keys: true,
            style: {
              focus: {
                bg: 'blue',
              },
              select: {
                bg: 'white',
              },
            },
          },
          options
        )
      ),
      model
    )

    this.inheritKeyMap(keyMap)
  }
}
