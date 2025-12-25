import { mergeLeft } from '@whimbrel/walk'

import { Controller } from './controller'
import { getEffectiveKeyMap } from './keymap'

export interface KeyLegend {
  legend?: string
  /**
   * Defines the `category` of this mapped keystroke. When a KeystrokeLegend
   * is computed, KeyMappings of the same category will be grouped together.
   */
  category?: string
  /**
   * Defines a `group` for this mapped keystroke. When a KeystrokeLegend
   * is computed, KeyMappings belonging to the same group will be merged into
   * a single entry, ie, if mappings for keys `up` and `down` both specify
   * 'Navigation' as their group, they will appear as 'up/down = Navigate'
   */
  group?: string
  /**
   * The handler function that will be invoked when the mapped keystroke is
   * performed.
   */
}

/**
 * A Keystroke Legend entry made up the keys of a grouped entry.
 */
export interface LegendGroup {
  /**
   * The combined symbols of the grouped keys, ie, `up/down`
   * for the Arrow Up and Arrow Down keys.
   */
  symbol: string

  /**
   * The description of the grouped keys, ie, `Navigate`
   */
  description: string

  /**
   * The priority of the group when culling entries to fit
   * within a maximum width. Lower priority values indicate
   * higher importance.
   *
   * undefined signals unimportant.
   */
  priority?: number
}

/**
 * A Keystroke Legend entry for a single keyboard command.
 */
export interface LegendKey {
  /**
   * The symbol of the key, ie, `C-c`
   */
  symbol: string
  /**
   * The description of the key, ie, `Quit`
   */
  description: string
  /**
   * The priority of the key when culling entries to fit
   * within a maximum width. Lower priority values indicate
   * higher importance.
   *
   * undefined signals unimportant.
   */
  priority?: number
}

/**
 * A Keystroke Legend entry, either a grouped entry or
 * an individual key entry.
 */
export type LegendEntry = LegendGroup | LegendKey

/**
 * Describes a set of keyboard commands, organized by category.
 *
 * Each category contains a mapping of either individual keys or groups
 * of keys to their respective LegendEntry.
 *
 * For example, a legend could have a `navigation` category containing
 * a `Navigate` group entry for the `up` and `down` keys, as well as
 * an individual entry for the `tab` key.
 */
export interface KeystrokeLegend {
  /**
   * The categories of the legend, each containing a mapping
   * of keys or groups to their LegendEntry.
   */
  categories: Record<string, Record<string, LegendEntry>>
}

/**
 * Options for generating a KeystrokeLegend.
 */
export interface KeystrokeLegendOptions {
  /**
   * An initial KeystrokeLegend to extend.
   *
   * If provided, the generated legend will include all entries
   * from this initial legend, with additional entries added
   * from the component's effective KeyMap.
   */
  initial?: KeystrokeLegend

  /**
   * A list of categories to include in the generated legend.
   */
  categories?: string[]

  /**
   * A map of key symbols to use in the legend.
   *
   * This can be used to control the characters used for special keys,
   * ie, substituting the default string `up` for Arrow Up with an arrow
   * glyph.
   */
  keySymbols?: Record<string, string>
}

/**
 * Intermediate representation of a rendered legend entry,
 * used to calculate and enforce constraints during rendering
 * of KeystrokeLegend to string.
 */
export interface RenderedEntry {
  /**
   * The rendered string for the entry
   */
  rendered: string
  /**
   * The original legend entry
   */
  entry: LegendEntry
}

/**
 * Intermediate representation of a rendered legend category,
 * used to calculate and enforce constraints during rendering
 * of KeystrokeLegend to string.
 */
export interface RenderedCategory {
  /**
   * The rendered string for the category
   */
  rendered: string
  /**
   * The individual rendered entries that make up the rendered
   * category.
   */
  entries: RenderedEntry[]
  /**
   * The rendering constraints for the category
   */
  constraints?: LegendCategoryRenderOptions
  /**
   * Transient maximum width for the category. If `constraints`
   * specifies a `maxWidth` function, this value will be
   * recalculated during culling/rendering passes
   */
  maxWidth?: number
}

/**
 * Intermediate representation of rendering options for Keystroke
 * legends.
 */
interface RenderOpts {
  maxWidth: number
  spacing: string
  separator: string
}

/**
 * Function type used to supply dynamic maximum widths for legend
 * categories.
 *
 * @param categories The current set of rendered categories
 *
 * @return The new maximum width for the category
 */
export type CategoryWidthSupplier = (
  categories: Record<string, RenderedCategory>
) => number

/**
 * Options for rendering constraints on individual legend categories
 * to string.
 */
export interface LegendCategoryRenderOptions {
  /**
   * The priority of the category when culling entries to fit
   * within a maximum width. Lower priority values indicate
   * higher importance.
   */
  priority?: number
  /**
   * The maximum width of the rendered category, either as
   * a fixed number or a function that computes the
   * maximum width based on the current set of rendered
   * categories.
   *
   * If undefined, the category has no max width.
   */
  maxWidth?: number | CategoryWidthSupplier
}

