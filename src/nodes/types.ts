import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'

export type StringType = {
  _tag: 'string'
}

export type NumberType = {
  _tag: 'number'
}

export type ImageUrlType = {
  _tag: 'imageUrl'
}

export type DataType =
  | StringType
  | NumberType
  | ImageUrlType
export type Data = string | number
export type Content = string | number

export type Label = DataType & {
  value: string
}

export type NodeFunc = (
  inputs: Record<string, Content>
) => E.Either<Error, { [key: string]: Data }>

export type AsyncNodeFunc = (
  inputs: Record<string, Content>
) => TE.TaskEither<Error, { [key: string]: Data }>

export type LabelFunc = (
  contents: Record<string, Content>
) => E.Either<Error, Label[]>

export type TitleFunc = (
  contents: Record<string, Content>
) => string

export type DescriptionFunc = (
  contents: Record<string, Content>
) => string

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
  component?: React.ReactNode
}
