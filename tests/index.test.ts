import { just, nothing } from 'error-null-handle'

import iter, { P, range, repeat, type Iter } from '../src/index'
import { equal, id } from '../src/utils'

type TestObj = { a: number, b: number }

test('equal', () => {
  expect(equal(iter([1, 2, 3]), iter([1, 2, 3]))).toEqual(true)
  expect(equal(iter([1, 2, 3]), iter([1, 2]))).toEqual(false)

  expect(equal({ foo: 'bar' }, { foo: 'bar' })).toEqual(true)
  expect(equal({ foo: 'bar' }, { foo: 'baz' })).toEqual(false)

  expect(equal([1, 2, 3], [1, 2, 3])).toEqual(true)
  expect(equal([1, 2, 3], [1, 2])).toEqual(false)

  expect(equal(new Set([1, 2, 3]), new Set([1, 2, 3]))).toEqual(true)
  expect(equal(new Set([1, 2, 3]), new Set([1, 2, 4]))).toEqual(false)
  expect(equal(new Set([1, 2, 3]), new Set([1, 2]))).toEqual(false)

  expect(equal(new Map([[1, 2], [3, 4]]), new Map([[1, 2], [3, 4]]))).toEqual(true)
  expect(equal(new Map([[1, 2], [3, 4]]), new Map([[1, 2], [3, 5]]))).toEqual(false)
  expect(equal(new Map([[1, 2], [3, 4]]), new Map([[1, 2]]))).toEqual(false)

  expect(equal(new Error('foo'), new Error('foo'))).toEqual(true)
  expect(equal(new Error('foo'), new Error('bar'))).toEqual(false)

  expect(equal(new Uint16Array([1, 2, 3]), new Uint16Array([1, 2, 3]))).toEqual(true)
  expect(equal(new Uint16Array([1, 2, 3]), new Int16Array([1, 2, 3]))).toEqual(false)
  expect(equal(new Uint16Array([1, 2, 3]), new Uint16Array([1, 2, 4]))).toEqual(false)
  expect(equal(new Uint16Array([1, 2, 3]), new Uint16Array([1, 2]))).toEqual(false)

  expect(equal(new ArrayBuffer(4), new ArrayBuffer(4))).toEqual(true)
  expect(equal(new ArrayBuffer(4), new ArrayBuffer(8))).toEqual(false)

  expect(equal(new DataView(new ArrayBuffer(4)), new DataView(new ArrayBuffer(4)))).toEqual(true)
  expect(equal(new DataView(new ArrayBuffer(4)), new DataView(new ArrayBuffer(8)))).toEqual(false)

  expect(equal(new Date(), new Date())).toEqual(true)
  expect(equal(new Date(), new Date('2000-01-01'))).toEqual(false)

  expect(equal(/abc/gi, /abc/gi)).toEqual(true)
  expect(equal(/abc/gi, /abc/g)).toEqual(false)

  expect(equal(NaN, NaN)).toEqual(true)
  expect(equal(NaN, 0)).toEqual(false)

  expect(equal(Promise.resolve(1), Promise.resolve(1))).toEqual(false)

  expect(equal(BigInt(1), BigInt(1))).toEqual(true)
  expect(equal(BigInt(1), BigInt(2))).toEqual(false)
  expect(equal(BigInt(1), 1)).toEqual(false)

  expect(equal(Symbol('foo'), Symbol('foo'))).toEqual(false)
  expect(equal(Symbol.for('foo'), Symbol.for('foo'))).toEqual(true)

  expect(equal(1, 1)).toEqual(true)
  expect(equal(1, 2)).toEqual(false)
  expect(equal(Infinity, Infinity)).toEqual(true)

  expect(equal(true, true)).toEqual(true)
  expect(equal(true, false)).toEqual(false)

  expect(equal(null, null)).toEqual(true)
  expect(equal(null, undefined)).toEqual(false)
  expect(equal(undefined, undefined)).toEqual(true)

  expect(equal('foo', 'foo')).toEqual(true)
  expect(equal('foo', 'bar')).toEqual(false)
})

test('iter Symbol.iterator', () => {
  const it1 = iter([1, 2, 3])[Symbol.iterator]()
  expect(it1.next()).toEqual({ value: 1, done: false })
  expect(it1.next()).toEqual({ value: 2, done: false })
  expect(it1.next()).toEqual({ value: 3, done: false })
  expect(it1.next()).toEqual({ value: undefined, done: true })

  const it2 = iter()[Symbol.iterator]()
  expect(it2.next()).toEqual({ value: undefined, done: true })

  const it3 = iter(1)[Symbol.iterator]()
  expect(it3.next()).toEqual({ value: 1, done: false })
  expect(it3.next()).toEqual({ value: undefined, done: true })
})

test('iter toArray', () => {
  expect(iter([1, 2, 3]).toArray()).toEqual([1, 2, 3])
})

test('iter append', () => {
  const it = iter([1, 2, 3]).append(4)
  expect(it.toArray()).toEqual([1, 2, 3, 4])
  expect(it.toArray()).toEqual([1, 2, 3, 4])

  expect(iter([1, 2, 3]).append(4).toArray()).toEqual([1, 2, 3, 4])
  expect(iter().append(1).toArray()).toEqual([1])
})

test('iter take', () => {
  const it = iter([1, 2, 3]).take(2)
  expect(it.toArray()).toEqual([1, 2])
  expect(it.toArray()).toEqual([1, 2])
  expect(iter([1, 2, 3]).take(2).toArray()).toEqual([1, 2])
  expect(iter([1, 2, 3]).take(5).toArray()).toEqual([1, 2, 3])
  expect(iter([1, 2, 3]).take(0).toArray()).toEqual([])
})

