/**
 * ESC = "Escape Sequence"
 */
export const ESC = '\x1b'

/**
 * CSI = "Control Sequence Introducer" opening sequence.
 */
export const ESC_CSI = `${ESC}[`

/**
 * OSC = "Operating System Command" opening sequence.
 */
export const ESC_OSC = `${ESC}]`

/**
 * BEL = Bell character (0x07).
 * Used as terminator for CSI and OSC sequences
 */
export const BEL = '\x07'

/**
 * ST = String Terminator (ESC \).
 * Used as an alternative terminator for CSI and OSC sequences.
 */
export const ST = '\x1b\\'

/**
 * CSI 21 t  — “Report window title” (xterm WindowOps).
 *
 * Sends the control sequence  ESC [ 21 t  to the terminal.
 * On terminals that implement this query (e.g., xterm/urxvt),
 * the terminal replies on stdin with an OSC (“Operating System Command”)
 * sequence containing the current title, typically one of:
 *
 *   ESC ] l <title> BEL        // reply using BEL terminator
 *   ESC ] l <title> ESC \      // reply using ST (String Terminator)
 *   (some variants reply as ESC ] 2; <title> (BEL|ESC \))
 *
 * Notes:
 *  - Many emulators (VTE/Terminator, GNOME Terminal, iTerm2, kitty) do NOT
 *    implement this query and will produce no reply at all.
 *  - Inside tmux/screen the query may be swallowed or rewritten.
 *  - Treat an absent or empty reply as “unknown title”; don’t assume success.
 *
 * CSI = “Control Sequence Introducer” = ESC [ (0x1B 0x5B)
 * BEL = 0x07, ST = ESC \ (0x1B 0x5C)
 */
const QUERY = `${ESC_CSI}21t`

/**
 * Builder for OSC sequence
 */
export const oscSequence = (ps: string, payload = '', terminator = BEL) =>
  `${ESC_OSC}${ps};${payload}${terminator}`

/**
 * Output ANSI escape sequence CSI ? 25 l to hide the cursor.
 * Optionally, wait for `delayMs` milliseconds before hiding the cursor.
 * This is useful to avoid flicker when the cursor is about to be
 * immediately redrawn by another component.
 *
 * @param delayMs Optional delay in milliseconds before hiding the cursor.
 * If not provided, the cursor is hidden immediately.
 */
export const hideCursor = (delayMs?: number) => {
  const hide = () => process.stdout.write(`${ESC_CSI}?25l`)
  if (typeof delayMs === 'number') {
    setTimeout(hide, delayMs)
  } else {
    hide()
  }
}

/**
 * Output ANSI escape sequence OSC 2 to instruct the tty/terminal emulator
 * to update its window title.
 */
export const setTTYTitleString = (title: string) => {
  process.stdout.write(oscSequence('2', title))
}

/**
 * Query the tty/terminal emulator for its window title string.
 *
 * This is supported by only a handful terminal environments, and
 * will yield an empty response for most users.
 *
 * The query is asynchronous, so by default, we stall for 150
 * ms waiting for a response on stdin.
 *
 * @param timeoutMs How long to wait for a response, in milliseconds.
 *
 * @return The window title string, or null if it could not be determined.
 */
export const readTTYTitleString = async (timeoutMs = 150) => {
  if (!process.stdin.isTTY || !process.stdin.isTTY) return null

  const chunks: Buffer<ArrayBuffer>[] = []
  const onData = (d: Buffer | string) =>
    chunks.push(typeof d === 'string' ? Buffer.from(d, 'binary') : d)

  const wasRaw = process.stdin.isRaw
  const oldEncoding = process.stdin.readableEncoding

  try {
    process.stdin.setEncoding('binary')
    process.stdin.setRawMode?.(true)
    process.stdin.resume()
    process.stdin.on('data', onData)

    process.stdout.write(oscSequence('21t'))

    await new Promise((r) => setTimeout(r, timeoutMs))
  } finally {
    process.stdin.off('data', onData)
    if (!wasRaw) process.stdin.setRawMode?.(false)
    if (oldEncoding) process.stdin.setEncoding(oldEncoding)
  }

  const buf = Buffer.concat(chunks).toString('binary')

  return parseOSCResponse(buf, null)
}

/**
 * Escape literal text for use inside a RegExp source
 */
export const reLit = (s: string) => s.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')

export const parseOSCResponse = (buf: string, defaultValue = null) => {
  const m =
    buf.match(/\x1b\]l([^\x07\x1b]*)\x07/) || // ESC ] l ... BEL
    buf.match(/\x1b\]l([^\x07\x1b]*)\x1b\\/) || // ESC ] l ... ST
    buf.match(/\x1b\]2;([^\x07\x1b]*)\x07/) || // fallback: ESC ] 2; ... BEL
    buf.match(/\x1b\]2;([^\x07\x1b]*)\x1b\\/) // fallback: ESC ] 2; ... ST

  return m ? m[1] : defaultValue
}