/**
 * Options for rendering a KeystrokeLegend to string
 */
export interface LegendRenderOptions {
  /**
   * The max width of the rendered legend string
   */
  maxWidth?: number
  /**
   * The separator string between legend entries (default: ' | ')
   */
  separator?: string
  /**
   * The mapping string between symbol and description (default: ' = ')
   */
  mapping?: string
  /**
   * Spacing between categories, expressed either as a separator string
   * or number of spaces. (default: 3/'   ')
   */
  spacing?: string | number
  /**
   * Specifies the strategy to use for culling entries from the rendered
   * result in order to fit within a provided max width
   */
  cullingStrategy?: 'priority' | 'right-to-left'

  /**
   * Per-category rendering constraints
   */
  categoryConstraints?: Record<string, LegendCategoryRenderOptions>
}

/**
 * Generate a KeystrokeLegend for `controller`, collecting all active
 * keymappings of the component and its parents.
 *
 * An initial KeystrokeLegend can be provided, including global level defaults
 * or mappings otherwise not readable from the component hierarchy.
 *
 * The legend is divided into categories according to the individual
 * KeyMappings of the effective KeyMap. KeyMappings that do not specify a
 * category will be collected in the `default` category.
 *
 * Categories can be limited to a specific set if `options.categories` is
 * provided. Any KeyMapping specifying a category not present in the
 * `options.categories` will then be grouped into `default`.
 *
 * A map of key symbol substitutions can be provided in `keySymbols`, in which
 * case any matching key will appear in the result as the substitute string.
 * This can, for example, be used to replace `up` and `down` with arrow icons.
 *
 * @param controller The controller to generate the legend for
 * @param opts Options for legend generation
 * @return The generated KeystrokeLegend
 */
export const generateKeystrokeLegend = (
  controller: Controller,
  opts: KeystrokeLegendOptions = { keySymbols: {} }
): KeystrokeLegend => {
  const { initial, categories, keySymbols = {} } = opts

  const result: KeystrokeLegend = initial
    ? mergeLeft({}, initial)
    : { categories: {} }

  const keyMap = getEffectiveKeyMap(controller)

  for (const [key, mapping] of Object.entries(keyMap)) {
    const {
      legend,
      group,
      category = 'default',
    } = typeof mapping === 'function' ? {} : mapping

    if (!legend) continue

    const effectiveCategory = categories
      ? categories.includes(category)
        ? category
        : 'default'
      : category

    const legendCategory: Record<string, LegendEntry> = (result.categories[
      effectiveCategory
    ] ??= {})

    if (group) {
      const gr = (legendCategory[group] ??= {
        symbol: '',
        description: group,
      })
      gr.symbol += keySymbols[key] ?? key
    } else {
      legendCategory[key] = {
        symbol: keySymbols[key] ?? key,
        description: legend,
      }
    }
  }

  return result
}

/**
 * Intermediate representation of rendered legend categories
 * used during rendering to string, keyed by category name.
 */
export type RenderedCategories = Record<string, RenderedCategory>

/**
 * Count the total number of rendered entries across all categories.
 *
 * @return The total number of rendered entries
 */
const entryCount = (categories: RenderedCategories) =>
  Object.values(categories).reduce(
    (count, cat) => count + cat.entries.length,
    0
  )

/**
 * Join the rendered entries of a category into a single string,
 * separated by the provided separator.
 *
 * @param entries The rendered entries of the category
 * @param renderOpts The rendering options
 *
 * @return The joined rendered string
 */
const joinCategory = (
  entries: RenderedEntry[],
  renderOpts: RenderOpts
): string => {
  return entries.map(({ rendered }) => rendered).join(renderOpts.separator)
}

/**
 * Calculate the total rendered width of all categories, including
 * category spacing.
 *
 * @param categoryMap The rendered categories
 * @param renderOpts The rendering options
 *
 * @return The total rendered width
 */
const renderedWidth = (
  categoryMap: RenderedCategories,
  { spacing }: { spacing: string }
): number => {
  const categories = Object.values(categoryMap)
  return (
    categories.reduce((w, cat) => w + cat.rendered.length, 0) +
    (spacing.length * categories.length - 1)
  )
}

/**
 * Recalculate the maximum widths of all categories that
 * specify a dynamic maxWidth function.
 *
 * @param categories The rendered categories
 */
const recalculateMaxWidths = (categories: RenderedCategories) => {
  Object.values(categories).forEach((cat) => {
    if (typeof cat.constraints?.maxWidth === 'function') {
      cat.maxWidth = cat.constraints?.maxWidth(categories)
    }
  })
}

/**
 * Get a list of references to rendered entries across all categories,
 * sorted by priority for culling.
 *
 * @param categories The rendered categories
 *
 * @return A list of references to rendered entries sorted by priority
 */