test('range', () => {
  expect(range().take(3).toArray()).toEqual([0, 1, 2])
  expect(range(3).take(3).toArray()).toEqual([3, 4, 5])
  expect(range(1, 3).toArray()).toEqual([1, 2])
  expect(range(1, 7, 2).toArray()).toEqual([1, 3, 5])
  expect(range(1, 7, 3).toArray()).toEqual([1, 4])
  expect(range({ start: 1, end: 3 }).toArray()).toEqual([1, 2])
  expect(range({ start: 1, end: 7, step: 2 }).toArray()).toEqual([1, 3, 5])
  expect(range({ start: 1, end: 7, step: 3 }).toArray()).toEqual([1, 4])
  expect(range({ start: 3 }).take(3).toArray()).toEqual([3, 4, 5])
  expect(range({ end: 3 }).take(3).toArray()).toEqual([0, 1, 2])
  expect(range({ step: 2 }).take(3).toArray()).toEqual([0, 2, 4])
})

test('iter chain', () => {
  const it = iter([1, 2, 3]).chain([4, 5, 6])
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])

  expect(iter([1, 2, 3]).chain([4, 5, 6]).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2, 3]).chain(iter([4, 5, 6])).toArray()).toEqual([1, 2, 3, 4, 5, 6])
})

test('iter chunks', () => {
  const it = iter([1, 2, 3]).chunks(2)
  expect(it.toArray().map(chunk => chunk.toArray())).toEqual([[1, 2], [3]])
  expect(it.toArray().map(chunk => chunk.toArray())).toEqual([[1, 2], [3]])

  expect(iter([1, 2, 3]).chunks(2).toArray().map(chunk => chunk.toArray())).toEqual([[1, 2], [3]])
  expect(iter([1, 2, 3]).chunks(5).toArray().map(chunk => chunk.toArray())).toEqual([[1, 2, 3]])
  expect(iter([]).chunks(1).toArray()).toEqual([])
  expect(() => iter().chunks(0)).toThrow('Expected non-zero in chunks, but got 0!')
  expect(() => iter().chunks(-1)).toThrow('Expected non-negative in chunks, but got -1!')
  expect(() => iter([1, 2, 3]).chunks(1.1)).toThrow('Expected integer in chunks, but got 1.1!')
})

test('iter compact', () => {
  const it = iter([1, 2, null, undefined, 3]).compact()
  expect(it.toArray()).toEqual([1, 2, 3])
  expect(it.toArray()).toEqual([1, 2, 3])

  expect(iter().compact().toArray()).toEqual([])
  expect(iter([1, 2, 3]).compact().toArray()).toEqual([1, 2, 3])
  expect(iter([1, 2, null, undefined, 3]).compact().toArray()).toEqual([1, 2, 3])
  expect(iter([1, 2, null, undefined, just(3), nothing<number>()]).compact().toArray()).toEqual([1, 2, 3])
})

test('iter concat', () => {
  const it = iter([1, 2, 3]).concat([4, 5, 6])
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])

  expect(iter([1, 2, 3]).concat([4, 5, 6]).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2, 3]).concat(iter([4, 5, 6])).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2]).concat([3, 4], iter([5, 6])).toArray()).toEqual([1, 2, 3, 4, 5, 6])
})

test('iter cycle', () => {
  const it = iter([1, 2, 3]).cycle().take(4)
  expect(it.toArray()).toEqual([1, 2, 3, 1])
  expect(it.toArray()).toEqual([1, 2, 3, 1])

  expect(iter([1, 2, 3]).cycle().take(2).toArray()).toEqual([1, 2])
  expect(iter([1, 2, 3]).cycle().take(5).toArray()).toEqual([1, 2, 3, 1, 2])
  expect(iter([1, 2, 3]).cycle().take(10).toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3, 1])
})

test('iter dedup', () => {
  const it = iter([1, 2, 2, 2, 3, 2, 2, 3, 3]).dedup()
  expect(it.toArray()).toEqual([1, 2, 3, 2, 3])
  expect(it.toArray()).toEqual([1, 2, 3, 2, 3])

  expect(iter([1, 2, 3, 1, 2, 3]).dedup().toArray()).toEqual([1, 2, 3, 1, 2, 3])
  expect(iter([1, 2, 2, 2, 3, 2, 2, 3, 3]).dedup().toArray()).toEqual([1, 2, 3, 2, 3])
  expect(iter([]).dedup().toArray()).toEqual([])
})

test('iter dedupBy', () => {
  const it = iter([1, 2, 2, 2, 3, 2, 2, 3, 3]).dedupBy((a, b) => a === b)
  expect(it.toArray()).toEqual([1, 2, 3, 2, 3])
  expect(it.toArray()).toEqual([1, 2, 3, 2, 3])

  expect(iter([1, 2, 3, 1, 2, 3]).dedupBy((a, b) => a === b).toArray()).toEqual([1, 2, 3, 1, 2, 3])
  expect(iter([1, 2, 2, 2, 3, 2, 2, 3, 3]).dedupBy((a, b) => a === b).toArray()).toEqual([1, 2, 3, 2, 3])
  expect(iter([]).dedupBy((a, b) => a === b).toArray()).toEqual([])
  expect(iter([
    { a: 1, b: 1 },
    { a: 2, b: 1 },
    { a: 2, b: 2 },
    { a: 2, b: 3 },
    { a: 3, b: 1 },
    { a: 3, b: 2 },
    { a: 2, b: 1 },
    { a: 2, b: 2 },
    { a: 2, b: 3 },
  ]).dedupBy((a, b) => a.a === b.a).toArray()).toEqual([
    { a: 1, b: 1 },
    { a: 2, b: 1 },
    { a: 3, b: 1 },
    { a: 2, b: 1 },
  ])
})

