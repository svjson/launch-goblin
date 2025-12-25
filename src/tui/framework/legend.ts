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
 *
 */
export interface LegendGroup {
  symbol: string
  description: string
}

/**
 *
 */
export interface LegendKey {
  symbol: string
  description: string
}

/**
 *
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
