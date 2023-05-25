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
  Labels,
  NodeFunc,
  createNode,
  StringLabel,
} from '../../types'
import TextareaAutosize from 'react-textarea-autosize'
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

const outputLabels = [
  {
    _tag: 'string',
    value: 'prompt',
  },
] as const satisfies Labels

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
            } as const satisfies Label)
        )
      )
    )
  )
}

const PromptComponent = ({
  contents,
  setContents,
}: ComponentProps) => {
  return (
    <TextareaAutosize
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

type outputType = typeof outputLabels

export const nodes = {
  prompt: createNode<StringLabel[], outputType>({
    config: {
      title,
      description,
      inputLabels: [],
      outputLabels,
      getInputLabels,
      contents: {
        prompt: {
          _tag: 'string',
          value: '',
        },
      },
    },
    component: PromptComponent,
    func: ({ inputs, contents }) => {
      let output = contents.prompt?.value.toString() ?? ''

      for (const label in inputs) {
        output = output.replace(
          new RegExp(`{${label}}`, 'g'),
          inputs[label]?.value.toString() ?? ''
        )
      }

      return E.right({
        prompt: {
          _tag: 'string',
          value: output,
        },
      })
    },
  }),
}

export default nodes