test('iter dedupByKey', () => {
  const it = iter([1, 2, 2, 2, 3, 2, 2, 3, 3]).dedupByKey(id)
  expect(it.toArray()).toEqual([1, 2, 3, 2, 3])
  expect(it.toArray()).toEqual([1, 2, 3, 2, 3])

  expect(iter([
    { a: 1, b: 1 },
    { a: 2, b: 1 },
    { a: 2, b: 2 },
    { a: 2, b: 3 },
    { a: 3, b: 1 },
    { a: 3, b: 2 },
    { a: 2, b: 1 },
    { a: 2, b: 2 },
    { a: 2, b: 3 },
  ]).dedupByKey(value => value.a).toArray()).toEqual([
    { a: 1, b: 1 },
    { a: 2, b: 1 },
    { a: 3, b: 1 },
    { a: 2, b: 1 },
  ])
})

test('iter enumerate', () => {
  const it = iter([1, 2, 3]).enumerate()
  expect(it.toArray()).toEqual([[0, 1], [1, 2], [2, 3]])
  expect(it.toArray()).toEqual([[0, 1], [1, 2], [2, 3]])

  expect(iter([1, 2, 3]).enumerate().toArray()).toEqual([[0, 1], [1, 2], [2, 3]])
})

test('iter filter', () => {
  const it = iter([1, 2, 3, undefined, null]).filter(v => typeof v === 'number')
  expect(it.toArray()).toEqual([1, 2, 3])
  expect(it.toArray()).toEqual([1, 2, 3])

  expect(iter([1, 2, 3, undefined, null]).filter(v => typeof v === 'number').toArray()).toEqual([1, 2, 3])
  expect(iter([1, 2, 3]).filter(value => value % 2 === 0).toArray()).toEqual([2])
  expect(iter([1, 2, 3]).filter(value => value % 2 === 1).toArray()).toEqual([1, 3])
  expect(iter([1, 2, 3]).filter(() => false).toArray()).toEqual([])
  expect(iter([1, 2, 3]).filter(() => true).toArray()).toEqual([1, 2, 3])
})

test('iter filterMap', () => {
  const it = iter([1, 2, 3]).filterMap(value => value % 2 === 0 ? value : undefined)
  expect(it.toArray()).toEqual([2])
  expect(it.toArray()).toEqual([2])

  expect(iter([1, 2, 3]).filterMap(value => value % 2 === 0 ? value : undefined).toArray()).toEqual([2])
  expect(iter([1, 2, 3]).filterMap(value => value % 2 === 1 ? value : undefined).toArray()).toEqual([1, 3])
  expect(iter([1, 2, 3]).filterMap(() => undefined).toArray()).toEqual([])
  expect(iter([1, 2, 3]).filterMap(() => 1).toArray()).toEqual([1, 1, 1])
  expect(iter([1, 2, 3]).filterMap(() => null).toArray()).toEqual([])
  expect(iter([1, 2, 3]).filterMap(() => false).toArray()).toEqual([false, false, false])
  expect(iter([1, 2, 3]).filterMap(v => v % 2 === 0 ? just(v * 2) : nothing()).toArray()).toEqual([4])
  expect(iter([1, 2, 3]).filterMap(v => v % 2 === 1 ? just(v * 2) : nothing()).toArray()).toEqual([2, 6])
})

test('iter flat', () => {
  const it = iter([1, [2, 3], [[4, 5], 6]]).flat(2)
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])

  expect(iter([1, 2, 3]).flat().toArray()).toEqual([1, 2, 3])
  expect(iter([[1], [2], [3]]).flat().toArray()).toEqual([1, 2, 3])
  expect(iter([[[1], [2], [3]]]).flat().toArray()).toEqual([[1], [2], [3]])
  expect(iter([[[[1], [2], [3]]]]).flat(1).toArray()).toEqual([[[1], [2], [3]]])
  expect(iter([[[[1], [2], [3]]]]).flat(2).toArray()).toEqual([[1], [2], [3]])
  expect(iter([[[[1], [2], [3]]]]).flat(3).toArray()).toEqual([1, 2, 3])
})

test('iter flatMap', () => {
  const it = iter([1, 2, 3]).flatMap(value => iter([value, value * 2]))
  expect(it.toArray()).toEqual([1, 2, 2, 4, 3, 6])
  expect(it.toArray()).toEqual([1, 2, 2, 4, 3, 6])

  expect(iter([1, 2, 3]).flatMap(value => iter([value, value * 2])).toArray()).toEqual([1, 2, 2, 4, 3, 6])
  expect(iter([1, 2, 3]).flatMap(value => [value, value * 2]).toArray()).toEqual([1, 2, 2, 4, 3, 6])
})

test('iter inspect', () => {
  const it = iter([1, 2]).inspect(console.log)
  expect(it.toArray()).toEqual([1, 2])
  expect(it.toArray()).toEqual([1, 2])

  const values: number[] = []
  iter([1, 2, 3]).inspect(value => values.push(value)).toArray()
  expect(values).toEqual([1, 2, 3])

  const logSpy = jest.spyOn(console, 'log')
  expect(iter([1, 2, 3]).inspect(console.log).toArray()).toEqual([1, 2, 3])
  expect(logSpy).toHaveBeenCalledWith(1)
  expect(logSpy).toHaveBeenCalledWith(2)
  expect(logSpy).toHaveBeenCalledWith(3)
  logSpy.mockRestore()
})

