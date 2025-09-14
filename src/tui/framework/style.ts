import { mergeLeft } from '@whimbrel/walk'

import { ComponentState } from './controller'
import { BaseWidgetOptions, narrow, WidgetOptions } from './widget'
import { APPEARANCE_KEYS, BASE_WIDGET_OPTIONS_KEYS } from './options'

export const getStyleOptions = (
  widgetOptions: WidgetOptions
): BaseWidgetOptions => {
  return narrow(widgetOptions, BASE_WIDGET_OPTIONS_KEYS)
}

export const getAppearanceOptions = (
  widgetOptions: BaseWidgetOptions
): BaseWidgetOptions => {
  return narrow(widgetOptions, APPEARANCE_KEYS)
}

export const calculateWidgetStyle = (
  widgetOptions: WidgetOptions,
  cmpState: ComponentState,
  parentStyle: BaseWidgetOptions
) => {
  let result: BaseWidgetOptions = mergeLeft(
    {},
    getAppearanceOptions(parentStyle),
    getStyleOptions(widgetOptions)
  )

  if (cmpState.disabled && widgetOptions[':disabled']) {
    result = mergeLeft(result, widgetOptions[':disabled'])
  } else {
    if (cmpState.selected && widgetOptions[':selected']) {
      result = mergeLeft(result, widgetOptions[':selected'])
    }
    if (cmpState.focused && widgetOptions[':focused']) {
      result = mergeLeft(result, widgetOptions[':focused'])
    }
  }

  return result
}
