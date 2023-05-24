import { useState } from 'react'
import {
  NodeConfig,
  Label,
  FunctionInput,
  ComponentProps,
  Data,
  NodeComponent,
} from '../../types'
import * as E from 'fp-ts/Either'

const title = 'Output'
const description =
  'A node that receives data and marks the end of a flow'

const inputLabels: Label[] = [
  {
    _tag: 'string',
    value: 'output',
  },
]

const func = ({ inputs }: FunctionInput) => {
  return E.right({
    output: {
      ...inputs.output,
    } as Data,
  })
}

const outputNodeConfig: NodeConfig = {
  title,
  description,
  inputLabels,
  outputLabels: [],
}

const outputNode: NodeComponent = {
  config: outputNodeConfig,
  func,
}

const nodes = {
  output: outputNode,
}

export default nodes
