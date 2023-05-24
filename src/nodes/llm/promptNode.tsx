import { useState } from 'react'
import {
  NodeConfig,
  Label,
  FunctionInput,
  ComponentProps,
  StringData,
  Content,
  Contents,
  NodeComponent,
} from '../../types'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import {
  NodeContentMissingError,
  NodeContentTypeMismatchError,
} from '../errors'
import { pipe } from 'fp-ts/lib/function'

const title = 'Prompt'
const description =
  'A node that outputs a prompt, pass in variables with {variable}'
const outputLabels: Label[] = [
  {
    _tag: 'string',
    value: 'prompt',
  },
]

const getInputLabels = (contents: Contents) => {
  return pipe(
    contents.prompt,
    E.fromNullable(NodeContentMissingError.of('prompt')),
    E.chainW((prompt: Content) => {
      if (prompt._tag === 'string') {
        return E.right(prompt.value)
      }
      return E.left(
        NodeContentTypeMismatchError.of(
          'prompt',
          'string',
          prompt._tag
        )
      )
    }),
    E.map((prompt: string) =>
      pipe(
        prompt.match(/{[^}]+}/g) ?? [],
        A.map((s) => s.slice(1, -1).trim()),
        A.filter((s) => s.length > 0),
        (labels) => Array.from(new Set(labels)),
        A.map(
          (label) =>
            ({
              _tag: 'string',
              value: label,
            } as Label)
        )
      )
    )
  )
}

const func = ({ inputs, contents }: FunctionInput) => {
  let output = contents.prompt?.value.toString() ?? ''

  for (const label in inputs) {
    output = output.replace(
      new RegExp(`{${label}}`, 'g'),
      inputs[label]?.value.toString() ?? ''
    )
  }

  return E.right({
    input: {
      _tag: 'string',
      value: output,
    } as StringData,
  })
}

const PromptComponent = ({
  contents,
  setContents,
}: ComponentProps) => {
  return (
    <textarea
      value={contents.prompt?.value.toString() ?? ''}
      onChange={(e) =>
        setContents({
          prompt: {
            _tag: 'string',
            value: e.target.value,
          } as StringData,
        })
      }
      className='w-full p-2 border border-gray-300 rounded-md mb-4 nodrag'
    />
  )
}

const promptNodeConfig: NodeConfig = {
  title,
  description,
  inputLabels: [],
  outputLabels,
  getInputs: getInputLabels,
  contents: {
    prompt: {
      _tag: 'string',
      value: '',
    } as StringData,
  },
}
export const promptComponent: NodeComponent = {
  config: promptNodeConfig,
  component: PromptComponent,
  func,
}

export const nodes = {
  prompt: promptComponent,
}

export default nodes
