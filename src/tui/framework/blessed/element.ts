import blessed from 'neo-blessed'

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
