import { Controller, CtrlCtorParams, Label, LegendEntry } from './framework'

/**
 * Replacement dictionary for the keyboard command legend.
 *
 * The keys are blessed key aliases and the values are the symbol
 * to display in the legend.
 */
const KEY_SYMBOLS: Record<string, string> = {
  down: '↓',
  up: '↑',
  left: '←',
  right: '→',
}

/**
 * TUI Component for the application footer bar, containing a list
 * of available keyboard commands
 */
export class FooterController extends Controller {
  focusable = false

  label: Label

  constructor({
    widget: { env, keyMap },
    state: { model, store },
  }: CtrlCtorParams) {
    super(
      env,
      env.backend.createBox({
        bottom: 0,
        left: 0,
        width: '100%',
        height: 1,
        color: 'white',
        background: 'gray',
      }),
      model,
      store
    )
    this.inheritKeyMap(keyMap)
    this.label = this.addChild(
      {
        component: Label,
      },
      {
        width: '100%',
      }
    )
  }

  buildKeyLegend(controller: Controller) {
    const entries: LegendEntry[] = [{ symbol: 'q', description: 'Quit' }]

    const groups: Record<string, LegendEntry> = {}

    for (const [key, spec] of Object.entries(controller.keyMap)) {
      const keySym = KEY_SYMBOLS[key] ?? key
      let groupName = spec.group

      if (!spec.legend) {
        continue
      } else if (groupName) {
        let group = groups[groupName]
        if (!group) {
          group = {
            symbol: '',
            description: groupName,
          }
          groups[groupName] = group
          entries.push(group)
        }
        group.symbol += keySym
      } else {
        entries.push({ symbol: keySym, description: spec.legend })
      }
    }

    return [
      ' ',
      entries.map((e) => [e.symbol, '=', e.description].join(' ')).join(' • '),
    ].join('')
  }

  applyContext(controller: Controller) {
    const legend = this.buildKeyLegend(controller)
    this.label.setText(legend)
  }
}
