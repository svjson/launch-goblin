import { Appearance } from '../appearance'
import { LayoutProperty } from '../layout'
import { BaseWidgetOptions, Widget, WidgetOptions } from '../widget'

export type HeadlessElement = {}

export class HeadlessWidget<O extends WidgetOptions = WidgetOptions>
  implements Widget
{
  calculatedStyle: BaseWidgetOptions
  widgetOptions: O

  constructor(
    public inner: HeadlessElement,
    options: O
  ) {
    this.calculatedStyle = {}
    this.widgetOptions = options
  }

  onBeforeRender(callback: () => void): void {}
  render(): void {}
  focus(): void {}
  destroy(): void {
    throw new Error('Method not implemented.')
  }
  isFocused(): boolean {
    throw new Error('Method not implemented.')
  }
  applyStyle(style: BaseWidgetOptions): void {
    throw new Error('Method not implemented.')
  }
  getStyleOptions(): BaseWidgetOptions {
    throw new Error('Method not implemented.')
  }
  getAppearance(): Appearance {
    throw new Error('Method not implemented.')
  }
  set(prop: string, value: string | number | undefined): void {
    throw new Error('Method not implemented.')
  }
  get(prop: string): string | number | undefined {
    throw new Error('Method not implemented.')
  }
  setParent(parent: Widget): void {
    throw new Error('Method not implemented.')
  }
  setLayout(prop: LayoutProperty, value: string | number): void {
    throw new Error('Method not implemented.')
  }
}