test('iter interleave', () => {
  const it = iter([1, 2, 3]).interleave([4, 5, 6, 7])
  expect(it.toArray()).toEqual([1, 4, 2, 5, 3, 6, 7])
  expect(it.toArray()).toEqual([1, 4, 2, 5, 3, 6, 7])

  expect(iter([1, 2, 3]).interleave([4, 5, 6, 7]).toArray()).toEqual([1, 4, 2, 5, 3, 6, 7])
  expect(iter([1, 2, 3]).interleave([4, 5]).toArray()).toEqual([1, 4, 2, 5, 3])
  expect(iter([1, 2, 3]).interleave([4, 5, 6]).toArray()).toEqual([1, 4, 2, 5, 3, 6])
  expect(iter([1, 2, 3]).interleave([]).toArray()).toEqual([1, 2, 3])
  expect(iter<number>().interleave([4, 5, 6]).toArray()).toEqual([4, 5, 6])
})

test('iter interleaveShortest', () => {
  const it = iter([1, 2, 3]).interleaveShortest([4, 5, 6, 7, 8])
  expect(it.toArray()).toEqual([1, 4, 2, 5, 3, 6])
  expect(it.toArray()).toEqual([1, 4, 2, 5, 3, 6])

  expect(iter([1, 2, 3]).interleaveShortest([4, 5, 6, 7, 8]).toArray()).toEqual([1, 4, 2, 5, 3, 6])
  expect(iter([1, 2, 3, 6]).interleaveShortest([4, 5]).toArray()).toEqual([1, 4, 2, 5])
  expect(iter([1, 2, 3]).interleaveShortest([4, 5, 6]).toArray()).toEqual([1, 4, 2, 5, 3, 6])
  expect(iter([1, 2, 3]).interleaveShortest([]).toArray()).toEqual([])
  expect(iter<number>().interleaveShortest([4, 5, 6]).toArray()).toEqual([])
})

test('iter intersperse', () => {
  const it = iter([1, 2, 3]).intersperse(0)
  expect(it.toArray()).toEqual([1, 0, 2, 0, 3])
  expect(it.toArray()).toEqual([1, 0, 2, 0, 3])

  expect(iter([1, 2, 3]).intersperse(0).toArray()).toEqual([1, 0, 2, 0, 3])
  expect(iter<number>([]).intersperse(0).toArray()).toEqual([])
  expect(iter([1]).intersperse(0).toArray()).toEqual([1])
})

test('iter map', () => {
  const it = iter([1, 2, 3]).map(value => value * 2)
  expect(it.toArray()).toEqual([2, 4, 6])
  expect(it.toArray()).toEqual([2, 4, 6])

  expect(iter([1, 2, 3]).map(value => value * 2).toArray()).toEqual([2, 4, 6])
  expect(iter([1, 2, 3]).map(() => 0).toArray()).toEqual([0, 0, 0])
  expect(iter([]).map(() => 0).toArray()).toEqual([])
})

test('iter merge', () => {
  const it = iter([1, 2, 3]).merge([4, 5, 6])
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])

  expect(iter([1, 2, 3]).merge([4, 5, 6]).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2, 3]).merge(iter([4, 5, 6])).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 3, 5]).merge([2, 4, 6]).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2, 3]).merge([]).toArray()).toEqual([1, 2, 3])
  expect(iter<number>().merge([4, 5, 6]).toArray()).toEqual([4, 5, 6])
  expect(iter([1, 1, 1]).merge([2, 2]).toArray()).toEqual([1, 1, 1, 2, 2])
})

test('iter mergeBy', () => {
  const it = iter([1, 2, 3]).mergeBy([4, 5, 6], (a, b) => a < b)
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])

  expect(iter([1, 2, 3]).mergeBy([4, 5, 6], (a, b) => a < b).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 3, 5]).mergeBy([2, 4, 6], (a, b) => a < b).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2, 3]).mergeBy([], (a, b) => a < b).toArray()).toEqual([1, 2, 3])
  expect(iter<number>().mergeBy([4, 5, 6], (a, b) => a < b).toArray()).toEqual([4, 5, 6])
  expect(iter([1, 1, 1]).mergeBy([2, 2], (a, b) => a < b).toArray()).toEqual([1, 1, 1, 2, 2])
  expect(iter([
    { a: 1, b: 1 },
    { a: 2, b: 2 },
  ]).mergeBy([
    { a: 1, b: 2 },
    { a: 1, b: 3 },
    { a: 3, b: 3 },
  ], (a, b) => a.a < b.a).toArray()).toEqual([
    { a: 1, b: 2 },
    { a: 1, b: 3 },
    { a: 1, b: 1 },
    { a: 2, b: 2 },
    { a: 3, b: 3 },
  ])
})

test('iter mergeByKey', () => {
  const it = iter([1, 2, 3]).mergeByKey([4, 5, 6], id)
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(it.toArray()).toEqual([1, 2, 3, 4, 5, 6])

  expect(iter([1, 2, 3]).mergeByKey([4, 5, 6], id).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 3, 5]).mergeByKey([2, 4, 6], id).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2, 3]).mergeByKey([], id).toArray()).toEqual([1, 2, 3])
  expect(iter<number>().mergeByKey([4, 5, 6], id).toArray()).toEqual([4, 5, 6])
  expect(iter([1, 1, 1]).mergeByKey([2, 2], id).toArray()).toEqual([1, 1, 1, 2, 2])
  expect(iter([
    { a: 1, b: 1 },
    { a: 2, b: 2 },
  ]).mergeByKey([
    { a: 1, b: 2 },
    { a: 1, b: 3 },
    { a: 3, b: 3 },
  ], v => v.a).toArray()).toEqual([
    { a: 1, b: 1 },
    { a: 1, b: 2 },
    { a: 1, b: 3 },
    { a: 2, b: 2 },
    { a: 3, b: 3 },
  ])
})

