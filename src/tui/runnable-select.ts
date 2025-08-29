import {
  CheckboxController,
  CheckboxEvent,
  Controller,
  createStore,
  CtrlCtorParams,
} from './framework'
import { juxt } from '@whimbrel/array'
import blessed from 'neo-blessed'
import { ProjectComponent } from '@src/project'

export class RunnableSelectController extends Controller<
  blessed.Widgets.BoxElement,
  ProjectComponent[]
> {
  keyMap = {
    up: {
      propagate: true,
      legend: 'Navigate',
      group: 'nav',
      handler: this.bind(this.moveUp),
    },
    down: {
      propagate: true,
      legend: 'Navigate',
      group: 'nav',
      handler: this.bind(this.moveDown),
    },
  }

  events = {
    checkbox: this.bind(this.onChecked),
  }

  focusedIndex = 0

  components: ProjectComponent[]

  constructor({
    parent,
    model = [],
    store,
    keyMap,
  }: CtrlCtorParams<ProjectComponent[]>) {
    super(
      blessed.box({
        parent: parent,
        label: ' Select Components to Launch ',
        focusable: true,
        width: Math.max(
          4 + ' Select Components to Launch '.length,
          10 + Math.max(...model.map((cmp) => cmp.name.length))
        ),
        height: Math.max(10, model.length + 4),
        top: '25%',
        left: 'center',
        border: 'line',
        keys: true,
        mouse: true,
        scrollable: true,
        alwaysScroll: true,
      }),
      store!
    )
    this.inheritKeyMap(keyMap)

    this.components = model

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

    this.store.subscribe('config.activeConfigName', () => {
      juxt(this.children, this.components).forEach(([checkbox, cmp]) => {
        ;(checkbox as CheckboxController).setSelected(cmp.selected ?? false)
      })
      return true
    })

    this.children[this.focusedIndex]?.focus()
  }

  onChecked(event: CheckboxEvent) {
    this.components[event.item.index].selected = event.checked
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
