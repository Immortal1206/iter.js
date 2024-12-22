import { just, nothing } from 'error-null-handle'
import iter, { repeat, type Iter } from '../src/index'

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
  expect(iter([1, 2, 3]).append(4).toArray()).toEqual([1, 2, 3, 4])
  expect(iter().append(1).toArray()).toEqual([1])
})

test('iter take', () => {
  expect(iter([1, 2, 3]).take(2).toArray()).toEqual([1, 2])
  expect(iter([1, 2, 3]).take(5).toArray()).toEqual([1, 2, 3])
  expect(iter([1, 2, 3]).take(0).toArray()).toEqual([])
})

test('iter chain', () => {
  expect(iter([1, 2, 3]).chain([4, 5, 6]).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2, 3]).chain(iter([4, 5, 6])).toArray()).toEqual([1, 2, 3, 4, 5, 6])
})

test('iter chunks', () => {
  expect(iter([1, 2, 3]).chunks(2).toArray().map(chunk => chunk.toArray())).toEqual([[1, 2], [3]])
  expect(iter([1, 2, 3]).chunks(5).toArray().map(chunk => chunk.toArray())).toEqual([[1, 2, 3]])
  expect(iter([]).chunks(1).toArray()).toEqual([])
  expect(() => iter().chunks(0)).toThrow('Expected non-zero in chunks, but got 0!')
  expect(() => iter().chunks(-1)).toThrow('Expected non-negative in chunks, but got -1!')
  expect(() => iter([1, 2, 3]).chunks(1.1)).toThrow('Expected integer in chunks, but got 1.1!')
})

test('iter concat', () => {
  expect(iter([1, 2, 3]).concat([4, 5, 6]).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2, 3]).concat(iter([4, 5, 6])).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2]).concat([3, 4], iter([5, 6])).toArray()).toEqual([1, 2, 3, 4, 5, 6])
})

test('iter cycle', () => {
  expect(iter([1, 2, 3]).cycle().take(2).toArray()).toEqual([1, 2])
  expect(iter([1, 2, 3]).cycle().take(5).toArray()).toEqual([1, 2, 3, 1, 2])
  expect(iter([1, 2, 3]).cycle().take(10).toArray()).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3, 1])
})

test('iter enumerate', () => {
  expect(iter([1, 2, 3]).enumerate().toArray()).toEqual([[0, 1], [1, 2], [2, 3]])
})

test('iter filter', () => {
  expect(iter([1, 2, 3]).filter(value => value % 2 === 0).toArray()).toEqual([2])
  expect(iter([1, 2, 3]).filter(value => value % 2 === 1).toArray()).toEqual([1, 3])
  expect(iter([1, 2, 3]).filter(() => false).toArray()).toEqual([])
  expect(iter([1, 2, 3]).filter(() => true).toArray()).toEqual([1, 2, 3])
})

