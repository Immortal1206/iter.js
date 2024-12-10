import { just, nothing } from 'error-null-handle'
import { iter, repeat } from '../src/index'

test('iter Symbol.iterator', () => {
  const i = iter([1, 2, 3])[Symbol.iterator]()
  expect(i.next()).toEqual({ value: 1, done: false })
  expect(i.next()).toEqual({ value: 2, done: false })
  expect(i.next()).toEqual({ value: 3, done: false })
  expect(i.next()).toEqual({ value: undefined, done: true })
})

test('iter toArray', () => {
  expect(iter([1, 2, 3]).toArray()).toEqual([1, 2, 3])
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

test('iter repeat', () => {
  expect(repeat(1).take(5).toArray()).toEqual([1, 1, 1, 1, 1])
  expect(repeat(() => [1, 2, 3]).take(5).toArray()).toEqual([[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]])
})

test('iter concat', () => {
  expect(iter([1, 2, 3]).concat([4, 5, 6]).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2, 3]).concat(iter([4, 5, 6])).toArray()).toEqual([1, 2, 3, 4, 5, 6])
  expect(iter([1, 2]).concat([3, 4], iter([5, 6])).toArray()).toEqual([1, 2, 3, 4, 5, 6])
})

test('iter cycle', () => {
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

test('iter intersperce', () => {
  expect(iter([1, 2, 3]).intersperce(0).toArray()).toEqual([1, 0, 2, 0, 3])
  expect(iter<number>([]).intersperce(0).toArray()).toEqual([])
  expect(iter([1]).intersperce(0).toArray()).toEqual([1])
})

test('iter map', () => {
  expect(iter([1, 2, 3]).map(value => value * 2).toArray()).toEqual([2, 4, 6])
  expect(iter([1, 2, 3]).map(() => 0).toArray()).toEqual([0, 0, 0])
  expect(iter([]).map(() => 0).toArray()).toEqual([])
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

test('iter takeWhile', () => {
  expect(iter([1, 2, 3]).takeWhile(value => value < 2).toArray()).toEqual([1])
  expect(iter([1, 2, 3]).takeWhile(value => value < 0).toArray()).toEqual([])
  expect(iter([]).takeWhile(() => true).toArray()).toEqual([])
  expect(iter([]).takeWhile(() => false).toArray()).toEqual([])
  expect(iter([1, 2, 3]).takeWhile(value => value < 4).toArray()).toEqual([1, 2, 3])
})

test('iter zip', () => {
  expect(iter([1, 2, 3]).zip([4, 5, 6]).toArray()).toEqual([[1, 4], [2, 5], [3, 6]])
  expect(iter([1, 2, 3]).zip(iter([4, 5, 6])).toArray()).toEqual([[1, 4], [2, 5], [3, 6]])
  expect(iter([1, 2, 3]).zip([]).toArray()).toEqual([])
  expect(iter([]).zip([]).toArray()).toEqual([])
  expect(iter([]).zip([1, 2, 3]).toArray()).toEqual([])
  expect(iter([1, 2, 3]).zip([4, 5, 6, 7]).toArray()).toEqual([[1, 4], [2, 5], [3, 6]])
})

test('iter count', () => {
  expect(iter([1, 2, 3]).count()).toEqual(3)
  expect(iter([]).count()).toEqual(0)
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

test('iter last', () => {
  expect(iter([1, 2, 3]).last()).toEqual(just(3))
  expect(iter([]).last()).toEqual(nothing())
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

test('iter some', () => {
  expect(iter([1, 2, 3]).some(value => value === 2)).toEqual(true)
  expect(iter([1, 2, 3]).some(value => value > 4)).toEqual(false)
  expect(iter([]).some(() => true)).toEqual(false)
  expect(iter([]).some(() => false)).toEqual(false)
})

test('iter reduce', () => {
  expect(iter([1, 2, 3]).reduce((acc, value) => acc + value, 0)).toEqual(6)
  expect(iter([]).reduce((acc, value) => acc + value, 0)).toEqual(0)
})

test('iter rev', () => {
  expect(iter([1, 2, 3]).rev().toArray()).toEqual([3, 2, 1])
  expect(iter([]).rev().toArray()).toEqual([])
})