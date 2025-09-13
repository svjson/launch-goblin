import blessed from 'neo-blessed'

import { Backend } from '../backend'

import {
  BoxOptions,
  ButtonOptions,
  LabelOptions,
  ListOptions,
  TextFieldOptions,
  LabelWidget,
  ListWidget,
  TextFieldWidget,
  Widget,
  WidgetOptions,
} from '../widget'
import {
  BlessedLabelWidget,
  BlessedListWidget,
  BlessedTextFieldWidget,
  BlessedWidget,
} from './widget'
import { initTui } from '../init'
import { destroy } from '../destroy'
import { Geometry } from '../geometry'

export class BlessedBackend implements Backend {
  private screen: blessed.Widgets.Screen

  constructor(screen?: blessed.Widgets.Screen) {
    this.screen = screen ?? blessed.screen()
  }

  static create(): BlessedBackend {
    const screen = initTui()
    return new BlessedBackend(screen)
  }

  dispose() {
    destroy(this.screen)
  }

  render() {
    this.screen.render()
  }

  addRoot(widget: Widget) {
    this.screen.append((widget as BlessedWidget).inner)
  }

  onKey(handler: (ch: string, key: any) => void) {
    this.screen.on('keypress', handler)
  }

  onKeyPress(key: string | string[], handler: (ch: string, key: any) => void) {
    this.screen.key(key, handler)
  }

  createBox(options: BoxOptions): Widget {
    return new BlessedWidget(
      blessed.box(toBlessedBoxOptions(options, this.screen))
    )
  }

  createButton(options: ButtonOptions): Widget {
    return new BlessedWidget(
      blessed.button(toBlessedButtonOptions(options, this.screen))
    )
  }

  createLabel(options: LabelOptions): LabelWidget {
    return new BlessedLabelWidget(
      blessed.text(toBlessedLabelOptions(options, this.screen))
    )
  }

  createList(options: ListOptions): ListWidget {
    return new BlessedListWidget(
      blessed.list({ ...options, parent: this.screen })
    )
  }

  createTextField(options: TextFieldOptions): TextFieldWidget {
    return new BlessedTextFieldWidget(
      blessed.textbox(toBlessedTextFieldOptions(options, this.screen))
    )
  }
}

export const toBlessedGeometry = (geometry: Geometry) => {
  return {
    width: geometry?.width,
    height: geometry?.height,
    top: geometry?.top,
    right: geometry?.right,
    bottom: geometry?.bottom,
    left: geometry?.left,
  }
}

export const toBlessedElementOptions = (
  options: WidgetOptions & { raw?: blessed.Widgets.ElementOptions },
  parent: blessed.Widgets.Node
) => {
  return {
    ...toBlessedGeometry(options),
    ...(options.raw ?? {}),
    ...{ parent },
  }
}

export const toBlessedButtonOptions = (
  options: ButtonOptions,
  parent: blessed.Widgets.Node
) => {
  return toBlessedElementOptions(options, parent)
}

export const toBlessedLabelOptions = (
  options: LabelOptions,
  parent: blessed.Widgets.Node
) => {
  return toBlessedElementOptions(options, parent)
}

export const toBlessedTextFieldOptions = (
  options: TextFieldOptions,
  parent: blessed.Widgets.Node
) => {
  return toBlessedElementOptions(options, parent)
}

export const toBlessedBoxOptions = (
  options: BoxOptions,
  parent: blessed.Widgets.Node
) => {
  return toBlessedElementOptions(options, parent)
}