test('iter prepend', () => {
  const it = iter([1, 2, 3]).prepend(0)
  expect(it.toArray()).toEqual([0, 1, 2, 3])
  expect(it.toArray()).toEqual([0, 1, 2, 3])

  expect(iter([1, 2, 3]).prepend(0).toArray()).toEqual([0, 1, 2, 3])
  expect(iter().prepend(0).toArray()).toEqual([0])
})

test('iter repeat', () => {
  expect(repeat(1).take(5).toArray()).toEqual([1, 1, 1, 1, 1])
  expect(repeat(() => [1, 2, 3]).take(5).toArray()).toEqual([[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]])
})

test('iter scan', () => {
  const it = iter([1, 2, 3]).scan((acc, value) => acc + value, 0)
  expect(it.toArray()).toEqual([1, 3, 6])
  expect(it.toArray()).toEqual([1, 3, 6])

  expect(iter([1, 2, 3]).scan((acc, value) => acc + value, 0).toArray()).toEqual([1, 3, 6])
  expect(iter([]).scan((acc, value) => acc + value, 0).toArray()).toEqual([])
  expect(iter([1, 2, 3]).scan((acc, value) => {
    if (value === 3) return nothing()
    return acc + value
  }, 0).toArray()).toEqual([1, 3])
  expect(iter([1, 2, 3]).scan((acc, value) => {
    if (value === 3) return null
    return acc + value
  }, 0).toArray()).toEqual([1, 3])
  expect(iter([1, 2, 3]).scan((acc, value) => {
    if (value === 2) return undefined
    return acc + value
  }, 0).toArray()).toEqual([1])
})

test('iter skip', () => {
  const it = iter([1, 2, 3]).skip(2)
  expect(it.toArray()).toEqual([3])
  expect(it.toArray()).toEqual([3])

  expect(iter([1, 2, 3]).skip(2).toArray()).toEqual([3])
  expect(iter([1, 2, 3]).skip(5).toArray()).toEqual([])
  expect(iter([1, 2, 3]).skip(0).toArray()).toEqual([1, 2, 3])
  expect(iter([]).skip(0).toArray()).toEqual([])
  expect(iter([]).skip(1).toArray()).toEqual([])
})

test('iter skipWhile', () => {
  const it = iter([1, 2, 3]).skipWhile(value => value < 2)
  expect(it.toArray()).toEqual([2, 3])
  expect(it.toArray()).toEqual([2, 3])

  expect(iter([1, 2, 3]).skipWhile(value => value < 2).toArray()).toEqual([2, 3])
  expect(iter([1, 2, 3]).skipWhile(value => value < 0).toArray()).toEqual([1, 2, 3])
  expect(iter([]).skipWhile(() => true).toArray()).toEqual([])
  expect(iter([]).skipWhile(() => false).toArray()).toEqual([])
  expect(iter([1, 2, 3]).skipWhile(value => value < 4).toArray()).toEqual([])
})

test('iter slice', () => {
  const it = iter([1, 2, 3]).slice(1, 2)
  expect(it.toArray()).toEqual([2])
  expect(it.toArray()).toEqual([2])

  expect(iter([1, 2, 3]).slice(1, 2).toArray()).toEqual([2])
  expect(iter([1, 2, 3]).slice(0, 0).toArray()).toEqual([])
  expect(iter([1, 2, 3]).slice(0, 1).toArray()).toEqual([1])
  expect(iter([1, 2, 3]).slice(0, 5).toArray()).toEqual([1, 2, 3])
  expect(iter([]).slice(0, 0).toArray()).toEqual([])
  expect(() => iter().slice(-1, 1)).toThrow('Expected non-negative in slice, but got -1!')
  expect(() => iter().slice(0, -1)).toThrow('Expected non-negative in slice, but got -1!')
  expect(() => iter().slice(1, 0)).toThrow('Start index must be less than end index!')
})

test('iter stepBy', () => {
  const it = iter([1, 2, 3]).stepBy(2)
  expect(it.toArray()).toEqual([1, 3])
  expect(it.toArray()).toEqual([1, 3])

  expect(iter([1, 2, 3]).stepBy(2).toArray()).toEqual([1, 3])
  expect(iter([1, 2, 3]).stepBy(5).toArray()).toEqual([1])
  expect(iter([1, 2, 3]).stepBy(1).toArray()).toEqual([1, 2, 3])
  expect(iter([1, 2, 3, 4, 5, 6]).stepBy(2).toArray()).toEqual([1, 3, 5])
  expect(iter([]).stepBy(1).toArray()).toEqual([])
  expect(() => iter().stepBy(0)).toThrow('Expected non-zero in stepBy, but got 0!')
  expect(() => iter().stepBy(-1)).toThrow('Expected non-negative in stepBy, but got -1!')
})

test('iter takeWhile', () => {
  const it = iter([1, 2, 3]).takeWhile(value => value < 2)
  expect(it.toArray()).toEqual([1])
  expect(it.toArray()).toEqual([1])

  expect(iter([1, 2, 3]).takeWhile(value => value < 2).toArray()).toEqual([1])
  expect(iter([1, 2, 3]).takeWhile(value => value < 0).toArray()).toEqual([])
  expect(iter([]).takeWhile(() => true).toArray()).toEqual([])
  expect(iter([]).takeWhile(() => false).toArray()).toEqual([])
  expect(iter([1, 2, 3]).takeWhile(value => value < 4).toArray()).toEqual([1, 2, 3])
})

