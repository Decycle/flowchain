import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'

export type StringType = {
  _tag: 'string'
}

export type StringData = {
  value: string
} & StringType

export type StringLabel = {
  value: string
} & StringType

export type NumberType = {
  _tag: 'number'
}

export type NumberData = {
  value: number
} & NumberType

export type NumberLabel = {
  value: string
} & NumberType

export type ImageUrlType = {
  _tag: 'imageUrl'
}

export type ImageUrlData = {
  value: string
} & ImageUrlType

export type ImageUrlLabel = {
  value: string
} & ImageUrlType

export type UnionTypeTag = 'string' | 'number' | 'imageUrl'
export type UnionTypeTags = ReadonlyArray<UnionTypeTag>

export type UnionType = {
  _tag: UnionTypeTags
}

export type UnionData<K extends UnionTypeTags> = {
  _tag: K
  value: K[number]
}

const unionTag = ['string', 'number'] as const

const a = {
  _tag: unionTag,
} as const satisfies Readonly<UnionType>

const b = {
  _tag: unionTag,
  value: 'number',
} as const satisfies Readonly<UnionData<typeof unionTag>>

export type DataType =
  | StringType
  | NumberType
  | ImageUrlType

export type Data = StringData | NumberData | ImageUrlData

export type Datas = Record<string, Data | null>
export type Content = StringData | NumberData | ImageUrlData
export type Contents = Record<string, Content | null>

export type Label =
  | StringLabel
  | NumberLabel
  | ImageUrlLabel
export type Labels = ReadonlyArray<Label>

type InferDataType<T extends DataType> =
  T extends StringType
    ? string
    : T extends NumberType
    ? number
    : T extends ImageUrlType
    ? string
    : never

type InferLabels<T extends Labels> = {
  [K in T[number] as K['value']]: {
    _tag: K['_tag']
    value: InferDataType<K>
  } | null
}

export type FunctionInput<IL extends Labels> = {
  inputs: InferLabels<IL>
  contents: Contents
}

export type NodeFunc<
  IL extends Labels = Labels,
  OL extends Labels = Labels
> = ({
  inputs,
  contents,
}: FunctionInput<IL>) => E.Either<Error, InferLabels<OL>>

export type AsyncNodeFunc<
  IL extends Labels = Labels,
  OL extends Labels = Labels
> = ({
  inputs,
  contents,
}: FunctionInput<IL>) => TE.TaskEither<
  Error,
  InferLabels<OL>
>

export type LabelFunc<T extends Labels> = (
  contents: Contents
) => E.Either<Error, T>

export type TitleFunc = (contents: Contents) => string

export type DescriptionFunc = (contents: Contents) => string

export type ComponentProps = {
  contents: Contents
  setContents: (content: Contents) => void
}

export type NodeConfig<
  IL extends Labels = Labels,
  OL extends Labels = Labels
> = {
  title: string
  getTitle?: TitleFunc
  description: string
  getDescription?: DescriptionFunc
  inputLabels: IL
  getInputLabels?: LabelFunc<IL>
  outputLabels: OL
  outputs?: InferLabels<OL>
  contents?: Contents
  lazy?: boolean
  componentId?: string
}

export type NodeComponent<
  IL extends Labels = Labels,
  OL extends Labels = Labels
> = {
  config: NodeConfig<IL, OL>
  component?: React.FC<ComponentProps>
  func?: NodeFunc<IL, OL>
  afunc?: AsyncNodeFunc<IL, OL>
}

export const createNode = <
  IL extends Labels,
  OL extends Labels
>(
  node: NodeComponent<IL, OL>
) => node