export const entriesByPriority = (categories: RenderedCategories) =>
  Object.entries(categories)
    .flatMap(([name, cat]) =>
      cat.entries.map((entry, i) => ({
        category: name,
        index: i,
        priority: entry.entry.priority,
      }))
    )
    .sort((a, b) => {
      if (a.priority === b.priority) return a.index > b.index ? 1 : -1
      if (b.priority == null) return -1
      if (a.priority == null) return 1
      return a.priority > b.priority ? 1 : -1
    })

/**
 * Determine if all categories with a specified max width are within
 * that width.
 *
 * @param categories The rendered categories
 *
 * @return True if all categories are within their max widths, false otherwise
 */
const categoriesWithinMaxWidth = (categories: RenderedCategories) => {
  for (const category of Object.values(categories)) {
    if (category.maxWidth == null) continue
    if (category.rendered.length > category.maxWidth) return false
  }
  return true
}

/**
 * Cull rendered entries from categories based on priority until
 * the total rendered width is within the maximum width and
 * all categories are within their individual maximum widths.
 *
 * @param categories The rendered categories
 * @param renderOpts The rendering options
 */
const cullByPriority = (
  categories: RenderedCategories,
  renderOpts: RenderOpts
) => {
  let remainingEntries = entryCount(categories)

  let totalWidth = renderedWidth(categories, renderOpts)

  while (
    remainingEntries > 0 &&
    (totalWidth > renderOpts.maxWidth || !categoriesWithinMaxWidth(categories))
  ) {
    const order = entriesByPriority(categories)

    const { category, index } = order.at(-1)!

    categories[category].entries.splice(index, 1)
    categories[category].rendered = joinCategory(
      categories[category].entries,
      renderOpts
    )
    remainingEntries--
    recalculateMaxWidths(categories)
    totalWidth = renderedWidth(categories, renderOpts)
  }
}

/**
 * Cull rendered entries from categories starting from the
 * rightmost category to the left until the total rendered
 * width is within the maximum width.
 *
 * @param categories The rendered categories
 * @param renderOpts The rendering options
 * @param categoryIndex Limit culling to a specific category index.
 */
const cullRightToLeft = (
  categories: RenderedCategories,
  renderOpts: RenderOpts,
  categoryIndex?: number
): void => {
  const categoryNames = Object.keys(categories)
  let remainingEntries = entryCount(categories)
  let catIndex = categoryIndex ?? categoryNames.length - 1
  while (
    remainingEntries &&
    catIndex >= 0 &&
    renderedWidth(categories, renderOpts) > renderOpts.maxWidth
  ) {
    while (categories[categoryNames[catIndex]].entries.length === 0) {
      catIndex--
      if (categoryIndex != null) return
    }
    const category = categories[categoryNames[catIndex]]
    category.entries.pop()
    category.rendered = joinCategory(category.entries, renderOpts)
    remainingEntries--
    recalculateMaxWidths(categories)
  }
}

/**
 * Render the categories of a KeystrokeLegend to strings,
 * applying any specified rendering constraints.
 *
 * If max width is specified, either on the full result or
 * individual categories, entries will be culled according
 * to the specified culling strategy until the constraints
 * are met or no entries remain.
 *
 * @param legend The KeystrokeLegend to render
 * @param opts Options for rendering the legend
 *
 * @return A mapping of category names to rendered strings
 */
export const renderLegendCategories = (
  legend: KeystrokeLegend,
  opts: LegendRenderOptions = {}
): Record<string, string> => {
  const renderOpts: RenderOpts = {
    separator: opts.separator ?? ' | ',
    maxWidth: typeof opts.maxWidth === 'number' ? opts.maxWidth : -1,
    spacing:
      typeof opts.spacing === 'number'
        ? ' '.repeat(opts.spacing)
        : typeof opts.spacing === 'string'
          ? opts.spacing
          : '   ',
  }

  const mapping = opts.mapping ?? ' = '

  let cullStrategy = opts.cullingStrategy ?? 'priority'

  const renderCategoryItems = (items: LegendEntry[]) => {
    return items.map((e) => ({
      rendered: [e.symbol, e.description].join(mapping),
      entry: e,
    }))
  }

  const renderedEntries = Object.entries(legend.categories).reduce(
    (result, [name, entries]) => {
      const items = renderCategoryItems(Object.values(entries))
      const constraints = opts.categoryConstraints?.[name]
      result[name] = {
        rendered: joinCategory(items, renderOpts),
        entries: items,
        constraints: constraints,
        maxWidth:
          typeof constraints?.maxWidth === 'number'
            ? constraints?.maxWidth
            : undefined,
      }
      return result
    },
    {} as Record<string, RenderedCategory>
  )
  recalculateMaxWidths(renderedEntries)

  let remainingEntries = entryCount(renderedEntries)

  if (renderOpts.maxWidth !== -1 && remainingEntries) {
    const strategy = {
      'right-to-left': cullRightToLeft,
      priority: cullByPriority,
    }[cullStrategy]
    strategy(renderedEntries, renderOpts)
  }

  return Object.entries(renderedEntries).reduce(
    (result, [cat, rnd]) => {
      result[cat] = rnd.rendered
      return result
    },
    {} as Record<string, string>
  )
}
