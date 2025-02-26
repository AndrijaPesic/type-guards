import { expect } from 'chai'
import * as tg from './index'
import { describe, it } from 'mocha'
import { assert, IsExact, IsNullable } from 'conditional-type-checks'

// tslint:disable-next-line
function noop (...args: any[]) {
}

describe(`isInstanceOf`, () => {
  it(`works as expected`, () => {
    class Foo {
    }

    class Bar {
    }

    const isFoo = tg.isInstanceOf(Foo)
    const isBar = tg.isInstanceOf(Bar)
    const foo = new Foo()
    expect(isFoo(foo)).to.equal(true)
    expect(isBar(foo)).to.equal(false)
  })
  it(`works with abstract class`, () => {
    abstract class Foo {
    }

    class Bar extends Foo {
    }

    const isFoo = tg.isInstanceOf(Foo)
    const isBar = tg.isInstanceOf(Bar)
    const bar = new Bar()
    expect(isFoo(bar)).to.equal(true)
    expect(isBar(bar)).to.equal(true)
  })
})

describe(`isNull`, () => {
  it(`returns true when null is passed`, () => {
    expect(tg.isNull(null)).to.equal(true)
  })
  it(`returns false when undefined is passed`, () => {
    expect(tg.isNull(undefined)).to.equal(false)
  })
})

describe(`isNotNull`, () => {
  it(`works`, () => {
    expect(tg.isNotNull(0)).to.equal(true)
    expect(tg.isNotNull(undefined)).to.equal(true)
    expect(tg.isNotNull(null)).to.equal(false)
  })
  it(`brings the correct type`, () => {
    let value: string | null = stringOrNull()
    if (tg.isNotNull(value)) {
      assert<IsExact<typeof value, string>>(true)
      assert<IsNullable<typeof value>>(false)
    } else {
      assert<IsExact<typeof value, never>>(true) // https://stackoverflow.com/q/56949854/2131286
      // assert<IsExact<typeof value, string | null>>(true)
      // assert<IsNullable<typeof value>>(true)
    }
  })
})

describe(`isNotNullOrUndefined`, () => {
  it(`works`, () => {
    expect(tg.isNotNullOrUndefined(0)).to.equal(true)
    expect(tg.isNotNullOrUndefined(undefined)).to.equal(false)
    expect(tg.isNotNullOrUndefined(null)).to.equal(false)
  })
  it(`brings the correct type`, () => {
    let value: string | null = stringOrNull()
    if (tg.isNotNullOrUndefined(value)) {
      assert<IsExact<typeof value, string>>(true)
      assert<IsNullable<typeof value>>(false)
    } else {
      assert<IsExact<typeof value, never>>(true) // https://stackoverflow.com/q/56949854/2131286
      // assert<IsExact<typeof value, string | null>>(true)
      // assert<IsNullable<typeof value>>(true)
    }
  })
})

describe(`isUndefined`, () => {
  it(`returns true when undefined is passed`, () => {
    expect(tg.isUndefined(undefined)).to.equal(true)
  })
  it(`returns false when null is passed`, () => {
    expect(tg.isUndefined(null)).to.equal(false)
  })
})

describe(`isNullOrUndefined`, () => {
  it(`returns true when undefined is passed`, () => {
    expect(tg.isNullOrUndefined(null)).to.equal(true)
  })
  it(`returns true when null is passed`, () => {
    expect(tg.isNullOrUndefined(undefined)).to.equal(true)
  })
})

describe(`isNumber`, () => {
  it(`returns true when a number is passed`, () => {
    expect(tg.isNumber(1)).to.equal(true)
  })
  it(`returns false when an array of numbers is passed`, () => {
    expect(tg.isNumber([1])).to.equal(false)
  })
  it(`returns false when a digit-only string is passed`, () => {
    expect(tg.isNumber('1')).to.equal(false)
  })
})

describe(`isString`, () => {
  it(`returns true when a string is passed`, () => {
    expect(tg.isString('foo')).to.equal(true)
  })
  it(`returns false when an array of characters is passed`, () => {
    expect(tg.isString(['f', 'o', 'o'])).to.equal(false)
  })
})

describe(`isBoolean`, () => {
  it(`returns true when true is passed`, () => {
    expect(tg.isBoolean(true)).to.equal(true)
  })
  it(`returns true when false is passed`, () => {
    expect(tg.isBoolean(false)).to.equal(true)
  })
  it(`returns false when zero is passed`, () => {
    expect(tg.isBoolean(0)).to.equal(false)
  })
  it(`returns false when an empty string is passed`, () => {
    expect(tg.isBoolean('')).to.equal(false)
  })
})

describe(`isEnum`, () => {
  it(`returns true when it belongs to enum`, () => {
    expect(tg.isEnum(1, 2, 3)(1)).to.equal(true)
  })
  it(`returns false when it does not belong to enum`, () => {
    expect(tg.isEnum(1, 2, 3)(4)).to.equal(false)
  })
  it(`always returns false for an empty enum`, () => {
    expect(tg.isEnum()(0)).to.equal(false)
  })
})

