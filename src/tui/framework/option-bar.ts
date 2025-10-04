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
    left: {
      propagate: true,
      legend: 'Prev Option',
      category: 'focused',
      handler: this.prevChild,
    },
    right: {
      propagate: true,
      legend: 'Next Option',
      category: 'focused',
      handler: this.nextChild,
    },
    ...(this.widget.widgetOptions.selectionMode === 'multi'
      ? {
          enter: {
            propagate: true,
            legend: 'Toggle',
            category: 'focused',
            handler: this.toggle,
          },
        }
      : {}),
  })

  events = this.defineEvents({
    focus: this.itemFocused,
  })

  focusable = true

  constructor({
    widget: { env, options = { selectionMode: 'single' } },
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
    widget: { env, options },
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
  }

  isSelected() {
    return this.model.selected
  }
}
