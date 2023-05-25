import { Labels, createNode } from '../../types'
import * as E from 'fp-ts/Either'

const title = 'Output'
const description =
  'A node that receives data and marks the end of a flow'

const inputLabels = [
  {
    _tag: 'string',
    value: 'output',
  },
] as const satisfies Labels

const outputLabels = [
  {
    _tag: 'string',
    value: 'output',
  },
] as const satisfies Labels

const nodes = {
  output: createNode({
    func: ({ inputs }) => {
      if (inputs.output !== null) {
        return E.right({
          output: {
            ...inputs.output,
          },
        })
      }
      return E.right({
        output: null,
      })
    },
    config: {
      title,
      description,
      inputLabels,
      outputLabels,
    },
  }),
}

export default nodes
