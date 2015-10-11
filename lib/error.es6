class ExtendableError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    Error.captureStackTrace(this, this.constructor.name)
  }
}

class IGWValidationError extends ExtendableError {
  constructor(m) {
    super(m)
  }
}

export { IGWValidationError }
