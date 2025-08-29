import { Button, CtrlCtorParams } from './framework'

export class LaunchButtonController extends Button {
  focusable = true

  keyMap = {
    enter: {
      legend: 'Launch',
      handler: this.bind(this.launch),
    },
  }

  constructor({ parent, model, keyMap, options }: CtrlCtorParams) {
    super({ parent, model, keyMap, options }, { text: 'Launch' })
    this.inheritKeyMap(keyMap)
  }

  launch() {
    this.emit('launch')
  }
}
