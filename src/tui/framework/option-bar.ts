import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { ListItem } from './list-box'
import { LabelItem } from './label'
import { Widget } from './widget'

export class OptionBar<
  ItemModel extends ListItem = ListItem,
> extends Controller<Widget, ItemModel[], undefined> {
  keyMap = this.extendKeyMap({
    right: {
      propagate: true,
      legend: 'Select Next',
      group: 'nav',
      handler: this.bind(this.nextChild),
    },
    left: {
      propagate: true,
      legend: 'Select Previous',
      group: 'nav',
      handler: this.bind(() => this.nextChild(-1)),
    },
  })

  focusable = true

  constructor({
    widget: { backend, parent, keyMap, options = {} },
    state: { model = [] },
  }: CtrlCtorParams<ItemModel[]>) {
    super(
      backend,
      backend.createBox(
        mergeLeft(
          {
            width: '100%-2',
            height: 1,
            keys: true,
            raw: {
              focusable: true,
            },
          },
          options
        )
      ),
      model
    )
    this.setParent(parent)
    this.inheritKeyMap(keyMap)

    let left = 2
    for (let i = 0; i < this.model.length; i++) {
      const opt = this.model[i]
      this.addChild(
        {
          component: Option,
          model: { text: opt.label },
        },
        {
          left,
        }
      )
      left += opt.label.length + 2
    }
  }

  getSelectedItemId() {
    return this.model[this.focusedIndex].id
  }
}

export class Option<Model extends LabelItem> extends Controller<Widget, Model> {
  focusable = true

  constructor({
    widget: { backend, parent, keyMap, options },
    state: { model = { text: '' } },
  }: CtrlCtorParams) {
    super(
      backend,
      backend.createLabel(
        mergeLeft(
          {
            background: 'default',
            color: 'white',
            ':focused': {
              background: 'blue',
            },
            ':selected': {
              background: 'white',
            },
            keys: true,
            raw: {
              content: ` ${model.text ?? ''} `,
              transparent: true,
              tags: true,
            },
          },
          options
        )
      ),
      model
    )
    this.setParent(parent)

    this.inheritKeyMap(keyMap)
  }
}