test('iter filterMap', () => {
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
  expect(iter([1, 2, 3]).flat().toArray()).toEqual([1, 2, 3])
  expect(iter([[1], [2], [3]]).flat().toArray()).toEqual([1, 2, 3])
  expect(iter([[1, 2], [3, 4]]).flat().toArray()).toEqual([1, 2, 3, 4])
  expect(iter([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]).flat().toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  expect(iter([[[1, 2], iter([3, 4])], iter([[5, 6], [7, 8]])]).flat().toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
})

test('iter flatMap', () => {
  expect(iter([1, 2, 3]).flatMap(value => iter([value, value * 2])).toArray()).toEqual([1, 2, 2, 4, 3, 6])
  expect(iter([1, 2, 3]).flatMap(value => [value, value * 2]).toArray()).toEqual([1, 2, 2, 4, 3, 6])
})

test('iter inspect', () => {
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
  expect(iter([1, 2, 3]).interleave([4, 5, 6, 7]).toArray()).toEqual([1, 4, 2, 5, 3, 6, 7])
  expect(iter([1, 2, 3]).interleave([4, 5]).toArray()).toEqual([1, 4, 2, 5, 3])
  expect(iter([1, 2, 3]).interleave([4, 5, 6]).toArray()).toEqual([1, 4, 2, 5, 3, 6])
  expect(iter([1, 2, 3]).interleave([]).toArray()).toEqual([1, 2, 3])
  expect(iter<number>().interleave([4, 5, 6]).toArray()).toEqual([4, 5, 6])
})

test('iter interleaveShortest', () => {
  expect(iter([1, 2, 3]).interleaveShortest([4, 5, 6, 7, 8]).toArray()).toEqual([1, 4, 2, 5, 3, 6])
  expect(iter([1, 2, 3, 6]).interleaveShortest([4, 5]).toArray()).toEqual([1, 4, 2, 5])
  expect(iter([1, 2, 3]).interleaveShortest([4, 5, 6]).toArray()).toEqual([1, 4, 2, 5, 3, 6])
  expect(iter([1, 2, 3]).interleaveShortest([]).toArray()).toEqual([])
  expect(iter<number>().interleaveShortest([4, 5, 6]).toArray()).toEqual([])
})

test('iter intersperse', () => {
  expect(iter([1, 2, 3]).intersperse(0).toArray()).toEqual([1, 0, 2, 0, 3])
  expect(iter<number>([]).intersperse(0).toArray()).toEqual([])
  expect(iter([1]).intersperse(0).toArray()).toEqual([1])
})

test('iter map', () => {
  expect(iter([1, 2, 3]).map(value => value * 2).toArray()).toEqual([2, 4, 6])
  expect(iter([1, 2, 3]).map(() => 0).toArray()).toEqual([0, 0, 0])
  expect(iter([]).map(() => 0).toArray()).toEqual([])
})

test('iter merge', () => {
  expect(iter([1, 2, 3]).merge([4, 5, 6]).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2, 3]).merge(iter([4, 5, 6])).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 3, 5]).merge([2, 4, 6]).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2, 3]).merge([]).toArray()).toEqual([1, 2, 3])
  expect(iter<number>().merge([4, 5, 6]).toArray()).toEqual([4, 5, 6])
  expect(iter([1, 1, 1]).merge([2, 2]).toArray()).toEqual([1, 1, 1, 2, 2])
})

