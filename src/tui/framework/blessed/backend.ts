import blessed from 'neo-blessed'

import { Backend } from '../backend'

import {
  BoxOptions,
  ButtonOptions,
  CheckboxWidget,
  LabelOptions,
  ListOptions,
  TextFieldOptions,
  LabelWidget,
  ListWidget,
  TextFieldWidget,
  Widget,
  CheckboxOptions,
  OptionBarWidget,
} from '../widget'
import {
  BlessedBoxWidget,
  BlessedButtonWidget,
  BlessedCheckboxWidget,
  BlessedLabelWidget,
  BlessedListWidget,
  BlessedOptionBarWidget,
  BlessedTextFieldWidget,
  BlessedWidget,
} from './widget'
import { initTui } from './init'
import { destroy } from './destroy'
import { TTYEnv } from '../environment'
import {
  toBlessedBoxOptions,
  toBlessedButtonOptions,
  toBlessedLabelOptions,
  toBlessedListOptions,
  toBlessedTextFieldOptions,
} from './style'

export const withParent = (opts: any, parent: blessed.Widgets.Node) => {
  opts.parent = parent
  return opts
}

export class BlessedBackend implements Backend {
  private screen: blessed.Widgets.Screen

  constructor(screen?: blessed.Widgets.Screen) {
    this.screen = screen ?? blessed.screen()
  }

  static create(ttyEnv: TTYEnv): BlessedBackend {
    const screen = initTui(ttyEnv)
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

  onBeforeRender(handler: () => void): void {
    this.screen.on('prerender', handler)
  }

  onKey(handler: (ch: string, key: any) => void) {
    this.screen.on('keypress', handler)
  }

  onKeyPress(key: string | string[], handler: (ch: string, key: any) => void) {
    this.screen.key(key, handler)
  }

  createBox(options: BoxOptions): Widget {
    return new BlessedBoxWidget(
      blessed.box(withParent(toBlessedBoxOptions(options), this.screen)),
      options
    )
  }

  createButton(options: ButtonOptions): Widget {
    return new BlessedButtonWidget(
      blessed.button(withParent(toBlessedButtonOptions(options), this.screen)),
      options
    )
  }

  createCheckbox(options: CheckboxOptions): CheckboxWidget {
    return new BlessedCheckboxWidget(
      blessed.box(withParent(toBlessedBoxOptions(options), this.screen)),
      options
    )
  }

  createLabel(options: LabelOptions): LabelWidget {
    return new BlessedLabelWidget(
      blessed.text(withParent(toBlessedLabelOptions(options), this.screen)),
      options
    )
  }

  createList(options: ListOptions): ListWidget {
    return new BlessedListWidget(
      blessed.list(withParent(toBlessedListOptions(options), this.screen)),
      options
    )
  }

  createOptionBar(options: ListOptions): OptionBarWidget {
    return new BlessedOptionBarWidget(
      blessed.box(withParent(toBlessedListOptions(options), this.screen)),
      options
    )
  }

  createTextField(options: TextFieldOptions): TextFieldWidget {
    return new BlessedTextFieldWidget(
      blessed.textbox(
        withParent(toBlessedTextFieldOptions(options), this.screen)
      ),
      options
    )
  }
}
