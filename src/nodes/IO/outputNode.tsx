import {
  Labels,
  allDataTypes,
  createNode,
} from '../../types'
import * as E from 'fp-ts/Either'

const title = 'Output'
const description =
  'A node that receives data and marks the end of a flow'

const inputLabels = [
  {
    _tag: allDataTypes,
    value: 'output',
  },
] as const satisfies Labels

const outputLabels = [
  {
    _tag: allDataTypes,
    value: 'output',
  },
] as const satisfies Labels

const contentLabels = [] as const satisfies Labels

const nodes = {
  output: createNode({
    config: {
      title,
      description,
      inputLabels,
      outputLabels,
      contentLabels,
    },
    func: ({ inputs }) => {
      if (inputs.output !== null) {
        return E.right({
          output: {
            _tag: allDataTypes,
            value: inputs.output.value,
          },
        })
      }
      return E.right({
        output: null,
      })
    },
  }),
}

export default nodes
