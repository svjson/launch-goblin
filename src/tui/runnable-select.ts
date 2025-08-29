import { CheckboxController } from './checkbox'
import { CheckboxEvent, Controller, CtrlCtorParams } from './controller'

import blessed from 'neo-blessed'

export class RunnableSelectController extends Controller {
  keyMap = {
    up: {
      propagate: true,
      handler: this.bind(this.moveUp),
    },
    down: {
      propagate: true,
      handler: this.bind(this.moveDown),
    },
  }

  events = {
    checkbox: this.bind(this.onChecked),
  }

  focusedIndex = 0

  constructor({ parent, model, keyMap }: CtrlCtorParams) {
    super(
      blessed.box({
        parent: parent,
        label: ' Select Components to Launch ',
        focusable: true,
        width: '50%',
        height: Math.max(10, model.project.components.length + 4),
        top: '25%',
        left: 'center',
        border: 'line',
        keys: true,
        mouse: true,
        scrollable: true,
        alwaysScroll: true,
      }),
      model
    )
    this.inheritKeyMap(keyMap)

    model.project.components.forEach((c, i) => {
      this.addChild(
        CheckboxController,
        {},
        {
          offsetY: 1,
          id: c.id,
          label: c.name,
          index: i,
          selected: c.selected,
        }
      )
    })

    this.children[this.focusedIndex]?.focus()
  }

  onChecked(event: CheckboxEvent) {
    this.model.project.components[event.item.index].selected = event.checked
  }

  moveUp() {
    this.focusedIndex =
      (this.focusedIndex - 1 + this.children.length) % this.children.length
    this.applySelection()
  }

  moveDown() {
    this.focusedIndex = (this.focusedIndex + 1) % this.children.length
    this.applySelection()
  }

  applySelection() {
    this.children[this.focusedIndex]?.focus()
    this.emit('dirty')
  }
}
