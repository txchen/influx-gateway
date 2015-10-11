import { IGWValidationError } from './error'

const keyRegex = /^[a-zA-Z0-9][\w-\.\/]*$/

class LineProtocol {
  tranform(json) {
    validate(json)
    const { measurement, tags, fields } = parseInput(json)
  }

  validate(json) {
    if (!this.isDictionary(json)) {
      throw new IGWValidationError('input must be a json object.')
    }

    // _name is measurement, must exists and must be valid
    if (!json._name) {
      throw new IGWValidationError('measurement must be specified.')
    }
    if (!this.isString(json._name)) {
      throw new IGWValidationError('measurement must be a string.')
    }
    if (!keyRegex.test(json._name)) {
      throw new IGWValidationError('measurement name invalid.')
    }

    // validate tags and fields
    for (const propertyName in json) {
      if (/^[a-zA-Z0-9]/.test(propertyName)) { // propertyName start with a-zA-Z0-9, recognized as tag
        if (!keyRegex.test(propertyName)) {
          throw new IGWValidationError('tag name invalid: ' + propertyName)
        }
        // tag value must be string
        if (!this.isString(json[propertyName])) {
          throw new IGWValidationError('value of tag: "${propertyName}" must be a string.')
        }
        if (!keyRegex.test(json[propertyName])) {
          throw new IGWValidationError('value of tag: "${propertyName}" is invalid')
        }
      } else if (/^__[a-zA-Z0-9]/.test(propertyName)) { // propertyName start with __[a-zA-Z0-9], recognized as field
        const fieldName = propertyName.substring(2)
        if (!keyRegex.test(fieldName)) {
          throw new IGWValidationError('field name invalid: ' + propertyName)
        }
        if (!this.isValidFieldValue(json[propertyName])) {
          throw new IGWValidationError('value of field: "${fieldName}" is invalid')
        }
      }
    }
  }

  // returns measurement, tags[], fields[]
  parseInput(json) {
    const measurement = json._name
    const tags = []
    const fields = []
    return { measurement, tags, fields }
  }

  isValidFieldValue(obj) {
    return typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean'
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

  isString(obj) {
    return typeof obj === 'string' || obj instanceof String
  }
}

export default LineProtocol
