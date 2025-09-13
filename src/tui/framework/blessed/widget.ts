import blessed from 'neo-blessed'
import { LabelWidget, ListWidget, TextFieldWidget, Widget } from '../widget'

import { LayoutProperty } from '../layout'

export type BlessedLmnt = blessed.Widgets.BlessedElement

const accessors: Record<
  LayoutProperty,
  {
    get: (lmnt: BlessedLmnt) => string | number | undefined
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
  width: {
    get: (lmnt) => lmnt.width,
    set: (lmnt, value) => (lmnt.width = value),
  },
  height: {
    get: (lmnt) => lmnt.height,
    set: (lmnt, value) => (lmnt.height = value),
  },
}

export class BlessedWidget<T extends BlessedLmnt = BlessedLmnt>
  implements Widget
{
  constructor(public inner: T) {}

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

  onBeforeRender(handler: () => void) {
    this.inner.onScreenEvent('prerender', handler)
  }

  isFocused(): boolean {
    return this.inner.screen.focused === this.inner
  }

  set(prop: LayoutProperty, value: string | number) {
    accessors[prop]?.set(this.inner, value)
  }

  get(prop: LayoutProperty): string | number | undefined {
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
