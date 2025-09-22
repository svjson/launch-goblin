import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { Label } from './label'
import { Widget } from './widget'
import { resolveComponentStyle } from './theme'

export interface CheckboxItem {
  id: string
  label: string
  index: number
  checked: boolean
}

export class Checkbox<I extends CheckboxItem = CheckboxItem> extends Controller<
  Widget,
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

  constructor({
    widget: { env, parent, keyMap, options },
    state: { model },
  }: CtrlCtorParams) {
    super(
      env,
      env.backend.createBox(
        mergeLeft(
          {
            left: 1,
            height: 1,
            width: '100%',
            padding: { left: 1 },
            mouse: true,
            keys: true,
          },
          resolveComponentStyle(env.theme, 'CheckBox', env.tty.colorMode),
          options
        )
      ),
      model
    )
    this.inheritKeyMap(keyMap)

    this.box = this.addChild(
      {
        component: Label,
        model: {
          text: this.makeBoxContent(),
        },
      },
      {
        color: 'white',
      }
    )

    this.label = this.addChild(
      {
        component: Label,
        model: {
          text: this.model.label,
        },
      },
      {
        left: 4,
      }
    )

    this.inheritKeyMap(keyMap)
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
