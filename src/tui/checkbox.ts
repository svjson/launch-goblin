import blessed from 'neo-blessed'

import { Controller, CtrlCtorParams } from './controller'

export interface SelectableItem {
  id: string
  label: string
  index: number
  offsetY: number
  selected: boolean
}

export class CheckboxController extends Controller<blessed.Widgets.CheckboxElement> {
  item: SelectableItem

  keyMap = {}

  constructor({ parent, model, keyMap }: CtrlCtorParams, item: SelectableItem) {
    super(
      blessed.checkbox({
        parent: parent,
        checked: item.selected,
        top: item.index + (item.offsetY ?? 0),
        left: 1,
        height: 1,
        mouse: true,
        keys: true,
        shrink: true,
        padding: { left: 1 },
        content: item.label,
        style: {
          focus: { bg: 'blue' },
        },
      }),
      model
    )
    this.widget.onScreenEvent('render', () => {
      const dirty = this.item.selected !== this.widget.checked
      this.item.selected = this.widget.checked
      this.widget.style.fg = this.widget.checked ? 'white' : 'gray'
      this.emit({
        type: 'checkbox',
        item: this.item,
        checked: this.widget.checked,
      })
      if (dirty) this.emit('dirty')
    })
    this.item = item

    this.inheritKeyMap(keyMap)

    this.applyKeyMap()
  }
}
