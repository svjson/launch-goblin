import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { Widget } from './widget'
import { resolveComponentStyle } from './theme'

export interface OptionItem {
  id: string
  label: string
  selected: boolean
}

export class OptionBar<
  ItemModel extends OptionItem = OptionItem,
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

  events = this.extendEvents({
    focus: this.bind(this.itemFocused),
  })

  focusable = true

  constructor({
    widget: { env, parent, keyMap, options = {} },
    state: { model = [] },
  }: CtrlCtorParams<ItemModel[]>) {
    super(
      env,
      env.backend.createBox(
        mergeLeft(
          {
            width: '100%-2',
            height: 1,
            keys: true,
            focusable: true,
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
          model: opt,
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

  itemFocused() {
    this.model.forEach((item, i) => {
      item.selected = this.focusedIndex === i
    })
  }
}

export class Option<Model extends OptionItem> extends Controller<
  Widget,
  Model
> {
  focusable = true

  constructor({
    widget: { env, parent, keyMap, options },
    state: { model = { text: '' } },
  }: CtrlCtorParams) {
    super(
      env,
      env.backend.createLabel(
        mergeLeft(
          {
            label: ` ${model.label ?? ''} `,
            keys: true,
          },
          resolveComponentStyle(env.theme, 'Option', env.tty.colorMode),
          options
        )
      ),
      model
    )
    this.setParent(parent)

    this.inheritKeyMap(keyMap)
  }

  isSelected() {
    return this.model.selected
  }
}
