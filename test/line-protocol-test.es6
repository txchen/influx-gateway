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
      validateOK({ _name: 'abc', t1: 'v1', t2: 'v2' })
      validateOK({ _name: 'abc', t1: 'v1', __f1: 1, __f2: true, __f3: '', __f4: 's', __f5: 1.1, __f6: -1.1 })
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
      validateShouldThrowError({ _name: 1 })
      validateShouldThrowError({ _name: 1.1 })
      validateShouldThrowError({ _name: [] })
      validateShouldThrowError({ _name: {} })
      validateShouldThrowError({ _name: ' ' })
      validateShouldThrowError({ _name: ' a' })
      validateShouldThrowError({ _name: '.' })
      validateShouldThrowError({ _name: 'abc()' })
      validateShouldThrowError({ _name: 'abc\\' })
    })

    it('should throw error if tag name is invalid', () => {
      validateShouldThrowError({ _name: 'a', 'A+B': 'bar' })
      validateShouldThrowError({ _name: 'a', 'A+B': 'bar', 'foo': 'bar' })
      validateShouldThrowError({ _name: 'a', 'A(D)': 'bar', 'foo': 'bar' })
    })

    it('should throw error if tag value is invalid', () => {
      validateShouldThrowError({ _name: 'a', 'abc': '' })
      validateShouldThrowError({ _name: 'a', 'abc': 1 })
      validateShouldThrowError({ _name: 'a', 'abc': [] })
      validateShouldThrowError({ _name: 'a', 'abc': {} })
      validateShouldThrowError({ _name: 'a', 'abc': ' ' })
      validateShouldThrowError({ _name: 'a', 'abc': 'abc()' })
      validateShouldThrowError({ _name: 'a', 'abc': 'abc\\' })
    })

    it('should throw error if field name is invalid', () => {
      validateShouldThrowError({ _name: 'a', '__a+b': 'a' })
      validateShouldThrowError({ _name: 'a', '__a(b)': 'a' })
    })

    it('should throw error if field value type is invalid', () => {
      validateShouldThrowError({ _name: 'a', '__abc': [] })
      validateShouldThrowError({ _name: 'a', '__abc': null })
      validateShouldThrowError({ _name: 'a', '__abc': undefined })
      validateShouldThrowError({ _name: 'a', '__abc': {} })
    })
  })

  describe('parseInput', () => {
    it('should parse the measurement name', () => {
      lp.parseInput({ _name: 'abc' }).measurement.should.equal('abc')
    })
  })
})
