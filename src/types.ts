import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'

export type DataTypeMappings = {
  string: string
  number: number
  imageUrl: string
}

export type DataType = {
  [K in keyof DataTypeMappings]: {
    _tag: K
  }
}[keyof DataTypeMappings]

export type Data = {
  [K in keyof DataTypeMappings]: {
    _tag: K
    value: DataTypeMappings[K]
  }
}[keyof DataTypeMappings]

export type Datas = Record<string, Data | undefined>

export type Content = Data
export type Contents = Record<string, Content | undefined>

export type Label = {
  [K in keyof DataTypeMappings]: {
    _tag: K
    value: string
  }
}[keyof DataTypeMappings]

export type Labels = ReadonlyArray<Label>

type InferLabels<T extends Labels> = {
  [K in T[number] as K['value']]: K extends {
    _tag: infer M
  }
    ? M extends keyof DataTypeMappings
      ? { _tag: M; value: DataTypeMappings[M] } | undefined
      : never
    : never
}

export type FunctionInput<
  IL extends Labels,
  CL extends Labels
> = {
  inputs: InferLabels<IL>
  contents: InferLabels<CL>
}

export type NodeFunc<
  IL extends Labels,
  OL extends Labels,
  CL extends Labels
> = ({
  inputs,
  contents,
}: FunctionInput<IL, CL>) => E.Either<
  Error,
  InferLabels<OL>
>

export type AsyncNodeFunc<
  IL extends Labels,
  OL extends Labels,
  CL extends Labels
> = ({
  inputs,
  contents,
}: FunctionInput<IL, CL>) => TE.TaskEither<
  Error,
  InferLabels<OL>
>

export type LabelFunc<
  IL extends Labels,
  CL extends Labels
> = ({
  inputs,
  contents,
}: {
  inputs: InferLabels<IL>
  contents: InferLabels<CL>
}) => E.Either<Error, IL>

export type TitleFunc<CL extends Labels> = (
  contents: InferLabels<CL>
) => string

export type DescriptionFunc<CL extends Labels> = (
  contents: InferLabels<CL>
) => string

export type ComponentProps<
  OL extends Labels,
  CL extends Labels
> = {
  contents: InferLabels<CL>
  setContents: (content: InferLabels<CL>) => void
  outputs: InferLabels<OL>
}

export type NodeConfig<
  IL extends Labels,
  OL extends Labels,
  CL extends Labels
> = {
  title: string
  description: string
  inputLabels: IL
  outputLabels: OL
  contentLabels: CL
  outputs?: InferLabels<OL>
  contents?: InferLabels<CL>
  lazy?: boolean
  componentId?: string
}

export type NodeComponent<
  IL extends Labels,
  OL extends Labels,
  CL extends Labels
> = {
  config: NodeConfig<IL, OL, CL>
  Component?: React.FC<ComponentProps<OL, CL>>
  func?: NodeFunc<IL, OL, CL>
  afunc?: AsyncNodeFunc<IL, OL, CL>
  getTitle?: TitleFunc<CL>
  getDescription?: DescriptionFunc<CL>
  getInputLabels?: LabelFunc<IL, CL>
}

export const createNode = <
  const IL extends Labels,
  const OL extends Labels,
  const CL extends Labels
>(
  node: NodeComponent<IL, OL, CL>
) => node

export type AnyNodeComponentType = NodeComponent<
  Labels,
  Labels,
  Labels
>
export type AnyNodeConfigType = NodeConfig<
  Labels,
  Labels,
  Labels
>
