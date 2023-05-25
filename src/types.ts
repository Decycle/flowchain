import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'

type DataTypes = {
  string: string
  number: number
  imageUrl: string
  any: any
}

export type UnionTypeTag = keyof DataTypes
export type UnionTypeTags = ReadonlyArray<UnionTypeTag>

export type UnionType = {
  _tag: UnionTypeTags
}

export type UnionData<K extends UnionTypeTags> = {
  _tag: K
  value: DataTypes[K[number]]
}

export type UnionLabel = {
  _tag: UnionTypeTags
  value: string
}

export const createUnionData = <
  const K extends UnionTypeTags
>(
  data: UnionData<K>
): UnionData<K> => data

export type SingleType = {
  [K in keyof DataTypes]: {
    _tag: K
  }
}[keyof DataTypes]

export type DataType = SingleType | UnionType

export type SingleData = {
  [K in keyof DataTypes]: {
    _tag: K
    value: DataTypes[K]
  }
}[keyof DataTypes]

export type Data = SingleData | UnionData<UnionTypeTags>
export type Datas = Record<string, Data | null>

export type Content = SingleData | UnionData<UnionTypeTags>
export type Contents = Record<string, Content | null>

export type SingleLabel = {
  [K in keyof DataTypes]: {
    _tag: K
    value: string
  }
}[keyof DataTypes]

export type Label = SingleLabel | UnionLabel
export type Labels = ReadonlyArray<Label>

type InferDataType<T extends DataType> =
  T extends SingleType
    ? DataTypes[T['_tag']]
    : T extends UnionType
    ? DataTypes[T['_tag'][number]]
    : never

type InferInputLabels<T extends Labels> = {
  [K in T[number] as K['value']]: {
    _tag: K['_tag'] extends UnionTypeTags
      ? K['_tag'][number] | K['_tag']
      : K['_tag']
    value: InferDataType<K>
  } | null
}

type InferOutputLabels<T extends Labels> = {
  [K in T[number] as K['value']]: {
    _tag: K['_tag']
    value: InferDataType<K>
  } | null
}

export type FunctionInput<
  IL extends Labels,
  CL extends Labels
> = {
  inputs: InferInputLabels<IL>
  contents: InferInputLabels<CL>
}

export type NodeFunc<
  IL extends Labels = Labels,
  OL extends Labels = Labels,
  CL extends Labels = Labels
> = ({
  inputs,
  contents,
}: FunctionInput<IL, CL>) => E.Either<
  Error,
  InferOutputLabels<OL>
>

export type AsyncNodeFunc<
  IL extends Labels = Labels,
  OL extends Labels = Labels,
  CL extends Labels = Labels
> = ({
  inputs,
  contents,
}: FunctionInput<IL, CL>) => TE.TaskEither<
  Error,
  InferOutputLabels<OL>
>

export type LabelFunc<
  IL extends Labels = Labels,
  CL extends Labels = Labels
> = (contents: InferInputLabels<CL>) => E.Either<Error, IL>

export type TitleFunc<CL extends Labels = Labels> = (
  contents: InferInputLabels<CL>
) => string

export type DescriptionFunc<CL extends Labels = Labels> = (
  contents: InferInputLabels<CL>
) => string

export type ComponentProps<CL extends Labels = Labels> = {
  contents: InferInputLabels<CL>
  setContents: (content: InferOutputLabels<CL>) => void
}

export type NodeConfig<
  IL extends Labels = Labels,
  OL extends Labels = Labels,
  CL extends Labels = Labels
> = {
  title: string
  getTitle?: TitleFunc<CL>
  description: string
  getDescription?: DescriptionFunc<CL>
  inputLabels: IL
  getInputLabels?: LabelFunc<IL, CL>
  outputLabels: OL
  contentLabels: CL
  outputs?: InferOutputLabels<OL>
  contents?: InferOutputLabels<CL>
  lazy?: boolean
  componentId?: string
}

export type NodeComponent<
  IL extends Labels = Labels,
  OL extends Labels = Labels,
  CL extends Labels = Labels
> = {
  config: NodeConfig<IL, OL, CL>
  component?: React.FC<ComponentProps<CL>>
  func?: NodeFunc<IL, OL, CL>
  afunc?: AsyncNodeFunc<IL, OL, CL>
}

export const createNode = <
  const IL extends Labels,
  const OL extends Labels,
  const CL extends Labels
>(
  node: NodeComponent<IL, OL, CL>
) => node

export const allDataTypes = [
  'string',
  'number',
  'imageUrl',
] as const
