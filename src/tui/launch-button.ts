import { Button, CtrlCtorParams } from './framework'

export class LaunchButtonController extends Button {
  focusable = true

  keyMap = {
    enter: {
      legend: 'Launch',
      handler: this.bind(this.launch),
    },
  }

  constructor({ parent, store, keyMap, options }: CtrlCtorParams) {
    super({ parent, model: { text: 'Launch' }, store, keyMap, options })
    this.inheritKeyMap(keyMap)
  }

  launch() {
    this.emit('launch')
  }
}
