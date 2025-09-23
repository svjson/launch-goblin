import { Appearance } from '../appearance'
import { LayoutProperty } from '../layout'
import {
  BaseWidgetOptions,
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

export class HeadlessWidget<O extends WidgetOptions = WidgetOptions>
  implements Widget
{
  _children: HeadlessWidget[] = []
  calculatedStyle: BaseWidgetOptions
  widgetOptions: O
  parent?: Widget<WidgetOptions>

  constructor(
    public backend: HeadlessBackend,
    public inner: HeadlessElement,
    options: O
  ) {
    this.calculatedStyle = {}
    this.widgetOptions = options
  }

  onBeforeRender(callback: () => void): void {}
  render(): void {}
  focus(): void {
    this.backend.focused = this
  }

  children() {
    return this._children
  }

  destroy(): void {
    throw new Error('HeadlessWidget::destroy() - Method not implemented.')
  }
  isFocused(): boolean {
    return this.backend.focused === this
  }
  applyStyle(style: BaseWidgetOptions): void {}
  getStyleOptions(): BaseWidgetOptions {
    throw new Error(
      'HeadlessWidget::getStyleOptions() - Method not implemented.'
    )
  }
  getAppearance(): Appearance {
    throw new Error('HeadlessWidget::getAppearance() - Method not implemented.')
  }

  set(prop: string, value: string | number | undefined): void {}
  get(prop: string): string | number | undefined {
    return (this.widgetOptions as any).text || (this.widgetOptions as any).label
  }
  setParent(parent: Widget): void {
    this.parent = parent
    if (!this.parent.children().includes(this)) {
      this.parent.children().push(this)
    }
  }
  setLayout(prop: LayoutProperty, value: string | number): void {
    throw new Error('HeadlessWidget::setLayout() - Method not implemented.')
  }
}

export class HeadlessCheckboxWidget
  extends HeadlessWidget<CheckboxOptions>
  implements CheckboxWidget
{
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

export class HeadlessTextFieldWidget
  extends HeadlessWidget<TextFieldOptions>
  implements TextFieldWidget
{
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
