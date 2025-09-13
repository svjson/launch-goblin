import blessed from 'neo-blessed'
import { LayoutProperty } from './layout'
import { Geometry } from './geometry'

export type WidgetOptions = Geometry & { raw?: blessed.Widgets.ElementOptions }

export type BoxOptions = WidgetOptions & { raw?: blessed.Widgets.BoxOptions }
export type ButtonOptions = WidgetOptions & {
  raw: blessed.Widgets.ButtonOptions
}
export type ListOptions = WidgetOptions & {
  raw: blessed.Widgets.ListOptions<blessed.Widgets.ListElementStyle>
}
export type LabelOptions = WidgetOptions & { raw: blessed.Widgets.TextOptions }
export type TextFieldOptions = WidgetOptions & {
  raw: blessed.Widgets.TextboxOptions
}

export interface Widget {
  /**
   * Register an event handler that will be called before this Widget
   * renders onto the screen or a virtual buffer of the backend
   * implemntation
   */
  onBeforeRender(callback: () => void): void
  /**
   * Force render/re-render of this widget.
   */
  render(): void

  focus(): void
  destroy(): void

  isFocused(): boolean

  set(prop: string, value: string | number | undefined): void
  get(prop: string): string | number | undefined

  setParent(parent: Widget): void
  setLayout(prop: LayoutProperty, value: string | number): void
}

export interface LabelWidget extends Widget {
  setText(text: string): void
}

export interface ListWidget extends Widget {
  clearItems(): void
  select(index: number): void
  setItems(items: string[]): void
  onItemSelected(callback: (item: any, index: number) => void): void
}

export interface TextFieldWidget extends Widget {
  onSubmit(callback: () => void): void
  onCancel(callback: () => void): void
  getText(): string
}
