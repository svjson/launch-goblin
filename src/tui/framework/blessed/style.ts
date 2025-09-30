import blessed from 'neo-blessed'
import { mergeLeft } from '@whimbrel/walk'

import { Geometry } from '../geometry'
import { Appearance, BorderOptions } from '../appearance'
import { Interaction } from '../interaction'
import { Behavior } from '../behavior'
import {
  BoxOptions,
  ButtonOptions,
  LabelOptions,
  ListOptions,
  TextFieldOptions,
  WidgetOptions,
} from '../widget'

export const toBlessedGeometry = (geometry: Geometry) => {
  return {
    ...ifPresent(geometry, 'width'),
    ...ifPresent(geometry, 'height'),
    ...ifPresent(geometry, 'top'),
    ...ifPresent(geometry, 'right'),
    ...ifPresent(geometry, 'bottom'),
    ...ifPresent(geometry, 'left'),
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
    ...ifPresent(interaction, 'mouse'),
    ...ifPresent(interaction, 'keys'),
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
    border: { type: options.type === 'line' ? 'line' : 'bg' },
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
  options: WidgetOptions & { raw?: blessed.Widgets.ElementOptions }
): blessed.Widgets.ElementOptions => {
  const opts = mergeLeft(
    { style: {} }, // Required because of bug in @whimbrel/walk
    {
      ...toBlessedGeometry(options),
      ...toBlessedInteraction(options),
      ...toBlessedBehavior(options),
      ...(options.raw ?? {}),
      tags: true,
    },
    toBlessedStyle(options)
  ) as blessed.Widgets.ElementOptions

  // Also because of @whimbrel/walk bug
  if (opts.border && !opts?.style?.border) {
    opts.style.border = {}
  }

  return opts
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
    ...(options.hidden !== undefined ? { hidden: options.hidden } : {}),
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

export const toBlessedBoxOptions = (options: BoxOptions) => {
  const boxOpts = mergeLeft(
    toBlessedElementOptions(options),
    toBlessedBorderOptions(options.border)
  )

  //  Also because of @whimbrel/walk bug
  if (boxOpts.border && !boxOpts?.style?.border) {
    boxOpts.style.border = {}
  }

  return boxOpts
}

export const toBlessedListOptions = (
  options: ListOptions
): blessed.Widgets.ListOptions<blessed.Widgets.ListElementStyle> => {
  return {
    focusable: true,
    ...toBlessedElementOptions(options),
    items: options.items ?? [],
  }
}

export const toBlessedButtonOptions = (options: ButtonOptions) => {
  return {
    focusable: true,
    ...toBlessedElementOptions(options),
    content: options.label,
  }
}

export const toBlessedLabelOptions = (options: LabelOptions) => {
  const labelOpts = {
    ...toBlessedElementOptions(options),
    content: options.label,
  }

  labelOpts.shrink = options.textAlign !== 'center'

  return labelOpts
}

export const toBlessedTextFieldOptions = (options: TextFieldOptions) => {
  return toBlessedElementOptions(options)
}

export const applyOptions = (
  element: blessed.Widgets.BlessedElement,
  options: any
): void => {
  const { style } = options

  element.style = {
    ...element.style,
    ...{
      fg: style.fg ?? 'default',
      bg: style.bg ?? 'default',
    },
    ...(typeof style.bold === 'boolean' ? { bold: style.bold } : {}),
    ...(typeof element.style.underline === 'boolean' ||
    typeof style.underline === 'boolean'
      ? { underline: style.underline }
      : {}),
    ...(typeof style.focusable === 'boolean'
      ? { focusable: style.focusable }
      : {}),
  }
}
