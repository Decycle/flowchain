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
export type Content = StringData | NumberData | ImageUrlData

export type Label = DataType & {
  value: string
}

export type FunctionInput = {
  inputs: Record<string, Data>
  content: Record<string, Content>
}

export type NodeFunc = ({
  inputs,
  content,
}: FunctionInput) => E.Either<
  Error,
  { [key: string]: Data }
>

export type AsyncNodeFunc = ({
  inputs,
  content,
}: FunctionInput) => TE.TaskEither<
  Error,
  { [key: string]: Data }
>

export type LabelFunc = (
  contents: Record<string, Content>
) => E.Either<Error, Label[]>

export type TitleFunc = (
  contents: Record<string, Content>
) => string

export type DescriptionFunc = (
  contents: Record<string, Content>
) => string

export type ComponentProps = {
  content: Record<string, Content>
  setContent: (content: Record<string, Content>) => void
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
  output?: Record<string, Data>
  content?: Record<string, Content>
  func?: NodeFunc
  afunc?: AsyncNodeFunc
  lazy?: boolean
  Component?: React.FC<ComponentProps>
}
