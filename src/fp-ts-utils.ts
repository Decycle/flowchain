import { Monoid } from 'fp-ts/lib/Monoid'

export const monoidObject = <K extends string, V>(): Monoid<
  Record<K, V>
> => ({
  concat: (x, y) => Object.assign({}, x, y),
  empty: {} as Record<K, V>,
})

export const log =
  <A>(message: string) =>
  (a: A): A => {
    console.log(message, a)
    return a
  }

export const error =
  <A>(message: string) =>
  (a: A): A => {
    console.error(message, a)
    return a
  }
