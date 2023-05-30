import { Label, Labels, createNode } from '../../types'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import { NodeContentMissingError } from '../../errors'
import { pipe } from 'fp-ts/lib/function'

const title = 'Dynamic Prompt'
const description =
  'A node that fills up a prompt, pass in variables with {variable}'

const inputLabels: ReadonlyArray<{
  _tag: 'string'
  value: string
}> = [
  {
    _tag: 'string',
    value: 'raw_prompt',
  },
] as const satisfies Labels

const outputLabels = [
  {
    _tag: 'string',
    value: 'prompt',
  },
] as const satisfies Labels

const contentLabels = [
  {
    _tag: 'string',
    value: 'prompt_inputs',
  },
] as const satisfies Labels

const dynamicPromptNode = createNode({
  config: {
    title,
    description,
    inputLabels,
    outputLabels,
    contentLabels,
  },
  func: ({ inputs }) => {
    let output = inputs.raw_prompt?.value ?? ''

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

  getInputLabels: ({ inputs }) => {
    return pipe(
      inputs.raw_prompt,
      E.fromNullable(
        NodeContentMissingError.of('raw_prompt')
      ),
      E.map((prompt) =>
        pipe(
          prompt.value.match(/{[^}]+}/g) ?? [],
          A.map((s) => s.slice(1, -1).trim()),
          A.filter((s) => s.length > 0),
          (labels) => Array.from(new Set(labels)),
          (labels) => ['raw_prompt', ...labels],
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
})

const nodes = {
  dynamicPrompt: dynamicPromptNode,
}

export default nodes
