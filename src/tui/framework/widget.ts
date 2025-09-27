import { LayoutProperty } from './layout'
import { Geometry } from './geometry'
import { Appearance, Border } from './appearance'
import { Interaction } from './interaction'
import { Behavior } from './behavior'

export type UIState = ':focused' | ':selected' | ':disabled'
export type SelectionMode = 'none' | 'single' | 'multi'

export type WidgetOptions = BaseWidgetOptions & StateVariants

export type BaseWidgetOptions = Geometry & Appearance & Interaction & Behavior

export type StateVariants = Partial<Record<UIState, BaseWidgetOptions>>

export type BoxOptions = BaseWidgetOptions & Border

export type ButtonOptions = BaseWidgetOptions & {
  label: string
}

export type CheckboxOptions = BaseWidgetOptions & {}

export type ListOptions = BaseWidgetOptions & {
  items?: string[]
  selectionMode: SelectionMode
}

export type LabelOptions = BaseWidgetOptions & {
  label: string
}

export type TextFieldOptions = BaseWidgetOptions

export interface Widget<O extends WidgetOptions = WidgetOptions> {
  calculatedStyle: BaseWidgetOptions
  widgetOptions: O

  /**
   * Register an event handler that will be called before this Widget
   * renders onto the screen or a virtual buffer of the backend
   * implementation
   */
  onBeforeRender(callback: () => void): void
  /**
   * Force render/re-render of this widget.
   */
  render(): void

  focus(): void
  destroy(): void

  isFocusable(): boolean
  isFocused(): boolean

  children(): Widget[]

  applyStyle(style: BaseWidgetOptions): void
  getStyleOptions(): BaseWidgetOptions
  getAppearance(): Appearance

  get(prop: string): string | number | boolean | undefined
  set(prop: string, value: string | number | undefined): void

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

export interface OptionBarWidget extends Widget<ListOptions> {}

export interface TextFieldWidget extends Widget {
  onSubmit(callback: () => void): void
  onCancel(callback: () => void): void
  getText(): string
}

export interface CheckboxWidget extends Widget {
  isChecked(): boolean
  setChecked(checked: boolean): void
}

/**
 * Narrow an object to only the specified keys, excluding undefined values.
 * This is useful for extracting a subset of properties from an object
 * while ensuring that only defined values are included in the result.
 *
 * @param obj - The source object to narrow down.
 * @param keys - An array of keys to extract from the source object.
 * @returns A new object containing only the specified keys with defined values.
 */
export const narrow = <T, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }
  return result
}
