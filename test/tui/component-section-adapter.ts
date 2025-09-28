import {
  ComponentSection,
  ComponentItemModel,
} from '@src/tui/component-section'
import { Controller, HeadlessBackend, Widget } from '@src/tui/framework'
import { CheckboxWidget } from '@src/tui/framework/widget'

export const componentSectionAdapter = (
  section: ComponentSection,
  backend: HeadlessBackend
) => {
  const makeComponentState = (item: Controller<Widget, ComponentItemModel>) => {
    return {
      name: item?.model.component.component.name,
      checked: item?.model.component.state.selected,
    }
  }

  const adapter = {
    section,
    getComponentNames() {
      const items = section.children
      return items.map((item) => {
        return item.model.component.component.name
      })
    },
    getComponentState(index: number) {
      return makeComponentState(section.children[index])
    },
    getComponentStates() {
      return section.children.map(makeComponentState)
    },
    getFocusedCheckboxWidget(): CheckboxWidget | undefined {
      const w = backend.getFocusedWidget()
      if (w) {
        const checkboxIndex = w.children()[0].type === 'checkbox' ? 0 : 1
        return w.children()[checkboxIndex] as CheckboxWidget
      }
    },
    getFocusedComponentName() {
      return adapter.getFocusedCheckboxWidget()?.get('text')
    },
    isFocusedComponentChecked() {
      return adapter.getFocusedCheckboxWidget()?.isChecked()
    },
  }

  return adapter
}

export type ComponentSectionAdapter = ReturnType<typeof componentSectionAdapter>
