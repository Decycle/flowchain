import React, { memo, useEffect, useState } from 'react'
import { Handle, Position } from 'reactflow'
import getHandleColor from './base/utils'
import useFlowStore, { DefaultNode } from '../store'
import {
  Data,
  DescriptionFunc,
  Label,
  LabelFunc,
  NodeConfig,
  TitleFunc,
} from './types'
import { NodeNotFoundError } from './errors'
import { flow, pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { error } from 'fp-ts/lib/Console'
import { monoidObject } from '../fp-ts-utils'
import { sequenceT } from 'fp-ts/lib/Apply'
import { Lens } from 'monocle-ts'

const BaseNode = ({ id }: { id: string }) => {
  const node = pipe(
    useFlowStore((state) => state.getNode(id)),
    E.fromOption(() => NodeNotFoundError.of(id)),
    E.getOrElseW(() => {
      console.error(`Node ${id} not found`)
      return null
    }),
    O.fromNullable
  )

  const getOutputs = (
    node: DefaultNode,
    handle: string | null | undefined
  ) =>
    node.data.output && handle && node.data.output[handle]
      ? O.some(node.data.output[handle])
      : O.none

  const parentNodeValues = useFlowStore(
    (state) =>
      pipe(
        state.getEdges(),
        A.filter((edge) => edge.target === id),
        A.map((edge) =>
          pipe(
            sequenceT(O.Applicative)(
              O.fromNullable(edge.targetHandle),
              pipe(
                state.getNode(edge.source),
                O.chain((node) =>
                  getOutputs(node, edge.sourceHandle)
                )
              )
            )
          )
        ),
        A.filterMap((tuple) => tuple),
        A.foldMap(monoidObject<string, Data>())(
          ([handle, value]) => ({
            [handle]: value,
          })
        )
      ),
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

  const [title, description, inputLabels, outputLabels] =
    pipe(
      node,
      O.fold(
        () => ['', '', [], []],
        (node) => [
          node.data.title,
          node.data.description,
          node.data.inputLabels,
          node.data.outputLabels,
        ]
      )
    )

  const [component, func, afunc] = pipe(
    node,
    O.fold(
      () => [undefined, undefined, undefined],
      (node) => [
        node.data.component,
        node.data.func,
        node.data.afunc,
      ]
    )
  )

  //   const childNodeValues = useFlowStore(
  //     (state) => {
  //       const childEdges = state.edges.filter(
  //         (edge) => edge.target === id
  //       )
  //       const childNodeValues = {} as { [key: string]: any }

  //       for (const edge of childEdges) {
  //         const sourceNode = state.nodes.find(
  //           (node) => node.id === edge.source
  //         ) as DefaultNode
  //         const sourceHandle = edge.sourceHandle
  //         const targetHandle = edge.targetHandle
  //         if (!sourceHandle || !targetHandle) {
  //           continue
  //         }
  //         if (
  //           !sourceNode ||
  //           !sourceNode.data ||
  //           !sourceNode.data.dataValues
  //         ) {
  //           continue
  //         }

  //         const sourceNodeData =
  //           sourceNode.data.dataValues[sourceHandle]

  //         childNodeValues[targetHandle] = sourceNodeData
  //       }
  //       return childNodeValues
  //     },
  //     (prev, next) => {
  //       if (
  //         Object.keys(prev).length !==
  //         Object.keys(next).length
  //       ) {
  //         return false
  //       }
  //       for (const key in prev) {
  //         if (prev[key] !== next[key]) {
  //           return false
  //         }
  //       }
  //       return true
  //     }
  //   )

  //   const [nodeValue, setNodeDataValue] = useFlowStore(
  //     (state) => {
  //       const nodeValue = state.nodes.find(
  //         (node) => node.id === id
  //       )?.data.dataValues
  //       return [nodeValue, state.setNodeDataValue]
  //     }
  //   )
  //   const { afunc, func, inputLabels } = data

  //   const [buttonClicked, setButtonClicked] = useState(false)
  //   const [isRunning, setIsRunning] = useState(false)

  //   useEffect(() => {
  //     if (lazy) {
  //       if (!buttonClicked) {
  //         return
  //       } else {
  //         setButtonClicked(false)
  //       }
  //     }
  //     if (isRunning) {
  //       return
  //     }
  //     if (!inputLabels || inputLabels.length === 0) {
  //       return
  //     }

  //     console.log('running', id, childNodeValues)

  //     for (const label of inputLabels) {
  //       if (!(label in childNodeValues)) {
  //         setNodeDataValue(id, null)
  //         return
  //       }
  //     }

  //     if (func) {
  //       const output = func(childNodeValues)
  //       setNodeDataValue(id, output)
  //     }
  //     if (afunc) {
  //       setIsRunning(true)
  //       afunc(childNodeValues).then((output) => {
  //         setNodeDataValue(id, output)
  //         setIsRunning(false)
  //       })
  //     }
  //   }, [
  //     func,
  //     afunc,
  //     lazy,
  //     isRunning,
  //     id,
  //     setNodeDataValue,
  //     childNodeValues,
  //     inputLabels,
  //     buttonClicked,
  //   ])
  return (
    <div className='bg-slate-50 rounded-md shadow-md p-4 flex flex-col items-start border-black'>
      <h2 className='text-xl font-semibold mb-2 '>
        {title}
      </h2>
      <p className='text-sm text-gray-700 mb-3'>
        {description}
      </p>
      {outputLabels.map((label) => (
        <div
          key={label.value}
          className='relative ml-auto -mr-4'>
          <h3 className='w-full mr-4'>{label.value}</h3>
          <Handle
            type='source'
            position={Position.Right}
            className='bg-white w-2.5 h-2.5 border-2'
            style={{
              borderColor: getHandleColor(label.value),
            }}
            id={label.value}
          />
        </div>
      ))}
      <div className='mb-2' />
      {component}
      {inputLabels.map((label) => (
        <div key={label.value} className='relative -ml-4'>
          <Handle
            type='target'
            position={Position.Left}
            className='bg-white w-2.5 h-2.5 border-2'
            style={{
              borderColor: getHandleColor(label.value),
            }}
            id={label.value}
          />
          <h3 className='w-full ml-4'>{label.value}</h3>
        </div>
      ))}
      {/* <div className='mb-3' />
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
      )} */}
    </div>
  )
}

export default BaseNode
