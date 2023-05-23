import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Handle, Position } from 'reactflow'
import getHandleColor from './utils'
import useFlowStore, { DefaultNode } from '../../store'
import { Content, Data, StringData } from '../../types'
import { NodeNotFoundError } from '../errors'
import { flow, pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { log, monoidObject } from '../../fp-ts-utils'
import { sequenceT } from 'fp-ts/lib/Apply'
import { shallow } from 'zustand/shallow'

const BaseNode = ({ id }: { id: string }) => {
  const node = pipe(
    useFlowStore((state) => state.getNode(id)),
    E.fromOption(() => NodeNotFoundError.of(id)),
    E.getOrElseW((e) => {
      console.error(e)
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
    shallow
  )

  const [
    title,
    description,
    inputLabels,
    outputLabels,
    lazy,
    output,
  ] = pipe(
    node,
    O.map((node) => node.data),
    O.fold(
      () => ['', '', [], [], false, {}],
      (data) => [
        data.title,
        data.description,
        data.inputLabels,
        data.outputLabels,
        data.lazy,
        data.output || {},
      ]
    )
  )

  const content = useFlowStore(
    (state) =>
      pipe(
        state.getNode(id),
        O.map((node) => node.data.content || {}),
        O.getOrElse(() => ({} as Record<string, Content>))
      ),
    shallow
  )

  const [Component, func, afunc] = pipe(
    node,
    O.map((node) => node.data),
    O.fold(
      () => [undefined, undefined, undefined],
      (data) => [data.Component, data.func, data.afunc]
    )
  )

  const [setNodeOutput, setNodeContent] = useFlowStore(
    (state) => [state.setNodeOutput, state.setNodeContent]
  )

  const [buttonClicked, setButtonClicked] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const runFunctions = () => {
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

    console.log('running', id, parentNodeValues)

    const runFunc = () =>
      pipe(
        func,
        O.fromNullable,
        O.chain((func) =>
          pipe(
            func({
              inputs: parentNodeValues,
              content,
            }),
            E.getOrElseW((e) => {
              console.error(e)
              return null
            }),
            O.fromNullable
          )
        ),
        O.map((output) => {
          setNodeOutput(id, output)
        })
      )

    const runAfunc = () =>
      pipe(
        afunc,
        O.fromNullable,
        O.map((func) =>
          pipe(
            func({ inputs: parentNodeValues, content }),
            TE.getOrElseW((e) => {
              console.error(e)
              setIsRunning(false)
              return T.of(null)
            })
          )
        ),
        O.map((task) => {
          setIsRunning(true)
          return pipe(
            task,
            T.map((output) =>
              pipe(
                output,
                O.fromNullable,
                O.map((output) => {
                  setNodeOutput(id, output)
                  setIsRunning(false)
                })
              )
            )
          )
        })
      )

    runFunc()
    pipe(
      runAfunc(),
      O.map((task) => task())
    )
  }

  useEffect(runFunctions, [
    func,
    afunc,
    lazy,
    isRunning,
    id,
    parentNodeValues,
    setNodeOutput,
    inputLabels,
    buttonClicked,
    content,
  ])

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
      {Component && (
        <Component
          content={content}
          setContent={(content) =>
            setNodeContent(id, content)
          }
        />
      )}
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
      <div className='mb-3' />
      {isRunning && (
        <p className='text-sm text-gray-700 mb-3'>
          Loading...
        </p>
      )}
      {output &&
        Object.keys(output).length > 0 &&
        (Object.keys(output).length > 1 ? (
          Object.keys(output).map((key) => (
            <div key={key} className=''>
              <h3 className='w-full mr-4 text-gray-800'>
                {key}
              </h3>
              {output[key]?._tag === 'imageUrl' ? (
                <img
                  src={output[key].value as string}
                  alt='img'
                  className='mb-3 max-w-md no-export'
                />
              ) : (
                <div className='text-sm text-gray-700 mb-3 max-w-md whitespace-pre-wrap'>
                  {output[key].value.toString()}
                </div>
              )}
            </div>
          ))
        ) : output[Object.keys(output)[0]]._tag ===
          'imageUrl' ? (
          <img
            src={
              output[Object.keys(output)[0]].value as string
            }
            alt='img'
            className='mb-3 max-w-md no-export'
          />
        ) : (
          <div className='text-sm text-gray-700 mb-3 max-w-md whitespace-pre-wrap'>
            {output[
              Object.keys(output)[0]
            ].value?.toString()}
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

export default BaseNode
