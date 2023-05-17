import { Handle, Position } from 'reactflow'
import getHandleColor from './utils'
import GenericNode, { NodeFunc } from './genericNode'
import { memo, useCallback, useMemo, useState } from 'react'

type NodeData = {
  runFunc: () => void
}
type NodeProps = {
  id: string
  data: NodeData
}

const title = 'Output'
const description = 'Output value for this chain'
const inputLabels = ['response']

const OutputNode = memo(({ id }: NodeProps) => {
  const func: NodeFunc = useCallback((inputs) => {
    if (!inputs['response']) {
      return { output: '' }
    }

    return { output: inputs['response'] }
  }, [])

  return (
    <GenericNode
      id={id}
      data={{
        title,
        description,
        inputLabels,
        func,
      }}></GenericNode>
  )
})

export default OutputNode