test('iter mergeBy', () => {
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

test('iter prepend', () => {
  expect(iter([1, 2, 3]).prepend(0).toArray()).toEqual([0, 1, 2, 3])
  expect(iter().prepend(0).toArray()).toEqual([0])
})

test('iter repeat', () => {
  expect(repeat(1).take(5).toArray()).toEqual([1, 1, 1, 1, 1])
  expect(repeat(() => [1, 2, 3]).take(5).toArray()).toEqual([[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]])
})

test('iter scan', () => {
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
  expect(iter([1, 2, 3]).skip(2).toArray()).toEqual([3])
  expect(iter([1, 2, 3]).skip(5).toArray()).toEqual([])
  expect(iter([1, 2, 3]).skip(0).toArray()).toEqual([1, 2, 3])
  expect(iter([]).skip(0).toArray()).toEqual([])
  expect(iter([]).skip(1).toArray()).toEqual([])
})

test('iter skipWhile', () => {
  expect(iter([1, 2, 3]).skipWhile(value => value < 2).toArray()).toEqual([2, 3])
  expect(iter([1, 2, 3]).skipWhile(value => value < 0).toArray()).toEqual([1, 2, 3])
  expect(iter([]).skipWhile(() => true).toArray()).toEqual([])
  expect(iter([]).skipWhile(() => false).toArray()).toEqual([])
  expect(iter([1, 2, 3]).skipWhile(value => value < 4).toArray()).toEqual([])
})

test('iter slice', () => {
  expect(iter([1, 2, 3]).slice(1, 2).toArray()).toEqual([2])
  expect(iter([1, 2, 3]).slice(0, 0).toArray()).toEqual([])
  expect(iter([1, 2, 3]).slice(0, 1).toArray()).toEqual([1])
  expect(iter([1, 2, 3]).slice(0, 5).toArray()).toEqual([1, 2, 3])
  expect(iter([]).slice(0, 0).toArray()).toEqual([])
  expect(() => iter().slice(-1, 1)).toThrow('Expected non-negative in slice, but got -1!')
  expect(() => iter().slice(0, -1)).toThrow('Expected non-negative in slice, but got -1!')
  expect(() => iter().slice(1, 0)).toThrow('Start index must be less than end index!')
})

test('iter takeWhile', () => {
  expect(iter([1, 2, 3]).takeWhile(value => value < 2).toArray()).toEqual([1])
  expect(iter([1, 2, 3]).takeWhile(value => value < 0).toArray()).toEqual([])
  expect(iter([]).takeWhile(() => true).toArray()).toEqual([])
  expect(iter([]).takeWhile(() => false).toArray()).toEqual([])
  expect(iter([1, 2, 3]).takeWhile(value => value < 4).toArray()).toEqual([1, 2, 3])
})

test('iter unique', () => {
  expect(iter([1, 2, 3, 1, 2, 3]).unique().toArray()).toEqual([1, 2, 3])
  expect(iter([1, 2, 3, 1, 2, 3, 4]).unique().toArray()).toEqual([1, 2, 3, 4])
  expect(iter([1, 2, 3, 1, 2, 3, 4, 1, 2, 3]).unique().toArray()).toEqual([1, 2, 3, 4])
  expect(iter([]).unique().toArray()).toEqual([])
})

test('iter uniqueBy', () => {
  expect(iter([1, 2, 3, 1, 2, 3]).uniqueBy(value => value).toArray()).toEqual([1, 2, 3])
  expect(iter([
    { a: 1, b: 1 },
    { a: 2, b: 2 },
    { a: 3, b: 3 },
    { a: 1, b: 2 },
    { a: 2, b: 1 }
  ]).uniqueBy(value => value.a).toArray())
    .toEqual([{ a: 1, b: 1 }, { a: 2, b: 2 }, { a: 3, b: 3 }])
  expect(iter([]).uniqueBy(() => 1).toArray()).toEqual([])
})

test('iter zip', () => {
  expect(iter([1, 2, 3]).zip([4, 5, 6]).toArray()).toEqual([[1, 4], [2, 5], [3, 6]])
  expect(iter([1, 2, 3]).zip(iter([4, 5, 6])).toArray()).toEqual([[1, 4], [2, 5], [3, 6]])
  expect(iter([1, 2, 3]).zip([]).toArray()).toEqual([])
  expect(iter([]).zip([]).toArray()).toEqual([])
  expect(iter([]).zip([1, 2, 3]).toArray()).toEqual([])
  expect(iter([1, 2, 3]).zip([4, 5, 6, 7]).toArray()).toEqual([[1, 4], [2, 5], [3, 6]])
})

test('iter zipWith', () => {
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
  expect(iter([1, 2, 3]).eq(iter([]))).toEqual(false)
})

test('iter eqBy', () => {
  const eq = (a: number, b: number) => a === b
  expect(iter([1, 2, 3]).eqBy(iter([1, 2, 3]), eq)).toEqual(true)
  expect(iter([1, 2, 3]).eqBy(iter([1, 2, 3, 4]), eq)).toEqual(false)
  expect(iter([1, 2, 3]).eqBy(iter([1, 2]), eq)).toEqual(false)
  expect(iter([1, 2, 3]).eqBy(iter([]), eq)).toEqual(false)
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

test('iter join', () => {
  expect(iter([1, 2, 3]).join(',')).toEqual('1,2,3')
  expect(iter([]).join(',')).toEqual('')
})

test('iter last', () => {
  expect(iter([1, 2, 3]).last()).toEqual(just(3))
  expect(iter([]).last()).toEqual(nothing())
})

test('iter ne', () => {
  expect(iter([1, 2, 3]).ne(iter([1, 2, 3]))).toEqual(false)
  expect(iter([1, 2, 3]).ne(iter([1, 2, 3, 4]))).toEqual(true)
  expect(iter([1, 2, 3]).ne(iter([1, 2]))).toEqual(true)
  expect(iter([1, 2, 3]).ne(iter([]))).toEqual(true)
  expect(iter([]).ne(iter([]))).toEqual(false)
})

test('iter neBy', () => {
  const ne = (a: number, b: number) => a !== b
  expect(iter([1, 2, 3]).neBy(iter([1, 2, 3]), ne)).toEqual(false)
  expect(iter([1, 2, 3]).neBy(iter([1, 2, 3, 4]), ne)).toEqual(true)
  expect(iter([1, 2, 3]).neBy(iter([1, 2]), ne)).toEqual(true)
  expect(iter([1, 2, 3]).neBy(iter([]), ne)).toEqual(true)
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