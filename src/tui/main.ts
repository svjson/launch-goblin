import { ApplicationState, Project } from '@src/project'
import {
  ApplicationController,
  ApplicationCtrlCtorParams,
  Event,
  FocusEvent,
} from './framework'
import { LaunchButtonController } from './launch-button'
import { ComponentSection } from './component-section'
import { FooterController } from './footer'
import { HeaderController } from './header'
import { SaveConfigDialog } from './save-config-dialog'
import { ConfigSection } from './config-section'

/**
 * The main TUI component of the Launch Goblin user interface
 */
export class MainController extends ApplicationController<ApplicationState> {
  keyMap = {
    'C-s': {
      propagate: true,
      legend: 'Save Configuration',
      handler: this.bind(this.saveConfig),
    },
    tab: {
      propagate: true,
      legend: 'Next Section',
      handler: this.bind(this.nextChild),
    },
    'S-tab': {
      propagate: true,
      legend: 'Prev Section',
      handler: this.bind(() => this.nextChild(-1)),
    },
  }

  events = {
    focus: this.bind(this.componentFocused),
  }

  componentSection: ComponentSection
  configSection: ConfigSection
  launchButton: LaunchButtonController
  footer: FooterController

  constructor(params: ApplicationCtrlCtorParams<ApplicationState>) {
    super(params)

    this.addChild(HeaderController)
    this.componentSection = this.addChild({
      component: ComponentSection,
      model: this.store
        .get<Project>('project')
        .components.filter((cmp) =>
          this.model.project.launchers[0].components.includes(cmp.id)
        ),
      store: this.store,
    })

    this.launchButton = this.addChild(LaunchButtonController)
    this.launchButton.layout.bind(
      'top',
      () => Number(this.componentSection.bottom()) + 1
    )

    this.configSection = this.addChild({
      component: ConfigSection,
      model: [],
      store: this.store,
    })
    this.configSection.layout.bind('top', () => this.componentSection.top())
    this.configSection.layout.bind(
      'left',
      () =>
        Number(this.componentSection.left()) +
        Number(this.componentSection.width()) +
        4
    )
    this.footer = this.addChild(FooterController)
  }

  componentFocused(event: FocusEvent) {
    this.footer.applyContext(event.component)
  }

  emit(event: Event) {
    super.emit(event)
  }

  saveConfig() {
    const dialog = new SaveConfigDialog({
      backend: this.backend,
      store: this.store,
    })

    dialog.on('*', (event: Event) => {
      if (event.type === 'destroyed') {
        this.focus()
      }
      this.receive(event)
    })

    dialog.focus()
  }
}
