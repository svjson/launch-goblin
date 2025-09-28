import { Appearance } from '../appearance'
import { BackendCallback } from '../backend'
import { LayoutProperty } from '../layout'
import {
  BaseWidgetOptions,
  BoxOptions,
  ButtonOptions,
  CheckboxOptions,
  CheckboxWidget,
  LabelOptions,
  LabelWidget,
  ListOptions,
  ListWidget,
  TextFieldOptions,
  TextFieldWidget,
  Widget,
  WidgetOptions,
} from '../widget'
import { HeadlessBackend } from './backend'

export type HeadlessElement = {}

export abstract class HeadlessWidget<O extends WidgetOptions = WidgetOptions>
  implements Widget<O>
{
  abstract type: string
  _children: HeadlessWidget[] = []
  calculatedStyle: BaseWidgetOptions
  widgetOptions: O
  parent?: Widget<WidgetOptions>

  preRenderListeners: BackendCallback[] = []

  constructor(
    public backend: HeadlessBackend,
    public inner: HeadlessElement,
    options: O
  ) {
    this.calculatedStyle = {}
    this.widgetOptions = options
  }

  onBeforeRender(callback: BackendCallback) {
    this.preRenderListeners.push(callback)
  }
  render(): void {
    this.preRenderListeners.forEach((l) => l())
    this._children.forEach((c) => c.render())
  }
  focus(): void {
    this.backend.focused = this
  }

  children() {
    return this._children
  }

  removeChild(widget: Widget) {
    this._children = this._children.filter((c) => c !== widget)
  }

  destroy(): void {
    this._children.forEach((c) => {
      c.destroy()
    })
    ;(this.parent as HeadlessWidget)?.removeChild(this)
  }
  isFocusable(): boolean {
    return typeof this.widgetOptions.focusable === 'boolean'
      ? this.widgetOptions.focusable
      : false
  }
  isFocused(): boolean {
    return this.backend.focused === this
  }
  applyStyle(_style: BaseWidgetOptions): void {}
  getStyleOptions(): BaseWidgetOptions {
    throw new Error(
      'HeadlessWidget::getStyleOptions() - Method not implemented.'
    )
  }
  getAppearance(): Appearance {
    throw new Error('HeadlessWidget::getAppearance() - Method not implemented.')
  }

  set(prop: string, value: string | number | undefined): void {
    if (prop === 'focusable') {
      this.widgetOptions.focusable = Boolean(value)
    }
  }
  get(_prop: string): string | number | undefined {
    return (this.widgetOptions as any).text || (this.widgetOptions as any).label
  }
  setParent(parent: Widget): void {
    this.parent = parent
    if (!this.parent.children().includes(this)) {
      this.parent.children().push(this)
    }
  }
  setLayout(_prop: LayoutProperty, _value: string | number): void {
    throw new Error('HeadlessWidget::setLayout() - Method not implemented.')
  }
}

export class HeadlessBoxWidget
  extends HeadlessWidget<BoxOptions>
  implements Widget
{
  type: 'box' = 'box'
}

export class HeadlessButtonWidget
  extends HeadlessWidget<ButtonOptions>
  implements Widget
{
  type: 'button' = 'button'
}

export class HeadlessCheckboxWidget
  extends HeadlessWidget<CheckboxOptions>
  implements CheckboxWidget
{
  type: 'checkbox' = 'checkbox'
  text: string = ''
  checked: boolean = false

  get(prop: string): string | number | undefined {
    if (prop === 'text') {
      return this._children[1]?.get('text')
    }
    return super.get(prop)
  }

  isChecked(): boolean {
    return this.checked
  }

  setChecked(checked: boolean) {
    this.checked = checked
  }

  setText(text: string): void {
    this.text = text
  }
}

export class HeadlessLabelWidget
  extends HeadlessWidget<LabelOptions>
  implements LabelWidget
{
  type: 'label' = 'label'
  text: string = ''

  get(prop: string): string | number | undefined {
    if (prop === 'text') {
      return this.widgetOptions.label
    }
    return super.get(prop)
  }

  setText(text: string): void {
    this.text = text
  }
}

export class HeadlessListWidget
  extends HeadlessWidget<ListOptions>
  implements ListWidget
{
  type: 'list' = 'list'

  clearItems(): void {
    throw new Error('HeadlessLabelWidget::clearItems - Method not implemented.')
  }
  select(index: number): void {
    throw new Error('HeadlessLabelWidget::select - Method not implemented.')
  }
  setItems(items: string[]): void {
    throw new Error('HeadlessLabelWidget::setItems - Method not implemented.')
  }
  onItemSelected(callback: (item: any, index: number) => void): void {
    throw new Error(
      'HeadlessLabelWidget::onItemSelected - Method not implemented.'
    )
  }
}

export class HeadlessOptionBarWidget
  extends HeadlessWidget<ListOptions>
  implements Widget
{
  type: 'option-bar' = 'option-bar'
}

export class HeadlessTextFieldWidget
  extends HeadlessWidget<TextFieldOptions>
  implements TextFieldWidget
{
  type: 'text-field' = 'text-field'

  onSubmit(callback: () => void): void {
    throw new Error(
      'HeadlessTextFieldWidget::onSubmit() - Method not implemented.'
    )
  }
  onCancel(callback: () => void): void {
    throw new Error(
      'HeadlessTextFieldWidget::onCancel() - Method not implemented.'
    )
  }
  getText(): string {
    throw new Error(
      'HeadlessTextFieldWidget::getText() - Method not implemented.'
    )
  }
}
