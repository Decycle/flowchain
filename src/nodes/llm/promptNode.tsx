import {
  Label,
  ComponentProps,
  Content,
  Contents,
  Labels,
  createNode,
  LabelFunc,
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

const inputLabels: ReadonlyArray<{
  _tag: 'string'
  value: string
}> = [] as const

const outputLabels = [
  {
    _tag: 'string',
    value: 'prompt',
  },
] as const satisfies Labels

const contentLabels = [
  {
    _tag: 'string',
    value: 'prompt',
  },
] as const satisfies Labels

const promptNode = createNode({
  config: {
    title,
    description,
    inputLabels,
    outputLabels,
    contentLabels,
    contents: {
      prompt: {
        _tag: 'string',
        value: '',
      },
    },
    getInputLabels: (contents) => {
      return pipe(
        contents.prompt,
        E.fromNullable(
          NodeContentMissingError.of('prompt')
        ),
        E.map((prompt) =>
          pipe(
            prompt.value.match(/{[^}]+}/g) ?? [],
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
    },
  },
  Component: ({ contents, setContents }) => {
    return (
      <TextareaAutosize
        value={contents.prompt?.value.toString() ?? ''}
        onChange={(e) =>
          setContents({
            prompt: {
              _tag: 'string',
              value: e.target.value,
            },
          })
        }
        className='w-full p-2 border border-gray-300 rounded-md mb-4 nodrag'
      />
    )
  },
  func: ({ inputs, contents }) => {
    let output = contents.prompt?.value ?? ''

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
      } as const,
    })
  },
})

const nodes = {
  prompt: promptNode,
}

export default nodes
