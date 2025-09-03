import blessed from 'neo-blessed'
import { mergeLeft } from '@whimbrel/walk'

import { Controller, CtrlCtorParams } from './controller'
import { Label } from './label'

export interface CheckboxItem {
  id: string
  label: string
  index: number
  checked: boolean
}

export class Checkbox<I extends CheckboxItem = CheckboxItem> extends Controller<
  blessed.Widgets.BoxElement,
  I
> {
  keyMap = {
    enter: {
      legend: 'Toggle Selection',
      group: 'focused',
      handler: this.bind(this.toggle),
    },
  }

  box: Label
  label: Label

  focusable = true

  constructor({ parent, model, keyMap, options }: CtrlCtorParams) {
    super(
      blessed.box(
        mergeLeft(
          {
            parent: parent,
            left: 1,
            height: 1,
            width: '100%',
            mouse: true,
            keys: true,
            shrink: true,
            padding: { left: 1 },
            style: {
              fg: 'gray',
              focus: { bg: 'blue', fg: 'black' },
            },
          },
          options
        )
      ),
      model
    )
    this.inheritKeyMap(keyMap)

    const currBg = () => {
      return this.widget.screen.focused === this.widget
        ? this.widget.style.focus.bg
        : this.widget.style.bg
    }

    this.box = this.addChild(
      {
        component: Label,
        model: {
          text: this.makeBoxContent(),
        },
      },
      {
        style: {
          fg: 'white',
        },
      }
    )
    this.box.layout.bind('bg', currBg)
    this.box.layout.bind('fg', () =>
      this.model.checked ? '#ffffff' : '#888888'
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
    this.label.layout.bind('bg', currBg)
    this.label.layout.bind('fg', () =>
      this.model.checked
        ? 'white'
        : this.widget.screen.focused === this.widget
          ? this.widget.style.focus.fg
          : this.widget.style.fg
    )

    this.inheritKeyMap(keyMap)
  }

  toggle() {
    this.setSelected(!this.model.checked)
  }

  makeBoxContent() {
    return `[${this.model.checked ? '{green-fg}{bold}✔{/}{/}' : ' '}]`
  }

  setSelected(selected: boolean) {
    this.model.checked = selected
    this.box.setText(this.makeBoxContent())
    this.widget.style.fg = this.model.checked ? 'white' : 'gray'
    this.emit('dirty')
    this.emit({
      type: 'checkbox',
      item: this.model,
      checked: this.model.checked,
    })
  }
}
