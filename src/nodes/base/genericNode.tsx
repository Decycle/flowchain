import React, { useEffect, useState } from 'react'
import { Handle, Position } from 'reactflow'
import getHandleColor from './utils'
import useFlowStore from '../../store'

type NodeFunc<I, O> = (inputs: { [key: string]: I }) => {
  [key: string]: O
}

type AsyncNodeFunc<I, O> = (inputs: {
  [key: string]: I
}) => Promise<{
  [key: string]: O
}>

type NodeData<I, O> = {
  title: string
  description?: string
  inputLabels?: string[]
  outputLabels?: string[]
  func?: NodeFunc<I, O>
  afunc?: AsyncNodeFunc<I, O>
}

type NodeProps<I, O> = {
  id: string
  data: NodeData<I, O>
  children?: React.ReactNode
  lazy?: boolean
}

const GenericNode = <I, O>({
  id,
  data,
  children,
  lazy = false,
}: NodeProps<I, O>) => {
  const childNodeValues = useFlowStore(
    (state) => {
      const childEdges = state.edges.filter(
        (edge) => edge.target === id
      )
      const childNodeValues = {} as { [key: string]: any }

      for (const edge of childEdges) {
        const sourceID = edge.source
        const sourceHandle = edge.sourceHandle
        const targetHandle = edge.targetHandle

        if (!sourceHandle || !targetHandle) {
          continue
        }
        if (!state.nodeValues[sourceID]) {
          continue
        }

        const sourceNodeData =
          state.nodeValues[sourceID][sourceHandle]

        childNodeValues[targetHandle] = sourceNodeData
      }
      return childNodeValues
    },
    (prev, next) => {
      if (
        Object.keys(prev).length !==
        Object.keys(next).length
      ) {
        return false
      }
      for (const key in prev) {
        if (prev[key] !== next[key]) {
          // console.log('not equal')
          return false
        }
      }
      return true
    }
  )

  const [nodeValue, setNodeValue] = useFlowStore(
    (state) => {
      const nodeValue = state.nodeValues[id]
      return [nodeValue, state.setNodeValue]
    }
  )
  const { afunc, func, inputLabels } = data

  const [buttonClicked, setButtonClicked] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (lazy) {
      if (!buttonClicked) {
        return
      } else {
        setButtonClicked(false)
      }
    }
    if (isRunning) {
      return
    }
    if (!inputLabels || inputLabels.length === 0) {
      return
    }

    for (const label of inputLabels) {
      if (!(label in childNodeValues)) {
        return
      }
    }

    console.log(id, childNodeValues, inputLabels)

    if (func) {
      const output = func(childNodeValues)
      setNodeValue(id, output)
    }
    if (afunc) {
      setIsRunning(true)
      afunc(childNodeValues).then((output) => {
        setNodeValue(id, output)
        setIsRunning(false)
      })
    }
  }, [
    func,
    afunc,
    lazy,
    isRunning,
    id,
    setNodeValue,
    childNodeValues,
    inputLabels,
    buttonClicked,
  ])

  return (
    <div className='bg-slate-50 rounded-md shadow-md p-4 flex flex-col items-start'>
      <h2 className='text-xl font-semibold mb-2 '>
        {data.title}
      </h2>
      <p className='text-sm text-gray-700 mb-3'>
        {data.description}
      </p>
      {data.outputLabels?.map((label) => (
        <div key={label} className='relative ml-auto -mr-4'>
          <h3 className='w-full mr-4'>{label}</h3>
          <Handle
            type='source'
            position={Position.Right}
            className='bg-white w-2.5 h-2.5 border-2'
            style={{
              borderColor: getHandleColor(
                'source',
                label,
                id
              ),
            }}
            id={label}
          />
        </div>
      ))}
      <div className='mb-2' />
      {children}
      {data.inputLabels?.map((label) => (
        <div key={label} className='relative -ml-4'>
          <Handle
            type='target'
            position={Position.Left}
            className='bg-white w-2.5 h-2.5 border-2'
            style={{
              borderColor: getHandleColor(
                'target',
                label,
                id
              ),
            }}
            id={label}
          />
          <h3 className='w-full ml-4'>{label}</h3>
        </div>
      ))}
      <div className='mb-3' />
      {isRunning && (
        <p className='text-sm text-gray-700 mb-3'>
          Loading...
        </p>
      )}
      {nodeValue &&
        (Object.keys(nodeValue).length > 1 ? (
          Object.keys(nodeValue).map((key) => (
            <div key={key} className=''>
              <h3 className='w-full mr-4 text-gray-800'>
                {key}
              </h3>
              <p className='text-sm text-gray-700 mb-3 max-w-md'>
                {nodeValue[key]}
              </p>
            </div>
          ))
        ) : (
          <p className='text-sm text-gray-700 mb-3 max-w-sm'>
            {nodeValue[Object.keys(nodeValue)[0]]}
          </p>
        ))}

      {lazy && (
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => setButtonClicked(true)}>
          Update
        </button>
      )}
    </div>
  )
}

export type { NodeData, NodeProps, NodeFunc, AsyncNodeFunc }

export default GenericNode
