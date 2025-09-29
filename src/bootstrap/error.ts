/**
 * Custom error class for handling bootstrap-related errors.
 *
 * @param message The error message.
 */
export class BootstrapError extends Error {
  constructor(message: string) {
    super(message)
  }
}
