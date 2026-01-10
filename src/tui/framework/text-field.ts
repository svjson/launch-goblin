import { Controller, CtrlCtorParams } from './controller'
import { KeyEvent, TextChangedEvent } from './event'
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
  cursor: number
}

/**
 * A TextField with label and input field, suitable for use in a
 * form.
 *
 * This compoent is a bare controller containing a Label and a
 * TextInput.
 */
export class TextField extends Controller<Widget, TextFieldModel> {
  events = this.defineEvents({
    'text-changed': (event: TextChangedEvent) => {
      this.model.value = (event as TextChangedEvent).value
      event.source = this
      this.emit(event)
      return true
    },
  })

  components = this.defineComponents({
    label: {
      component: Label,
      model:
        typeof this.model.label === 'string'
          ? { text: this.model.label }
          : this.model.label,
      style: { top: 0 },
    },

    textInput: {
      component: TextInput,
      style: { top: 1 },
      model: { value: this.model.value },
    },
  })

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

    this.focusedIndex = 1
  }

  /**
   * Get the current text value of the TextInput
   */
  getText() {
    return this.components.textInput.getText()
  }

  /**
   * Set the current text value of the TextInput
   *
   * @param text The text to set
   */
  setText(text?: string) {
    return this.components.textInput.setText(text)
  }
}

/**
 * A single-line text input field.
 *
 * This is a bare-bones implementation of a text-based input field,
 * whose rasion d'etre is that the stock dito from neo-blessed is
 * buggy and too opinionated.
 *
 * Emits 'text-changed' events when the text content changes.
 */
export class TextInput extends Controller<Widget, TextInputModel> {
  private prevRenderBuffer = ''

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
      model ?? { value: '', cursor: 0 }
    )
    this.model.value ??= ''
    this.model.cursor ??= 0

    this.widget.onBeforeRender(this.render.bind(this))
  }

  /**
   * Move the cursor to the start of the input field
   *
   * Emits 'dirty'.
   */
  moveStart() {
    this.model.cursor = 0
    this.emit('dirty')
  }

  /**
   * Move the cursor to the end of the input field
   *
   * Emits 'dirty'.
   */
  moveEnd() {
    this.model.cursor = this.model.value.length
    this.emit('dirty')
  }

  /**
   * Move the cursor one position to the left, if possible
   *
   * Emits 'dirty'.
   */
  moveLeft() {
    this.model.cursor = Math.max(0, this.model.cursor - 1)
    this.emit('dirty')
  }

  /**
   * Move the cursor one position to the right, if possible
   *
   * Emits 'dirty'.
   */
  moveRight() {
    this.model.cursor = Math.min(this.model.value.length, this.model.cursor + 1)
    this.emit('dirty')
  }
  submit() {
    //    this.emit({ type: 'submit', value: this.model.value })
  }
  killBackwards() {
    if (this.model.cursor > 0) {
      this.model.value =
        this.model.value.slice(0, this.model.cursor - 1) +
        this.model.value.slice(this.model.cursor)
      this.model.cursor--
    }
    this.emit('dirty')
  }
  killForwards() {
    if (this.model.cursor < this.model.value.length) {
      this.model.value =
        this.model.value.slice(0, this.model.cursor) +
        this.model.value.slice(this.model.cursor + 1)
    }
    this.emit('dirty')
  }
  insertChar({ ch }: KeyEvent) {
    if (ch && ch.length === 1) {
      this.model.value =
        this.model.value.slice(0, this.model.cursor) +
        ch +
        this.model.value.slice(this.model.cursor)
      this.model.cursor++
    }
    this.emit('dirty')
  }

  private render() {
    if (!this.model.value) this.model.value = ''
    if (this.isFocused()) {
      const before = this.model.value.slice(0, this.model.cursor)
      const atCursor = this.model.value[this.model.cursor] || ' '
      const after = this.model.value.slice(this.model.cursor + 1)
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

  /**
   * Get the current text value
   *
   * @returns The current text value
   */
  getText() {
    return this.model.value
  }

  /**
   * Set the current text value
   *
   * Replaces the entire text content of the input field and places
   * the cursor at the end of the input.
   *
   * @param text The text to set
   */
  setText(text?: string) {
    this.model.value = text ?? ''
    this.model.cursor = this.model.value.length
    this.emit('dirty')
  }
}
