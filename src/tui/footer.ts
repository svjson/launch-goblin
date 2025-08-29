import blessed from 'neo-blessed'

import { Controller, CtrlCtorParams, LegendEntry } from './framework'

const KEY_SYMBOLS: Record<string, string> = {
  down: '↓',
  up: '↑',
}

export class FooterController extends Controller {
  focusable = false

  constructor({ parent, model, keyMap }: CtrlCtorParams) {
    super(
      blessed.box({
        parent: parent,
        bottom: 0,
        left: 0,
        width: '100%',
        height: 1,
        content: ' q = quit • ↑↓ = nav • space = toggle',
        style: { fg: 'white', bg: 'gray' },
      }),
      model
    )
    this.inheritKeyMap(keyMap)
  }

  buildKeyLegend(controller: Controller) {
    const entries: LegendEntry[] = [{ symbol: 'q', description: 'Quit' }]

    const groups: Record<string, LegendEntry> = {}

    for (const [key, spec] of Object.entries(controller.keyMap)) {
      const keySym = KEY_SYMBOLS[key] ?? key
      let groupName = spec.group

      if (groupName) {
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
    this.widget.content = legend
  }
}
