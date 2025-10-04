import { ApplicationState } from '@src/project'
import {
  ApplicationController,
  ApplicationCtrlCtorParams,
  Backend,
  Button,
  FocusEvent,
  Store,
} from './framework'
import { ComponentSection } from './component-section'
import { FooterController } from './footer'
import { HeaderController } from './header'
import { SaveConfigDialog } from './save-config-dialog'
import { ConfigSection } from './config-section'
import { LaunchSession } from '@src/project/state'

/**
 * The main TUI component of the Launch Goblin user interface
 */
export class MainController extends ApplicationController<ApplicationState> {
  /**
   * Globally available keyboard commands
   */
  keyMap = this.defineKeys({
    'C-s': {
      propagate: true,
      legend: 'Save Configuration',
      category: 'app',
      handler: this.openSaveConfigDialog,
    },
    tab: {
      propagate: true,
      category: 'nav',
      legend: 'Next Section',
      handler: this.nextChild,
    },
    'S-tab': {
      propagate: true,
      category: 'nav',
      legend: 'Prev Section',
      handler: this.prevChild,
    },
  })

  /**
   * React to all component focus events
   */
  events = this.defineEvents({
    focus: this.updateFooter,
    launchButton: {
      pressed: () => {
        this.dispatch({ type: 'launch' })
      },
    },
  })

  /**
   * Main UI Component
   */
  components = this.defineComponents({
    /**
     * The Launch Goblin header bar
     */
    header: HeaderController,

    /**
     * The Component section, showing components and targets selected
     * for launch
     */
    componentSection: {
      component: ComponentSection,
      model: this.store
        .get<LaunchSession>('session')
        .components.filter((cmp) =>
          this.model.project.isLaunchable(cmp.component.id)
        ),
      store: this.store,
    },

    /**
     * The Launch-button
     */
    launchButton: {
      component: Button,
      legend: {
        enter: 'Launch!',
      },
      model: { text: 'Launch' },
    },

    /**
     * The Config section, showing stored and transient configurations
     */
    configSection: ConfigSection,

    /**
     * The application footer, showing available keyboard commands
     */
    footer: FooterController,
  })

  constructor(params: ApplicationCtrlCtorParams<ApplicationState>) {
    super(params)
    const { componentSection, configSection, launchButton } = this.components

    launchButton.layout.bind('top', () => Number(componentSection.bottom()) + 1)

    configSection.layout.bind('top', () => componentSection.top())
    configSection.layout.bind(
      'left',
      () =>
        Number(componentSection.left()) + Number(componentSection.width()) + 4
    )

    this.focusedIndex = 1
  }

  /**
   * Catches FocusEvents and updates the application footer with available
   * keyboard commands for the focused component's context.
   */
  updateFooter(event: FocusEvent) {
    this.components.footer.applyContext(event.source)
  }

  /**
   * Open a dialog with options for saving the current session as a
   * configuration.
   */
  openSaveConfigDialog() {
    this.dispatch({
      type: 'open-modal',
      details: {
        source: this,
        create: <M, SM>(_: { backend: Backend; model: M; store: Store<SM> }) =>
          new SaveConfigDialog({
            env: this.env,
            store: this.store,
          }),
      },
    })
  }
}
