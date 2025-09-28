import { Controller, CtrlCtorParams } from './controller'
import { KeyEvent, TUIEvent, TextChangedEvent } from './event'
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

  constructor({ widget: { env, options }, state: { model } }: CtrlCtorParams) {
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

    this.textInput.on('text-changed', (event: TUIEvent) => {
      this.model.value = (event as TextChangedEvent).value
      this.emit(event)
    })

    this.focusedIndex = 1
  }

  getText() {
    return this.textInput.getText()
  }
}

export class TextInput extends Controller<Widget, { value: string }> {
  private prevRenderBuffer = ''
  private cursor = 0

  keyMap = this.defineKeys({
    left: {
      handler: this.moveLeft,
    },
    right: {
      handler: this.moveRight,
    },
    return: {
      handler: this.submit,
    },
    backspace: {
      handler: this.killBackwards,
    },
    delete: {
      handler: this.killForwards,
    },
    home: {
      handler: this.moveStart,
    },
    end: {
      handler: this.moveEnd,
    },
    '/[a-zA-Z0-9 ]/': {
      handler: this.insertChar,
      group: 'edit',
      legend: 'Insert',
    },
  })

  focusable = true

  constructor({
    widget: { env, options = {} },
    state: { model },
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
            focusable: true,
          },
          resolveComponentStyle(env.theme, 'TextInput', env.tty.colorMode),
          options
        )
      ),
      model ?? { value: '' }
    )
    this.model.value ??= ''

    this.widget.onBeforeRender(this.render.bind(this))
  }

  moveStart() {
    this.cursor = 0
    this.emit('dirty')
  }

  moveEnd() {
    this.cursor = this.model.value.length
    this.emit('dirty')
  }

  moveLeft() {
    this.cursor = Math.max(0, this.cursor - 1)
    this.emit('dirty')
  }
  moveRight() {
    this.cursor = Math.min(this.model.value.length, this.cursor + 1)
    this.emit('dirty')
  }
  submit() {
    //    this.emit({ type: 'submit', value: this.model.value })
  }
  killBackwards() {
    if (this.cursor > 0) {
      this.model.value =
        this.model.value.slice(0, this.cursor - 1) +
        this.model.value.slice(this.cursor)
      this.cursor--
    }
    this.emit('dirty')
  }
  killForwards() {
    if (this.cursor < this.model.value.length) {
      this.model.value =
        this.model.value.slice(0, this.cursor) +
        this.model.value.slice(this.cursor + 1)
    }
    this.emit('dirty')
  }
  insertChar({ ch }: KeyEvent) {
    if (ch && ch.length === 1) {
      this.model.value =
        this.model.value.slice(0, this.cursor) +
        ch +
        this.model.value.slice(this.cursor)
      this.cursor++
    }
    this.emit('dirty')
  }

  private render() {
    if (!this.model.value) this.model.value = ''
    if (this.isFocused()) {
      const before = this.model.value.slice(0, this.cursor)
      const atCursor = this.model.value[this.cursor] || ' '
      const after = this.model.value.slice(this.cursor + 1)
      this.widget.set(
        'text',
        before + '{inverse}' + atCursor + '{/inverse}' + after
      )
    } else {
      this.widget.set('text', this.model.value)
    }
    if (this.prevRenderBuffer !== this.model.value) {
      this.emit({
        type: 'text-changed',
        value: this.model.value,
      })
    }
    this.prevRenderBuffer = this.model.value
  }

  getText() {
    return this.model.value
  }
}
