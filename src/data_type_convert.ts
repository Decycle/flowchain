import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/lib/function'
import { DataTypeMappings } from './types'
import { ValueConversionError } from './errors'

type DataTypeConverters = {
  [K in keyof DataTypeMappings]: {
    [L in keyof DataTypeMappings]: (
      value: DataTypeMappings[K]
    ) => E.Either<ValueConversionError, DataTypeMappings[L]>
  }
}

const identity = <T>(value: T) => E.right(value)

const dataTypeConverters: DataTypeConverters = {
  number: {
    string: (value: number) => E.right(value.toString()),
    imageUrl: () =>
      E.left(ValueConversionError.of('number', 'imageUrl')),
    number: identity,
  },
  string: {
    number: (value: string) => E.right(Number(value)),
    imageUrl: (value: string) =>
      pipe(
        value,
        E.fromPredicate(
          (value: string) => value.startsWith('http'),
          () =>
            ValueConversionError.of('string', 'imageUrl')
        )
      ),
    string: identity,
  },
  imageUrl: {
    number: () =>
      E.left(ValueConversionError.of('imageUrl', 'number')),
    string: (value: string) => E.right(value),
    imageUrl: identity,
  },
}

const convert = <
  K extends keyof DataTypeMappings,
  L extends keyof DataTypeMappings
>(
  value: DataTypeMappings[K],
  from: K,
  to: L
) => dataTypeConverters[from][to](value)

export default convert
