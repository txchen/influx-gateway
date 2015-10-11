import { IGWValidationError } from './error'

class LineProtocol {
  tranform(json) {
    validate(json)
  }

  validate(json) {
    if (!this.isDictionary(json)) {
      throw new IGWValidationError('input must be a json object')
    }
  }

  isDictionary(obj) {
    if (!obj) {
      return false
    }
    if (Array.isArray(obj)) {
      return false
    }
    if (obj.constructor !== Object) {
      return false
    }
    return true
  }
}

export default LineProtocol
