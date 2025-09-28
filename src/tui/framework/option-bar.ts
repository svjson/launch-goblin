import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { OptionBarWidget, Widget } from './widget'
import { resolveComponentStyle } from './theme'

export interface OptionItem {
  id: string
  label: string
  selected: boolean
}

export class OptionBar<
  ItemModel extends OptionItem = OptionItem,
> extends Controller<OptionBarWidget, ItemModel[], undefined> {
  keyMap = this.defineKeys({
    right: {
      propagate: true,
      legend: 'Next',
      group: 'nav',
      handler: this.nextChild,
    },
    left: {
      propagate: true,
      legend: 'Previous',
      group: 'nav',
      handler: this.prevChild,
    },
    enter: {
      propagate: true,
      legend: 'Toggle',
      group: 'focused',
      handler: this.toggle,
    },
  })

  events = this.defineEvents({
    focus: this.itemFocused,
  })

  focusable = true

  constructor({
    widget: { env, keyMap, options = { selectionMode: 'single' } },
    state: { model = [] },
  }: CtrlCtorParams<ItemModel[], undefined, OptionBarWidget>) {
    super(
      env,
      env.backend.createOptionBar(
        mergeLeft(
          {
            height: 1,
            keys: true,
            focusable: true,
          },
          options
        )
      ),
      model
    )
    this.inheritKeyMap(keyMap)

    if (
      options.selectionMode === 'single' &&
      this.model.length &&
      !this.model.some((o) => o.selected)
    ) {
      this.model[0].selected = true
    }

    let left = 0
    for (let i = 0; i < this.model.length; i++) {
      const opt = this.model[i]
      this.addChild({
        component: Option,
        model: opt,
        style: {
          left,
          focusable: this.widget.widgetOptions.focusable ?? true,
        },
      })
      left += opt.label.length + 2
    }
  }

  getSelectedItemId() {
    return this.model[this.focusedIndex].id
  }

  toggle() {
    if (this.widget.widgetOptions.selectionMode === 'multi') {
      this.model[this.focusedIndex].selected =
        !this.model[this.focusedIndex].selected
    }
  }

  itemFocused() {
    if (this.widget.widgetOptions.selectionMode === 'single') {
      this.model.forEach((item, i) => {
        item.selected = this.focusedIndex === i
      })
    }
  }
}

export class Option<Model extends OptionItem> extends Controller<
  Widget,
  Model
> {
  focusable = true

  constructor({
    widget: { env, keyMap, options },
    state: { model = { text: '' } },
  }: CtrlCtorParams) {
    super(
      env,
      env.backend.createLabel(
        mergeLeft(
          {
            label: ` ${model.label ?? ''} `,
            keys: true,
            focusable: true,
          },
          resolveComponentStyle(env.theme, 'Option', env.tty.colorMode),
          options
        )
      ),
      model
    )

    this.inheritKeyMap(keyMap)
  }

  isSelected() {
    return this.model.selected
  }
}
