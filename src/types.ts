import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'

export type StringType = {
  _tag: 'string'
}

export type StringData = {
  value: string
} & StringType

export type NumberType = {
  _tag: 'number'
}

export type NumberData = {
  value: number
} & NumberType

export type ImageUrlType = {
  _tag: 'imageUrl'
}

export type ImageUrlData = {
  value: string
} & ImageUrlType

export type DataType =
  | StringType
  | NumberType
  | ImageUrlType

export type Data = StringData | NumberData | ImageUrlData
export type Datas = Record<string, Data | null>
export type Content = StringData | NumberData | ImageUrlData
export type Contents = Record<string, Content | null>

export type Label = DataType & {
  value: string
}

export type FunctionInput = {
  inputs: Datas
  contents: Contents
}

export type NodeFunc = ({
  inputs,
  contents,
}: FunctionInput) => E.Either<
  Error,
  { [key: string]: Data }
>

export type AsyncNodeFunc = ({
  inputs,
  contents,
}: FunctionInput) => TE.TaskEither<
  Error,
  { [key: string]: Data }
>

export type LabelFunc = (
  contents: Contents
) => E.Either<Error, Label[]>

export type TitleFunc = (contents: Contents) => string

export type DescriptionFunc = (contents: Contents) => string

export type ComponentProps = {
  contents: Contents
  setContents: (content: Contents) => void
}

export type NodeConfig = {
  title: string
  getTitle?: TitleFunc
  description: string
  getDescription?: DescriptionFunc
  inputLabels: Label[]
  getInputs?: LabelFunc
  outputLabels: Label[]
  getOutputs?: LabelFunc
  outputs?: Datas
  contents?: Contents
  lazy?: boolean
  componentId?: string
}

export type NodeComponent = {
  config: NodeConfig
  component?: React.FC<ComponentProps>
  func?: NodeFunc
  afunc?: AsyncNodeFunc
}
