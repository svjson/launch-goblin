import blessed from 'neo-blessed'
import { mergeLeft } from '@whimbrel/walk'

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
  WidgetOptions,
  CheckboxOptions,
} from '../widget'
import {
  BlessedCheckboxWidget,
  BlessedLabelWidget,
  BlessedListWidget,
  BlessedTextFieldWidget,
  BlessedWidget,
} from './widget'
import { initTui } from '../init'
import { destroy } from './destroy'
import { Geometry } from '../geometry'
import { Appearance, BorderOptions } from '../appearance'
import { Interaction } from '../interaction'
import { Behavior } from '../behavior'

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
    return new BlessedWidget(
      blessed.box(toBlessedBoxOptions(options, this.screen)),
      options
    )
  }

  createButton(options: ButtonOptions): Widget {
    return new BlessedWidget(
      blessed.button(toBlessedButtonOptions(options, this.screen)),
      options
    )
  }

  createCheckbox(options: CheckboxOptions): CheckboxWidget {
    return new BlessedCheckboxWidget(
      blessed.box(toBlessedBoxOptions(options, this.screen)),
      options
    )
  }

  createLabel(options: LabelOptions): LabelWidget {
    return new BlessedLabelWidget(
      blessed.text(toBlessedLabelOptions(options, this.screen)),
      options
    )
  }

  createList(options: ListOptions): ListWidget {
    return new BlessedListWidget(
      blessed.list(toBlessedListOptions(options, this.screen)),
      options
    )
  }

  createTextField(options: TextFieldOptions): TextFieldWidget {
    return new BlessedTextFieldWidget(
      blessed.textbox(toBlessedTextFieldOptions(options, this.screen)),
      options
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

const ifPresent = (options: any, key: string, target?: string) => {
  if (options?.[key] === undefined) return {}
  if (target === undefined) target = key
  return {
    [target]: options[key],
  }
}

export const toBlessedInteraction = (interaction: Interaction) => {
  return {
    mouse: interaction.mouse,
    keys: interaction.keys,
  }
}

export const toBlessedBehavior = (behavior: Behavior) => {
  return {
    ...ifPresent(behavior, 'focusable'),
    ...ifPresent(behavior, 'scrollable'),
    ...ifPresent(behavior, 'alwaysScroll'),
  }
}

export const toBlessedBorderOptions = (
  options?: BorderOptions | 'none'
): blessed.Widgets.ElementOptions => {
  if (!options || options === 'none') return {}
  return {
    border: options.type === 'line' ? 'line' : 'bg',
    ...(options.label ? { label: options.label } : {}),
    style: {
      border: {
        ...(options.color ? { fg: options.color } : {}),
        ...(options.background ? { bg: options.background } : {}),
      },
    },
  }
}

export const toBlessedElementOptions = (
  options: WidgetOptions & { raw?: blessed.Widgets.ElementOptions },
  parent: blessed.Widgets.Node
): blessed.Widgets.ElementOptions => {
  return mergeLeft(
    {
      ...toBlessedGeometry(options),
      ...toBlessedInteraction(options),
      ...toBlessedBehavior(options),
      ...(options.raw ?? {}),
      ...{ parent },
      tags: true,
    },
    toBlessedStyle(options)
  ) as blessed.Widgets.ElementOptions
}

export const toBlessedStateStyle = (state: string, options?: Appearance) => {
  if (!options) return {}
  const stateStyle = {
    ...(options.color ? { fg: options.color } : {}),
    ...(options.background ? { bg: options.background } : {}),
  }
  if (Object.keys(stateStyle).length === 0) return {}
  return {
    [state]: stateStyle,
  }
}

export const toBlessedStyle = (
  options: WidgetOptions
): blessed.Widgets.ElementOptions => {
  return {
    ...(options.textAlign ? { align: options.textAlign } : {}),
    style: {
      ...(options.color ? { fg: options.color } : {}),
      ...(options.background ? { bg: options.background } : {}),
      ...(options.bold ? { bold: options.bold } : {}),
      ...(options.underline ? { underline: options.underline } : {}),
      // ...toBlessedStateStyle('focus', options[':focused']),
      // ...toBlessedStateStyle('select', options[':selected']),
    },
  }
}

export const toBlessedBoxOptions = (
  options: BoxOptions,
  parent: blessed.Widgets.Node
) => {
  return mergeLeft(
    toBlessedElementOptions(options, parent),
    toBlessedBorderOptions(options.border)
  )
}

export const toBlessedListOptions = (
  options: ListOptions,
  parent: blessed.Widgets.Node
): blessed.Widgets.ListOptions<blessed.Widgets.ListElementStyle> => {
  return {
    focusable: true,
    ...toBlessedElementOptions(options, parent),
    items: options.items ?? [],
  }
}

export const toBlessedButtonOptions = (
  options: ButtonOptions,
  parent: blessed.Widgets.Node
) => {
  return {
    focusable: true,
    ...toBlessedElementOptions(options, parent),
    content: options.label,
  }
}

export const toBlessedLabelOptions = (
  options: LabelOptions,
  parent: blessed.Widgets.Node
) => {
  return {
    ...toBlessedElementOptions(options, parent),
    content: options.label,
  }
}

export const toBlessedTextFieldOptions = (
  options: TextFieldOptions,
  parent: blessed.Widgets.Node
) => {
  return toBlessedElementOptions(options, parent)
}
