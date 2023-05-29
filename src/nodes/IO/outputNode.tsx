import { Label, Labels, createNode } from '../../types'
import * as E from 'fp-ts/Either'

const title = 'Output'
const description =
  'A node that receives data and marks the end of a flow'

const inputLabels: readonly [
  {
    _tag: 'string' | 'number' | 'imageUrl'
    value: 'output'
  }
] = [
  {
    _tag: 'string',
    value: 'output',
  },
] as const satisfies Labels

const outputLabels: readonly [
  {
    _tag: 'string' | 'number' | 'imageUrl'
    value: 'output'
  }
] = [
  {
    _tag: 'string',
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
      if (inputs.output !== undefined) {
        console.log('outputNode', inputs.output)
        return E.right({
          output: {
            ...inputs.output,
          },
        })
      }
      return E.right({
        output: {
          _tag: 'string',
          value: '',
        } as const satisfies Label,
      })
    },
  }),
}

export default nodes
