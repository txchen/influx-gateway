import { IGWValidationError } from './error'

const keyRegex = /^[a-zA-Z0-9][\w-\.\/]*$/

class LineProtocol {
  tranform(json) {
    validate(json)
  }

  validate(json) {
    if (!this.isDictionary(json)) {
      throw new IGWValidationError('input must be a json object.')
    }

    // _name is measurement, must exists and must be valid
    if (!json._name) {
      throw new IGWValidationError('measurement must be specified.')
    }
    if (!keyRegex.test(json._name)) {
      throw new IGWValidationError('measurement name invalid.')
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
