import {
  Checkbox,
  CheckboxEvent,
  Controller,
  CtrlCtorParams,
  Label,
} from './framework'
import { mergeLeft } from '@whimbrel/walk'
import { juxt } from '@whimbrel/array'
import { ApplicationState, Project } from '@src/project'
import { CheckboxItem } from './framework/checkbox'
import { Widget } from './framework/widget'
import { resolveComponentStyle } from './framework/theme'
import { SessionComponent } from '@src/project/state'

/**
 * TUI Component containing checkboxes and options for launchable
 * components.
 */
export class ComponentSection extends Controller<
  Widget,
  SessionComponent[],
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

  focusedIndex = 0

  components: SessionComponent[]

  constructor({
    widget: { env, parent, keyMap },
    state: { model = [], store },
  }: CtrlCtorParams<SessionComponent[], ApplicationState>) {
    super(
      env,
      env.backend.createBox({
        width: Math.max(
          4 + ' Select Components to Launch '.length,
          10 +
            Math.max(
              ...model.map(
                (cmp) =>
                  cmp.component.name.length +
                  Math.max(0, ...cmp.component.targets.map((t) => t.length))
              )
            )
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
        component: ComponentItem,
        model: {
          component: c as SessionComponent,
          targetSelectable:
            this.store.get<Project>('project').launchers[0].features
              .componentTargets === 'multi',
          index: i,
        } as ComponentItemModel,
        style: {
          top: i + 1,
          width: '100%-3',
        },
      })
    })

    this.store!.subscribe('config.activeConfigName', () => {
      juxt(this.children, this.components).forEach(([checkbox, cmp]) => {
        ;(checkbox as ComponentItem).setSelected(cmp.state.selected ?? false)
        ;(checkbox as ComponentItem).setTargets(cmp.state.targets ?? ['dev'])
      })
      return true
    })

    this.children[this.focusedIndex]?.focus()
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

export type ComponentItemModel = {
  component: SessionComponent
  targetSelectable: boolean
  index: number
}

class ComponentItem extends Controller<
  Widget,
  ComponentItemModel,
  ApplicationState
> {
  focusable = true

  events = this.defineEvents({
    checkbox: this.onChecked,
  })

  keyMap = this.defineKeys({
    enter: {
      legend: 'Toggle Selection',
      group: 'focused',
      propagate: true,
      handler: () => (this.children[0] as Checkbox).toggle(),
    },
    ...(this.model.targetSelectable
      ? {
          left: {
            legend: 'Cycle target',
            group: 'focused',
            propagate: true,
            handler: () => this.cycleTarget(-1),
          },
          right: {
            legend: 'Cycle target',
            group: 'focused',
            propagate: true,
            handler: this.cycleTarget,
          },
        }
      : {}),
  })

  components = this.defineComponents({
    checkbox: {
      component: Checkbox,
      model: {
        id: this.model.component.component.id,
        label: this.model.component.component.name,
        index: this.model.index,
        checked: this.model.component.state.selected,
      } as CheckboxItem,
      style: {
        left: 1,
        focusable: false,
      },
    },
    target: {
      component: Label,
      model: {
        text: this.model.component.state.targets.join(' '),
      },
      style: {
        right: 0,
        color: 'white',
        ':focused': {
          background: 'blue',
        },
      },
    },
  })

  constructor({
    widget: { env, keyMap, options },
    state: { model },
  }: CtrlCtorParams<ComponentItemModel>) {
    super(
      env,
      env.backend.createBox(
        mergeLeft(
          {
            height: 1,
            top: model.index + 1,
            focusable: true,
          },
          resolveComponentStyle(env.theme, 'CheckBox', env.tty.colorMode),
          options
        )
      ),
      model
    )
    this.inheritKeyMap(keyMap)

    if (!this.model.targetSelectable) {
      this.components.target.hide()
    }
  }

  onChecked(event: CheckboxEvent) {
    this.model.component.state.selected = event.checked
  }

  cycleTarget(amount: number = 1) {
    if (!this.model.targetSelectable) return

    const currentIndex = this.model.component.component.targets.indexOf(
      this.model.component.state.targets[0]
    )

    const newIndex =
      (currentIndex + amount + this.model.component.component.targets.length) %
      this.model.component.component.targets.length

    this.setTargets([this.model.component.component.targets[newIndex]])
  }

  setTargets(targets: string[]) {
    this.model.component.state.targets[0] = targets[0]

    // FIXME: Setting the model should be enough here!
    // this.components.target.model.text =
    //   this.model.component.state.targets.join(' ')
    this.components.target.set(
      'text',
      this.model.component.state.targets.join(' ')
    )
    this.emit('dirty')
  }

  setSelected(sel: boolean) {
    ;(this.children[0] as Checkbox).setSelected(sel)
  }
}