test('iter unique', () => {
  const it = iter([1, 2, 3, 1, 2, 3]).unique()
  expect(it.toArray()).toEqual([1, 2, 3])
  expect(it.toArray()).toEqual([1, 2, 3])

  expect(iter([1, 2, 3, 1, 2, 3]).unique().toArray()).toEqual([1, 2, 3])
  expect(iter([1, 2, 3, 1, 2, 3, 4]).unique().toArray()).toEqual([1, 2, 3, 4])
  expect(iter([1, 2, 3, 1, 2, 3, 4, 1, 2, 3]).unique().toArray()).toEqual([1, 2, 3, 4])
  expect(iter([]).unique().toArray()).toEqual([])
})

test('iter uniqueByKey', () => {
  const it = iter([1, 2, 3, 1, 2, 3]).uniqueByKey(id)
  expect(it.toArray()).toEqual([1, 2, 3])
  expect(it.toArray()).toEqual([1, 2, 3])

  expect(iter([1, 2, 3, 1, 2, 3]).uniqueByKey(value => value).toArray()).toEqual([1, 2, 3])
  expect(iter([
    { a: 1, b: 1 },
    { a: 2, b: 2 },
    { a: 3, b: 3 },
    { a: 1, b: 2 },
    { a: 2, b: 1 }
  ]).uniqueByKey(value => value.a).toArray())
    .toEqual([{ a: 1, b: 1 }, { a: 2, b: 2 }, { a: 3, b: 3 }])
  expect(iter([]).uniqueByKey(() => 1).toArray()).toEqual([])
})

test('iter withPosition', () => {
  const it = iter([1, 2, 3]).withPosition()
  expect(it.toArray()).toEqual([[P.First, 1], [P.Middle, 2], [P.Last, 3]])
  expect(it.toArray()).toEqual([[P.First, 1], [P.Middle, 2], [P.Last, 3]])

  expect(iter([1, 2, 3]).withPosition().toArray()).toEqual([[P.First, 1], [P.Middle, 2], [P.Last, 3]])
  expect(iter([]).withPosition().toArray()).toEqual([])
  expect(iter([1]).withPosition().toArray()).toEqual([[P.Only, 1]])
  expect(iter([1, 2]).withPosition().toArray()).toEqual([[P.First, 1], [P.Last, 2]])
})

test('iter zip', () => {
  const it = iter([1, 2, 3]).zip([4, 5, 6])
  expect(it.toArray()).toEqual([[1, 4], [2, 5], [3, 6]])
  expect(it.toArray()).toEqual([[1, 4], [2, 5], [3, 6]])

  expect(iter([1, 2, 3]).zip([4, 5, 6]).toArray()).toEqual([[1, 4], [2, 5], [3, 6]])
  expect(iter([1, 2, 3]).zip(iter([4, 5, 6])).toArray()).toEqual([[1, 4], [2, 5], [3, 6]])
  expect(iter([1, 2, 3]).zip([]).toArray()).toEqual([])
  expect(iter([]).zip([]).toArray()).toEqual([])
  expect(iter([]).zip([1, 2, 3]).toArray()).toEqual([])
  expect(iter([1, 2, 3]).zip([4, 5, 6, 7]).toArray()).toEqual([[1, 4], [2, 5], [3, 6]])
})

test('iter zipWith', () => {
  const it = iter([1, 2, 3]).zipWith([4, 5, 6], (a, b) => a + b)
  expect(it.toArray()).toEqual([5, 7, 9])
  expect(it.toArray()).toEqual([5, 7, 9])

  expect(iter([1, 2, 3]).zipWith([4, 5, 6], (a, b) => a + b).toArray()).toEqual([5, 7, 9])
  expect(iter([1, 2, 3]).zipWith(iter([4, 5, 6]), (a, b) => a + b).toArray()).toEqual([5, 7, 9])
  expect(iter([1, 2, 3]).zipWith([], (a, b) => a + b).toArray()).toEqual([])
  expect(iter([]).zipWith([], (a, b) => a + b).toArray()).toEqual([])
  expect(iter([]).zipWith([1, 2, 3], (a, b) => a + b).toArray()).toEqual([])
  expect(iter([1, 2, 3]).zipWith([4, 5, 6, 7], (a, b) => a + b).toArray()).toEqual([5, 7, 9])
  expect(iter([1, 2, 3]).zipWith([4, 5], (a, b) => a + b).toArray()).toEqual([5, 7])
})

test('iter count', () => {
  expect(iter([1, 2, 3]).count()).toEqual(3)
  expect(iter([]).count()).toEqual(0)
})

test('iter each', () => {
  const values: number[] = []
  iter([1, 2, 3]).each(value => values.push(value))
  expect(values).toEqual([1, 2, 3])

  const logSpy = jest.spyOn(console, 'log')
  iter([1, 2, 3]).each(console.log)
  expect(logSpy).toHaveBeenCalledWith(1)
  expect(logSpy).toHaveBeenCalledWith(2)
  expect(logSpy).toHaveBeenCalledWith(3)
  logSpy.mockRestore()
})

test('iter eq', () => {
  expect(iter([1, 2, 3]).eq(iter([1, 2, 3]))).toEqual(true)
  expect(iter([1, 2, 3]).eq(iter([1, 2, 3, 4]))).toEqual(false)
  expect(iter([1, 2, 3]).eq(iter([1, 2]))).toEqual(false)
  expect(iter([1, 2, 3]).eq(iter<number>([]))).toEqual(false)
})

test('iter eqBy', () => {
  const eq = (a: number, b: number) => a === b
  expect(iter([1, 2, 3]).eqBy(iter([1, 2, 3]), eq)).toEqual(true)
  expect(iter([1, 2, 3]).eqBy(iter([1, 2, 3, 4]), eq)).toEqual(false)
  expect(iter([1, 2, 3]).eqBy(iter([1, 2]), eq)).toEqual(false)
  expect(iter([1, 2, 3]).eqBy(iter<number>([]), eq)).toEqual(false)
})

