import { CheckboxController } from './framework/checkbox'
import { CheckboxEvent, Controller, CtrlCtorParams } from './framework'

import blessed from 'neo-blessed'
import { ProjectComponent } from '@src/project'

export class RunnableSelectController extends Controller<
  blessed.Widgets.BoxElement,
  ProjectComponent[]
> {
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

  constructor({ parent, model, keyMap }: CtrlCtorParams<ProjectComponent[]>) {
    super(
      blessed.box({
        parent: parent,
        label: ' Select Components to Launch ',
        focusable: true,
        width: '50%',
        height: Math.max(10, model.length + 4),
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

    model.forEach((c, i) => {
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
    this.model[event.item.index].selected = event.checked
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
