import React, { memo, useEffect, useState } from 'react'
import { Handle, Position } from 'reactflow'
import getHandleColor from './utils'
import useFlowStore, { DefaultNode } from '../../store'

type NodeFunc = (inputs: { [key: string]: any }) => {
  [key: string]: any
}

type AsyncNodeFunc = (inputs: {
  [key: string]: any
}) => Promise<{
  [key: string]: any
}>

type NodeData = {
  title: string
  description?: string
  inputLabels?: string[]
  outputLabels?: string[]
  func?: NodeFunc
  afunc?: AsyncNodeFunc
}

type NodeProps = {
  id: string
  data: NodeData
  children?: React.ReactNode
  lazy?: boolean
}

const GenericNode = memo(
  ({ id, data, children, lazy = false }: NodeProps) => {
    const childNodeValues = useFlowStore(
      (state) => {
        const childEdges = state.edges.filter(
          (edge) => edge.target === id
        )
        const childNodeValues = {} as { [key: string]: any }

        for (const edge of childEdges) {
          const sourceNode = state.nodes.find(
            (node) => node.id === edge.source
          ) as DefaultNode
          const sourceHandle = edge.sourceHandle
          const targetHandle = edge.targetHandle
          if (!sourceHandle || !targetHandle) {
            continue
          }
          if (
            !sourceNode ||
            !sourceNode.data ||
            !sourceNode.data.dataValues
          ) {
            continue
          }

          const sourceNodeData =
            sourceNode.data.dataValues[sourceHandle]

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
            return false
          }
        }
        return true
      }
    )

    const [nodeValue, setNodeDataValue] = useFlowStore(
      (state) => {
        const nodeValue = state.nodes.find(
          (node) => node.id === id
        )?.data.dataValues
        return [nodeValue, state.setNodeDataValue]
      }
    )
    const { afunc, func, inputLabels } = data

    const [buttonClicked, setButtonClicked] =
      useState(false)
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

      console.log('running', id, childNodeValues)

      for (const label of inputLabels) {
        if (!(label in childNodeValues)) {
          setNodeDataValue(id, null)
          return
        }
      }

      if (func) {
        const output = func(childNodeValues)
        setNodeDataValue(id, output)
      }
      if (afunc) {
        setIsRunning(true)
        afunc(childNodeValues).then((output) => {
          setNodeDataValue(id, output)
          setIsRunning(false)
        })
      }
    }, [
      func,
      afunc,
      lazy,
      isRunning,
      id,
      setNodeDataValue,
      childNodeValues,
      inputLabels,
      buttonClicked,
    ])

    return (
      <div className='bg-slate-50 rounded-md shadow-md p-4 flex flex-col items-start border-black'>
        <h2 className='text-xl font-semibold mb-2 '>
          {data.title}
        </h2>
        <p className='text-sm text-gray-700 mb-3'>
          {data.description}
        </p>
        {data.outputLabels?.map((label) => (
          <div
            key={label}
            className='relative ml-auto -mr-4'>
            <h3 className='w-full mr-4'>{label}</h3>
            <Handle
              type='source'
              position={Position.Right}
              className='bg-white w-2.5 h-2.5 border-2'
              style={{
                borderColor: getHandleColor(label),
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
                borderColor: getHandleColor(label),
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
                {nodeValue[key]
                  ?.toString()
                  .includes('http') ? (
                  <img
                    src={nodeValue[key]?.toString()}
                    alt='img'
                    className='mb-3 max-w-md no-export'
                  />
                ) : (
                  <div className='text-sm text-gray-700 mb-3 max-w-md whitespace-pre-wrap'>
                    {nodeValue[key]?.toString()}
                  </div>
                )}
              </div>
            ))
          ) : nodeValue[Object.keys(nodeValue)[0]]
              ?.toString()
              .includes('http') ? (
            <img
              src={nodeValue[
                Object.keys(nodeValue)[0]
              ]?.toString()}
              alt='img'
              className='mb-3 max-w-md no-export'
            />
          ) : (
            <div className='text-sm text-gray-700 mb-3 max-w-md whitespace-pre-wrap'>
              {nodeValue[
                Object.keys(nodeValue)[0]
              ]?.toString()}
            </div>
          ))}

        {lazy && (
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto nodrag'
            onClick={() => setButtonClicked(true)}>
            Update
          </button>
        )}
      </div>
    )
  }
)

export type { NodeData, NodeProps, NodeFunc, AsyncNodeFunc }

export default GenericNode
