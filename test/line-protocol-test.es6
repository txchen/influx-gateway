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
  describe('tranform', () => {
    it('should transform with expected result', () => {
      lp.tranform({ _name: 'cpu', host: 'a', cluster: 'uswest', __value: 30.2, __prod: false, __weather: 'rainy' })
        .should.equal('cpu,cluster=uswest,host=a prod=false,value=30.2,weather="rainy"')
    })
  })

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

    it('should parse the tags', () => {
      lp.parseInput({ _name: 'test', abc: 'cde', efg: 'xzy', '___ignore': 'me' })
        .tags.should.eql({ abc: 'cde', efg: 'xzy' })
    })

    it('should parse the fields', () => {
      lp.parseInput({ _name: 'test', __f1: 1, __f2: 'v2', __f3: false, __f4: -1.2 })
        .fields.should.eql({ f1: 1, f2: 'v2', f3: false, f4: -1.2 })
    })

    it('should add count if no fields in input', () => {
      lp.parseInput({ _name: 'test' }).fields.should.eql({ count: 1 })
    })
  })

  describe('buildKeyExpression', () => {
    it('should work if no tags are specified', () => {
      lp.buildKeyExpression('abc', {}).should.equal('abc')
    })

    it('should work if tags are specified', () => {
      lp.buildKeyExpression('abc', { cpu: '1', server: '2' }).should.equal('abc,cpu=1,server=2')
    })

    it('should generate expression with tag key ordered', () => {
      lp.buildKeyExpression('abc', { b: 'b', a: 'a', c: 'c' }).should.equal('abc,a=a,b=b,c=c')
    })
  })

  describe('buildFieldsExpression', () => {
    it('should render boolean values correctly', () => {
      lp.buildFieldsExpression({ f1: true, f2: false }).should.equal('f1=true,f2=false')
    })

    it('should render number values correctly', () => { // always float type of influx data
      lp.buildFieldsExpression({ f1: 1, f2: 1.1, f3: -1, f4: -100.0 }).should.equal('f1=1,f2=1.1,f3=-1,f4=-100')
    })

    it('should render string values correctly', () => {
      lp.buildFieldsExpression({ f1: '', f2: ' ', f3: 'a c', f4: 'Z"Y' }).should.equal('f1="",f2=" ",f3="a c",f4="Z\\"Y"')
    })

    it('should render result with field name ordered', () => {
      lp.buildFieldsExpression({ f4: 1, f3: true, f2: 1.4, f1: 'a' }).should.equal('f1="a",f2=1.4,f3=true,f4=1')
    })
  })
})