test('iter every', () => {
  expect(iter([1, 2, 3]).every(value => value < 4)).toEqual(true)
  expect(iter([1, 2, 3]).every(value => value < 2)).toEqual(false)
  expect(iter([]).every(() => true)).toEqual(true)
  expect(iter([]).every(() => false)).toEqual(true)
})

test('iter find', () => {
  expect(iter([1, 2, 3]).find(value => value === 2)).toEqual(just(2))
  expect(iter([1, 2, 3]).find(value => value === 4)).toEqual(nothing())
  expect(iter([]).find(() => true)).toEqual(nothing())
  expect(iter([]).find(() => false)).toEqual(nothing())
})

test('iter findIndex', () => {
  expect(iter([1, 2, 3]).findIndex(value => value === 2)).toEqual(just(1))
  expect(iter([1, 2, 3]).findIndex(value => value === 4)).toEqual(nothing())
  expect(iter([]).findIndex(() => true)).toEqual(nothing())
  expect(iter([]).findIndex(() => false)).toEqual(nothing())
})

test('iter findMap', () => {
  expect(iter([1, 2, 3]).findMap(value => value === 2 ? just(value * 2) : nothing()).unwrap()).toEqual(4)
  expect(iter([1, 2, 3]).findMap(value => value === 4 ? just(value * 2) : nothing()).isNothing()).toBe(true)
  expect(iter([]).findMap(() => just(1)).isNothing()).toBe(true)
  expect(iter().findMap(v => v).isNothing()).toBe(true)
  expect(iter([1, 2, 3]).findMap(v => v === 2 ? v * 2 : null).unwrap()).toEqual(4)
  expect(iter([1, 2, 3]).findMap(v => v === 4 ? v * 2 : null).isNothing()).toBe(true)
  expect(iter([1, 2, 3]).findMap(v => v === 2 ? v * 2 : undefined).unwrap()).toEqual(4)
  expect(iter([1, 2, 3]).findMap(v => v === 4 ? v * 2 : undefined).isNothing()).toBe(true)
})

test('iter first', () => {
  expect(iter([1, 2, 3]).first().unwrap()).toEqual(1)
  expect(iter([]).first().isNothing()).toEqual(true)
  expect(iter(1).first().unwrap()).toEqual(1)
})

test('iter groupToMap', () => {
  const parse = (map: Map<number, Iter<number>>) => new Map([...map.entries()].map(([k, v]) => [k, v.toArray()]))
  expect(parse(iter([1, 2, 3, 4, 5, 6]).groupToMap(value => value % 2))).toEqual(new Map([[0, [2, 4, 6]], [1, [1, 3, 5]]]))
  expect(parse(iter<number>().groupToMap(value => value % 2))).toEqual(new Map())
})

test('iter groupToObject', () => {
  const parse = (obj: Record<string, Iter<number>>) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, v.toArray()]))
  expect(parse(iter([1, 2, 3, 4, 5, 6]).groupToObject(value => value % 2))).toEqual({ 0: [2, 4, 6], 1: [1, 3, 5] })
  expect(parse(iter<number>().groupToObject(value => value % 2))).toEqual({})
})

test('iter isEmpty', () => {
  expect(iter([1, 2, 3]).isEmpty()).toBe(false)
  expect(iter([]).isEmpty()).toBe(true)
  expect(iter().isEmpty()).toBe(true)
})

test('iter isUnique', () => {
  expect(iter([1, 2, 3]).isUnique()).toBe(true)
  expect(iter([1, 1, 2, 3]).isUnique()).toBe(false)
  expect(iter([]).isUnique()).toBe(true)
})

test('iter isUniqueByKey', () => {
  expect(iter([1, 2, 3]).isUniqueByKey(id)).toBe(true)
  expect(iter([1, 1, 2, 3]).isUniqueByKey(id)).toBe(false)
  expect(iter([]).isUniqueByKey(id)).toBe(true)
  expect(iter([
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 1 }
  ]).isUniqueByKey(v => v.id)).toBe(false)
  expect(iter([
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 }
  ]).isUniqueByKey(v => v.id)).toBe(true)
})

test('iter join', () => {
  expect(iter([1, 2, 3]).join(',')).toEqual('1,2,3')
  expect(iter([]).join(',')).toEqual('')
})

test('iter last', () => {
  expect(iter([1, 2, 3]).last()).toEqual(just(3))
  expect(iter([]).last()).toEqual(nothing())
})

test('iter max', () => {
  expect(iter([1, 2, 3, 2, 1]).max().unwrap()).toEqual(3)
  expect(iter(1).max().unwrap()).toEqual(1)
  expect(iter().max().isNothing()).toBe(true)
})

test('iter maxBy', () => {
  const fn = (a: TestObj, b: TestObj) => {
    if (a.a > b.a) return 1
    if (a.a < b.a) return -1
    return 0
  }
  expect(iter([
    { a: 1, b: 1 },
    { a: 2, b: 2 },
    { a: 3, b: 3 },
    { a: 3, b: 4 },
    { a: 3, b: 5 },
    { a: 2, b: 6 },
  ]).maxBy(fn).unwrap()).toEqual({ a: 3, b: 5 })
  expect(iter({ a: 1, b: 1 }).maxBy(fn).unwrap()).toEqual({ a: 1, b: 1 })
  expect(iter<TestObj>().maxBy(fn).isNothing()).toBe(true)
})

