import blessed from 'neo-blessed'

import {
  Backend,
  BoxOptions,
  ButtonOptions,
  LabelOptions,
  ListOptions,
  TextFieldOptions,
} from '../backend'
import { LabelWidget, ListWidget, TextFieldWidget, Widget } from '../widget'
import {
  BlessedLabelWidget,
  BlessedListWidget,
  BlessedTextFieldWidget,
  BlessedWidget,
} from './widget'
import { initTui } from '../init'
import { destroy } from '../destroy'

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
    return new BlessedWidget(blessed.box({ ...options, parent: this.screen }))
  }

  createButton(options: ButtonOptions): Widget {
    return new BlessedWidget(
      blessed.button({ ...options, parent: this.screen })
    )
  }

  createLabel(options: LabelOptions): LabelWidget {
    return new BlessedLabelWidget(
      blessed.text({ ...options, parent: this.screen })
    )
  }

  createList(options: ListOptions): ListWidget {
    return new BlessedListWidget(
      blessed.list({ ...options, parent: this.screen })
    )
  }

  createTextField(options: TextFieldOptions): TextFieldWidget {
    return new BlessedTextFieldWidget(
      blessed.textbox({ ...options, parent: this.screen })
    )
  }
}
