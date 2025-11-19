import { Controller, CtrlCtorParams, Label, LegendEntry } from './framework'
import { generateKeystrokeLegend } from './framework/keymap'

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

  components = this.defineComponents({
    appLegend: {
      component: Label,
      style: {
        right: 1,
      },
    },
    focusedLegend: {
      component: Label,
      style: {},
    },
    navLegend: {
      component: Label,
      style: {
        left: 1,
      },
    },
  })

  constructor({ widget: { env }, state: { model, store } }: CtrlCtorParams) {
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
  }

  buildKeyLegend(controller: Controller) {
    const legend = generateKeystrokeLegend(controller, {
      keySymbols: KEY_SYMBOLS,
      categories: ['app', 'focused', 'nav'],
      initial: {
        categories: {
          app: {
            q: { symbol: 'q', description: 'Quit' },
          },
        },
      },
    })

    const joinCategory = (cat: Record<string, LegendEntry>) => {
      return Object.values(cat)
        .map((e) => [e.symbol, '=', e.description].join(' '))
        .join(' • ')
    }

    return Object.entries(legend.categories).reduce(
      (result, [name, entries]) => {
        result[name] = joinCategory(entries)
        return result
      },
      {
        default: '',
        app: '',
        focused: '',
        nav: '',
      } as Record<string, string>
    )
  }

  applyContext(controller: Controller) {
    const legend = this.buildKeyLegend(controller)
    this.components.appLegend.setText(legend.app)
    this.components.navLegend.setText(legend.nav)
    this.components.focusedLegend.setText(legend.focused)
    this.components.focusedLegend.set(
      'left',
      `50%-${Math.round(legend.focused.length / 2)}`
    )
  }
}