test('iter maxByKey', () => {
  expect(iter([
    { a: 1, b: 1 },
    { a: 2, b: 2 },
    { a: 3, b: 3 },
    { a: 3, b: 4 },
    { a: 3, b: 5 },
    { a: 2, b: 6 },
  ]).maxByKey(value => value.a).unwrap()).toEqual({ a: 3, b: 5 })
  expect(iter({ a: 1, b: 1 }).maxByKey(v => v.a).unwrap()).toEqual({ a: 1, b: 1 })
  expect(iter<TestObj>().maxByKey(v => v.a).isNothing()).toBe(true)
})

test('iter min', () => {
  expect(iter([1, 2, 3, 2, 1]).min().unwrap()).toEqual(1)
  expect(iter(1).min().unwrap()).toEqual(1)
  expect(iter().min().isNothing()).toBe(true)
})

test('iter minBy', () => {
  const fn = (a: TestObj, b: TestObj) => {
    if (a.a > b.a) return 1
    if (a.a < b.a) return -1
    return 0
  }
  expect(iter([
    { a: 2, b: 2 },
    { a: 1, b: 1 },
    { a: 1, b: 3 },
    { a: 1, b: 4 },
    { a: 3, b: 5 },
    { a: 2, b: 6 },
  ]).minBy(fn).unwrap()).toEqual({ a: 1, b: 1 })
  expect(iter({ a: 1, b: 1 }).minBy(fn).unwrap()).toEqual({ a: 1, b: 1 })
  expect(iter<TestObj>().minBy(fn).isNothing()).toBe(true)
})

test('iter minByKey', () => {
  expect(iter([
    { a: 1, b: 1 },
    { a: 2, b: 2 },
    { a: 1, b: 3 },
    { a: 1, b: 4 },
    { a: 3, b: 5 },
    { a: 2, b: 6 },
  ]).minByKey(value => value.a).unwrap()).toEqual({ a: 1, b: 1 })
  expect(iter({ a: 1, b: 1 }).minByKey(a => a.a).unwrap()).toEqual({ a: 1, b: 1 })
  expect(iter<TestObj>().minByKey(v => v.a).isNothing()).toBe(true)
})

test('iter ne', () => {
  expect(iter([1, 2, 3]).ne(iter([1, 2, 3]))).toEqual(false)
  expect(iter([1, 2, 3]).ne(iter([1, 2, 3, 4]))).toEqual(true)
  expect(iter([1, 2, 3]).ne(iter([1, 2]))).toEqual(true)
  expect(iter([1, 2, 3]).ne(iter<number>([]))).toEqual(true)
  expect(iter([]).ne(iter([]))).toEqual(false)
})

test('iter neBy', () => {
  const ne = (a: number, b: number) => a !== b
  expect(iter([1, 2, 3]).neBy(iter([1, 2, 3]), ne)).toEqual(false)
  expect(iter([1, 2, 3]).neBy(iter([1, 2, 3, 4]), ne)).toEqual(true)
  expect(iter([1, 2, 3]).neBy(iter([1, 2]), ne)).toEqual(true)
  expect(iter([1, 2, 3]).neBy(iter<number>([]), ne)).toEqual(true)
  expect(iter([]).neBy(iter([]), ne)).toEqual(false)
})

test('iter nth', () => {
  expect(iter([1, 2, 3]).nth(1)).toEqual(just(2))
  expect(iter([1, 2, 3]).nth(0)).toEqual(just(1))
  expect(iter([1, 2, 3]).nth(2)).toEqual(just(3))
  expect(iter([1, 2, 3]).nth(5)).toEqual(nothing())
  expect(iter([]).nth(0)).toEqual(nothing())
})

test('iter partition', () => {
  expect(iter([1, 2, 3]).partition(value => value < 3).map(i => i.toArray())).toEqual([[1, 2], [3]])
  expect(iter([]).partition(() => true).map(i => i.toArray())).toEqual([[], []])
})

test('iter reduce', () => {
  expect(iter([1, 2, 3]).reduce((acc, value) => acc + value, 0)).toEqual(6)
  expect(iter([]).reduce((acc, value) => acc + value, 0)).toEqual(0)
})

test('iter rev', () => {
  expect(iter([1, 2, 3]).rev().toArray()).toEqual([3, 2, 1])
  expect(iter([]).rev().toArray()).toEqual([])
})

test('iter some', () => {
  expect(iter([1, 2, 3]).some(value => value === 2)).toEqual(true)
  expect(iter([1, 2, 3]).some(value => value > 4)).toEqual(false)
  expect(iter([]).some(() => true)).toEqual(false)
  expect(iter([]).some(() => false)).toEqual(false)
})

test('iter toMap', () => {
  expect(iter([1, 2, 3]).toMap(value => [value, value * 2])).toEqual(new Map([[1, 2], [2, 4], [3, 6]]))
  expect(iter([]).toMap(() => [1, 2])).toEqual(new Map())
})

test('iter toObject', () => {
  expect(iter([1, 2, 3]).toObject(value => [value, value * 2])).toEqual({ 1: 2, 2: 4, 3: 6 })
  expect(iter([]).toObject(() => [1, 2])).toEqual({})
})

test('iter toSet', () => {
  expect(iter([1, 2, 3]).toSet()).toEqual(new Set([1, 2, 3]))
  expect(iter([]).toSet()).toEqual(new Set())
})

test('iter toString', () => {
  expect(iter([1, 2, 3]).toString()).toEqual('Iter { 1, 2, 3 }')
  expect(iter([]).toString()).toEqual('Iter {  }')
  expect(iter(1).toString()).toEqual('Iter { 1 }')
})

test('Symbol.toStringTag', () => {
  expect(Object.prototype.toString.call(iter())).toBe('[object Iter]')
})