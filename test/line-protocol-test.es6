import chai from 'chai'
import LineProtocol from '../lib/line-protocol'
import { IGWValidationError } from '../lib/error'

chai.should()
const lp = new LineProtocol()

function validateCall(input) {
  return () => {
    lp.validate(input)
  }
}

function validateShouldThrowError(input) {
  validateCall(input).should.throw(IGWValidationError)
}

function validateOK(input) {
  validateCall(input).should.not.throw(Error)
}

describe('LineProtocol', () => {
  describe('validate', () => {
    it('should not throw error if input is valid', () => {
      validateOK({ _name: 'abc' })
      validateOK({ _name: 'abc.cde' })
      validateOK({ _name: 'a-c' })
      validateOK({ _name: 'a/c' })
      validateOK({ _name: 'A_B/C-a-b_10.' })
    })

    it('should throw error if input is string', () => {
      validateShouldThrowError('s')
    })

    it('should throw error if input is int', () => {
      validateShouldThrowError(1)
    })

    it('should throw error if input is float', () => {
      validateShouldThrowError(1.1)
    })

    it('should throw error if input is undefined', () => {
      validateShouldThrowError(undefined)
    })

    it('should throw error if input is null', () => {
      validateShouldThrowError(null)
    })

    it('should throw error if input is array', () => {
      validateShouldThrowError([])
    })

    it('should throw error if measurement is not specified', () => {
      validateShouldThrowError({})

      validateShouldThrowError({ foo: 'bar' })
    })

    it('should throw error if measurement name is invalid', () => {
      validateShouldThrowError({ _name: '' })
      validateShouldThrowError({ _name: null })
      validateShouldThrowError({ _name: undefined })
      validateShouldThrowError({ _name: ' ' })
      validateShouldThrowError({ _name: ' a' })
      validateShouldThrowError({ _name: '.' })
      validateShouldThrowError({ _name: 'abc()' })
      validateShouldThrowError({ _name: 'abc\\' })
    })
  })
})
