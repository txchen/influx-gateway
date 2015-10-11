import { IGWValidationError } from './error'

const keyRegex = /^[a-zA-Z0-9][\w-\.\/]*$/

class LineProtocol {
  tranform(json) {
    this.validate(json)
    const { measurement, tags, fields } = this.parseInput(json)
    return this.buildKeyExpression(measurement, tags) + ' ' + this.buildFieldsExpression(fields)
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

  // returns measurement, tags{}, fields{}
  parseInput(json) {
    const measurement = json._name
    const tags = {}
    const fields = {}
    for (const propertyName in json) {
      if (/^[a-zA-Z0-9]/.test(propertyName)) {
        tags[propertyName] = json[propertyName]
      } else if (/^__[a-zA-Z0-9]/.test(propertyName)) {
        const fieldName = propertyName.substring(2)
        fields[fieldName] = json[propertyName]
      }
    }
    if (Object.keys(fields).length === 0) {
      fields.count = 1 // influxdb must have at least one field, use count=1i if no fileds in input
    }
    return { measurement, tags, fields }
  }

  buildKeyExpression(measurement, tags) {
    let result = measurement
    Object.keys(tags).sort().forEach(tagName => { result += `,${tagName}=${tags[tagName]}` })
    return result
  }

  buildFieldsExpression(fields) {
    let result = ''
    Object.keys(fields).sort().forEach(fieldName => {
      const fieldVal = fields[fieldName]
      if (typeof fieldVal === 'boolean' || typeof fieldVal === 'number') {
        // NOTE: influxdb's int must have a trailing 'i', once a field is written into a series, its type cannot change.
        // however in js, 1.0 and 1 are the same thing, so we can not ensure the values are always int or float for
        // a field. Thus, always use float here. WTF, javascript!
        result += `,${fieldName}=${fieldVal}`
      } else if (typeof fieldVal === 'string') {
        result += `,${fieldName}=${JSON.stringify(fieldVal)}`
      }
    })
    return result.substring(1) // trim the leading ,
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
