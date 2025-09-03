import blessed from 'neo-blessed'
import { ApplicationState } from '@src/project'
import { MainController } from './main'
import { Application } from './framework'

export class LaunchGoblinApp extends Application<
  ApplicationState,
  MainController
> {
  constructor(screen: blessed.Widgets.Screen, model: ApplicationState) {
    super(screen, MainController, model)
  }
}
