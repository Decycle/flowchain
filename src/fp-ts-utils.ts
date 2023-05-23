import { Monoid } from 'fp-ts/lib/Monoid'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'

export const monoidObject = <K extends string, V>(): Monoid<
  Record<K, V>
> => ({
  concat: (x, y) => Object.assign({}, x, y),
  empty: {} as Record<K, V>,
})

export const log = <A>(a: A): A => {
  console.log(a)
  return a
}

export const error = <A>(a: A): A => {
  console.error(a)
  return a
}