describe(`isArrayOf`, () => {
  describe(`isNumber`, () => {
    it(`returns true when array of numbers is passed`, () => {
      expect(tg.isArrayOf(tg.isNumber)([1, 2, 3])).to.equal(true)
    })
    it(`returns false when there is one string among numbers`, () => {
      expect(tg.isArrayOf(tg.isNumber)([1, '2', 3])).to.equal(false)
    })
    it(`returns true when an empty array is passed`, () => {
      expect(tg.isArrayOf(tg.isNumber)([])).to.equal(true)
    })
  })
  describe(`oneOf(isNull, isUndefined, isNumber)`, () => {
    const assert = tg.isArrayOf(tg.oneOf(tg.isNull, tg.isUndefined, tg.isNumber))
    it(`allows all nulls`, () => {
      expect(assert([null, null, null])).to.equal(true)
    })
    it(`allows a mix of null, undefined and numbers`, () => {
      expect(assert([1, null, 2, undefined, 3, null])).to.equal(true)
    })
    it(`does not allow a string`, () => {
      expect(assert([1, null, '2', undefined])).to.equal(false)
    })
  })
})

describe(`isObjectOfShape`, () => {
  describe(`asserting shape {foo: number}`, () => {
    const assert = tg.isOfShape({ foo: tg.isNumber })
    it(`returns true for an object matching the shape`, () => {
      expect(assert({ foo: 1 })).to.equal(true)
    })
    it(`returns false for an object matching the shape with additional props`, () => {
      expect(assert({ foo: 1, bar: 2 })).to.equal(false)
    })
    it(`returns false for an object which does not match the shape`, () => {
      expect(assert({ bar: 2 })).to.equal(false)
    })
    it(`doesn't allow extra keys`, () => {
      expect(assert({ foo: 1, bar: 2 })).to.equal(false)
    })
    it(`is correctly typed`, () => {
      let input: {} = {}
      if (assert(input)) {
        try {
          noop(input.foo.toExponential())
        } catch {
        }
      }
    })
  })
  describe(`asserting shape {foo: number[], bar: {baz: string, qux: null | boolean}}`, () => {
    const assert = tg.isOfShape({
      foo: tg.isArrayOf(tg.isNumber),
      bar: {
        baz: tg.isString,
        qux: tg.oneOf(tg.isNull, tg.isBoolean),
      },
    })
    it(`returns true for an object matching the shape`, () => {
      const input = { foo: [1, 2], bar: { baz: 'baz', qux: true } }
      expect(assert(input)).to.equal(true)
    })
    it(`returns false for an object missing "qux"`, () => {
      const input = { foo: [1, 2], bar: { baz: 'baz' } }
      expect(assert(input)).to.equal(false)
    })
    it(`returns false for wrong type of "foo"`, () => {
      const input = { foo: 1, bar: { baz: 'baz', qux: false } }
      expect(assert(input)).to.equal(false)
    })
    it(`returns false from wrong type of "baz"`, () => {
      const input = { foo: [1], bar: { bar: 'baz', qux: undefined } }
      expect(assert(input)).to.equal(false)
    })
    it(`doesn't allow extra nested keys`, () => {
      const input = { foo: [], bar: { baz: 'baz', qux: true, test: 'test' } }
      expect(assert(input)).to.equal(false)
    })
    it(`is correctly typed`, () => {
      let input: {} = {}
      if (assert(input)) {
        try {
          noop(input.foo[0].toExponential())
          noop(input.bar.baz.charAt(0))
        } catch {
        }
      }
    })
  })
})

describe(`pick`, () => {
  const a = 'a', b = 'b', c = 'c'
  it(`grabs only one key from a larger shape`, () => {
    const superType = tg.isOfShape({ a: tg.isString, b: tg.isString })
    const subType = tg.pick(superType, 'a')
    expect(subType({ a })).to.equal(true)
    expect(subType({ a, b })).to.equal(false)
  })
  it(`grabs a few keys from a larger shape`, () => {
    const superType = tg.isOfShape({ a: tg.isString, b: tg.isString, c: tg.isString, d: tg.isString })
    const subType = tg.pick(superType, 'a', 'b')
    expect(subType({ a })).to.equal(false, `Missing "b".`)
    expect(subType({ a, b })).to.equal(true)
    expect(subType({ a, b, c })).to.equal(false, `Extra "c".`)
  })
  it(`grabs everything from a larger shape`, () => {
    const superType = tg.isOfShape({ a: tg.isString, b: tg.isString })
    const subType = tg.pick(superType, 'a', 'b')
    expect(subType({ a })).to.equal(false, `Missing "a".`)
    expect(subType({ a, b })).to.equal(true)
  })
})

describe(`omit`, () => {
  const a = 'a', b = 'b', c = 'c'
  it(`omits one key from a larger shape`, () => {
    const superType = tg.isOfShape({ a: tg.isString, b: tg.isString, c: tg.isString })
    const subType = tg.omit(superType, 'a')
    expect(subType({ a })).to.equal(false, `Extra "a", missing "b" and "c".`)
    expect(subType({ b, c })).to.equal(true)
    expect(subType({ b })).to.equal(false, `Missing "c".`)
  })
})

describe(`partial`, () => {
  const a = 'a', b = 'b', c = 'c'
  const superType = tg.isOfShape({ a: tg.isString, b: tg.isString, c: tg.isString })
  const subType = tg.partial(superType)
  it(`allows the full type`, () => {
    expect(subType({ a, b, c })).to.equal(true)
  })
  it(`allows a partial type`, () => {
    expect(subType({ a, b, c: undefined })).to.equal(true)
  })
  it(`allows "empty" object`, () => {
    expect(subType({ a: undefined, b: undefined, c: undefined })).to.equal(true)
  })
  it(`doesn't allow random stuff like arrays of numbers`, () => {
    expect(subType([])).to.equal(false, `Array`)
    expect(subType(0)).to.equal(false, `Number`)
    expect(subType('a')).to.equal(false, `String`)
  })
})

function stringOrNull (): string | null {
  return Math.random() > 0.5 ? '' : null
}
