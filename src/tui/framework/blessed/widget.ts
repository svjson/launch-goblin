import blessed from 'neo-blessed'
import {
  BaseWidgetOptions,
  CheckboxWidget,
  LabelWidget,
  ListWidget,
  TextFieldWidget,
  Widget,
  WidgetOptions,
  narrow,
} from '../widget'

import { LayoutProperty } from '../layout'
import { Appearance } from '../appearance'
import { APPEARANCE_KEYS, BASE_WIDGET_OPTIONS_KEYS } from '../options'

export type BlessedLmnt = blessed.Widgets.BlessedElement

const accessors: Record<
  LayoutProperty,
  {
    get: (lmnt: BlessedLmnt) => string | number | boolean | undefined
    set: (lmnt: BlessedLmnt, value: string | number) => void
  }
> = {
  top: {
    get: (lmnt) => lmnt.top,
    set: (lmnt, value) => (lmnt.top = value),
  },
  bottom: {
    get: (lmnt) => lmnt.lpos?.yl,
    set: (lmnt, value) => (lmnt.bottom = value),
  },
  left: {
    get: (lmnt) => lmnt.lpos?.xi,
    set: (lmnt, value) => (lmnt.left = value),
  },
  right: {
    get: (lmnt) => lmnt.lpos?.xl,
    set: (lmnt, value) => (lmnt.right = value),
  },
  bg: {
    get: (lmnt) => lmnt.style?.bg,
    set: (lmnt, value: string | number) => (lmnt.style.bg = value),
  },
  fg: {
    get: (lmnt) => lmnt.style?.fg,
    set: (lmnt, value: string | number) => (lmnt.style.fg = value),
  },
  focusable: {
    get: (lmnt) => lmnt.focusable,
    set: (lmnt, value: string | number) => (lmnt.focusable = Boolean(value)),
  },
  'focused:bg': {
    get: (lmnt) => lmnt.style?.focus?.bg,
    set: (lmnt, value: string | number) => (lmnt.style.focus.bg = value),
  },
  'focused:fg': {
    get: (lmnt) => lmnt.style?.focus?.fg,
    set: (lmnt, value: string | number) => (lmnt.style.focus.fg = value),
  },
  'selected:bg': {
    get: (lmnt) => lmnt.style?.select?.bg,
    set: (lmnt, value: string | number) => (lmnt.style.select.bg = value),
  },
  'selected:fg': {
    get: (lmnt) => lmnt.style?.focus?.fg,
    set: (lmnt, value: string | number) => (lmnt.style.focus.fg = value),
  },
  hidden: {
    get: (lmnt) => lmnt.hidden,
    set: (lmnt, value) => (lmnt.hidden = Boolean(value)),
  },
  width: {
    get: (lmnt) => lmnt.width,
    set: (lmnt, value) => (lmnt.width = value),
  },
  height: {
    get: (lmnt) => lmnt.height,
    set: (lmnt, value) => (lmnt.height = value),
  },
  text: {
    get: (lmnt) => lmnt.content,
    set: (lmnt, value) => (lmnt.content = String(value)),
  },
}

export class BlessedWidget<
  T extends BlessedLmnt = BlessedLmnt,
  O extends WidgetOptions = WidgetOptions,
> implements Widget<O>
{
  _children: BlessedWidget[] = []
  calculatedStyle: BaseWidgetOptions
  widgetOptions: O

  constructor(
    public inner: T,
    options: O
  ) {
    this.calculatedStyle = {}
    this.widgetOptions = options
  }

  focus() {
    this.inner.focus()
  }

  render() {
    this.inner.render()
  }

  destroy() {
    this.inner.detach()
    this.inner.destroy()
  }

  children() {
    return this._children
  }

  applyStyle(style: BaseWidgetOptions) {
    this.inner.style = {
      ...this.inner.style,
      ...{
        fg: style.color ?? 'default',
        bg: style.background ?? 'default',
      },
      ...(typeof style.bold === 'boolean' ? { bold: style.bold } : {}),
      ...(typeof this.inner.style.underline === 'boolean' ||
      typeof style.underline === 'boolean'
        ? { underline: style.underline }
        : {}),
      ...(typeof style.focusable === 'boolean'
        ? { focusable: style.focusable }
        : {}),
    }
    this.calculatedStyle = style
  }

  getAppearance(): Appearance {
    return narrow(this.widgetOptions, APPEARANCE_KEYS)
  }

  getStyleOptions(): BaseWidgetOptions {
    return narrow(this.widgetOptions, BASE_WIDGET_OPTIONS_KEYS)
  }

  onBeforeRender(handler: () => void) {
    this.inner.onScreenEvent('prerender', handler)
  }

  isFocusable(): boolean {
    if (!this.inner.screen) return false
    if (this.inner.hidden) return false
    if (this.inner.detached) return false
    if ((this.inner as any).keyable) return true
    if ((this.inner as any).clickable) return true
    if (this.calculatedStyle.focusable) return true
    if (this.inner.focusable) return true
    if (this.inner.style?.focusable) return true
    if (this.inner.options.focusable) return true
    return false
  }
  isFocused(): boolean {
    return this.inner.screen.focused === this.inner
  }

  set(prop: LayoutProperty, value: string | number) {
    accessors[prop]?.set(this.inner, value)
  }

  get(prop: LayoutProperty): string | number | boolean | undefined {
    return accessors[prop]?.get(this.inner)
  }

  setParent(parent: Widget) {
    const blessedParent = parent as BlessedWidget<BlessedLmnt>
    this.inner.detach()
    blessedParent.inner.append(this.inner)
  }

  setLayout(prop: LayoutProperty, value: string | number): void {
    throw new Error('Method not implemented.')
  }
}

export class BlessedCheckboxWidget
  extends BlessedWidget<blessed.Widgets.BoxElement>
  implements CheckboxWidget
{
  private checked: boolean = false

  isChecked(): boolean {
    return this.checked
  }

  setChecked(checked: boolean) {
    this.checked = checked
  }
}

export class BlessedLabelWidget
  extends BlessedWidget<blessed.Widgets.TextElement>
  implements LabelWidget
{
  setText(text: string) {
    this.inner.content = text ?? ''
  }
}

export class BlessedListWidget
  extends BlessedWidget<blessed.Widgets.ListElement>
  implements ListWidget
{
  clearItems() {
    this.inner.clearItems
  }

  select(index: number) {
    this.inner.select(index)
  }

  setItems(items: string[]) {
    this.inner.setItems(items)
  }

  onItemSelected(callback: (item: any, index: number) => void) {
    this.inner.on('select item', callback)
  }
}

export class BlessedTextFieldWidget
  extends BlessedWidget<blessed.Widgets.TextboxElement>
  implements TextFieldWidget
{
  onSubmit(callback: () => void) {
    this.inner.on('submit', callback)
  }
  onCancel(callback: () => void) {
    this.inner.on('cancel', callback)
  }
  getText() {
    return this.inner.content
  }
}
