import chai from 'chai'
import LineProtocol from '../lib/line-protocol'
import { IGWValidationError } from '../lib/error'

chai.should()
const lp = new LineProtocol()

describe('LineProtocol', () => {
  describe('validate', () => {
    it('should throw error if input is string', () => {
      (() => { lp.validate('s') }).should.throw(IGWValidationError)
    })

    it('should throw error if input is int', () => {
      () => { lp.validate(1) }.should.throw(IGWValidationError)
    })

    it('should throw error if input is float', () => {
      () => { lp.validate(1.1) }.should.throw(IGWValidationError)
    })

    it('should throw error if input is undefined', () => {
      () => { lp.validate(undefined) }.should.throw(IGWValidationError)
    })

    it('should throw error if input is null', () => {
      () => { lp.validate(null) }.should.throw(IGWValidationError)
    })

    it('should throw error if input is array', () => {
      () => { lp.validate([]) }.should.throw(IGWValidationError)
    })
  })
})
