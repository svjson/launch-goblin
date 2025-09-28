import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { Label } from './label'
import { CheckboxWidget } from './widget'
import { resolveComponentStyle } from './theme'

export interface CheckboxItem {
  id: string
  label: string
  index: number
  checked: boolean
}

export class Checkbox<I extends CheckboxItem = CheckboxItem> extends Controller<
  CheckboxWidget,
  I
> {
  keyMap = this.defineKeys({
    enter: {
      legend: 'Toggle Selection',
      group: 'focused',
      handler: this.toggle,
    },
  })

  box: Label
  label: Label

  focusable = true

  constructor({ widget: { env, options }, state: { model } }: CtrlCtorParams) {
    super(
      env,
      env.backend.createCheckbox(
        mergeLeft(
          {
            left: 1,
            height: 1,
            width: '100%',
            padding: { left: 1 },
            mouse: true,
            keys: true,
            focusable: true,
          },
          resolveComponentStyle(env.theme, 'CheckBox', env.tty.colorMode),
          options
        )
      ),
      model
    )

    this.box = this.addChild({
      component: Label,
      model: {
        text: this.makeBoxContent(),
      },
      style: {
        color: 'white',
      },
    })

    this.label = this.addChild({
      component: Label,
      model: {
        text: this.model.label,
      },
      style: {
        left: 4,
      },
    })

    this.setSelected(this.model.checked)
  }

  toggle() {
    this.setSelected(!this.model.checked)
  }

  isSelected() {
    return this.model.checked
  }

  makeBoxContent() {
    return `[${this.model.checked ? '{green-fg}{bold}✔{/}{/}' : ' '}]`
  }

  setSelected(selected: boolean) {
    if (selected === this.model.checked && selected === this.widget.isChecked())
      return
    this.widget.setChecked(selected)
    this.model.checked = selected
    this.box.setText(this.makeBoxContent())
    this.emit('dirty')
    this.emit({
      type: 'checkbox',
      item: this.model,
      checked: this.model.checked,
    })
  }
}
