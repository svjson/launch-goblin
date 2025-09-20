import { Controller, CtrlCtorParams } from './controller'
import { Event } from './event'
import { Label, LabelItem } from './label'
import { mergeLeft } from '@whimbrel/walk'
import { Widget } from './widget'
import { resolveComponentStyle } from './theme'

export interface TextFieldModel {
  label: string | LabelItem
  value: string
}

export interface TextInputModel {
  value: string
}

export class TextField extends Controller<Widget, TextFieldModel> {
  textInput: TextInput

  constructor({
    widget: { env, parent, keyMap, options },
    state: { model },
  }: CtrlCtorParams) {
    super(
      env,
      env.backend.createBox(
        mergeLeft(
          {
            height: 2,
            width: '100%',
          },
          options
        )
      ),
      model
    )
    this.setParent(parent)

    this.inheritKeyMap(keyMap)

    this.addChild(
      {
        component: Label,
        model:
          typeof model.label === 'string' ? { text: model.label } : model.label,
      },
      { top: 0 }
    )
    this.textInput = this.addChild(
      TextInput,
      { top: 1 },
      { value: model.value }
    )

    this.textInput.on('text-changed', (event: Event) => {
      this.emit(event)
    })

    this.focusedIndex = 1
  }

  getText() {
    return this.textInput.getText()
  }
}

export class TextInput extends Controller<Widget, { value: string }> {
  private buffer = ''
  private prevRenderBuffer = ''
  private cursor = 0

  keyMap = this.extendKeyMap({
    left: {
      handler: this.moveLeft.bind(this),
    },
    right: {
      handler: this.moveRight.bind(this),
    },
    return: {
      handler: this.submit.bind(this),
    },
    backspace: {
      handler: this.killBackwards.bind(this),
    },
    delete: {
      handler: this.killForwards.bind(this),
    },
    home: {
      handler: this.moveStart.bind(this),
    },
    end: {
      handler: this.moveEnd.bind(this),
    },
    '/[a-zA-Z0-9]/': {
      handler: this.insertChar.bind(this),
      group: 'edit',
      legend: 'Insert',
    },
  })

  constructor({
    widget: { env, parent, keyMap, options = {} },
    state: { model, store },
  }: CtrlCtorParams) {
    super(
      env,
      env.backend.createBox(
        mergeLeft(
          {
            width: '100%',
            height: 1,
            keys: true,
            mouse: true,
          },
          resolveComponentStyle(env.theme, 'TextInput', env.tty.colorMode),
          options
        )
      ),
      model ?? { value: '' }
    )
    this.setParent(parent)
    this.buffer = this.model.value || ''
    this.inheritKeyMap(keyMap)

    this.widget.onBeforeRender(this.render.bind(this))
  }

  moveStart() {
    this.cursor = 0
    this.emit('dirty')
  }

  moveEnd() {
    this.cursor = this.buffer.length
    this.emit('dirty')
  }

  moveLeft() {
    this.cursor = Math.max(0, this.cursor - 1)
    this.emit('dirty')
  }
  moveRight() {
    this.cursor = Math.min(this.buffer.length, this.cursor + 1)
    this.emit('dirty')
  }
  submit() {
    //    this.emit({ type: 'submit', value: this.buffer })
  }
  killBackwards() {
    if (this.cursor > 0) {
      this.buffer =
        this.buffer.slice(0, this.cursor - 1) + this.buffer.slice(this.cursor)
      this.cursor--
    }
    this.emit('dirty')
  }
  killForwards() {
    if (this.cursor < this.buffer.length) {
      this.buffer =
        this.buffer.slice(0, this.cursor) + this.buffer.slice(this.cursor + 1)
    }
    this.emit('dirty')
  }
  insertChar(ch: string, _key: any) {
    if (ch && ch.length === 1) {
      this.buffer =
        this.buffer.slice(0, this.cursor) + ch + this.buffer.slice(this.cursor)
      this.cursor++
    }
    this.emit('dirty')
  }

  private render() {
    if (!this.buffer) this.buffer = ''
    if (this.isFocused()) {
      const before = this.buffer.slice(0, this.cursor)
      const atCursor = this.buffer[this.cursor] || ' '
      const after = this.buffer.slice(this.cursor + 1)
      this.widget.set(
        'text',
        before + '{inverse}' + atCursor + '{/inverse}' + after
      )
    } else {
      this.widget.set('text', this.buffer)
    }
    if (this.prevRenderBuffer !== this.buffer) {
      this.emit({
        type: 'text-changed',
        value: this.buffer,
      })
    }
    this.prevRenderBuffer = this.buffer
  }

  getText() {
    return this.buffer
  }
}
