import {
  Checkbox,
  CheckboxEvent,
  Controller,
  CtrlCtorParams,
} from './framework'
import { juxt } from '@whimbrel/array'
import { ApplicationState, ProjectComponent } from '@src/project'
import { CheckboxItem } from './framework/checkbox'
import { Widget } from './framework/widget'

/**
 * TUI Component containing checkboxes and options for launchable
 * components.
 */
export class ComponentSection extends Controller<
  Widget,
  ProjectComponent[],
  ApplicationState
> {
  keyMap = this.defineKeys({
    up: {
      propagate: true,
      legend: 'Navigate',
      group: 'nav',
      handler: this.moveUp,
    },
    down: {
      propagate: true,
      legend: 'Navigate',
      group: 'nav',
      handler: this.moveDown,
    },
  })

  events = this.defineEvents({
    checkbox: this.onChecked,
  })

  focusedIndex = 0

  components: ProjectComponent[]

  constructor({
    widget: { env, parent, keyMap },
    state: { model = [], store },
  }: CtrlCtorParams<ProjectComponent[], ApplicationState>) {
    super(
      env,
      env.backend.createBox({
        width: Math.max(
          4 + ' Select Components to Launch '.length,
          10 + Math.max(...model.map((cmp) => cmp.name.length))
        ),
        height: Math.max(10, model.length + 4),
        top: '25%',
        left: 'center',
        keys: true,
        mouse: true,
        border: {
          type: 'line',
          label: ' Select Components to Launch ',
        },
        focusable: true,
        scrollable: true,
        alwaysScroll: true,
      }),
      model,
      store
    )
    this.setParent(parent)
    this.inheritKeyMap(keyMap)

    this.components = model

    model.forEach((c, i) => {
      this.addChild({
        component: Checkbox,
        model: {
          id: c.id,
          label: c.name,
          index: i,
          checked: c.selected,
        } as CheckboxItem,
        style: {
          top: i + 1,
        },
      })
    })

    this.store!.subscribe('config.activeConfigName', () => {
      juxt(this.children, this.components).forEach(([checkbox, cmp]) => {
        ;(checkbox as Checkbox).setSelected(cmp.selected ?? false)
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
